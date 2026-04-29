import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { RestClientV5 } from "bybit-api";

const client = new RestClientV5({
  key: process.env.BYBIT_API_KEY,
  secret: process.env.BYBIT_API_SECRET,
  testnet: process.env.BYBIT_TESTNET === "true",
});

const server = new Server(
  { name: "bybit-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_tickers",
      description: "Получить текущие цены и изменения за 24ч по всем или конкретным тикерам",
      inputSchema: {
        type: "object",
        properties: {
          symbol: { type: "string", description: "Тикер, например BTCUSDT (опционально)" },
          category: { type: "string", enum: ["spot", "linear", "inverse"], default: "linear" }
        }
      }
    },
    {
      name: "get_klines",
      description: "Свечи (OHLCV) по активу",
      inputSchema: {
        type: "object",
        required: ["symbol", "interval"],
        properties: {
          symbol: { type: "string" },
          interval: { type: "string", enum: ["1", "5", "15", "60", "240", "D", "W"] },
          category: { type: "string", enum: ["spot", "linear", "inverse"], default: "linear" },
          limit: { type: "number", default: 50 }
        }
      }
    },
    {
      name: "get_orderbook",
      description: "Стакан заявок по символу",
      inputSchema: {
        type: "object",
        required: ["symbol"],
        properties: {
          symbol: { type: "string" },
          category: { type: "string", enum: ["spot", "linear", "inverse"], default: "linear" },
          limit: { type: "number", default: 25 }
        }
      }
    },
    {
      name: "get_wallet_balance",
      description: "Баланс кошелька",
      inputSchema: {
        type: "object",
        properties: {
          accountType: { type: "string", enum: ["UNIFIED", "CONTRACT", "SPOT"], default: "UNIFIED" }
        }
      }
    },
    {
      name: "get_positions",
      description: "Открытые позиции",
      inputSchema: {
        type: "object",
        properties: {
          category: { type: "string", enum: ["linear", "inverse"], default: "linear" },
          symbol: { type: "string" }
        }
      }
    },
    {
      name: "get_open_orders",
      description: "Активные ордера",
      inputSchema: {
        type: "object",
        properties: {
          category: { type: "string", default: "linear" },
          symbol: { type: "string" }
        }
      }
    },
    {
      name: "place_order",
      description: "Разместить ордер (спот или деривативы)",
      inputSchema: {
        type: "object",
        required: ["category", "symbol", "side", "orderType", "qty"],
        properties: {
          category: { type: "string", enum: ["spot", "linear", "inverse"] },
          symbol: { type: "string", description: "Например BTCUSDT" },
          side: { type: "string", enum: ["Buy", "Sell"] },
          orderType: { type: "string", enum: ["Market", "Limit"] },
          qty: { type: "string", description: "Количество (строка)" },
          price: { type: "string", description: "Цена (обязательно для Limit)" },
          timeInForce: { type: "string", enum: ["GTC", "IOC", "FOK", "PostOnly"], default: "GTC" },
          marketUnit: { type: "string", enum: ["baseCoin", "quoteCoin"], description: "Для спот market buy" },
          takeProfit: { type: "string" },
          stopLoss: { type: "string" },
          positionIdx: { type: "number", enum: [0, 1, 2], description: "0=one-way, 1=hedge buy, 2=hedge sell" }
        }
      }
    },
    {
      name: "cancel_order",
      description: "Отменить ордер",
      inputSchema: {
        type: "object",
        required: ["category", "symbol"],
        properties: {
          category: { type: "string", enum: ["spot", "linear", "inverse"] },
          symbol: { type: "string" },
          orderId: { type: "string" },
          orderLinkId: { type: "string" }
        }
      }
    },
    {
      name: "cancel_all_orders",
      description: "Отменить все ордера по категории/символу",
      inputSchema: {
        type: "object",
        required: ["category"],
        properties: {
          category: { type: "string", enum: ["spot", "linear", "inverse"] },
          symbol: { type: "string" }
        }
      }
    },
    {
      name: "set_leverage",
      description: "Установить плечо для торговой пары",
      inputSchema: {
        type: "object",
        required: ["category", "symbol", "buyLeverage", "sellLeverage"],
        properties: {
          category: { type: "string", enum: ["linear", "inverse"] },
          symbol: { type: "string" },
          buyLeverage: { type: "string" },
          sellLeverage: { type: "string" }
        }
      }
    },
    {
      name: "get_instruments_info",
      description: "Информация об инструменте (лоты, точность, лимиты)",
      inputSchema: {
        type: "object",
        required: ["category"],
        properties: {
          category: { type: "string", enum: ["spot", "linear", "inverse", "option"] },
          symbol: { type: "string" }
        }
      }
    },
    {
      name: "get_funding_rate",
      description: "Текущая ставка финансирования",
      inputSchema: {
        type: "object",
        required: ["category", "symbol"],
        properties: {
          category: { type: "string", enum: ["linear", "inverse"] },
          symbol: { type: "string" },
          limit: { type: "number", default: 1 }
        }
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case "get_tickers":
        result = await client.getTickers({ category: args.category || "linear", symbol: args.symbol });
        break;
      case "get_klines":
        result = await client.getKline({ category: args.category || "linear", symbol: args.symbol, interval: args.interval, limit: args.limit || 50 });
        break;
      case "get_orderbook":
        result = await client.getOrderbook({ category: args.category || "linear", symbol: args.symbol, limit: args.limit || 25 });
        break;
      case "get_wallet_balance":
        result = await client.getWalletBalance({ accountType: args.accountType || "UNIFIED" });
        break;
      case "get_positions":
        result = await client.getPositionInfo({ category: args.category || "linear", symbol: args.symbol });
        break;
      case "get_open_orders":
        result = await client.getActiveOrders({ category: args.category || "linear", symbol: args.symbol });
        break;
      case "place_order": {
        const orderParams = {
          category: args.category,
          symbol: args.symbol,
          side: args.side,
          orderType: args.orderType,
          qty: args.qty,
        };
        if (args.price) orderParams.price = args.price;
        if (args.timeInForce) orderParams.timeInForce = args.timeInForce;
        if (args.marketUnit) orderParams.marketUnit = args.marketUnit;
        if (args.takeProfit) orderParams.takeProfit = args.takeProfit;
        if (args.stopLoss) orderParams.stopLoss = args.stopLoss;
        if (args.positionIdx !== undefined) orderParams.positionIdx = args.positionIdx;
        result = await client.submitOrder(orderParams);
        break;
      }
      case "cancel_order": {
        const cancelParams = { category: args.category, symbol: args.symbol };
        if (args.orderId) cancelParams.orderId = args.orderId;
        if (args.orderLinkId) cancelParams.orderLinkId = args.orderLinkId;
        result = await client.cancelOrder(cancelParams);
        break;
      }
      case "cancel_all_orders":
        result = await client.cancelAllOrders({ category: args.category, symbol: args.symbol });
        break;
      case "set_leverage":
        result = await client.setLeverage({
          category: args.category,
          symbol: args.symbol,
          buyLeverage: args.buyLeverage,
          sellLeverage: args.sellLeverage,
        });
        break;
      case "get_instruments_info":
        result = await client.getInstrumentsInfo({ category: args.category, symbol: args.symbol });
        break;
      case "get_funding_rate":
        result = await client.getFundingRateHistory({ category: args.category, symbol: args.symbol, limit: args.limit || 1 });
        break;
      default:
        return { content: [{ type: "text", text: `Неизвестный инструмент: ${name}` }], isError: true };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  } catch (e) {
    return {
      content: [{ type: "text", text: `Ошибка: ${e.message}` }],
      isError: true
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
