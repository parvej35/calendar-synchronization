const nodemailer = require('nodemailer');
const { env } = require('../config/env');

function createTransporter() {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    throw new Error('SMTP configuration is missing. Set SMTP_HOST, SMTP_USER and SMTP_PASS in .env');
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });
}

async function sendSummaryEmail({ to, subject, text, html }) {
  const transporter = createTransporter();
  return transporter.sendMail({
    from: env.mailFrom,
    to,
    subject,
    text,
    html
  });
}

module.exports = {
  sendSummaryEmail
};