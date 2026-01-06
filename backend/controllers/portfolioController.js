const portfolioService = require('../services/portfolioService');
const { asyncHandler } = require('../middleware/errorHandler');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');

class PortfolioController {
  /**
   * Get user's complete portfolio
   * @route GET /api/v1/portfolio
   */
  getPortfolio = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const portfolio = portfolioService.getPortfolio(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.SUCCESS.DATA_RETRIEVED,
      data: {
        portfolio
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get portfolio holding for a specific symbol
   * @route GET /api/v1/portfolio/:symbol
   */
  getHoldingBySymbol = asyncHandler(async (req, res) => {
    const { symbol } = req.params;
    const userId = req.user.id;
    
    const holding = portfolioService.getHoldingBySymbol(userId, symbol.toUpperCase());

    if (!holding) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: `No holding found for symbol ${symbol.toUpperCase()}`,
        timestamp: new Date().toISOString()
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Holding for ${symbol.toUpperCase()} retrieved successfully`,
      data: {
        holding
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get portfolio performance analytics
   * @route GET /api/v1/portfolio/performance
   */
  getPortfolioPerformance = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const performance = portfolioService.getPortfolioPerformance(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Portfolio performance retrieved successfully',
      data: {
        performance
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get portfolio summary
   * @route GET /api/v1/portfolio/summary
   */
  getPortfolioSummary = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const portfolio = portfolioService.getPortfolio(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Portfolio summary retrieved successfully',
      data: {
        summary: portfolio.summary,
        holdingsCount: portfolio.holdings.length
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get portfolio holdings (just the holdings array)
   * @route GET /api/v1/portfolio/holdings
   */
  getHoldings = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const portfolio = portfolioService.getPortfolio(userId);

    // Apply sorting if requested
    let { sortBy, sortOrder = 'desc' } = req.query;
    let holdings = portfolio.holdings;

    if (sortBy) {
      holdings = [...holdings].sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case 'symbol':
            aValue = a.symbol;
            bValue = b.symbol;
            break;
          case 'quantity':
            aValue = a.quantity;
            bValue = b.quantity;
            break;
          case 'currentValue':
            aValue = a.currentValue;
            bValue = b.currentValue;
            break;
          case 'totalReturn':
            aValue = a.totalReturn;
            bValue = b.totalReturn;
            break;
          case 'totalReturnPercentage':
            aValue = a.totalReturnPercentage;
            bValue = b.totalReturnPercentage;
            break;
          default:
            aValue = a.currentValue;
            bValue = b.currentValue;
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Portfolio holdings retrieved successfully',
      data: {
        holdings,
        total: holdings.length,
        sorting: sortBy ? { sortBy, sortOrder } : null
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get profitable holdings
   * @route GET /api/v1/portfolio/profitable
   */
  getProfitableHoldings = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const portfolio = portfolioService.getPortfolio(userId);
    const profitableHoldings = portfolio.holdings.filter(holding => holding.totalReturn > 0);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Profitable holdings retrieved successfully',
      data: {
        holdings: profitableHoldings,
        total: profitableHoldings.length
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get loss-making holdings
   * @route GET /api/v1/portfolio/losses
   */
  getLossHoldings = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const portfolio = portfolioService.getPortfolio(userId);
    const lossHoldings = portfolio.holdings.filter(holding => holding.totalReturn < 0);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Loss holdings retrieved successfully',
      data: {
        holdings: lossHoldings,
        total: lossHoldings.length
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get top holdings by value
   * @route GET /api/v1/portfolio/top-holdings
   */
  getTopHoldings = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 5;
    
    const portfolio = portfolioService.getPortfolio(userId);
    const topHoldings = portfolio.holdings
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, limit);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Top ${limit} holdings retrieved successfully`,
      data: {
        holdings: topHoldings,
        total: topHoldings.length,
        limit
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get portfolio value history
   * @route GET /api/v1/portfolio/history
   */
  getPortfolioHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 30;
    
    const history = portfolioService.getPortfolioValueHistory(userId, days);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Portfolio history for ${days} days retrieved successfully`,
      data: {
        history,
        days,
        dataPoints: history.length
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get portfolio allocation (sector-wise)
   * @route GET /api/v1/portfolio/allocation
   */
  getPortfolioAllocation = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const performance = portfolioService.getPortfolioPerformance(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Portfolio allocation retrieved successfully',
      data: {
        sectorAllocation: performance.sectorAllocation,
        topHoldings: performance.topHoldings,
        diversificationScore: performance.diversificationScore
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get portfolio metrics
   * @route GET /api/v1/portfolio/metrics
   */
  getPortfolioMetrics = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const portfolio = portfolioService.getPortfolio(userId);
    const performance = portfolioService.getPortfolioPerformance(userId);

    const metrics = {
      totalInvestment: portfolio.summary.totalInvestment,
      currentValue: portfolio.summary.totalCurrentValue,
      totalReturn: portfolio.summary.totalReturn,
      returnPercentage: portfolio.summary.totalReturnPercentage,
      holdingsCount: portfolio.holdings.length,
      profitableHoldings: portfolio.summary.profitableHoldings,
      lossHoldings: portfolio.summary.lossHoldings,
      diversificationScore: performance.diversificationScore,
      bestPerformer: performance.bestPerformer,
      worstPerformer: performance.worstPerformer
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Portfolio metrics retrieved successfully',
      data: {
        metrics
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get portfolio comparison with market (simulation)
   * @route GET /api/v1/portfolio/comparison
   */
  getPortfolioComparison = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const portfolio = portfolioService.getPortfolio(userId);
    
    // Simulate market comparison (in real app, this would use actual market indices)
    const marketReturn = 12.5; // Simulated market return percentage
    const portfolioReturn = portfolio.summary.totalReturnPercentage;
    
    const comparison = {
      portfolioReturn: portfolioReturn,
      marketReturn: marketReturn,
      outperformance: portfolioReturn - marketReturn,
      isOutperforming: portfolioReturn > marketReturn,
      riskLevel: portfolioReturn > 20 ? 'High' : portfolioReturn > 10 ? 'Medium' : 'Low',
      benchmark: 'NIFTY 50 (Simulated)'
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Portfolio comparison retrieved successfully',
      data: {
        comparison
      },
      timestamp: new Date().toISOString()
    });
  });
}

module.exports = new PortfolioController();
