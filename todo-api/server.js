const http = require('http');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://TranDuong05-la.github.io',
];

let tasks = [];
let nextId = 1;

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function handleBypassCors(req, res, fullUrl) {
  const targetUrl = fullUrl.searchParams.get('url');
  if (!targetUrl) {
    sendJson(res, 400, { message: 'Missing url query param' });
    return;
  }

  const body = await readBody(req);

  try {
    const fetchOptions = { method: req.method, headers: {} };
    if (req.headers['content-type']) {
      fetchOptions.headers['Content-Type'] = req.headers['content-type'];
    }
    if (body && !['GET', 'HEAD'].includes(req.method)) {
      fetchOptions.body = body;
    }

    const targetRes = await fetch(targetUrl, fetchOptions);
    const contentType = targetRes.headers.get('content-type') || 'application/json';
    const resBody = await targetRes.text();

    res.setHeader('Content-Type', contentType);
    res.writeHead(targetRes.status);
    res.end(resBody);
  } catch (err) {
    sendJson(res, 500, { message: 'Bypass request failed', error: err.message });
  }
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const fullUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = fullUrl.pathname;

  if (pathname === '/bypass-cors') {
    await handleBypassCors(req, res, fullUrl);
    return;
  }

  if (pathname === '/api/tasks' && req.method === 'GET') {
    sendJson(res, 200, tasks);
    return;
  }

  if (pathname === '/api/tasks' && req.method === 'POST') {
    const body = await readBody(req);
    let parsed;
    try {
      parsed = JSON.parse(body || '{}');
    } catch (err) {
      sendJson(res, 400, { message: 'Invalid JSON body' });
      return;
    }
    const newTask = { id: nextId++, title: parsed.title, isCompleted: false };
    tasks.push(newTask);
    sendJson(res, 201, newTask);
    return;
  }

  const taskIdMatch = pathname.match(/^\/api\/tasks\/(\d+)$/);
  if (taskIdMatch) {
    const id = Number(taskIdMatch[1]);
    const task = tasks.find((t) => t.id === id);

    if (req.method === 'GET') {
      if (!task) {
        sendJson(res, 404, { message: 'Task not found' });
        return;
      }
      sendJson(res, 200, task);
      return;
    }

    if (req.method === 'PUT') {
      if (!task) {
        sendJson(res, 404, { message: 'Task not found' });
        return;
      }
      const body = await readBody(req);
      let parsed;
      try {
        parsed = JSON.parse(body || '{}');
      } catch (err) {
        sendJson(res, 400, { message: 'Invalid JSON body' });
        return;
      }
      if (parsed.title !== undefined) task.title = parsed.title;
      if (parsed.isCompleted !== undefined) task.isCompleted = parsed.isCompleted;
      sendJson(res, 200, task);
      return;
    }

    if (req.method === 'DELETE') {
      if (!task) {
        sendJson(res, 404, { message: 'Task not found' });
        return;
      }
      tasks = tasks.filter((t) => t.id !== id);
      sendJson(res, 200, { message: 'Task deleted' });
      return;
    }
  }

  sendJson(res, 404, { message: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
