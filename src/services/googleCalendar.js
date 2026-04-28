const { google } = require('googleapis');
const { env } = require('../config/env');

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

function createOAuthClient() {
  return new google.auth.OAuth2(
    env.googleClientId,
    env.googleClientSecret,
    env.googleRedirectUri
  );
}

function getAuthUrl() {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES
  });
}

async function exchangeCodeForTokens(code) {
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);
  return tokens;
}

function normalizeEvent(event) {
  const start = event.start?.dateTime || event.start?.date || null;
  const end = event.end?.dateTime || event.end?.date || null;

  return {
    id: event.id,
    title: event.summary || 'Untitled Event',
    start,
    end,
    location: event.location || '-',
    description: event.description || '-'
  };
}

function toTimestamp(value) {
  if (!value) return Number.POSITIVE_INFINITY;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? Number.POSITIVE_INFINITY : date.getTime();
}

async function fetchEvents(tokens, { days = 7, maxResults = 100 } = {}) {
  const auth = createOAuthClient();
  auth.setCredentials(tokens);

  const calendar = google.calendar({ version: 'v3', auth });
  const now = new Date();
  const until = new Date(now.getTime() + Number(days) * 24 * 60 * 60 * 1000);

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: now.toISOString(),
    timeMax: until.toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: 'startTime'
  });

  return (response.data.items || [])
    .map(normalizeEvent)
    .sort((a, b) => toTimestamp(a.start) - toTimestamp(b.start));
}

module.exports = {
  getAuthUrl,
  exchangeCodeForTokens,
  fetchEvents
};