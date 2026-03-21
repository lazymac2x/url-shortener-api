const express = require('express');
const cors = require('cors');
const shortener = require('./shortener');

const app = express();
const PORT = process.env.PORT || 4100;

app.use(cors());
app.use(express.json());

function getBaseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Create short URL
app.post('/api/v1/shorten', (req, res) => {
  try {
    const { url, alias, expiresIn } = req.body;
    const entry = shortener.create({ url, alias, expiresIn });
    const baseUrl = getBaseUrl(req);
    res.status(201).json({
      success: true,
      data: {
        ...entry,
        shortUrl: `${baseUrl}/api/v1/${entry.code}`,
        qrCode: shortener.qrCodeUrl(entry.code, baseUrl),
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// List all URLs
app.get('/api/v1/list', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const result = shortener.list({ page, limit });
  res.json({ success: true, data: result });
});

// Get URL info
app.get('/api/v1/info/:code', (req, res) => {
  const info = shortener.getInfo(req.params.code);
  if (!info) return res.status(404).json({ success: false, error: 'Not found' });
  const baseUrl = getBaseUrl(req);
  res.json({
    success: true,
    data: {
      ...info,
      shortUrl: `${baseUrl}/api/v1/${info.code}`,
      qrCode: shortener.qrCodeUrl(info.code, baseUrl),
    },
  });
});

// Get detailed stats
app.get('/api/v1/stats/:code', (req, res) => {
  const stats = shortener.getStats(req.params.code);
  if (!stats) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: stats });
});

// Delete short URL
app.delete('/api/v1/:code', (req, res) => {
  const deleted = shortener.delete(req.params.code);
  if (!deleted) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, message: 'Deleted' });
});

// Redirect to original URL
app.get('/api/v1/:code', (req, res) => {
  const entry = shortener.resolve(req.params.code);
  if (!entry) return res.status(404).json({ success: false, error: 'URL not found or expired' });

  shortener.recordClick(req.params.code, {
    userAgent: req.get('user-agent'),
    referer: req.get('referer'),
    ip: req.ip,
  });

  res.redirect(302, entry.originalUrl);
});

app.listen(PORT, () => {
  console.log(`URL Shortener API running on http://localhost:${PORT}`);
});

module.exports = app;
