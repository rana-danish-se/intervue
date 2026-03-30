import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, htmlBody) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Intervue" <${process.env.SENDER_EMAIL || process.env.MAIL_USERNAME}>`,
      to,
      subject,
      html: htmlBody,
    });
  } catch (error) {
    console.error('===================================================');
    console.error('📧 EMAIL DISPATCH FAILED!');
    console.error('SMTP Credentials in .env are missing or invalid.');
    console.error('For local development, here is the link to verify:');
    console.error(htmlBody);
    console.error('===================================================');
    // We swallow the error so the registration process continues successfully!
  }
};

export default sendEmail;