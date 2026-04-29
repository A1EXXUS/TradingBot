# TradingBot Template

Template repository for a configurable crypto trading assistant with MCP integrations.

## What is included
- Bybit MCP server (`bybit-mcp/`)
- Example MCP config (`.mcp.json.example`)
- Public-safe context/log templates (`CONTEXT.md`, `trade_log.md`)

## Quick start
1. Copy `.mcp.json.example` to `.mcp.json`
2. Add your own API keys to `.mcp.json`
3. Keep secrets local (`.mcp.json`, `.env`) and never commit them

## Safety
- This repository is public-template ready.
- Do not store balances, order IDs, or personal trade history in tracked files.
