const memoryStore = require('../database/memoryStore');
const { AppError } = require('../middleware/errorHandler');
const { formatCurrency, generateTradeReference, paginate } = require('../utils/helpers');
const { HTTP_STATUS } = require('../utils/constants');

class TradeService {
  /**
   * Create a new trade record
   * @param {Object} tradeData - Trade data
   * @returns {Object} Created trade
   */
  createTrade(tradeData) {
    try {
      // Calculate total amount
      const totalAmount = tradeData.quantity * tradeData.price;
      
      // Generate trade reference
      const tradeReference = generateTradeReference();

      const trade = memoryStore.createTrade({
        ...tradeData,
        totalAmount,
        tradeReference,
        executedAt: new Date()
      });

      console.log(`📈 Trade created: ${tradeReference} - ${tradeData.orderType} ${tradeData.quantity} ${tradeData.symbol} @ ₹${tradeData.price}`);
      
      return trade;
    } catch (error) {
      throw new AppError('Failed to create trade record', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get all trades for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Array} Array of trades
   */
  getAllTrades(userId, options = {}) {
    try {
      let trades = memoryStore.getAllTrades(userId);

      // Apply filters
      if (options.symbol) {
        trades = trades.filter(trade => 
          trade.symbol.toLowerCase() === options.symbol.toLowerCase()
        );
      }

      if (options.orderType) {
        trades = trades.filter(trade => trade.orderType === options.orderType);
      }

      if (options.fromDate) {
        const fromDate = new Date(options.fromDate);
        trades = trades.filter(trade => 
          new Date(trade.executedAt) >= fromDate
        );
      }

      if (options.toDate) {
        const toDate = new Date(options.toDate);
        trades = trades.filter(trade => 
          new Date(trade.executedAt) <= toDate
        );
      }

      if (options.minAmount) {
        trades = trades.filter(trade => 
          trade.totalAmount >= parseFloat(options.minAmount)
        );
      }

      if (options.maxAmount) {
        trades = trades.filter(trade => 
          trade.totalAmount <= parseFloat(options.maxAmount)
        );
      }

      // Sort by execution date (newest first)
      trades.sort((a, b) => new Date(b.executedAt) - new Date(a.executedAt));

      // Add formatted values for display
      trades = trades.map(trade => ({
        ...trade,
        formattedAmount: formatCurrency(trade.totalAmount),
        formattedPrice: formatCurrency(trade.price)
      }));

      // Apply pagination if requested
      if (options.page || options.limit) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        return paginate(trades, page, limit);
      }

      return trades;
    } catch (error) {
      throw new AppError('Failed to retrieve trades', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get trade by ID
   * @param {string} tradeId - Trade ID
   * @param {string} userId - User ID
   * @returns {Object} Trade object
   */
  getTradeById(tradeId, userId) {
    try {
      const trades = memoryStore.getAllTrades(userId);
      const trade = trades.find(t => t.id === tradeId);

      if (!trade) {
        throw new AppError('Trade not found', HTTP_STATUS.NOT_FOUND);
      }

      return {
        ...trade,
        formattedAmount: formatCurrency(trade.totalAmount),
        formattedPrice: formatCurrency(trade.price)
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to retrieve trade', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get trades by order ID
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID
   * @returns {Array} Array of trades for the order
   */
  getTradesByOrderId(orderId, userId) {
    try {
      const trades = memoryStore.getAllTrades(userId);
      const orderTrades = trades.filter(trade => trade.orderId === orderId);

      return orderTrades.map(trade => ({
        ...trade,
        formattedAmount: formatCurrency(trade.totalAmount),
        formattedPrice: formatCurrency(trade.price)
      }));
    } catch (error) {
      throw new AppError('Failed to retrieve order trades', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get trades by symbol
   * @param {string} symbol - Instrument symbol
   * @param {string} userId - User ID
   * @returns {Array} Array of trades for the symbol
   */
  getTradesBySymbol(symbol, userId) {
    try {
      const trades = memoryStore.getAllTrades(userId);
      const symbolTrades = trades.filter(trade => 
        trade.symbol.toLowerCase() === symbol.toLowerCase()
      );

      // Sort by execution date (newest first)
      symbolTrades.sort((a, b) => new Date(b.executedAt) - new Date(a.executedAt));

      return symbolTrades.map(trade => ({
        ...trade,
        formattedAmount: formatCurrency(trade.totalAmount),
        formattedPrice: formatCurrency(trade.price)
      }));
    } catch (error) {
      throw new AppError('Failed to retrieve symbol trades', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get trade statistics for a user
   * @param {string} userId - User ID
   * @returns {Object} Trade statistics
   */
  getTradeStats(userId) {
    try {
      const trades = memoryStore.getAllTrades(userId);

      if (trades.length === 0) {
        return {
          totalTrades: 0,
          totalVolume: 0,
          totalValue: 0,
          buyTrades: 0,
          sellTrades: 0,
          uniqueSymbols: 0,
          averageTradeSize: 0,
          largestTrade: null,
          smallestTrade: null,
          todayTrades: 0,
          thisWeekTrades: 0,
          thisMonthTrades: 0
        };
      }

      const totalTrades = trades.length;
      const totalVolume = trades.reduce((sum, trade) => sum + trade.quantity, 0);
      const totalValue = trades.reduce((sum, trade) => sum + trade.totalAmount, 0);
      
      const buyTrades = trades.filter(trade => trade.orderType === 'BUY').length;
      const sellTrades = trades.filter(trade => trade.orderType === 'SELL').length;
      
      const uniqueSymbols = new Set(trades.map(trade => trade.symbol)).size;
      const averageTradeSize = totalVolume / totalTrades;

      // Find largest and smallest trades by value
      const sortedByValue = [...trades].sort((a, b) => b.totalAmount - a.totalAmount);
      const largestTrade = sortedByValue[0];
      const smallestTrade = sortedByValue[sortedByValue.length - 1];

      // Time-based statistics
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const todayTrades = trades.filter(trade => 
        new Date(trade.executedAt) >= today
      ).length;

      const thisWeekTrades = trades.filter(trade => 
        new Date(trade.executedAt) >= weekAgo
      ).length;

      const thisMonthTrades = trades.filter(trade => 
        new Date(trade.executedAt) >= monthAgo
      ).length;

      return {
        totalTrades,
        totalVolume: Math.round(totalVolume),
        totalValue: Math.round(totalValue * 100) / 100,
        buyTrades,
        sellTrades,
        uniqueSymbols,
        averageTradeSize: Math.round(averageTradeSize * 100) / 100,
        largestTrade: largestTrade ? {
          id: largestTrade.id,
          symbol: largestTrade.symbol,
          quantity: largestTrade.quantity,
          totalAmount: largestTrade.totalAmount,
          executedAt: largestTrade.executedAt
        } : null,
        smallestTrade: smallestTrade ? {
          id: smallestTrade.id,
          symbol: smallestTrade.symbol,
          quantity: smallestTrade.quantity,
          totalAmount: smallestTrade.totalAmount,
          executedAt: smallestTrade.executedAt
        } : null,
        todayTrades,
        thisWeekTrades,
        thisMonthTrades,
        formattedTotalValue: formatCurrency(totalValue),
        buyVsSellRatio: sellTrades > 0 ? (buyTrades / sellTrades).toFixed(2) : 'N/A'
      };
    } catch (error) {
      throw new AppError('Failed to get trade statistics', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get trading activity for a date range
   * @param {string} userId - User ID
   * @param {Date} fromDate - Start date
   * @param {Date} toDate - End date
   * @returns {Object} Trading activity summary
   */
  getTradingActivity(userId, fromDate, toDate) {
    try {
      const trades = memoryStore.getAllTrades(userId);
      
      const filteredTrades = trades.filter(trade => {
        const tradeDate = new Date(trade.executedAt);
        return tradeDate >= fromDate && tradeDate <= toDate;
      });

      // Group trades by date
      const dailyActivity = {};
      
      filteredTrades.forEach(trade => {
        const dateKey = new Date(trade.executedAt).toISOString().split('T')[0];
        
        if (!dailyActivity[dateKey]) {
          dailyActivity[dateKey] = {
            date: dateKey,
            trades: 0,
            volume: 0,
            value: 0,
            buyTrades: 0,
            sellTrades: 0
          };
        }

        const activity = dailyActivity[dateKey];
        activity.trades += 1;
        activity.volume += trade.quantity;
        activity.value += trade.totalAmount;
        
        if (trade.orderType === 'BUY') {
          activity.buyTrades += 1;
        } else {
          activity.sellTrades += 1;
        }
      });

      return Object.values(dailyActivity).sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      throw new AppError('Failed to get trading activity', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = new TradeService();
