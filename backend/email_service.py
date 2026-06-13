import resend
from config import settings

resend.api_key = settings.RESEND_API_KEY


def send_reset_email(to_email: str, reset_url: str, name: str) -> None:
    resend.Emails.send({
        "from": settings.EMAIL_FROM,
        "to": to_email,
        "subject": "Reset your Orbit Architect password",
        "html": f"""
        <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#060e1c;color:#dbe2f6;padding:40px;border-radius:16px;border:1px solid rgba(255,255,255,0.08)">
          <div style="text-align:center;margin-bottom:32px">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:#fc6d26;border-radius:14px;margin-bottom:16px">
              <span style="font-size:28px">⬡</span>
            </div>
            <h1 style="color:#ffb597;font-size:22px;margin:0">Orbit Architect</h1>
          </div>
          <h2 style="font-size:18px;margin-bottom:8px">Hi {name},</h2>
          <p style="color:rgba(219,226,246,0.6);line-height:1.6;margin-bottom:24px">
            We received a request to reset your password. Click the button below to set a new password.
            This link expires in <strong style="color:#ffb597">1 hour</strong>.
          </p>
          <div style="text-align:center;margin-bottom:24px">
            <a href="{reset_url}"
               style="display:inline-block;background:#fc6d26;color:white;padding:14px 32px;border-radius:10px;font-weight:bold;text-decoration:none;font-size:14px">
              Reset Password
            </a>
          </div>
          <p style="color:rgba(219,226,246,0.35);font-size:12px;text-align:center">
            If you didn't request this, you can safely ignore this email.<br/>
            This link will expire in 1 hour.
          </p>
        </div>
        """,
    })
