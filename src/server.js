const path = require('path');
const express = require('express');
const session = require('express-session');
const { env, validateEnv } = require('./config/env');
const { getAuthUrl, exchangeCodeForTokens, fetchEvents } = require('./services/googleCalendar');
const { buildPlainTextSummary, buildHtmlSummary } = require('./utils/eventFormatter');
const { sendSummaryEmail } = require('./services/emailService');

validateEnv();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'lax'
    }
  })
);

app.use(express.static(path.resolve(__dirname, '..', 'public')));

function requireAuth(req, res, next) {
  if (!req.session.tokens) {
    return res.status(401).json({ error: 'Unauthorized. Connect Google Calendar first.' });
  }
  return next();
}

app.get('/dashboard', (req, res) => {
  if (!req.session.tokens) {
    return res.redirect('/');
  }
  return res.sendFile(path.resolve(__dirname, '..', 'public', 'dashboard.html'));
});

app.get('/auth/google', (req, res) => {
  const authUrl = getAuthUrl();
  res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).send('Missing authorization code.');
    }

    const tokens = await exchangeCodeForTokens(code);
    req.session.tokens = tokens;
    return res.redirect('/dashboard');
  } catch (error) {
    return res.status(500).send(`Google authorization failed: ${error.message}`);
  }
});

app.get('/api/auth/status', (req, res) => {
  res.json({ authenticated: Boolean(req.session.tokens) });
});

app.get('/api/events', requireAuth, async (req, res) => {
  try {
    const days = Number(req.query.days || 7);
    const events = await fetchEvents(req.session.tokens, { days });
    return res.json({ total: events.length, events });
  } catch (error) {
    return res.status(500).json({ error: `Failed to fetch events: ${error.message}` });
  }
});

app.post('/api/send-summary', requireAuth, async (req, res) => {
  try {
    const days = Number(req.body.days || 7);
    const recipient = req.body.recipient || env.defaultRecipientEmail;

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient email is required.' });
    }

    const events = await fetchEvents(req.session.tokens, { days });
    const subject = `Calendar Summary (${events.length} event${events.length === 1 ? '' : 's'})`;
    const text = buildPlainTextSummary(events);
    const html = buildHtmlSummary(events);

    const mailInfo = await sendSummaryEmail({
      to: recipient,
      subject,
      text,
      html
    });

    return res.json({
      message: 'Summary email sent successfully.',
      recipient,
      accepted: mailInfo.accepted,
      rejected: mailInfo.rejected
    });
  } catch (error) {
    return res.status(500).json({ error: `Failed to send summary email: ${error.message}` });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out.' });
  });
});

app.listen(env.port, () => {
  // Keep startup logs concise and actionable for local setup.
  console.log(`Calendar sync app running on http://localhost:${env.port}`);
});
