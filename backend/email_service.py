import resend
from config import settings

resend.api_key = settings.RESEND_API_KEY


def send_otp_email(to_email: str, otp: str, name: str) -> None:
    # Resend sandbox: can only send to verified email
    # Once domain is verified, remove this override
    actual_to = to_email if settings.RESEND_DOMAIN_VERIFIED == "true" else "kaduutkarsh52@gmail.com"
    resend.Emails.send({
        "from": settings.EMAIL_FROM,
        "to": actual_to,
        "subject": "Your Orbit Architect password reset OTP",
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
            Use the OTP below to reset your password. It expires in <strong style="color:#ffb597">10 minutes</strong>.
          </p>
          <div style="text-align:center;margin-bottom:24px">
            <div style="display:inline-block;background:rgba(255,181,151,0.08);border:1px solid rgba(255,181,151,0.3);border-radius:12px;padding:20px 40px">
              <span style="font-family:monospace;font-size:36px;font-weight:bold;color:#ffb597;letter-spacing:10px">{otp}</span>
            </div>
          </div>
          <p style="color:rgba(219,226,246,0.35);font-size:12px;text-align:center">
            If you didn't request this, you can safely ignore this email.<br/>
            This OTP will expire in 10 minutes.
          </p>
        </div>
        """,
    })
