// const nodemailer = require('nodemailer');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// const transporter = nodemailer.createTransport({
//   host: 'smtp-relay.brevo.com',
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.BREVO_USER, 
//     pass: process.env.BREVO_SMTP_KEY, 
//   },
// });

// transporter.verify((error,success) => {
//     if(error) {
//         console.error("Gmail Verification failed",error);
//     } else {
//         console.log("Gmail configured successfully");
//     }
// })

const sendOtpToEmail = async(email,otp) => {
    const subject = `Otp verification code`;
    const html = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h2 style="color: #075e54;">🔐 LinkUp Verification</h2>
      
      <p>Hi there,</p>
      
      <p>Your one-time password (OTP) to verify your LinkUp account is:</p>
      
      <h1 style="background: #e0f7fa; color: #000; padding: 10px 20px; display: inline-block; border-radius: 5px; letter-spacing: 2px;">
        ${otp}
      </h1>

      <p><strong>This OTP is valid for the next 5 minutes.</strong> Please do not share this code with anyone.</p>

      <p>If you didn’t request this OTP, please ignore this email.</p>

      <p style="margin-top: 20px;">Thanks & Regards,<br/>LinkUp Security Team</p>

      <hr style="margin: 30px 0;" />

      <small style="color: #777;">This is an automated message. Please do not reply.</small>
    </div>
  `;

  try {
    const apiKey = process.env.BREVO_API_KEY; 

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'Link Up',
          email: 'abhishekkaratagi325@gmail.com', 
        },
        to: [
          {
            email: email,
          },
        ],
        subject: subject,
        htmlContent: html,
      },
      {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Email sent successfully via Brevo API:', response.data);
    return response.data;

  } catch (error) {
    console.error('Error sending email with Brevo API:', error.response ? error.response.data : error.message);
    throw error;
  }

  // console.log("In the sendotpToMail service...")
  // await transporter.sendMail({
  //   from: `LinkUp <${process.env.EMAIL_USER}>`,
  //   to: email,
  //   subject: 'Your LinkUp verification code',
  //   html,
  // })
}

module.exports = sendOtpToEmail