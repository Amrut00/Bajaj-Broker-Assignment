const Joi = require('joi');

// Instrument schema validation
const instrumentSchema = Joi.object({
  symbol: Joi.string().required().min(1).max(20),
  exchange: Joi.string().valid('NSE', 'BSE').required(),
  instrumentType: Joi.string().valid('EQUITY', 'DERIVATIVE', 'COMMODITY').required(),
  lastTradedPrice: Joi.number().positive().required(),
  companyName: Joi.string().optional()
});

class Instrument {
  constructor(data) {
    const { error, value } = instrumentSchema.validate(data);
    if (error) {
      throw new Error(`Invalid instrument data: ${error.details[0].message}`);
    }
    
    Object.assign(this, value);
  }

  static validate(data) {
    return instrumentSchema.validate(data);
  }

  toJSON() {
    return {
      symbol: this.symbol,
      exchange: this.exchange,
      instrumentType: this.instrumentType,
      lastTradedPrice: this.lastTradedPrice,
      companyName: this.companyName
    };
  }
}

module.exports = Instrument;
