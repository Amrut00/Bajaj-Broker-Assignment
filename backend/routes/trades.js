const express = require('express');
const tradeController = require('../controllers/tradeController');
const { authenticateUser } = require('../middleware/auth');
const { validateQueryParams } = require('../middleware/validation');

const router = express.Router();

// All trade routes require authentication
router.use(authenticateUser);

/**
 * @route   GET /api/v1/trades
 * @desc    Get all trades for the authenticated user
 * @access  Private
 * @params  Query parameters: symbol, orderType, fromDate, toDate, minAmount, maxAmount, page, limit
 */
router.get('/', validateQueryParams, tradeController.getAllTrades);

/**
 * @route   GET /api/v1/trades/stats
 * @desc    Get trade statistics
 * @access  Private
 */
router.get('/stats', tradeController.getTradeStats);

/**
 * @route   GET /api/v1/trades/recent
 * @desc    Get recent trades
 * @access  Private
 * @params  Query parameters: limit (default: 10)
 */
router.get('/recent', tradeController.getRecentTrades);

/**
 * @route   GET /api/v1/trades/buy
 * @desc    Get buy trades
 * @access  Private
 * @params  Query parameters: symbol, fromDate, toDate, page, limit
 */
router.get('/buy', validateQueryParams, tradeController.getBuyTrades);

/**
 * @route   GET /api/v1/trades/sell
 * @desc    Get sell trades
 * @access  Private
 * @params  Query parameters: symbol, fromDate, toDate, page, limit
 */
router.get('/sell', validateQueryParams, tradeController.getSellTrades);

/**
 * @route   GET /api/v1/trades/activity
 * @desc    Get trading activity for a date range
 * @access  Private
 * @params  Query parameters: fromDate, toDate
 */
router.get('/activity', tradeController.getTradingActivity);

/**
 * @route   GET /api/v1/trades/summary
 * @desc    Get trades summary by date range
 * @access  Private
 * @params  Query parameters: fromDate, toDate, groupBy (day, week, month)
 */
router.get('/summary', tradeController.getTradesSummary);

/**
 * @route   GET /api/v1/trades/order/:orderId
 * @desc    Get trades by order ID
 * @access  Private
 * @params  Path parameter: orderId (UUID)
 */
router.get('/order/:orderId', tradeController.getTradesByOrderId);

/**
 * @route   GET /api/v1/trades/symbol/:symbol
 * @desc    Get trades by symbol
 * @access  Private
 * @params  Path parameter: symbol (instrument symbol)
 */
router.get('/symbol/:symbol', tradeController.getTradesBySymbol);

/**
 * @route   GET /api/v1/trades/:tradeId
 * @desc    Get trade by ID
 * @access  Private
 * @params  Path parameter: tradeId (UUID)
 */
router.get('/:tradeId', tradeController.getTradeById);

module.exports = router;
