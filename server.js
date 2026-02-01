const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Init Scheduler
  try {
    const { initScheduler } = require('./scheduler');
    initScheduler();
  } catch (e) { console.error('Scheduler init failed:', e); }

  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, '0.0.0.0', () => {
    console.log('--------------------------------------------------');
    console.log('> Panel http://localhost:3000 adresinde aktif!');
    console.log('--------------------------------------------------');
  });
});
