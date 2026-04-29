# TradingBot Template

Configurable crypto trading assistant template with MCP integrations.

## Architecture

| Component | Purpose |
|---|---|
| `bybit-mcp/` | Local MCP server for market data and trading actions |
| `.mcp.json.example` | MCP client configuration template |
| `CONTEXT.md` | Public-safe session context template |
| `trade_log.md` | Public-safe trade journal template |

## Quick start

1. Copy `.env.example` to `.env` and add your own keys.
2. Install local MCP server dependencies:
   - `cd bybit-mcp && npm install`
3. Copy `.mcp.json.example` to `.mcp.json`.
4. Confirm `.env`, `.mcp.json`, and secret files are ignored by git.
5. Start your MCP client and use the configured `bybit` / `coinmarketcap` tools.

## Security / No Secrets

Never commit:
- API keys, secrets, tokens
- Wallet balances or exchange account screenshots
- Exact order IDs and personal trade history

Checklist before every push:
1. `git --no-pager status`
2. `git --no-pager diff --staged`
3. Ensure `.env` and `.mcp.json` are not tracked
4. Confirm `CONTEXT.md` and `trade_log.md` contain only template/public data

## Demo scenarios

1. **Market summary**: get CMC global context + Bybit price/orderbook/klines, then build one consolidated market view.
2. **Paper-trade mode**: set `BYBIT_DRY_RUN=true` to simulate trading actions without sending real orders.

## Trading risk disclaimer

This project is for software and strategy development. It is **not** financial advice.
Crypto and leveraged trading can cause significant losses. You are fully responsible for all orders and risk decisions.
