const Joi = require('joi');

// Trade schema validation
const tradeSchema = Joi.object({
  userId: Joi.string().required(),
  orderId: Joi.string().required(),
  symbol: Joi.string().required().min(1).max(20),
  orderType: Joi.string().valid('BUY', 'SELL').required(),
  quantity: Joi.number().integer().min(1).required(),
  price: Joi.number().positive().required(),
  totalAmount: Joi.number().positive().required(),
  executedAt: Joi.date().default(() => new Date())
});

class Trade {
  constructor(data) {
    // Calculate total amount if not provided
    if (data.quantity && data.price && !data.totalAmount) {
      data.totalAmount = data.quantity * data.price;
    }
    
    const { error, value } = tradeSchema.validate(data);
    if (error) {
      throw new Error(`Invalid trade data: ${error.details[0].message}`);
    }
    
    Object.assign(this, value);
  }

  static validate(data) {
    return tradeSchema.validate(data);
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      orderId: this.orderId,
      symbol: this.symbol,
      orderType: this.orderType,
      quantity: this.quantity,
      price: this.price,
      totalAmount: this.totalAmount,
      executedAt: this.executedAt,
      createdAt: this.createdAt
    };
  }
}

module.exports = Trade;
