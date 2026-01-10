import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // For Gmail, you can use other services too like 'sendgrid', 'smtp.mailtrap.io', etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email address (for Gmail, it would be your Gmail address)
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

export const sendMail = async (
  to: string | string[],
  subject: string,
  html: string,
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: html, // HTML body
  };
  return await transporter.sendMail(mailOptions);
};

export const HTML_OTP_TEMPLATE = (otp: string) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            text-align: center;
            padding: 20px;
        }
        .container {
            background: #ffffff;
            max-width: 400px;
            margin: auto;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h2 {
            color: #333;
        }
        .otp {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            padding: 10px;
            background: #f1f1f1;
            display: inline-block;
            border-radius: 5px;
            margin-top: 10px;
        }
        p {
            color: #555;
        }
        .footer {
            font-size: 12px;
            color: #888;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Email Verification</h2>
        <p>Your OTP for email verification is:</p>
        <div class="otp">${otp}</div>
        <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
        <p>If you did not request this, please ignore this email.</p>
        <div class="footer">© 2025 Your Company. All rights reserved.</div>
    </div>
</body>
</html>
`;
};
