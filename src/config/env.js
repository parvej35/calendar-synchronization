const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function readEnv(key, fallback = undefined) {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return fallback;
  }
  return value;
}

const env = {
  nodeEnv: readEnv('NODE_ENV', 'development'),
  port: Number(readEnv('PORT', 3000)),
  sessionSecret: readEnv('SESSION_SECRET', 'change-me-in-production'),
  googleClientId: readEnv('GOOGLE_CLIENT_ID'),
  googleClientSecret: readEnv('GOOGLE_CLIENT_SECRET'),
  googleRedirectUri: readEnv('GOOGLE_REDIRECT_URI'),
  defaultRecipientEmail: readEnv('DEFAULT_RECIPIENT_EMAIL'),
  smtpHost: readEnv('SMTP_HOST'),
  smtpPort: Number(readEnv('SMTP_PORT', 587)),
  smtpSecure: readEnv('SMTP_SECURE', 'false') === 'true',
  smtpUser: readEnv('SMTP_USER'),
  smtpPass: readEnv('SMTP_PASS'),
  mailFrom: readEnv('MAIL_FROM', readEnv('SMTP_USER'))
};

function validateEnv() {
  const required = ['googleClientId', 'googleClientSecret', 'googleRedirectUri'];
  const missing = required.filter((key) => !env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment values: ${missing.join(', ')}`);
  }
}

module.exports = {
  env,
  validateEnv
};
