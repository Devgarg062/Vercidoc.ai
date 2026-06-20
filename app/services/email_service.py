import resend
import os
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")

class EmailService:
    """
    Sends OTP verification emails via Resend.
    Free tier: 3000 emails/month, 100/day.
    """

    def send_otp_email(self, to_email: str, otp_code: str, purpose: str = "signup"):
        subject = "Verify your VeriDoc.ai account" if purpose == "signup" else "Your VeriDoc.ai login code"

        html_content = f"""
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <h2 style="color: #0f172a;">VeriDoc<span style="color:#3b82f6;">.ai</span></h2>
            <p style="color: #475569; font-size: 15px;">Your verification code is:</p>
            <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #0f172a;">{otp_code}</span>
            </div>
            <p style="color: #64748b; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
        </div>
        """

        try:
            resend.Emails.send({
                "from": "VeriDoc.ai <onboarding@resend.dev>",
                "to": [to_email],
                "subject": subject,
                "html": html_content
            })
            return True
        except Exception as e:
            print(f"[EmailService] Failed to send email: {e}")
            return False


email_service = EmailService()