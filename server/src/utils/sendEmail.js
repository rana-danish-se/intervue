import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, htmlBody) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Intervue" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlBody,
  });
};

export default sendEmail;