<p align="center"><img src="logo.png" width="120" alt="logo"></p>

[![lazymac API Store](https://img.shields.io/badge/lazymac-API%20Store-blue?style=flat-square)](https://lazymac2x.github.io/lazymac-api-store/) [![Gumroad](https://img.shields.io/badge/Buy%20on-Gumroad-ff69b4?style=flat-square)](https://coindany.gumroad.com/) [![MCPize](https://img.shields.io/badge/MCP-MCPize-green?style=flat-square)](https://mcpize.com/mcp/url-shortener-api)

# URL Shortener API

[![npm](https://img.shields.io/npm/v/@lazymac/mcp.svg?label=%40lazymac%2Fmcp&color=orange)](https://www.npmjs.com/package/@lazymac/mcp)
[![Smithery](https://img.shields.io/badge/Smithery-lazymac%2Fmcp-orange)](https://smithery.ai/server/lazymac/mcp)
[![lazymac Pro](https://img.shields.io/badge/lazymac%20Pro-%2429%2Fmo-ff6b35)](https://coindany.gumroad.com/l/zlewvz)
[![api.lazy-mac.com](https://img.shields.io/badge/REST-api.lazy--mac.com-orange)](https://api.lazy-mac.com)

> 🚀 Want all 42 lazymac tools through ONE MCP install? `npx -y @lazymac/mcp` · [Pro $29/mo](https://coindany.gumroad.com/l/zlewvz) for unlimited calls.

Self-hosted URL shortener with click tracking, analytics, and MCP server. No external services required — uses in-memory store with JSON file persistence.

## Quick Start

```bash
npm install
npm start        # API on http://localhost:4100
npm run mcp      # MCP server (stdio)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/shorten` | Create short URL |
| GET | `/api/v1/:code` | Redirect to original URL (302) |
| GET | `/api/v1/info/:code` | URL info + click count |
| GET | `/api/v1/stats/:code` | Detailed click analytics |
| DELETE | `/api/v1/:code` | Delete short URL |
| GET | `/api/v1/list` | List all URLs (paginated) |
| GET | `/health` | Health check |

## Create Short URL

```bash
curl -X POST http://localhost:4100/api/v1/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "alias": "ex", "expiresIn": 86400}'
```

Response includes: `shortUrl`, `qrCode` (link to QR image), `code`, `createdAt`, `expiresAt`.

## MCP Server

Add to your Claude Desktop or MCP client config:

```json
{
  "mcpServers": {
    "url-shortener": {
      "command": "node",
      "args": ["/path/to/url-shortener-api/src/mcp-server.js"],
      "env": { "BASE_URL": "http://localhost:4100" }
    }
  }
}
```

### MCP Tools

- `shorten_url` — Create a shortened URL
- `get_url_info` — Get URL info and click count
- `get_url_stats` — Detailed click analytics
- `delete_url` — Delete a shortened URL
- `list_urls` — List all URLs with pagination

## Docker

```bash
docker build -t url-shortener-api .
docker run -p 4100:4100 url-shortener-api
```

## Features

- Short code generation (nanoid, 7 chars)
- Custom aliases
- Expiration dates
- Click tracking (timestamp, user-agent, referer, IP)
- QR code URL generation
- JSON file persistence (`data/urls.json`)
- Pagination on list endpoint

## License

MIT

## Related projects

- 🧰 **[lazymac-mcp](https://github.com/lazymac2x/lazymac-mcp)** — Single MCP server exposing 15+ lazymac APIs as tools for Claude Code, Cursor, Windsurf
- ✅ **[lazymac-api-healthcheck-action](https://github.com/lazymac2x/lazymac-api-healthcheck-action)** — Free GitHub Action to ping any URL on a cron and fail on non-2xx
- 🌐 **[api.lazy-mac.com](https://api.lazy-mac.com)** — 36+ developer APIs, REST + MCP, free tier

<sub>💡 Host your own stack? <a href="https://m.do.co/c/c8c07a9d3273">Get $200 DigitalOcean credit</a> via lazymac referral link.</sub>
