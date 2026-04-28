function formatDate(value) {
  if (!value) return 'N/A';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: value.includes('T') ? 'short' : undefined
  }).format(date);
}

function formatTimeRange(start, end) {
  const startText = formatDate(start);
  const endText = formatDate(end);

  if (endText === 'N/A') {
    return startText;
  }

  return `${startText} - ${endText}`;
}

function formatDuration(start, end) {
  if (!start || !end) return '-';

  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return '-';

  const totalMinutes = Math.floor((endDate.getTime() - startDate.getTime()) / 60000);
  if (totalMinutes <= 0) return '-';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function buildPlainTextSummary(events) {
  if (!events.length) {
    return 'No upcoming events were found for the selected time range.';
  }

  return events
    .map((event, index) => {
      return [
        `${index + 1}. ${event.title}`,
        `   Start: ${formatDate(event.start)}`,
        `   End: ${formatDate(event.end)}`,
        `   Location: ${event.location || '-'}`,
        `   Description: ${event.description}`
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildHtmlSummary(events) {
  if (!events.length) {
    return '<p>No upcoming events were found for the selected time range.</p>';
  }

  const rows = events
    .map((event) => {
      return `
        <tr>
          <td>${escapeHtml(event.title)}</td>
          <td>${escapeHtml(formatTimeRange(event.start, event.end))}</td>
          <td>${escapeHtml(formatDuration(event.start, event.end))}</td>
          <td>${escapeHtml(event.location || '-')}</td>
          <td>${escapeHtml(event.description)}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <p>Here is your Google Calendar summary:</p>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; font-family: Arial, sans-serif;">
      <thead>
        <tr>
          <th>Title</th>
          <th>Time</th>
          <th>Duration</th>
          <th>Location</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

module.exports = {
  formatDate,
  buildPlainTextSummary,
  buildHtmlSummary
};