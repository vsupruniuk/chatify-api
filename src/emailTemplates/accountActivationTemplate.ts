import * as dayjs from 'dayjs';

export const accountActivationTemplate = (OTPCode: number): string => {
	const logoUrl: string | undefined = String(process.env.APP_LOGO_URL);
	const currentYear: number = dayjs().year();

	return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap" rel="stylesheet">
    <title>Account Activation</title>
    <style>
      body {
        font-family: 'Poppins', sans-serif;
        background-color: #f8f9fa;
        margin: 0;
        padding: 0;
        color: #333;
        line-height: 1.6;
      }
      
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      
      .email-header {
        background: #e8f5f0;
        color: #31C48D;
        padding: 20px;
        text-align: center;
      }
      
      .email-header img {
        width: 50px;
        height: 50px;
        display: block;
        margin: 0 auto 10px;
      }
      
      .email-header h1 {
        margin: 0;
        font-size: 24px;
      }
      
      .email-body {
        padding: 30px;
        text-align: center;
      }
      
      .email-body h2 {
        font-size: 20px;
        color: #31C48D;
      }
      
      .otp-code {
        display: inline-block;
        font-size: 28px;
        color: #ffffff;
        background: #31C48D;
        padding: 10px 20px;
        border-radius: 8px;
        margin: 20px 0;
      }
      
      .email-footer {
        background: #f1f1f1;
        padding: 10px;
        text-align: center;
        font-size: 14px;
        color: #888;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-header">
        <img src="${logoUrl}" alt="Chatify Logo">
        
        <h1>Chatify</h1>
      </div>
      
      <div class="email-body">
        <h2>Activate Your Account</h2>
        
        <p style="color: #333">
          Welcome to Chatify, your go-to messenger for seamless communication. 
          We're excited to have you join our growing community! 
          To complete the sign-up process and activate your account, please use the unique OTP code below.
        </p>
        
        <div class="otp-code">${OTPCode}</div>
        
        <p style="color: #333">
          If you didn't request to sign up for Chatify or believe this was a mistake, 
          rest assured that no action is required on your part. 
          Simply ignore this email, and no changes will be made to your account or email address.
        </p>
        
        <p style="color: #333">Thank you,<br>The Chatify Team</p>
      </div>
      
      <div class="email-footer">
        &copy; ${currentYear} Chatify. All rights reserved.
      </div>
    </div>
  </body>
</html>`;
};
