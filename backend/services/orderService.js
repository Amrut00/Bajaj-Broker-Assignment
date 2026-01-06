const memoryStore = require('../database/memoryStore');
const instrumentService = require('./instrumentService');
const tradeService = require('./tradeService');
const portfolioService = require('./portfolioService');
const { AppError } = require('../middleware/errorHandler');
const { calculateExecutionPrice, canExecuteLimitOrder, isMarketOpen } = require('../utils/helpers');
const { HTTP_STATUS, MESSAGES, ORDER_STATUSES, ORDER_STYLES } = require('../utils/constants');

class OrderService {
  /**
   * Place a new order
   * @param {Object} orderData - Order data
   * @returns {Object} Created order
   */
  async placeOrder(orderData) {
    try {
      // Validate instrument exists
      if (!instrumentService.validateInstrument(orderData.symbol)) {
        throw new AppError(
          `Invalid instrument symbol: ${orderData.symbol}`,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      // Check market status (for demo, we'll allow trading anytime)
      // if (!isMarketOpen()) {
      //   throw new AppError('Market is currently closed', HTTP_STATUS.BAD_REQUEST);
      // }

      // Get current market price
      const currentPrice = instrumentService.getCurrentPrice(orderData.symbol);

      // Validate limit order price
      if (orderData.orderStyle === ORDER_STYLES.LIMIT) {
        if (!orderData.price || orderData.price <= 0) {
          throw new AppError('Price is required for LIMIT orders', HTTP_STATUS.BAD_REQUEST);
        }
      }

      // Create order
      const order = memoryStore.createOrder({
        ...orderData,
        status: ORDER_STATUSES.NEW
      });

      // Update status to PLACED
      const placedOrder = memoryStore.updateOrderStatus(order.id, ORDER_STATUSES.PLACED);

      // Try to execute the order immediately
      const executedOrder = await this.attemptOrderExecution(placedOrder.id);

      return executedOrder || placedOrder;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to place order', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Object} Order object
   */
  getOrderById(orderId) {
    try {
      const order = memoryStore.getOrderById(orderId);
      
      if (!order) {
        throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
      }

      return order;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to retrieve order', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get all orders for a user
   * @param {string} userId - User ID
   * @param {Object} filters - Filter options
   * @returns {Array} Array of orders
   */
  getAllOrders(userId, filters = {}) {
    try {
      let orders = memoryStore.getAllOrders(userId);

      // Apply filters
      if (filters.status) {
        orders = orders.filter(order => order.status === filters.status);
      }

      if (filters.symbol) {
        orders = orders.filter(order => 
          order.symbol.toLowerCase() === filters.symbol.toLowerCase()
        );
      }

      if (filters.orderType) {
        orders = orders.filter(order => order.orderType === filters.orderType);
      }

      // Sort by creation date (newest first)
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return orders;
    } catch (error) {
      throw new AppError('Failed to retrieve orders', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Cancel an order
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID
   * @returns {Object} Cancelled order
   */
  cancelOrder(orderId, userId) {
    try {
      const order = this.getOrderById(orderId);

      // Verify order belongs to user
      if (order.userId !== userId) {
        throw new AppError('Unauthorized to cancel this order', HTTP_STATUS.FORBIDDEN);
      }

      // Check if order can be cancelled
      if (order.status === ORDER_STATUSES.EXECUTED) {
        throw new AppError('Cannot cancel executed order', HTTP_STATUS.BAD_REQUEST);
      }

      if (order.status === ORDER_STATUSES.CANCELLED) {
        throw new AppError('Order is already cancelled', HTTP_STATUS.BAD_REQUEST);
      }

      // Cancel the order
      const cancelledOrder = memoryStore.updateOrderStatus(orderId, ORDER_STATUSES.CANCELLED);
      
      return cancelledOrder;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to cancel order', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Attempt to execute an order
   * @param {string} orderId - Order ID
   * @returns {Object|null} Executed order or null if not executed
   */
  async attemptOrderExecution(orderId) {
    try {
      const order = memoryStore.getOrderById(orderId);
      
      if (!order || order.status !== ORDER_STATUSES.PLACED) {
        return null;
      }

      const currentPrice = instrumentService.getCurrentPrice(order.symbol);

      // Check if order can be executed
      let canExecute = false;
      
      if (order.orderStyle === ORDER_STYLES.MARKET) {
        // Market orders execute immediately
        canExecute = true;
      } else {
        // Check limit order conditions
        canExecute = canExecuteLimitOrder(order, currentPrice);
      }

      if (!canExecute) {
        return null; // Order remains in PLACED status
      }

      // Calculate execution price
      const executionPrice = calculateExecutionPrice(order, currentPrice);
      
      // Execute the order
      const executedOrder = memoryStore.updateOrderStatus(orderId, ORDER_STATUSES.EXECUTED, {
        executedPrice: executionPrice,
        executedQuantity: order.quantity
      });

      // Create trade record
      const tradeData = {
        userId: order.userId,
        orderId: order.id,
        symbol: order.symbol,
        orderType: order.orderType,
        quantity: order.quantity,
        price: executionPrice
      };

      const trade = tradeService.createTrade(tradeData);

      // Update portfolio
      await portfolioService.updatePortfolioAfterTrade(
        order.userId,
        order.symbol,
        order.quantity,
        executionPrice,
        order.orderType
      );

      console.log(`✅ Order ${orderId} executed at ₹${executionPrice} for ${order.quantity} shares of ${order.symbol}`);
      
      return executedOrder;
    } catch (error) {
      console.error(`❌ Failed to execute order ${orderId}:`, error.message);
      return null;
    }
  }

  /**
   * Get order statistics for a user
   * @param {string} userId - User ID
   * @returns {Object} Order statistics
   */
  getOrderStats(userId) {
    try {
      const orders = memoryStore.getAllOrders(userId);

      const stats = {
        totalOrders: orders.length,
        executedOrders: orders.filter(order => order.status === ORDER_STATUSES.EXECUTED).length,
        pendingOrders: orders.filter(order => order.status === ORDER_STATUSES.PLACED).length,
        cancelledOrders: orders.filter(order => order.status === ORDER_STATUSES.CANCELLED).length,
        buyOrders: orders.filter(order => order.orderType === 'BUY').length,
        sellOrders: orders.filter(order => order.orderType === 'SELL').length,
        marketOrders: orders.filter(order => order.orderStyle === ORDER_STYLES.MARKET).length,
        limitOrders: orders.filter(order => order.orderStyle === ORDER_STYLES.LIMIT).length
      };

      // Calculate success rate
      stats.successRate = stats.totalOrders > 0 ? 
        ((stats.executedOrders / stats.totalOrders) * 100).toFixed(2) : 0;

      return stats;
    } catch (error) {
      throw new AppError('Failed to get order statistics', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Process pending limit orders (background task simulation)
   * @returns {Array} Array of executed orders
   */
  async processPendingOrders() {
    try {
      const allOrders = Array.from(memoryStore.orders.values());
      const pendingOrders = allOrders.filter(order => order.status === ORDER_STATUSES.PLACED);
      
      const executedOrders = [];

      for (const order of pendingOrders) {
        const executedOrder = await this.attemptOrderExecution(order.id);
        if (executedOrder) {
          executedOrders.push(executedOrder);
        }
      }

      return executedOrders;
    } catch (error) {
      console.error('Error processing pending orders:', error);
      return [];
    }
  }
}

module.exports = new OrderService();
