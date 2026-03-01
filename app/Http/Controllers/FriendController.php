<?php

namespace App\Http\Controllers;

use App\Events\FriendRequestAccepted;
use App\Events\FriendRequestSent;
use App\Mail\FriendActivityMail;
use App\Models\FriendRequest;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class FriendController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $friends = $user->friendsList()->map(function (User $u) {
            $progress = $u->progress;
            $progress = $progress ?: \App\Models\UserProgress::getOrCreateFor($u);
            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'avatar_url' => $u->avatar_url,
                'stats' => [
                    'level' => $progress->level ?? 1,
                    'total_points' => $progress->total_points ?? 0,
                    'badges_earned' => $u->badges()->count(),
                    'current_streak' => $progress->current_streak ?? 0,
                ],
            ];
        });

        $pendingReceived = FriendRequest::where('receiver_id', $user->id)
            ->where('status', 'pending')
            ->with('sender:id,name,email')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (FriendRequest $fr) => [
                'id' => $fr->id,
                'sender' => [
                    'id' => $fr->sender->id,
                    'name' => $fr->sender->name,
                    'email' => $fr->sender->email,
                ],
                'created_at' => $fr->created_at->toIso8601String(),
            ]);

        $pendingSent = FriendRequest::where('sender_id', $user->id)
            ->where('status', 'pending')
            ->with('receiver:id,name,email')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (FriendRequest $fr) => [
                'id' => $fr->id,
                'receiver' => [
                    'id' => $fr->receiver->id,
                    'name' => $fr->receiver->name,
                    'email' => $fr->receiver->email,
                ],
                'created_at' => $fr->created_at->toIso8601String(),
            ]);

        $notifications = Notification::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(fn (Notification $n) => [
                'id' => $n->id,
                'type' => $n->type,
                'data' => $n->data,
                'read_at' => $n->read_at?->toIso8601String(),
                'created_at' => $n->created_at->toIso8601String(),
            ]);

        return Inertia::render('Friends/Index', [
            'game' => config('game'),
            'friends' => $friends,
            'pending_received' => $pendingReceived,
            'pending_sent' => $pendingSent,
            'notifications' => $notifications,
        ]);
    }

    public function search(Request $request)
    {
        $request->validate(['q' => 'required|string|min:2|max:100']);
        $user = $request->user();
        $q = trim($request->q);

        $friendIds = $user->friendsList()->pluck('id')->push($user->id);
        $requestUserIds = FriendRequest::where(function ($query) use ($user) {
            $query->where('sender_id', $user->id)->orWhere('receiver_id', $user->id);
        })->where('status', 'pending')->get()
            ->flatMap(fn ($fr) => [$fr->sender_id, $fr->receiver_id])
            ->unique()
            ->filter(fn ($id) => $id !== $user->id);

        $excludeIds = $friendIds->merge($requestUserIds)->unique()->values()->all();

        $users = User::whereNotIn('id', $excludeIds)
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            })
            ->select('id', 'name', 'email')
            ->limit(20)
            ->get();

        return response()->json(['users' => $users]);
    }

    public function send(Request $request)
    {
        $request->validate(['user_id' => 'required|integer|exists:users,id']);
        $user = $request->user();
        $receiverId = (int) $request->user_id;

        if ($receiverId === $user->id) {
            return back()->withErrors(['user_id' => 'You cannot send a friend request to yourself.']);
        }

        $existing = FriendRequest::where(function ($q) use ($user, $receiverId) {
            $q->where('sender_id', $user->id)->where('receiver_id', $receiverId);
        })->orWhere(function ($q) use ($user, $receiverId) {
            $q->where('sender_id', $receiverId)->where('receiver_id', $user->id);
        })->first();

        if ($existing) {
            if ($existing->status === 'accepted') {
                return back()->withErrors(['user_id' => 'You are already friends.']);
            }
            if ($existing->status === 'pending' && $existing->sender_id === $user->id) {
                return back()->withErrors(['user_id' => 'Friend request already sent.']);
            }
            if ($existing->status === 'pending' && $existing->receiver_id === $user->id) {
                return back()->withErrors(['user_id' => 'This user has already sent you a request.']);
            }
        }

        FriendRequest::create([
            'sender_id' => $user->id,
            'receiver_id' => $receiverId,
            'status' => 'pending',
        ]);

        broadcast(new FriendRequestSent($receiverId, $user->id, $user->name));

        $receiver = User::find($receiverId);
        if ($receiver && $receiver->parent_id && $receiver->parent?->email) {
            Mail::to($receiver->parent->email)->send(new FriendActivityMail($receiver, 'request_received', $user->name));
        }
        if ($user->parent_id && $user->parent?->email) {
            Mail::to($user->parent->email)->send(new FriendActivityMail($user, 'request_sent', $receiver->name));
        }

        return redirect()->route('friends.index')->with('success', 'Friend request sent.');
    }

    public function accept(Request $request, FriendRequest $friendRequest)
    {
        if ($friendRequest->receiver_id !== $request->user()->id) {
            abort(403);
        }
        if ($friendRequest->status !== 'pending') {
            return back()->withErrors(['error' => 'Request already handled.']);
        }

        $friendRequest->update(['status' => 'accepted']);

        broadcast(new FriendRequestAccepted($friendRequest->sender_id, $request->user()->name));

        $receiver = $request->user();
        $sender = $friendRequest->sender;
        if ($receiver->parent_id && $receiver->parent?->email) {
            Mail::to($receiver->parent->email)->send(new FriendActivityMail($receiver, 'request_approved', $sender->name));
        }
        if ($sender->parent_id && $sender->parent?->email && $sender->parent_id !== $receiver->parent_id) {
            Mail::to($sender->parent->email)->send(new FriendActivityMail($sender, 'request_approved', $receiver->name));
        }

        return redirect()->route('friends.index')->with('success', 'Friend request accepted.');
    }

    public function reject(Request $request, FriendRequest $friendRequest)
    {
        if ($friendRequest->receiver_id !== $request->user()->id) {
            abort(403);
        }
        if ($friendRequest->status !== 'pending') {
            return back()->withErrors(['error' => 'Request already handled.']);
        }

        $friendRequest->update(['status' => 'rejected']);

        return redirect()->route('friends.index')->with('success', 'Friend request declined.');
    }

    public function cancel(Request $request, FriendRequest $friendRequest)
    {
        if ($friendRequest->sender_id !== $request->user()->id) {
            abort(403);
        }
        if ($friendRequest->status !== 'pending') {
            return back()->withErrors(['error' => 'Request already handled.']);
        }

        $friendRequest->delete();

        return redirect()->route('friends.index')->with('success', 'Friend request cancelled.');
    }

    public function markNotificationsRead(Request $request)
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return redirect()->route('friends.index');
    }

    public function clearNotifications(Request $request)
    {
        $request->user()->notifications()->delete();

        return redirect()->route('friends.index')->with('success', __('friends.notifications_cleared'));
    }

    public function unfriend(Request $request, User $user)
    {
        $me = $request->user();
        if ($user->id === $me->id) {
            return back()->withErrors(['error' => 'You cannot unfriend yourself.']);
        }

        $deleted = FriendRequest::where('status', 'accepted')
            ->where(function ($q) use ($me, $user) {
                $q->where('sender_id', $me->id)->where('receiver_id', $user->id)
                    ->orWhere('sender_id', $user->id)->where('receiver_id', $me->id);
            })
            ->delete();

        if ($deleted === 0) {
            return back()->withErrors(['error' => 'You are not friends with this user.']);
        }

        if ($me->parent_id && $me->parent?->email) {
            Mail::to($me->parent->email)->send(new FriendActivityMail($me, 'friend_removed', $user->name));
        }
        if ($user->parent_id && $user->parent?->email && $user->parent_id !== $me->parent_id) {
            Mail::to($user->parent->email)->send(new FriendActivityMail($user, 'friend_removed', $me->name));
        }

        return redirect()->route('friends.index')->with('success', 'Friend removed.');
    }
}
