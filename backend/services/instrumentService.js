const memoryStore = require('../database/memoryStore');
const { AppError } = require('../middleware/errorHandler');
const { generatePriceVariation } = require('../utils/helpers');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');

class InstrumentService {
  /**
   * Get all available instruments
   * @returns {Array} Array of instruments
   */
  getAllInstruments() {
    try {
      const instruments = memoryStore.getAllInstruments();
      
      // Simulate real-time price updates (optional feature)
      instruments.forEach(instrument => {
        // 10% chance to update price on each request (for demo purposes)
        if (Math.random() < 0.1) {
          const newPrice = generatePriceVariation(instrument.lastTradedPrice, 1);
          memoryStore.updateInstrumentPrice(instrument.symbol, newPrice);
          instrument.lastTradedPrice = newPrice;
        }
      });

      return instruments;
    } catch (error) {
      throw new AppError('Failed to retrieve instruments', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get instrument by symbol
   * @param {string} symbol - Instrument symbol
   * @returns {Object} Instrument object
   */
  getInstrumentBySymbol(symbol) {
    try {
      const instrument = memoryStore.getInstrumentBySymbol(symbol);
      
      if (!instrument) {
        throw new AppError(
          `Instrument with symbol '${symbol}' not found`, 
          HTTP_STATUS.NOT_FOUND
        );
      }

      return instrument;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to retrieve instrument', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Search instruments by criteria
   * @param {Object} searchCriteria - Search parameters
   * @returns {Array} Filtered instruments
   */
  searchInstruments(searchCriteria) {
    try {
      let instruments = this.getAllInstruments();
      
      if (searchCriteria.exchange) {
        instruments = instruments.filter(inst => 
          inst.exchange.toLowerCase() === searchCriteria.exchange.toLowerCase()
        );
      }

      if (searchCriteria.instrumentType) {
        instruments = instruments.filter(inst => 
          inst.instrumentType.toLowerCase() === searchCriteria.instrumentType.toLowerCase()
        );
      }

      if (searchCriteria.symbol) {
        instruments = instruments.filter(inst => 
          inst.symbol.toLowerCase().includes(searchCriteria.symbol.toLowerCase()) ||
          (inst.companyName && inst.companyName.toLowerCase().includes(searchCriteria.symbol.toLowerCase()))
        );
      }

      if (searchCriteria.minPrice) {
        instruments = instruments.filter(inst => 
          inst.lastTradedPrice >= parseFloat(searchCriteria.minPrice)
        );
      }

      if (searchCriteria.maxPrice) {
        instruments = instruments.filter(inst => 
          inst.lastTradedPrice <= parseFloat(searchCriteria.maxPrice)
        );
      }

      return instruments;
    } catch (error) {
      throw new AppError('Failed to search instruments', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get current market price for an instrument
   * @param {string} symbol - Instrument symbol
   * @returns {number} Current market price
   */
  getCurrentPrice(symbol) {
    const instrument = this.getInstrumentBySymbol(symbol);
    return instrument.lastTradedPrice;
  }

  /**
   * Update instrument price (for simulation)
   * @param {string} symbol - Instrument symbol
   * @param {number} newPrice - New price
   * @returns {boolean} Update success status
   */
  updatePrice(symbol, newPrice) {
    try {
      const success = memoryStore.updateInstrumentPrice(symbol, newPrice);
      
      if (!success) {
        throw new AppError(
          `Failed to update price for symbol '${symbol}'`, 
          HTTP_STATUS.NOT_FOUND
        );
      }

      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update instrument price', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Validate if instrument exists and is tradable
   * @param {string} symbol - Instrument symbol
   * @returns {boolean} Validation result
   */
  validateInstrument(symbol) {
    try {
      const instrument = memoryStore.getInstrumentBySymbol(symbol);
      return !!instrument;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get market statistics
   * @returns {Object} Market statistics
   */
  getMarketStats() {
    try {
      const instruments = this.getAllInstruments();
      
      const totalInstruments = instruments.length;
      const averagePrice = instruments.reduce((sum, inst) => sum + inst.lastTradedPrice, 0) / totalInstruments;
      const highestPrice = Math.max(...instruments.map(inst => inst.lastTradedPrice));
      const lowestPrice = Math.min(...instruments.map(inst => inst.lastTradedPrice));
      
      const exchanges = [...new Set(instruments.map(inst => inst.exchange))];
      const instrumentTypes = [...new Set(instruments.map(inst => inst.instrumentType))];

      return {
        totalInstruments,
        averagePrice: Math.round(averagePrice * 100) / 100,
        highestPrice,
        lowestPrice,
        exchanges,
        instrumentTypes,
        lastUpdated: new Date()
      };
    } catch (error) {
      throw new AppError('Failed to get market statistics', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = new InstrumentService();
