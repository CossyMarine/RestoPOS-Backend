import "dotenv/config";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  if (!options.email) throw new Error("Recipient email is required");

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || null,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.email}`);
    return info;
  } catch (error) {
    console.error(`Email sending failed to ${options.email}:`, error.message);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;
