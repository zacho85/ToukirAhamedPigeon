<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tontine Invitation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }

        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 10px;
        }

        .title {
            font-size: 20px;
            color: #333;
            margin: 0;
        }

        .content {
            margin-bottom: 30px;
        }

        .tontine-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }

        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }

        .detail-row:last-child {
            border-bottom: none;
        }

        .detail-label {
            font-weight: bold;
            color: #495057;
        }

        .detail-value {
            color: #333;
        }

        .cta-button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
        }

        .cta-button:hover {
            background-color: #0056b3;
        }

        .footer {
            text-align: center;
            border-top: 1px solid #e9ecef;
            padding-top: 20px;
            margin-top: 30px;
            color: #6c757d;
            font-size: 14px;
        }

        .expiry-notice {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }

        @media (max-width: 600px) {
            body {
                padding: 10px;
            }

            .container {
                padding: 20px;
            }

            .detail-row {
                flex-direction: column;
            }

            .detail-label {
                margin-bottom: 5px;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <div class="logo">E-Tontine</div>
            <h1 class="title">You're Invited to Join a Tontine!</h1>
        </div>

        <div class="content">
            <p>Hello,</p>

            <p><strong>{{ $inviter->name }}</strong> has invited you to join their tontine group. This is a
                great opportunity to save money together and build financial discipline with a trusted group.</p>

            <div class="tontine-details">
                <h3 style="margin-top: 0; color: #007bff;">Tontine Details</h3>

                <div class="detail-row">
                    <span class="detail-label">Tontine Name:</span>
                    <span class="detail-value">{{ $tontine->name }}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Type:</span>
                    <span class="detail-value">{{ ucfirst($tontine->type) }}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Contribution Amount:</span>
                    <span class="detail-value">${{ number_format($tontine->contribution_amount, 2) }}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Contribution Frequency:</span>
                    <span class="detail-value">{{ ucfirst($tontine->frequency->value) }}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Duration:</span>
                    <span class="detail-value">{{ $tontine->duration_months }} months</span>
                </div>

                {{-- <div class="detail-row">
                    <span class="detail-label">Maximum Members:</span>
                    <span class="detail-value">{{ $tontine->max_members }}</span>
                </div> --}}

                {{--- <div class="detail-row">
                    <span class="detail-label">Start Date:</span>
                    <span class="detail-value">{{ $tontine->start_date->format('F j, Y') }}</span>
                </div> --}}

                @if($tontine->description)
                    <div class="detail-row">
                        <span class="detail-label">Description:</span>
                        <span class="detail-value">{{ $tontine->description }}</span>
                    </div>
                @endif
            </div>

            <div class="expiry-notice">
                <strong>⏰ Time Sensitive:</strong> This invitation expires on
                {{ now()->addHours(\App\Enums\TimePeriodEnums::DAY_IN_HOURS->value)->format('F j, Y \a\t g:i A') }}.
                Don't miss out!
            </div>

            <div style="text-align: center;">
                <a href="{{ $acceptUrl }}" class="cta-button">Accept Invitation</a>
            </div>

            <p style="text-align: center; margin-top: 20px;">
                <small>
                    If you're unable to click the button above, copy and paste this link into your browser:<br>
                    <a href="{{ $acceptUrl }}" style="color: #007bff; word-break: break-all;">{{ $acceptUrl }}</a>
                </small>
            </p>

            <p><strong>What happens next?</strong></p>
            <ul>
                <li>Click the "Accept Invitation" button above</li>
                <li>Create your account or log in if you already have one</li>
                <li>Review and confirm the tontine terms</li>
                <li>Start contributing according to the schedule</li>
            </ul>

            <p><strong>Why join a tontine?</strong></p>
            <ul>
                <li>Build a savings habit with accountability</li>
                <li>Access to a lump sum when it's your turn</li>
                <li>Strengthen community bonds</li>
                <li>No interest charges or complex terms</li>
            </ul>
        </div>

        <div class="footer">
            <p>This invitation was sent by {{ $inviter->name }} ({{ $inviter->email }}).</p>
            <p>If you don't want to receive these emails, you can <a href="{{ $unsubscribeUrl ?? '#' }}"
                    style="color: #6c757d;">unsubscribe here</a>.</p>
            <p>&copy; {{ date('Y') }} E-Tontine. All rights reserved.</p>
        </div>
    </div>
</body>

</html>