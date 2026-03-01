import { createContext, useContext, useEffect, useState } from 'react';

const UserChannelContext = createContext({
    pendingFriendRequestsCount: 0,
    unreadNotificationsCount: 0,
    totalAlertCount: 0,
    friendRequestToast: null,
    dismissFriendRequestToast: () => {},
});

export function UserChannelProvider({ children, userId, initialPendingFriendRequests = 0, initialUnreadNotifications = 0 }) {
    const [pendingFriendRequestsCount, setPendingFriendRequestsCount] = useState(initialPendingFriendRequests);
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(initialUnreadNotifications);
    const [friendRequestToast, setFriendRequestToast] = useState(null);

    useEffect(() => {
        setPendingFriendRequestsCount(initialPendingFriendRequests);
        setUnreadNotificationsCount(initialUnreadNotifications);
    }, [initialPendingFriendRequests, initialUnreadNotifications]);

    useEffect(() => {
        if (!userId || !window.Echo) return;

        const channel = window.Echo.private(`App.Models.User.${userId}`);

        channel.listen('.friend.request.sent', (e) => {
            setPendingFriendRequestsCount((c) => c + 1);
            setFriendRequestToast({ type: 'sent', name: e.sender_name });
        });

        channel.listen('.friend.request.accepted', (e) => {
            setFriendRequestToast({ type: 'accepted', name: e.accepter_name });
        });

        return () => {
            window.Echo.leave(`private-App.Models.User.${userId}`);
        };
    }, [userId]);

    const totalAlertCount = pendingFriendRequestsCount + unreadNotificationsCount;

    return (
        <UserChannelContext.Provider
            value={{
                pendingFriendRequestsCount,
                unreadNotificationsCount,
                totalAlertCount,
                friendRequestToast,
                dismissFriendRequestToast: () => setFriendRequestToast(null),
            }}
        >
            {children}
        </UserChannelContext.Provider>
    );
}

export function useUserChannel() {
    return useContext(UserChannelContext);
}
