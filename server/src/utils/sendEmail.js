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
  }
};

export default sendEmail;

/*
FILE: src/utils/sendEmail.js
ROLE: Email dispatch utility. Provides a single reusable async function for sending transactional HTML emails via Gmail SMTP using Nodemailer. Errors are swallowed intentionally so that a failed email delivery does not abort the parent operation (e.g. user registration still succeeds if email fails).

FUNCTIONS / LOGIC:
  - sendEmail(to, subject, htmlBody) — creates a Nodemailer transporter configured for Gmail using MAIL_USERNAME and MAIL_PASSWORD from environment variables. Calls transporter.sendMail() with the sender address (SENDER_EMAIL or MAIL_USERNAME), recipient (to), subject, and HTML body. On failure, logs a descriptive error block to the console including the raw htmlBody (which contains the verification/reset URL) so developers can manually use it during local development. The error is not rethrown, ensuring the calling service function continues without interruption.

IMPORTED BY:
  - src/services/auth.service.js — imports sendEmail as the default export and calls it inside createUser() to send email verification links, and inside forgotPassword flow (via the controller which calls authService.createPasswordResetToken then sendEmail directly).
  - src/controllers/auth.controller.js — imports sendEmail as the default export and calls it directly inside forgotPassword() to dispatch the password-reset email after authService.createPasswordResetToken() returns the rawToken.
*/