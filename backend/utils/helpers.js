const { ORDER_STYLES } = require('./constants');

/**
 * Generate random price variation for market simulation
 * @param {number} basePrice - Base price to vary
 * @param {number} maxVariationPercent - Maximum variation percentage (default 2%)
 * @returns {number} - New price with random variation
 */
const generatePriceVariation = (basePrice, maxVariationPercent = 2) => {
  const variation = (Math.random() - 0.5) * 2 * (maxVariationPercent / 100);
  const newPrice = basePrice * (1 + variation);
  return Math.round(newPrice * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate order execution price
 * @param {object} order - Order object
 * @param {number} currentMarketPrice - Current market price
 * @returns {number} - Execution price
 */
const calculateExecutionPrice = (order, currentMarketPrice) => {
  if (order.orderStyle === ORDER_STYLES.MARKET) {
    // Market orders execute at current market price (with small slippage simulation)
    const slippage = (Math.random() - 0.5) * 0.002; // 0.1% max slippage
    return Math.round(currentMarketPrice * (1 + slippage) * 100) / 100;
  } else {
    // Limit orders execute at the specified price
    return order.price;
  }
};

/**
 * Check if limit order can be executed
 * @param {object} order - Order object
 * @param {number} currentMarketPrice - Current market price
 * @returns {boolean} - Whether order can be executed
 */
const canExecuteLimitOrder = (order, currentMarketPrice) => {
  if (order.orderStyle !== ORDER_STYLES.LIMIT) {
    return true; // Market orders can always be executed
  }

  if (order.orderType === 'BUY') {
    // Buy limit order executes when market price <= limit price
    return currentMarketPrice <= order.price;
  } else {
    // Sell limit order executes when market price >= limit price
    return currentMarketPrice >= order.price;
  }
};

/**
 * Format currency values
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default INR)
 * @returns {string} - Formatted currency string
 */
const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format percentage values
 * @param {number} percentage - Percentage to format
 * @returns {string} - Formatted percentage string
 */
const formatPercentage = (percentage) => {
  return `${parseFloat(percentage).toFixed(2)}%`;
};

/**
 * Validate if market is open (simulation)
 * @returns {boolean} - Whether market is open
 */
const isMarketOpen = () => {
  const now = new Date();
  const hour = now.getHours();
  
  // Simulate market hours (9:15 AM to 3:30 PM IST)
  // For demo purposes, we'll assume market is always open
  return hour >= 9 && hour < 16;
};

/**
 * Generate trade reference number
 * @returns {string} - Unique trade reference
 */
const generateTradeReference = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `TXN${timestamp}${randomStr}`.toUpperCase();
};

/**
 * Calculate portfolio metrics
 * @param {Array} holdings - Array of portfolio holdings
 * @returns {object} - Portfolio summary metrics
 */
const calculatePortfolioMetrics = (holdings) => {
  const totalInvestment = holdings.reduce((sum, holding) => sum + holding.totalInvestment, 0);
  const totalCurrentValue = holdings.reduce((sum, holding) => sum + (holding.currentValue || 0), 0);
  const totalReturn = totalCurrentValue - totalInvestment;
  const totalReturnPercentage = totalInvestment > 0 ? (totalReturn / totalInvestment * 100) : 0;

  return {
    totalHoldings: holdings.length,
    totalInvestment: Math.round(totalInvestment * 100) / 100,
    totalCurrentValue: Math.round(totalCurrentValue * 100) / 100,
    totalReturn: Math.round(totalReturn * 100) / 100,
    totalReturnPercentage: Math.round(totalReturnPercentage * 100) / 100,
    profitableHoldings: holdings.filter(h => (h.currentValue || 0) > h.totalInvestment).length,
    lossHoldings: holdings.filter(h => (h.currentValue || 0) < h.totalInvestment).length
  };
};

/**
 * Paginate array data
 * @param {Array} data - Data array to paginate
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Items per page
 * @returns {object} - Paginated result with metadata
 */
const paginate = (data, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const paginatedData = data.slice(offset, offset + limit);
  
  return {
    data: paginatedData,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(data.length / limit),
      totalItems: data.length,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(data.length / limit),
      hasPrevPage: page > 1
    }
  };
};

module.exports = {
  generatePriceVariation,
  calculateExecutionPrice,
  canExecuteLimitOrder,
  formatCurrency,
  formatPercentage,
  isMarketOpen,
  generateTradeReference,
  calculatePortfolioMetrics,
  paginate
};
