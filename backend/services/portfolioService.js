const memoryStore = require('../database/memoryStore');
const instrumentService = require('./instrumentService');
const { AppError } = require('../middleware/errorHandler');
const { formatCurrency, formatPercentage, calculatePortfolioMetrics } = require('../utils/helpers');
const { HTTP_STATUS } = require('../utils/constants');

class PortfolioService {
  /**
   * Get user's complete portfolio
   * @param {string} userId - User ID
   * @returns {Object} Portfolio data with current values
   */
  getPortfolio(userId) {
    try {
      const holdings = memoryStore.getPortfolio(userId);
      
      if (holdings.length === 0) {
        return {
          holdings: [],
          summary: {
            totalHoldings: 0,
            totalInvestment: 0,
            totalCurrentValue: 0,
            totalReturn: 0,
            totalReturnPercentage: 0,
            profitableHoldings: 0,
            lossHoldings: 0
          }
        };
      }

      // Add formatted values for display
      const formattedHoldings = holdings.map(holding => ({
        ...holding,
        formattedAveragePrice: formatCurrency(holding.averagePrice),
        formattedTotalInvestment: formatCurrency(holding.totalInvestment),
        formattedCurrentValue: formatCurrency(holding.currentValue),
        formattedTotalReturn: formatCurrency(holding.totalReturn),
        formattedCurrentPrice: formatCurrency(holding.currentPrice),
        returnStatus: holding.totalReturn >= 0 ? 'PROFIT' : 'LOSS'
      }));

      // Calculate portfolio summary
      const summary = calculatePortfolioMetrics(holdings);
      
      return {
        holdings: formattedHoldings,
        summary: {
          ...summary,
          formattedTotalInvestment: formatCurrency(summary.totalInvestment),
          formattedTotalCurrentValue: formatCurrency(summary.totalCurrentValue),
          formattedTotalReturn: formatCurrency(summary.totalReturn),
          formattedTotalReturnPercentage: formatPercentage(summary.totalReturnPercentage),
          lastUpdated: new Date()
        }
      };
    } catch (error) {
      throw new AppError('Failed to retrieve portfolio', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get portfolio holding for a specific symbol
   * @param {string} userId - User ID
   * @param {string} symbol - Instrument symbol
   * @returns {Object|null} Portfolio holding or null if not found
   */
  getHoldingBySymbol(userId, symbol) {
    try {
      const holdings = memoryStore.getPortfolio(userId);
      const holding = holdings.find(h => h.symbol.toLowerCase() === symbol.toLowerCase());

      if (!holding) {
        return null;
      }

      return {
        ...holding,
        formattedAveragePrice: formatCurrency(holding.averagePrice),
        formattedTotalInvestment: formatCurrency(holding.totalInvestment),
        formattedCurrentValue: formatCurrency(holding.currentValue),
        formattedTotalReturn: formatCurrency(holding.totalReturn),
        formattedCurrentPrice: formatCurrency(holding.currentPrice),
        returnStatus: holding.totalReturn >= 0 ? 'PROFIT' : 'LOSS'
      };
    } catch (error) {
      throw new AppError('Failed to retrieve holding', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Update portfolio after a trade execution
   * @param {string} userId - User ID
   * @param {string} symbol - Instrument symbol
   * @param {number} quantity - Trade quantity
   * @param {number} price - Trade price
   * @param {string} orderType - BUY or SELL
   * @returns {Object} Updated holding
   */
  async updatePortfolioAfterTrade(userId, symbol, quantity, price, orderType) {
    try {
      // Validate instrument
      if (!instrumentService.validateInstrument(symbol)) {
        throw new AppError(`Invalid instrument symbol: ${symbol}`, HTTP_STATUS.BAD_REQUEST);
      }

      // For SELL orders, check if user has enough quantity
      if (orderType === 'SELL') {
        const currentHolding = this.getHoldingBySymbol(userId, symbol);
        if (!currentHolding || currentHolding.quantity < quantity) {
          throw new AppError(
            `Insufficient quantity. Available: ${currentHolding ? currentHolding.quantity : 0}, Required: ${quantity}`,
            HTTP_STATUS.BAD_REQUEST
          );
        }
      }

      // Update portfolio in memory store
      const updatedHolding = memoryStore.updatePortfolio(userId, symbol, quantity, price, orderType);
      
      console.log(`📊 Portfolio updated: ${orderType} ${quantity} shares of ${symbol} at ₹${price}`);
      
      return updatedHolding;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update portfolio', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get portfolio performance analytics
   * @param {string} userId - User ID
   * @returns {Object} Portfolio performance data
   */
  getPortfolioPerformance(userId) {
    try {
      const portfolio = this.getPortfolio(userId);
      
      if (portfolio.holdings.length === 0) {
        return {
          totalReturn: 0,
          totalReturnPercentage: 0,
          dayChange: 0,
          dayChangePercentage: 0,
          bestPerformer: null,
          worstPerformer: null,
          sectorAllocation: {},
          topHoldings: []
        };
      }

      const holdings = portfolio.holdings;
      
      // Find best and worst performers
      const sortedByReturn = [...holdings].sort((a, b) => b.totalReturnPercentage - a.totalReturnPercentage);
      const bestPerformer = sortedByReturn[0];
      const worstPerformer = sortedByReturn[sortedByReturn.length - 1];

      // Get top holdings by value
      const topHoldings = [...holdings]
        .sort((a, b) => b.currentValue - a.currentValue)
        .slice(0, 5)
        .map(holding => ({
          symbol: holding.symbol,
          currentValue: holding.currentValue,
          percentage: (holding.currentValue / portfolio.summary.totalCurrentValue * 100).toFixed(2),
          formattedCurrentValue: formatCurrency(holding.currentValue)
        }));

      // Simulate sector allocation (in real app, this would come from instrument data)
      const sectorAllocation = this.calculateSectorAllocation(holdings);

      return {
        totalReturn: portfolio.summary.totalReturn,
        totalReturnPercentage: portfolio.summary.totalReturnPercentage,
        formattedTotalReturn: formatCurrency(portfolio.summary.totalReturn),
        dayChange: 0, // Would need historical data to calculate
        dayChangePercentage: 0,
        bestPerformer: bestPerformer ? {
          symbol: bestPerformer.symbol,
          returnPercentage: bestPerformer.totalReturnPercentage,
          returnAmount: bestPerformer.totalReturn,
          formattedReturn: formatCurrency(bestPerformer.totalReturn)
        } : null,
        worstPerformer: worstPerformer ? {
          symbol: worstPerformer.symbol,
          returnPercentage: worstPerformer.totalReturnPercentage,
          returnAmount: worstPerformer.totalReturn,
          formattedReturn: formatCurrency(worstPerformer.totalReturn)
        } : null,
        sectorAllocation,
        topHoldings,
        diversificationScore: this.calculateDiversificationScore(holdings)
      };
    } catch (error) {
      throw new AppError('Failed to get portfolio performance', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Calculate sector allocation (simplified simulation)
   * @param {Array} holdings - Portfolio holdings
   * @returns {Object} Sector allocation
   */
  calculateSectorAllocation(holdings) {
    // This is a simplified simulation. In a real app, instruments would have sector information
    const sectorMap = {
      'RELIANCE': 'Energy',
      'TCS': 'IT Services',
      'INFY': 'IT Services',
      'HDFC': 'Banking',
      'ICICIBANK': 'Banking'
    };

    const allocation = {};
    let totalValue = 0;

    holdings.forEach(holding => {
      const sector = sectorMap[holding.symbol] || 'Others';
      const value = holding.currentValue || 0;
      
      if (!allocation[sector]) {
        allocation[sector] = { value: 0, percentage: 0 };
      }
      
      allocation[sector].value += value;
      totalValue += value;
    });

    // Calculate percentages
    Object.keys(allocation).forEach(sector => {
      allocation[sector].percentage = totalValue > 0 ? 
        (allocation[sector].value / totalValue * 100).toFixed(2) : 0;
      allocation[sector].formattedValue = formatCurrency(allocation[sector].value);
    });

    return allocation;
  }

  /**
   * Calculate diversification score (0-100)
   * @param {Array} holdings - Portfolio holdings
   * @returns {number} Diversification score
   */
  calculateDiversificationScore(holdings) {
    if (holdings.length === 0) return 0;
    
    const totalValue = holdings.reduce((sum, holding) => sum + (holding.currentValue || 0), 0);
    
    if (totalValue === 0) return 0;

    // Calculate concentration risk
    const concentrations = holdings.map(holding => (holding.currentValue || 0) / totalValue);
    const maxConcentration = Math.max(...concentrations);
    
    // Number of holdings factor
    const holdingsScore = Math.min(holdings.length * 10, 50); // Max 50 points for holdings count
    
    // Concentration factor
    const concentrationScore = (1 - maxConcentration) * 50; // Max 50 points for diversification
    
    return Math.round(holdingsScore + concentrationScore);
  }

  /**
   * Get portfolio value history (simulation)
   * @param {string} userId - User ID
   * @param {number} days - Number of days to simulate
   * @returns {Array} Portfolio value history
   */
  getPortfolioValueHistory(userId, days = 30) {
    try {
      const currentPortfolio = this.getPortfolio(userId);
      
      if (currentPortfolio.holdings.length === 0) {
        return [];
      }

      // Simulate historical values (in real app, this would come from historical data)
      const history = [];
      const currentValue = currentPortfolio.summary.totalCurrentValue;
      
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Add random variation for simulation
        const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
        const simulatedValue = currentValue * (1 + variation);
        
        history.push({
          date: date.toISOString().split('T')[0],
          value: Math.round(simulatedValue * 100) / 100,
          formattedValue: formatCurrency(simulatedValue)
        });
      }
      
      return history;
    } catch (error) {
      throw new AppError('Failed to get portfolio history', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = new PortfolioService();
