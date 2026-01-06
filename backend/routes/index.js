const express = require('express');
const instrumentRoutes = require('./instruments');
const orderRoutes = require('./orders');
const tradeRoutes = require('./trades');
const portfolioRoutes = require('./portfolio');

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bajaj Trading SDK API is healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      instruments: '/api/v1/instruments',
      orders: '/api/v1/orders',
      trades: '/api/v1/trades',
      portfolio: '/api/v1/portfolio'
    }
  });
});

// API Documentation route
router.get('/docs', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bajaj Trading SDK API Documentation',
    version: '1.0.0',
    baseUrl: `${req.protocol}://${req.get('host')}/api/v1`,
    authentication: {
      type: 'Bearer Token',
      header: 'Authorization',
      value: 'Bearer mock-token',
      note: 'Use "Bearer mock-token" for testing'
    },
    endpoints: {
      instruments: {
        'GET /instruments': 'Get all available instruments',
        'GET /instruments/:symbol': 'Get instrument by symbol',
        'GET /instruments/search': 'Search instruments with filters',
        'GET /instruments/:symbol/price': 'Get current price',
        'GET /instruments/stats': 'Get market statistics'
      },
      orders: {
        'POST /orders': 'Place a new order',
        'GET /orders': 'Get all orders',
        'GET /orders/:orderId': 'Get order by ID',
        'PUT /orders/:orderId/cancel': 'Cancel an order',
        'GET /orders/stats': 'Get order statistics',
        'GET /orders/pending': 'Get pending orders',
        'GET /orders/executed': 'Get executed orders'
      },
      trades: {
        'GET /trades': 'Get all trades',
        'GET /trades/:tradeId': 'Get trade by ID',
        'GET /trades/symbol/:symbol': 'Get trades by symbol',
        'GET /trades/stats': 'Get trade statistics',
        'GET /trades/recent': 'Get recent trades'
      },
      portfolio: {
        'GET /portfolio': 'Get complete portfolio',
        'GET /portfolio/:symbol': 'Get holding by symbol',
        'GET /portfolio/summary': 'Get portfolio summary',
        'GET /portfolio/performance': 'Get portfolio performance',
        'GET /portfolio/holdings': 'Get all holdings'
      }
    },
    examples: {
      placeOrder: {
        method: 'POST',
        url: '/api/v1/orders',
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json'
        },
        body: {
          symbol: 'RELIANCE',
          orderType: 'BUY',
          orderStyle: 'MARKET',
          quantity: 10
        }
      },
      getInstruments: {
        method: 'GET',
        url: '/api/v1/instruments',
        headers: {
          'Authorization': 'Bearer mock-token'
        }
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Mount route modules
router.use('/instruments', instrumentRoutes);
router.use('/orders', orderRoutes);
router.use('/trades', tradeRoutes);
router.use('/portfolio', portfolioRoutes);

module.exports = router;
