import * as dayjs from 'dayjs';

export const resetPasswordTemplate = (userName: string, appEmail: string, link: string): string => {
	const logoUrl: string | undefined = String(process.env.APP_LOGO_URL);
	const currentYear: number = dayjs().year();

	return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap" rel="stylesheet">
    <title>Password Reset - Chatify</title>
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
      }
      
      .email-body h2 {
        font-size: 20px;
        color: #31C48D;
      }
      
      .email-body p {
        margin: 15px 0;
      }
      
      .reset-link {
        display: inline-block;
        font-size: 16px;
        color: #ffffff;
        background: #31C48D;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 8px;
        margin: 20px 0;
      }
      
      .reset-link:hover {
        background: #28a879;
      }
      
      .subtle-link {
        color: #5c8a75;
        text-decoration: none;
      }
      
      .subtle-link:hover {
        text-decoration: underline;
      }
      
      .email-footer {
        background: #f1f1f1;
        padding: 10px;
        text-align: center;
        font-size: 14px;
        color: #888;
      }
      
      .thank-you-note {
        font-style: italic;
        color: #5c8a75;
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
        <p style="color: #333">Dear ${userName},</p>
        
        <p style="color: #333">
          We received a request to reset the password for your Chatify account. If you made this request, click the button below to reset your password:
        </p>
        
        <a href="${link}" class="reset-link" style="color: #ffffff">Reset My Password</a>
        
        <p style="color: #333">
          Alternatively, you can copy and paste the following link into your browser:
          <br>
          <a href="${link}" class="subtle-link" style="color: #5c8a75">${link}</a>
        </p>
        
        <p style="color: #333">
          If you didn’t request this password reset, you can safely ignore this email. However, if you suspect any unauthorized access, please contact our support team immediately at 
          <a href="mailto:${appEmail}" class="subtle-link" style="color: #5c8a75">${appEmail}</a>.
        </p>
        
        <p style="color: #333">
          This reset link will expire in 24 hours. If you encounter any issues or need further assistance, don’t hesitate to reach out to us.
        </p>
        
        <p class="thank-you-note">Thank you for choosing Chatify as your communication platform!</p>
      </div>
      
      <div class="email-footer">
        &copy; ${currentYear} Chatify. All rights reserved.
      </div>
    </div>
  </body>
</html>`;
};
