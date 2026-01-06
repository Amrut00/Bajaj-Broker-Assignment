const tradeService = require('../services/tradeService');
const { asyncHandler } = require('../middleware/errorHandler');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');

class TradeController {
  /**
   * Get all trades for the authenticated user
   * @route GET /api/v1/trades
   */
  getAllTrades = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const options = {
      symbol: req.query.symbol,
      orderType: req.query.orderType,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
      minAmount: req.query.minAmount,
      maxAmount: req.query.maxAmount,
      page: req.query.page,
      limit: req.query.limit
    };

    // Remove undefined options
    Object.keys(options).forEach(key => {
      if (options[key] === undefined) {
        delete options[key];
      }
    });

    const result = tradeService.getAllTrades(userId, options);

    // Handle paginated response
    if (result.data && result.pagination) {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.DATA_RETRIEVED,
        data: {
          trades: result.data,
          pagination: result.pagination,
          filters: Object.keys(options).length > 0 ? options : null
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.DATA_RETRIEVED,
        data: {
          trades: result,
          total: result.length,
          filters: Object.keys(options).length > 0 ? options : null
        },
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * Get trade by ID
   * @route GET /api/v1/trades/:tradeId
   */
  getTradeById = asyncHandler(async (req, res) => {
    const { tradeId } = req.params;
    const userId = req.user.id;
    
    const trade = tradeService.getTradeById(tradeId, userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.SUCCESS.DATA_RETRIEVED,
      data: {
        trade
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get trades by order ID
   * @route GET /api/v1/trades/order/:orderId
   */
  getTradesByOrderId = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.id;
    
    const trades = tradeService.getTradesByOrderId(orderId, userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Trades for order ${orderId} retrieved successfully`,
      data: {
        trades,
        total: trades.length,
        orderId
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get trades by symbol
   * @route GET /api/v1/trades/symbol/:symbol
   */
  getTradesBySymbol = asyncHandler(async (req, res) => {
    const { symbol } = req.params;
    const userId = req.user.id;
    
    const trades = tradeService.getTradesBySymbol(symbol.toUpperCase(), userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Trades for ${symbol.toUpperCase()} retrieved successfully`,
      data: {
        trades,
        total: trades.length,
        symbol: symbol.toUpperCase()
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get trade statistics
   * @route GET /api/v1/trades/stats
   */
  getTradeStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const stats = tradeService.getTradeStats(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Trade statistics retrieved successfully',
      data: {
        tradeStats: stats
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get buy trades
   * @route GET /api/v1/trades/buy
   */
  getBuyTrades = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const options = {
      ...req.query,
      orderType: 'BUY'
    };
    
    const trades = tradeService.getAllTrades(userId, options);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Buy trades retrieved successfully',
      data: {
        trades: trades.data || trades,
        total: trades.data ? trades.data.length : trades.length,
        orderType: 'BUY',
        pagination: trades.pagination || null
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get sell trades
   * @route GET /api/v1/trades/sell
   */
  getSellTrades = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const options = {
      ...req.query,
      orderType: 'SELL'
    };
    
    const trades = tradeService.getAllTrades(userId, options);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Sell trades retrieved successfully',
      data: {
        trades: trades.data || trades,
        total: trades.data ? trades.data.length : trades.length,
        orderType: 'SELL',
        pagination: trades.pagination || null
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get trading activity for a date range
   * @route GET /api/v1/trades/activity
   */
  getTradingActivity = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { fromDate, toDate } = req.query;

    // Default to last 30 days if no dates provided
    const endDate = toDate ? new Date(toDate) : new Date();
    const startDate = fromDate ? new Date(fromDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const activity = tradeService.getTradingActivity(userId, startDate, endDate);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Trading activity retrieved successfully',
      data: {
        activity,
        dateRange: {
          from: startDate.toISOString().split('T')[0],
          to: endDate.toISOString().split('T')[0]
        }
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get recent trades
   * @route GET /api/v1/trades/recent
   */
  getRecentTrades = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;
    
    const trades = tradeService.getAllTrades(userId, { limit });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Recent trades retrieved successfully',
      data: {
        trades: trades.data || trades.slice(0, limit),
        total: trades.data ? trades.data.length : trades.slice(0, limit).length
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get trades summary by date range
   * @route GET /api/v1/trades/summary
   */
  getTradesSummary = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { fromDate, toDate, groupBy = 'day' } = req.query;

    // Get all trades
    const options = {};
    if (fromDate) options.fromDate = fromDate;
    if (toDate) options.toDate = toDate;

    const trades = tradeService.getAllTrades(userId, options);
    const allTrades = trades.data || trades;

    // Group trades by the specified period
    const groupedTrades = {};
    
    allTrades.forEach(trade => {
      const date = new Date(trade.executedAt);
      let key;
      
      switch (groupBy) {
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'day':
        default:
          key = date.toISOString().split('T')[0];
          break;
      }
      
      if (!groupedTrades[key]) {
        groupedTrades[key] = {
          period: key,
          trades: 0,
          buyTrades: 0,
          sellTrades: 0,
          volume: 0,
          value: 0
        };
      }
      
      const group = groupedTrades[key];
      group.trades += 1;
      group.volume += trade.quantity;
      group.value += trade.totalAmount;
      
      if (trade.orderType === 'BUY') {
        group.buyTrades += 1;
      } else {
        group.sellTrades += 1;
      }
    });

    const summary = Object.values(groupedTrades).sort((a, b) => a.period.localeCompare(b.period));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Trades summary retrieved successfully',
      data: {
        summary,
        groupBy,
        totalPeriods: summary.length
      },
      timestamp: new Date().toISOString()
    });
  });
}

module.exports = new TradeController();
