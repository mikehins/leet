<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ __('friends.parent_email_subject_' . $activityType, ['child' => $child->name, 'other' => $otherUserName]) }}</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155; max-width: 560px; margin: 0 auto; padding: 24px;">
    <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px;">👋</span>
    </div>
    <h1 style="font-size: 24px; color: #0f766e; margin-bottom: 16px;">
        {{ __('friends.parent_email_heading') }}
    </h1>
    <p style="font-size: 16px; margin-bottom: 16px;">
        @if($activityType === 'request_received')
            {{ __('friends.parent_email_request_received', ['child' => $child->name, 'other' => $otherUserName]) }}
        @elseif($activityType === 'request_sent')
            {{ __('friends.parent_email_request_sent', ['child' => $child->name, 'other' => $otherUserName]) }}
        @elseif($activityType === 'request_approved')
            {{ __('friends.parent_email_request_approved', ['child' => $child->name, 'other' => $otherUserName]) }}
        @elseif($activityType === 'friend_removed')
            {{ __('friends.parent_email_friend_removed', ['child' => $child->name, 'other' => $otherUserName]) }}
        @endif
    </p>
    <p style="font-size: 14px; color: #64748b;">
        {{ __('friends.parent_email_footer') }}
    </p>
</body>
</html>
