const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticateUser } = require('../middleware/auth');
const { validateCreateOrder, validateOrderId, validateQueryParams } = require('../middleware/validation');

const router = express.Router();

// All order routes require authentication
router.use(authenticateUser);

/**
 * @route   POST /api/v1/orders
 * @desc    Place a new order
 * @access  Private (requires authentication)
 * @body    { symbol, orderType, orderStyle, quantity, price? }
 */
router.post('/', validateCreateOrder, orderController.placeOrder);

/**
 * @route   GET /api/v1/orders
 * @desc    Get all orders for the authenticated user
 * @access  Private
 * @params  Query parameters: status, symbol, orderType, limit, offset
 */
router.get('/', validateQueryParams, orderController.getAllOrders);

/**
 * @route   GET /api/v1/orders/stats
 * @desc    Get order statistics for the user
 * @access  Private
 */
router.get('/stats', orderController.getOrderStats);

/**
 * @route   GET /api/v1/orders/pending
 * @desc    Get pending orders
 * @access  Private
 */
router.get('/pending', orderController.getPendingOrders);

/**
 * @route   GET /api/v1/orders/executed
 * @desc    Get executed orders
 * @access  Private
 */
router.get('/executed', orderController.getExecutedOrders);

/**
 * @route   POST /api/v1/orders/process-pending
 * @desc    Process pending orders (manual trigger for testing)
 * @access  Private
 */
router.post('/process-pending', orderController.processPendingOrders);

/**
 * @route   GET /api/v1/orders/status/:status
 * @desc    Get orders by status
 * @access  Private
 * @params  Path parameter: status (NEW, PLACED, EXECUTED, CANCELLED)
 */
router.get('/status/:status', orderController.getOrdersByStatus);

/**
 * @route   GET /api/v1/orders/symbol/:symbol
 * @desc    Get orders for a specific symbol
 * @access  Private
 * @params  Path parameter: symbol (instrument symbol)
 */
router.get('/symbol/:symbol', orderController.getOrdersBySymbol);

/**
 * @route   GET /api/v1/orders/:orderId
 * @desc    Get order by ID
 * @access  Private
 * @params  Path parameter: orderId (UUID)
 */
router.get('/:orderId', validateOrderId, orderController.getOrderById);

/**
 * @route   PUT /api/v1/orders/:orderId/cancel
 * @desc    Cancel an order
 * @access  Private
 * @params  Path parameter: orderId (UUID)
 */
router.put('/:orderId/cancel', validateOrderId, orderController.cancelOrder);

/**
 * @route   PUT /api/v1/orders/:orderId
 * @desc    Modify order (limited to pending orders)
 * @access  Private
 * @params  Path parameter: orderId (UUID)
 * @body    { price?, quantity? }
 */
router.put('/:orderId', validateOrderId, orderController.modifyOrder);

module.exports = router;
