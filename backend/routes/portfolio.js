const express = require('express');
const portfolioController = require('../controllers/portfolioController');
const { authenticateUser } = require('../middleware/auth');
const { validateQueryParams } = require('../middleware/validation');

const router = express.Router();

// All portfolio routes require authentication
router.use(authenticateUser);

/**
 * @route   GET /api/v1/portfolio
 * @desc    Get user's complete portfolio
 * @access  Private
 */
router.get('/', portfolioController.getPortfolio);

/**
 * @route   GET /api/v1/portfolio/summary
 * @desc    Get portfolio summary
 * @access  Private
 */
router.get('/summary', portfolioController.getPortfolioSummary);

/**
 * @route   GET /api/v1/portfolio/performance
 * @desc    Get portfolio performance analytics
 * @access  Private
 */
router.get('/performance', portfolioController.getPortfolioPerformance);

/**
 * @route   GET /api/v1/portfolio/holdings
 * @desc    Get portfolio holdings with optional sorting
 * @access  Private
 * @params  Query parameters: sortBy (symbol, quantity, currentValue, totalReturn), sortOrder (asc, desc)
 */
router.get('/holdings', validateQueryParams, portfolioController.getHoldings);

/**
 * @route   GET /api/v1/portfolio/profitable
 * @desc    Get profitable holdings
 * @access  Private
 */
router.get('/profitable', portfolioController.getProfitableHoldings);

/**
 * @route   GET /api/v1/portfolio/losses
 * @desc    Get loss-making holdings
 * @access  Private
 */
router.get('/losses', portfolioController.getLossHoldings);

/**
 * @route   GET /api/v1/portfolio/top-holdings
 * @desc    Get top holdings by value
 * @access  Private
 * @params  Query parameters: limit (default: 5)
 */
router.get('/top-holdings', portfolioController.getTopHoldings);

/**
 * @route   GET /api/v1/portfolio/history
 * @desc    Get portfolio value history
 * @access  Private
 * @params  Query parameters: days (default: 30)
 */
router.get('/history', portfolioController.getPortfolioHistory);

/**
 * @route   GET /api/v1/portfolio/allocation
 * @desc    Get portfolio allocation (sector-wise)
 * @access  Private
 */
router.get('/allocation', portfolioController.getPortfolioAllocation);

/**
 * @route   GET /api/v1/portfolio/metrics
 * @desc    Get portfolio metrics
 * @access  Private
 */
router.get('/metrics', portfolioController.getPortfolioMetrics);

/**
 * @route   GET /api/v1/portfolio/comparison
 * @desc    Get portfolio comparison with market
 * @access  Private
 */
router.get('/comparison', portfolioController.getPortfolioComparison);

/**
 * @route   GET /api/v1/portfolio/:symbol
 * @desc    Get portfolio holding for a specific symbol
 * @access  Private
 * @params  Path parameter: symbol (instrument symbol)
 */
router.get('/:symbol', portfolioController.getHoldingBySymbol);

module.exports = router;
