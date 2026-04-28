function formatDate(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

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

function renderEvents(events) {
  const body = document.querySelector('#eventsTable tbody');
  body.innerHTML = '';

  if (!events.length) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="5">No events found for selected range.</td>';
    body.appendChild(row);
    return;
  }

  events.forEach((event) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${event.title}</td>
      <td>${formatTimeRange(event.start, event.end)}</td>
      <td>${formatDuration(event.start, event.end)}</td>
      <td>${event.location}</td>
      <td>${event.description}</td>
    `;
    body.appendChild(row);
  });
}

async function getAuthStatus() {
  const response = await fetch('/api/auth/status');
  const data = await response.json();
  return data.authenticated;
}

async function loadEvents() {
  const status = document.getElementById('statusText');
  const days = Number(document.getElementById('daysInput').value || 7);

  status.textContent = 'Loading events...';
  const response = await fetch(`/api/events?days=${encodeURIComponent(days)}`);
  const data = await response.json();

  if (!response.ok) {
    status.textContent = data.error || 'Failed to fetch events.';
    return;
  }

  renderEvents(data.events);
  status.textContent = `Loaded ${data.total} event(s).`;
}

async function sendSummary() {
  const status = document.getElementById('statusText');
  const days = Number(document.getElementById('daysInput').value || 7);
  const recipient = document.getElementById('recipientInput').value.trim();

  status.textContent = 'Sending summary email...';

  const response = await fetch('/api/send-summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ days, recipient })
  });
  const data = await response.json();

  if (!response.ok) {
    status.textContent = data.error || 'Failed to send summary email.';
    return;
  }

  status.textContent = `Email sent to ${data.recipient}.`;
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/';
}

async function init() {
  const authenticated = await getAuthStatus();
  if (!authenticated) {
    window.location.href = '/';
    return;
  }

  document.getElementById('loadEventsBtn').addEventListener('click', loadEvents);
  document.getElementById('sendSummaryBtn').addEventListener('click', sendSummary);
  document.getElementById('logoutBtn').addEventListener('click', logout);

  loadEvents().catch((error) => {
    document.getElementById('statusText').textContent = error.message;
  });
}

init().catch((error) => {
  document.getElementById('statusText').textContent = error.message;
});