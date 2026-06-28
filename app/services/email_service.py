import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
import os
from dotenv import load_dotenv

load_dotenv()

configuration = sib_api_v3_sdk.Configuration()
configuration.api_key['api-key'] = os.getenv("BREVO_API_KEY")

class EmailService:

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

        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))

        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            to=[{"email": to_email}],
            sender={"name": "VeriDoc.ai", "email": "devgarg062@gmail.com"},
            subject=subject,
            html_content=html_content
        )

        try:
            api_instance.send_transac_email(send_smtp_email)
            return True
        except ApiException as e:
            print(f"[EmailService] Failed to send email: {e}")
            return False


email_service = EmailService()