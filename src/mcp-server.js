#!/usr/bin/env node

/**
 * MCP Server for URL Shortener API
 * Protocol: JSON-RPC 2.0 over stdio
 */

const shortener = require('./shortener');
const readline = require('readline');

const SERVER_INFO = {
  name: 'url-shortener-mcp',
  version: '1.0.0',
};

const BASE_URL = process.env.BASE_URL || 'http://localhost:4100';

const TOOLS = [
  {
    name: 'shorten_url',
    description: 'Create a shortened URL. Returns the short code, short URL, and QR code link.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The URL to shorten' },
        alias: { type: 'string', description: 'Optional custom alias for the short code' },
        expiresIn: { type: 'number', description: 'Optional expiration time in seconds' },
      },
      required: ['url'],
    },
  },
  {
    name: 'get_url_info',
    description: 'Get information about a shortened URL including click count.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'The short code to look up' },
      },
      required: ['code'],
    },
  },
  {
    name: 'get_url_stats',
    description: 'Get detailed click analytics for a shortened URL.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'The short code to get analytics for' },
      },
      required: ['code'],
    },
  },
  {
    name: 'delete_url',
    description: 'Delete a shortened URL.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'The short code to delete' },
      },
      required: ['code'],
    },
  },
  {
    name: 'list_urls',
    description: 'List all shortened URLs with pagination.',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        limit: { type: 'number', description: 'Items per page (default: 20)' },
      },
    },
  },
];

function handleToolCall(name, args) {
  switch (name) {
    case 'shorten_url': {
      const entry = shortener.create({
        url: args.url,
        alias: args.alias,
        expiresIn: args.expiresIn,
      });
      return {
        ...entry,
        shortUrl: `${BASE_URL}/api/v1/${entry.code}`,
        qrCode: shortener.qrCodeUrl(entry.code, BASE_URL),
      };
    }
    case 'get_url_info': {
      const info = shortener.getInfo(args.code);
      if (!info) throw new Error('URL not found');
      return {
        ...info,
        shortUrl: `${BASE_URL}/api/v1/${info.code}`,
        qrCode: shortener.qrCodeUrl(info.code, BASE_URL),
      };
    }
    case 'get_url_stats': {
      const stats = shortener.getStats(args.code);
      if (!stats) throw new Error('URL not found');
      return stats;
    }
    case 'delete_url': {
      const deleted = shortener.delete(args.code);
      if (!deleted) throw new Error('URL not found');
      return { success: true, message: `Deleted ${args.code}` };
    }
    case 'list_urls': {
      return shortener.list({ page: args.page || 1, limit: args.limit || 20 });
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function handleRequest(request) {
  const { method, params, id } = request;

  switch (method) {
    case 'initialize':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: SERVER_INFO,
        },
      };

    case 'notifications/initialized':
      return null; // No response for notifications

    case 'tools/list':
      return {
        jsonrpc: '2.0',
        id,
        result: { tools: TOOLS },
      };

    case 'tools/call': {
      try {
        const result = handleToolCall(params.name, params.arguments || {});
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          },
        };
      } catch (err) {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: `Error: ${err.message}` }],
            isError: true,
          },
        };
      }
    }

    default:
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Method not found: ${method}` },
      };
  }
}

// stdio transport
const rl = readline.createInterface({ input: process.stdin, terminal: false });

rl.on('line', (line) => {
  try {
    const request = JSON.parse(line);
    const response = handleRequest(request);
    if (response) {
      process.stdout.write(JSON.stringify(response) + '\n');
    }
  } catch (err) {
    const errResponse = {
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: 'Parse error' },
    };
    process.stdout.write(JSON.stringify(errResponse) + '\n');
  }
});

process.stderr.write('URL Shortener MCP Server started (stdio)\n');
