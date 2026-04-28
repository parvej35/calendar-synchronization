const test = require('node:test');
const assert = require('node:assert/strict');
const {
  formatDate,
  buildPlainTextSummary,
  buildHtmlSummary
} = require('../src/utils/eventFormatter');

test('formatDate keeps unknown values unchanged', () => {
  assert.equal(formatDate('invalid-value'), 'invalid-value');
});

test('buildPlainTextSummary renders key fields', () => {
  const events = [
    {
      title: 'Team Sync',
      start: '2026-04-28T09:00:00Z',
      end: '2026-04-28T10:00:00Z',
      location: '',
      description: 'Weekly standup',
      organizer: 'manager@example.com',
      htmlLink: 'https://calendar.google.com/event'
    }
  ];

  const summary = buildPlainTextSummary(events);
  assert.match(summary, /Team Sync/);
  assert.match(summary, /Location: -/);
  assert.match(summary, /Description: Weekly standup/);
  assert.doesNotMatch(summary, /Organizer:/);
  assert.doesNotMatch(summary, /Link:/);
});

test('buildHtmlSummary outputs table row', () => {
  const events = [
    {
      title: 'Design Review',
      start: '2026-04-29T11:00:00Z',
      end: '2026-04-29T12:30:00Z',
      location: '',
      description: 'Review homepage update',
      organizer: 'lead@example.com',
      htmlLink: 'https://calendar.google.com/event?id=1'
    }
  ];

  const html = buildHtmlSummary(events);
  assert.match(html, /<table/);
  assert.match(html, /Design Review/);
  assert.match(html, /Duration/);
  assert.match(html, />1h 30m<\/td>/);
  assert.match(html, />-<\/td>/);
  assert.doesNotMatch(html, /Organizer/);
  assert.doesNotMatch(html, /Link/);
});