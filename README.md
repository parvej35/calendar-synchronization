# Calendar Synchronization (Node.js)

This app lets a user:

1. Authorize Google Calendar access using OAuth2
2. Fetch upcoming calendar events
3. Summarize each event (title, start, end, location, description, organizer, link)
4. Send the summary email to a designated recipient

## Stack

- Node.js + Express
- Google Calendar API (`googleapis`)
- Session-based OAuth token storage (`express-session`)
- SMTP email sending (`nodemailer`)
- Modern responsive HTML/CSS frontend

## Project Structure

- `src/server.js` - app entrypoint and API routes
- `src/services/googleCalendar.js` - Google OAuth + event fetch
- `src/services/emailService.js` - SMTP delivery
- `src/utils/eventFormatter.js` - event summary formatting
- `public/` - frontend pages and styles
- `tests/eventFormatter.test.js` - small test harness for summary formatting

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env template:

```bash
cp .env.example .env
```

3. Fill `.env` values:

- Google OAuth credentials from Google Cloud Console
- Redirect URI must match exactly: `http://localhost:3000/auth/google/callback`
- SMTP credentials (for Gmail, use an app password)

4. Run tests:

```bash
npm test
```

5. Start app:

```bash
npm run dev
```

6. Open browser:

- `http://localhost:3000`

## Google Cloud Console Notes

- Enable **Google Calendar API**
- Configure OAuth consent screen
- Create OAuth 2.0 Client ID (Web application)
- Add redirect URI: `http://localhost:3000/auth/google/callback`

## API Endpoints

- `GET /auth/google` - start Google OAuth flow
- `GET /auth/google/callback` - OAuth callback
- `GET /api/auth/status` - authentication status
- `GET /api/events?days=7` - fetch upcoming events
- `POST /api/send-summary` - send summary email (`{ days, recipient }`)
- `POST /api/auth/logout` - clear session

## Security Note

This demo stores OAuth tokens in memory-backed session storage. For production, use a persistent session store (Redis, database) and enforce HTTPS.
