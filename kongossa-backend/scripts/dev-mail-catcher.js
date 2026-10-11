/**
 * Local mail catcher for manual testing. Development only.
 *
 * Accepts every email the backend sends over SMTP (nothing leaves the machine)
 * and lists them in a small web page, with the OTP code pulled out of each one,
 * so testers can log in and confirm cash-outs with fake test accounts.
 *
 *   node scripts/dev-mail-catcher.js
 *   SMTP  -> 127.0.0.1:1025   (set SMTP_HOST=127.0.0.1, SMTP_PORT=1025 in .env)
 *   Web   -> http://localhost:8025
 *   JSON  -> http://localhost:8025/api/latest?to=<email>   (newest message to that address)
 *
 * No dependencies; messages live in memory and vanish when it stops.
 */
const net = require('net');
const http = require('http');

const SMTP_PORT = Number(process.env.CATCHER_SMTP_PORT) || 1025;
const HTTP_PORT = Number(process.env.CATCHER_HTTP_PORT) || 8025;
const MAX_MESSAGES = 500;

const messages = [];
let nextId = 1;

// ---------------------------------------------------------------- MIME parsing

function splitHeadersBody(raw) {
  const i = raw.search(/\r?\n\r?\n/);
  if (i === -1) return { headers: {}, body: '' };
  const headerText = raw.slice(0, i).replace(/\r?\n[ \t]+/g, ' ');
  const headers = {};
  for (const line of headerText.split(/\r?\n/)) {
    const c = line.indexOf(':');
    if (c > 0) headers[line.slice(0, c).trim().toLowerCase()] = line.slice(c + 1).trim();
  }
  return { headers, body: raw.slice(i).replace(/^\r?\n\r?\n/, '') };
}

function decodeWords(s = '') {
  return s.replace(/=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g, (_, _cs, enc, text) =>
    enc.toUpperCase() === 'B'
      ? Buffer.from(text, 'base64').toString('utf8')
      : decodeQP(text.replace(/_/g, ' ')),
  );
}

function decodeQP(s) {
  const bytes = [];
  const src = s.replace(/=\r?\n/g, '');
  for (let i = 0; i < src.length; i++) {
    if (src[i] === '=' && /^[0-9A-Fa-f]{2}$/.test(src.substr(i + 1, 2))) {
      bytes.push(parseInt(src.substr(i + 1, 2), 16));
      i += 2;
    } else {
      bytes.push(...Buffer.from(src[i], 'utf8'));
    }
  }
  return Buffer.from(bytes).toString('utf8');
}

function decodeBody(headers, body) {
  const enc = (headers['content-transfer-encoding'] || '').toLowerCase();
  if (enc === 'base64') return Buffer.from(body.replace(/\s+/g, ''), 'base64').toString('utf8');
  if (enc === 'quoted-printable') return decodeQP(body);
  return body;
}

/** Collects text/plain and text/html parts, walking nested multiparts. */
function collectParts(raw, out = { text: '', html: '' }) {
  const { headers, body } = splitHeadersBody(raw);
  const type = (headers['content-type'] || 'text/plain').toLowerCase();
  const boundary = /boundary="?([^";]+)"?/i.exec(headers['content-type'] || '');
  if (type.startsWith('multipart/') && boundary) {
    for (const part of body.split('--' + boundary[1]).slice(1)) {
      if (part.startsWith('--')) break;
      collectParts(part.replace(/^\r?\n/, ''), out);
    }
  } else if (type.startsWith('text/html')) {
    out.html += decodeBody(headers, body);
  } else if (type.startsWith('text/')) {
    out.text += decodeBody(headers, body);
  }
  return out;
}

function store(envelope, raw) {
  const { headers } = splitHeadersBody(raw);
  const parts = collectParts(raw);
  const plain = parts.text || parts.html.replace(/<[^>]*>/g, ' ');
  const otp = (/\b(\d{6})\b/.exec(plain) || [])[1] || null;
  const msg = {
    id: nextId++,
    receivedAt: new Date().toISOString(),
    to: envelope.to.join(', ') || headers.to || '',
    from: envelope.from || headers.from || '',
    subject: decodeWords(headers.subject || '(no subject)'),
    otp,
    text: parts.text,
    html: parts.html,
  };
  messages.unshift(msg);
  messages.length = Math.min(messages.length, MAX_MESSAGES);
  console.log(`[mail] #${msg.id} to=${msg.to} subject="${msg.subject}"${otp ? ` OTP=${otp}` : ''}`);
}

// ------------------------------------------------------------------ SMTP server

net
  .createServer((socket) => {
    let buffer = '';
    let inData = false;
    let authStep = null;
    let envelope = { from: '', to: [] };
    const reply = (line) => socket.write(line + '\r\n');

    reply('220 kongossa-dev-mail-catcher ESMTP');

    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      for (;;) {
        if (inData) {
          const end = buffer.indexOf('\r\n.\r\n');
          if (end === -1) return;
          const raw = buffer.slice(0, end).replace(/\r\n\.\./g, '\r\n.');
          buffer = buffer.slice(end + 5);
          inData = false;
          store(envelope, raw);
          envelope = { from: '', to: [] };
          reply('250 OK: queued');
          continue;
        }
        const nl = buffer.indexOf('\r\n');
        if (nl === -1) return;
        const line = buffer.slice(0, nl);
        buffer = buffer.slice(nl + 2);

        if (authStep === 'user') { authStep = 'pass'; reply('334 UGFzc3dvcmQ6'); continue; }
        if (authStep === 'pass') { authStep = null; reply('235 Authentication successful'); continue; }

        const cmd = line.slice(0, 4).toUpperCase();
        if (cmd === 'EHLO') {
          socket.write('250-kongossa-dev-mail-catcher\r\n250-AUTH PLAIN LOGIN\r\n250 8BITMIME\r\n');
        } else if (cmd === 'HELO') reply('250 kongossa-dev-mail-catcher');
        else if (cmd === 'AUTH') {
          if (/^AUTH LOGIN/i.test(line)) { authStep = 'user'; reply('334 VXNlcm5hbWU6'); }
          else reply('235 Authentication successful');
        } else if (cmd === 'MAIL') {
          envelope.from = (/<([^>]*)>/.exec(line) || [])[1] || '';
          reply('250 OK');
        } else if (cmd === 'RCPT') {
          envelope.to.push((/<([^>]*)>/.exec(line) || [])[1] || '');
          reply('250 OK');
        } else if (cmd === 'DATA') { inData = true; reply('354 End data with <CR><LF>.<CR><LF>'); }
        else if (cmd === 'RSET') { envelope = { from: '', to: [] }; reply('250 OK'); }
        else if (cmd === 'QUIT') { reply('221 Bye'); socket.end(); return; }
        else reply('250 OK');
      }
    });
    socket.on('error', () => {});
  })
  .listen(SMTP_PORT, '127.0.0.1', () => console.log(`SMTP listening on 127.0.0.1:${SMTP_PORT}`));

// ------------------------------------------------------------------- Web viewer

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function listPage(filter) {
  const rows = messages
    .filter((m) => !filter || m.to.toLowerCase().includes(filter.toLowerCase()))
    .map(
      (m) => `<tr><td>${m.id}</td><td>${new Date(m.receivedAt).toLocaleTimeString()}</td>
      <td>${esc(m.to)}</td><td>${esc(m.subject)}</td>
      <td class="otp">${m.otp ? esc(m.otp) : ''}</td><td><a href="/message/${m.id}">open</a></td></tr>`,
    )
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Dev Mail Catcher</title><meta http-equiv="refresh" content="5">
<style>body{font-family:system-ui,sans-serif;margin:16px;background:#f6f7f9;color:#1b1f24}
table{border-collapse:collapse;width:100%;background:#fff}th,td{padding:8px;border-bottom:1px solid #dde1e7;text-align:left;font-size:14px}
th{background:#f0f2f5}.otp{font:700 20px ui-monospace,Consolas,monospace;letter-spacing:2px;color:#1a7f45}
form{margin:0 0 12px}input{padding:6px 8px;width:260px;max-width:100%}</style></head><body>
<h2 style="margin:0 0 4px">Dev Mail Catcher</h2><p style="margin:0 0 12px;color:#5b6470">Local only. Auto-refreshes every 5 s. ${messages.length} message(s).</p>
<form><input name="to" placeholder="filter by recipient" value="${esc(filter || '')}"> <button>Filter</button></form>
<div style="overflow-x:auto"><table><tr><th>#</th><th>Time</th><th>To</th><th>Subject</th><th>OTP</th><th></th></tr>${rows || '<tr><td colspan="6">No mail yet.</td></tr>'}</table></div>
</body></html>`;
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/latest') {
      const to = (url.searchParams.get('to') || '').toLowerCase();
      const m = messages.find((x) => !to || x.to.toLowerCase().includes(to));
      res.writeHead(m ? 200 : 404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(m ? { id: m.id, to: m.to, subject: m.subject, otp: m.otp, receivedAt: m.receivedAt } : { error: 'not found' }));
    }
    const view = /^\/message\/(\d+)$/.exec(url.pathname);
    if (view) {
      const m = messages.find((x) => x.id === Number(view[1]));
      res.writeHead(m ? 200 : 404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(m ? m.html || `<pre>${esc(m.text)}</pre>` : 'Not found');
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(listPage(url.searchParams.get('to')));
  })
  .listen(HTTP_PORT, () => console.log(`Web viewer on http://localhost:${HTTP_PORT}`));
