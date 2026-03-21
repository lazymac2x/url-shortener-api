const { nanoid } = require('nanoid');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'urls.json');

class URLShortener {
  constructor() {
    this.urls = new Map();
    this.clicks = new Map();
    this._load();
  }

  _load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        for (const [code, entry] of Object.entries(raw.urls || {})) {
          this.urls.set(code, entry);
        }
        for (const [code, entries] of Object.entries(raw.clicks || {})) {
          this.clicks.set(code, entries);
        }
      }
    } catch {
      // Start fresh if file is corrupted
    }
  }

  _save() {
    const data = {
      urls: Object.fromEntries(this.urls),
      clicks: Object.fromEntries(this.clicks),
    };
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  }

  create({ url, alias, expiresIn }) {
    if (!url) throw new Error('URL is required');
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL format');
    }

    const code = alias || nanoid(7);

    if (alias && this.urls.has(alias)) {
      throw new Error('Alias already in use');
    }
    if (this.urls.has(code)) {
      // Extremely unlikely collision with nanoid — retry once
      return this.create({ url, alias: undefined, expiresIn });
    }

    const entry = {
      code,
      originalUrl: url,
      createdAt: new Date().toISOString(),
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null,
      clickCount: 0,
    };

    this.urls.set(code, entry);
    this.clicks.set(code, []);
    this._save();
    return entry;
  }

  resolve(code) {
    const entry = this.urls.get(code);
    if (!entry) return null;
    if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
      return null;
    }
    return entry;
  }

  recordClick(code, { userAgent, referer, ip }) {
    const entry = this.urls.get(code);
    if (!entry) return;
    entry.clickCount++;
    const clickLog = this.clicks.get(code) || [];
    clickLog.push({
      timestamp: new Date().toISOString(),
      userAgent: userAgent || null,
      referer: referer || null,
      ip: ip || null,
    });
    this.clicks.set(code, clickLog);
    this._save();
  }

  getInfo(code) {
    const entry = this.urls.get(code);
    if (!entry) return null;
    return { ...entry };
  }

  getStats(code) {
    const entry = this.urls.get(code);
    if (!entry) return null;

    const clickLog = this.clicks.get(code) || [];

    // Aggregate analytics
    const referers = {};
    const userAgents = {};
    const clicksByHour = {};

    for (const c of clickLog) {
      const ref = c.referer || 'direct';
      referers[ref] = (referers[ref] || 0) + 1;

      const ua = c.userAgent || 'unknown';
      userAgents[ua] = (userAgents[ua] || 0) + 1;

      const hour = c.timestamp ? c.timestamp.slice(0, 13) : 'unknown';
      clicksByHour[hour] = (clicksByHour[hour] || 0) + 1;
    }

    return {
      ...entry,
      analytics: {
        totalClicks: entry.clickCount,
        referers,
        userAgents,
        clicksByHour,
        recentClicks: clickLog.slice(-20),
      },
    };
  }

  delete(code) {
    if (!this.urls.has(code)) return false;
    this.urls.delete(code);
    this.clicks.delete(code);
    this._save();
    return true;
  }

  list({ page = 1, limit = 20 } = {}) {
    const all = Array.from(this.urls.values());
    const total = all.length;
    const start = (page - 1) * limit;
    const items = all.slice(start, start + limit);
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  qrCodeUrl(code, baseUrl) {
    const shortUrl = `${baseUrl}/api/v1/${code}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shortUrl)}`;
  }
}

module.exports = new URLShortener();
