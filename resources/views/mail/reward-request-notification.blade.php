<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ __('rewards.parent_email_subject') }}</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155; max-width: 560px; margin: 0 auto; padding: 24px;">
    <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px;">🎉</span>
    </div>
    <h1 style="font-size: 24px; color: #0f766e; margin-bottom: 16px;">
        {{ __('rewards.star_alert') }}
    </h1>
    <p style="font-size: 16px; margin-bottom: 16px;">
        {{ __('rewards.parent_email_intro', ['name' => $rewardRequest->user->name]) }}
    </p>
    <div style="background: #f0fdfa; border: 2px solid #99f6e4; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #0f766e;">
            {{ __('rewards.points_earned') }}: {{ $rewardRequest->points_spent }} {{ __('rewards.points') }}
        </p>
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #0f766e;">
            {{ __('rewards.dollar_value') }}: ${{ number_format($rewardRequest->dollars_value, 2) }}
        </p>
        @if($rewardRequest->message)
        <p style="margin: 12px 0 0 0; padding-top: 12px; border-top: 1px solid #99f6e4;">
            <strong>{{ __('rewards.their_message') }}:</strong><br>
            "{{ $rewardRequest->message }}"
        </p>
        @endif
    </div>
    <p style="font-size: 14px; color: #64748b;">
        {{ __('rewards.parent_email_footer') }}
    </p>
</body>
</html>
