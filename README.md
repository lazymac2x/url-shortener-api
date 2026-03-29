<p align="center"><img src="logo.png" width="120" alt="logo"></p>

[![lazymac API Store](https://img.shields.io/badge/lazymac-API%20Store-blue?style=flat-square)](https://lazymac2x.github.io/lazymac-api-store/) [![Gumroad](https://img.shields.io/badge/Buy%20on-Gumroad-ff69b4?style=flat-square)](https://coindany.gumroad.com/) [![MCPize](https://img.shields.io/badge/MCP-MCPize-green?style=flat-square)](https://mcpize.com/mcp/url-shortener-api)

# URL Shortener API

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
