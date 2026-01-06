const instrumentService = require('../services/instrumentService');
const { asyncHandler } = require('../middleware/errorHandler');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');

class InstrumentController {
  /**
   * Get all available instruments
   * @route GET /api/v1/instruments
   */
  getAllInstruments = asyncHandler(async (req, res) => {
    const { exchange, instrumentType, search, minPrice, maxPrice } = req.query;
    
    let instruments;
    
    // If filters are provided, use search functionality
    if (exchange || instrumentType || search || minPrice || maxPrice) {
      const searchCriteria = {
        exchange,
        instrumentType,
        symbol: search,
        minPrice,
        maxPrice
      };
      instruments = instrumentService.searchInstruments(searchCriteria);
    } else {
      instruments = instrumentService.getAllInstruments();
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.SUCCESS.DATA_RETRIEVED,
      data: {
        instruments,
        total: instruments.length
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get instrument by symbol
   * @route GET /api/v1/instruments/:symbol
   */
  getInstrumentBySymbol = asyncHandler(async (req, res) => {
    const { symbol } = req.params;
    
    const instrument = instrumentService.getInstrumentBySymbol(symbol.toUpperCase());

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.SUCCESS.DATA_RETRIEVED,
      data: {
        instrument
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Search instruments with advanced filters
   * @route GET /api/v1/instruments/search
   */
  searchInstruments = asyncHandler(async (req, res) => {
    const searchCriteria = req.query;
    
    const instruments = instrumentService.searchInstruments(searchCriteria);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Instruments search completed successfully',
      data: {
        instruments,
        total: instruments.length,
        searchCriteria
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get current market price for an instrument
   * @route GET /api/v1/instruments/:symbol/price
   */
  getCurrentPrice = asyncHandler(async (req, res) => {
    const { symbol } = req.params;
    
    const price = instrumentService.getCurrentPrice(symbol.toUpperCase());
    const instrument = instrumentService.getInstrumentBySymbol(symbol.toUpperCase());

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Current price retrieved successfully',
      data: {
        symbol: symbol.toUpperCase(),
        currentPrice: price,
        companyName: instrument.companyName,
        exchange: instrument.exchange,
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get market statistics
   * @route GET /api/v1/instruments/stats
   */
  getMarketStats = asyncHandler(async (req, res) => {
    const stats = instrumentService.getMarketStats();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Market statistics retrieved successfully',
      data: {
        marketStats: stats
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Update instrument price (for testing/simulation purposes)
   * @route PUT /api/v1/instruments/:symbol/price
   */
  updatePrice = asyncHandler(async (req, res) => {
    const { symbol } = req.params;
    const { price } = req.body;

    if (!price || price <= 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Valid price is required',
        timestamp: new Date().toISOString()
      });
    }

    const updated = instrumentService.updatePrice(symbol.toUpperCase(), price);

    if (updated) {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Price updated successfully',
        data: {
          symbol: symbol.toUpperCase(),
          newPrice: price,
          updatedAt: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * Get instruments by exchange
   * @route GET /api/v1/instruments/exchange/:exchange
   */
  getInstrumentsByExchange = asyncHandler(async (req, res) => {
    const { exchange } = req.params;
    
    const instruments = instrumentService.searchInstruments({ 
      exchange: exchange.toUpperCase() 
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Instruments for ${exchange.toUpperCase()} retrieved successfully`,
      data: {
        exchange: exchange.toUpperCase(),
        instruments,
        total: instruments.length
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get instruments by type
   * @route GET /api/v1/instruments/type/:instrumentType
   */
  getInstrumentsByType = asyncHandler(async (req, res) => {
    const { instrumentType } = req.params;
    
    const instruments = instrumentService.searchInstruments({ 
      instrumentType: instrumentType.toUpperCase() 
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `${instrumentType.toUpperCase()} instruments retrieved successfully`,
      data: {
        instrumentType: instrumentType.toUpperCase(),
        instruments,
        total: instruments.length
      },
      timestamp: new Date().toISOString()
    });
  });
}

module.exports = new InstrumentController();
