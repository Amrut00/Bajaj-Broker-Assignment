const express = require('express');
const instrumentController = require('../controllers/instrumentController');
const { authenticateUser, optionalAuth } = require('../middleware/auth');
const { validateQueryParams } = require('../middleware/validation');

const router = express.Router();

/**
 * @route   GET /api/v1/instruments
 * @desc    Get all available instruments
 * @access  Public (no authentication required for viewing instruments)
 * @params  Query parameters: exchange, instrumentType, search, minPrice, maxPrice
 */
router.get('/', optionalAuth, validateQueryParams, instrumentController.getAllInstruments);

/**
 * @route   GET /api/v1/instruments/search
 * @desc    Search instruments with advanced filters
 * @access  Public
 * @params  Query parameters: exchange, instrumentType, symbol, minPrice, maxPrice
 */
router.get('/search', optionalAuth, validateQueryParams, instrumentController.searchInstruments);

/**
 * @route   GET /api/v1/instruments/stats
 * @desc    Get market statistics
 * @access  Public
 */
router.get('/stats', optionalAuth, instrumentController.getMarketStats);

/**
 * @route   GET /api/v1/instruments/:symbol
 * @desc    Get instrument by symbol
 * @access  Public
 * @params  Path parameter: symbol (instrument symbol)
 */
router.get('/:symbol', optionalAuth, instrumentController.getInstrumentBySymbol);

/**
 * @route   GET /api/v1/instruments/:symbol/price
 * @desc    Get current market price for an instrument
 * @access  Public
 * @params  Path parameter: symbol (instrument symbol)
 */
router.get('/:symbol/price', optionalAuth, instrumentController.getCurrentPrice);

/**
 * @route   GET /api/v1/instruments/exchange/:exchange
 * @desc    Get instruments by exchange
 * @access  Public
 * @params  Path parameter: exchange (NSE, BSE)
 */
router.get('/exchange/:exchange', optionalAuth, instrumentController.getInstrumentsByExchange);

/**
 * @route   GET /api/v1/instruments/type/:instrumentType
 * @desc    Get instruments by type
 * @access  Public
 * @params  Path parameter: instrumentType (EQUITY, DERIVATIVE, COMMODITY)
 */
router.get('/type/:instrumentType', optionalAuth, instrumentController.getInstrumentsByType);

/**
 * @route   PUT /api/v1/instruments/:symbol/price
 * @desc    Update instrument price (for testing/simulation purposes)
 * @access  Private (requires authentication)
 * @params  Path parameter: symbol (instrument symbol)
 * @body    { price: number }
 */
router.put('/:symbol/price', authenticateUser, instrumentController.updatePrice);

module.exports = router;
