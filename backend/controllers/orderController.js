const orderService = require('../services/orderService');
const { asyncHandler } = require('../middleware/errorHandler');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');

class OrderController {
  /**
   * Place a new order
   * @route POST /api/v1/orders
   */
  placeOrder = asyncHandler(async (req, res) => {
    const orderData = {
      ...req.body,
      userId: req.user.id
    };

    const order = await orderService.placeOrder(orderData);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: MESSAGES.SUCCESS.ORDER_CREATED,
      data: {
        order
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get order by ID
   * @route GET /api/v1/orders/:orderId
   */
  getOrderById = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    
    const order = orderService.getOrderById(orderId);

    // Verify order belongs to the authenticated user
    if (order.userId !== req.user.id) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Access denied to this order',
        timestamp: new Date().toISOString()
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.SUCCESS.DATA_RETRIEVED,
      data: {
        order
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get all orders for the authenticated user
   * @route GET /api/v1/orders
   */
  getAllOrders = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const filters = {
      status: req.query.status,
      symbol: req.query.symbol,
      orderType: req.query.orderType
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const orders = orderService.getAllOrders(userId, filters);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.SUCCESS.DATA_RETRIEVED,
      data: {
        orders,
        total: orders.length,
        filters: Object.keys(filters).length > 0 ? filters : null
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Cancel an order
   * @route PUT /api/v1/orders/:orderId/cancel
   */
  cancelOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.id;

    const cancelledOrder = orderService.cancelOrder(orderId, userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.SUCCESS.ORDER_CANCELLED,
      data: {
        order: cancelledOrder
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get order statistics for the user
   * @route GET /api/v1/orders/stats
   */
  getOrderStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const stats = orderService.getOrderStats(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Order statistics retrieved successfully',
      data: {
        orderStats: stats
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get orders by status
   * @route GET /api/v1/orders/status/:status
   */
  getOrdersByStatus = asyncHandler(async (req, res) => {
    const { status } = req.params;
    const userId = req.user.id;

    // Validate status
    const validStatuses = ['NEW', 'PLACED', 'EXECUTED', 'CANCELLED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    const orders = orderService.getAllOrders(userId, { status: status.toUpperCase() });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `${status.toUpperCase()} orders retrieved successfully`,
      data: {
        orders,
        total: orders.length,
        status: status.toUpperCase()
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get orders for a specific symbol
   * @route GET /api/v1/orders/symbol/:symbol
   */
  getOrdersBySymbol = asyncHandler(async (req, res) => {
    const { symbol } = req.params;
    const userId = req.user.id;

    const orders = orderService.getAllOrders(userId, { symbol: symbol.toUpperCase() });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Orders for ${symbol.toUpperCase()} retrieved successfully`,
      data: {
        orders,
        total: orders.length,
        symbol: symbol.toUpperCase()
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get pending orders
   * @route GET /api/v1/orders/pending
   */
  getPendingOrders = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const orders = orderService.getAllOrders(userId, { status: 'PLACED' });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Pending orders retrieved successfully',
      data: {
        orders,
        total: orders.length
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get executed orders
   * @route GET /api/v1/orders/executed
   */
  getExecutedOrders = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const orders = orderService.getAllOrders(userId, { status: 'EXECUTED' });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Executed orders retrieved successfully',
      data: {
        orders,
        total: orders.length
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Process pending orders (manual trigger for testing)
   * @route POST /api/v1/orders/process-pending
   */
  processPendingOrders = asyncHandler(async (req, res) => {
    const executedOrders = await orderService.processPendingOrders();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Processed ${executedOrders.length} pending orders`,
      data: {
        executedOrders,
        processedCount: executedOrders.length
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Modify order (limited to pending orders)
   * @route PUT /api/v1/orders/:orderId
   */
  modifyOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { price, quantity } = req.body;
    const userId = req.user.id;

    // Get existing order
    const existingOrder = orderService.getOrderById(orderId);

    // Verify order belongs to user
    if (existingOrder.userId !== userId) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Access denied to this order',
        timestamp: new Date().toISOString()
      });
    }

    // Check if order can be modified
    if (existingOrder.status !== 'PLACED') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Only pending orders can be modified',
        timestamp: new Date().toISOString()
      });
    }

    // For simplicity, we'll cancel the old order and create a new one
    orderService.cancelOrder(orderId, userId);

    // Create new order with modified data
    const newOrderData = {
      ...existingOrder,
      price: price || existingOrder.price,
      quantity: quantity || existingOrder.quantity,
      userId
    };

    const modifiedOrder = await orderService.placeOrder(newOrderData);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Order modified successfully',
      data: {
        originalOrderId: orderId,
        newOrder: modifiedOrder
      },
      timestamp: new Date().toISOString()
    });
  });
}

module.exports = new OrderController();
