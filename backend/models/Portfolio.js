const Joi = require('joi');

// Portfolio schema validation
const portfolioSchema = Joi.object({
  userId: Joi.string().required(),
  symbol: Joi.string().required().min(1).max(20),
  quantity: Joi.number().integer().min(0).required(),
  averagePrice: Joi.number().min(0).required(),
  totalInvestment: Joi.number().min(0).required(),
  currentPrice: Joi.number().positive().optional(),
  currentValue: Joi.number().min(0).optional(),
  totalReturn: Joi.number().optional(),
  totalReturnPercentage: Joi.number().optional()
});

class Portfolio {
  constructor(data) {
    const { error, value } = portfolioSchema.validate(data);
    if (error) {
      throw new Error(`Invalid portfolio data: ${error.details[0].message}`);
    }
    
    Object.assign(this, value);
  }

  static validate(data) {
    return portfolioSchema.validate(data);
  }

  // Calculate current value based on current price
  calculateCurrentValues(currentPrice) {
    this.currentPrice = currentPrice;
    this.currentValue = this.quantity * currentPrice;
    this.totalReturn = this.currentValue - this.totalInvestment;
    this.totalReturnPercentage = this.totalInvestment > 0 ? 
      ((this.totalReturn / this.totalInvestment) * 100).toFixed(2) : 0;
    
    return this;
  }

  toJSON() {
    return {
      userId: this.userId,
      symbol: this.symbol,
      quantity: this.quantity,
      averagePrice: parseFloat(this.averagePrice.toFixed(2)),
      totalInvestment: parseFloat(this.totalInvestment.toFixed(2)),
      currentPrice: this.currentPrice ? parseFloat(this.currentPrice.toFixed(2)) : null,
      currentValue: this.currentValue ? parseFloat(this.currentValue.toFixed(2)) : null,
      totalReturn: this.totalReturn ? parseFloat(this.totalReturn.toFixed(2)) : null,
      totalReturnPercentage: this.totalReturnPercentage ? parseFloat(this.totalReturnPercentage) : null,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Portfolio;
