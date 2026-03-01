import { createContext, useContext, useEffect, useRef, useState } from 'react';

const CompetitionChannelContext = createContext({
    onlineCount: 0,
    subscribeToInvites: () => () => {},
});

export function CompetitionChannelProvider({ children, userId }) {
    const [onlineCount, setOnlineCount] = useState(0);
    const listenersRef = useRef(new Set());

    useEffect(() => {
        if (!userId || !window.Echo) return;

        const channel = window.Echo.join('competitions');

        channel.here((users) => setOnlineCount(users.length));
        channel.joining(() => setOnlineCount((c) => c + 1));
        channel.leaving(() => setOnlineCount((c) => Math.max(0, c - 1)));

        channel.listen('.competition.invite', (e) => {
            if (e.creatorId === userId) return;
            listenersRef.current.forEach((fn) => fn(e));
        });

        return () => {
            window.Echo.leave('competitions');
        };
    }, [userId]);

    const subscribeToInvites = (callback) => {
        listenersRef.current.add(callback);
        return () => {
            listenersRef.current.delete(callback);
        };
    };

    return (
        <CompetitionChannelContext.Provider value={{ onlineCount, subscribeToInvites }}>
            {children}
        </CompetitionChannelContext.Provider>
    );
}

export function useCompetitionChannel() {
    return useContext(CompetitionChannelContext);
}
