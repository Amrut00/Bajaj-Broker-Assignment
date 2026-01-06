const Joi = require('joi');

// Order schema validation
const orderSchema = Joi.object({
  userId: Joi.string().required(),
  symbol: Joi.string().required().min(1).max(20),
  orderType: Joi.string().valid('BUY', 'SELL').required(),
  orderStyle: Joi.string().valid('MARKET', 'LIMIT').required(),
  quantity: Joi.number().integer().min(1).required(),
  price: Joi.when('orderStyle', {
    is: 'LIMIT',
    then: Joi.number().positive().required(),
    otherwise: Joi.number().positive().optional()
  }),
  status: Joi.string().valid('NEW', 'PLACED', 'EXECUTED', 'CANCELLED').default('NEW')
});

class Order {
  constructor(data) {
    const { error, value } = orderSchema.validate(data);
    if (error) {
      throw new Error(`Invalid order data: ${error.details[0].message}`);
    }
    
    Object.assign(this, value);
  }

  static validate(data) {
    return orderSchema.validate(data);
  }

  static validateUpdate(data) {
    const updateSchema = Joi.object({
      status: Joi.string().valid('NEW', 'PLACED', 'EXECUTED', 'CANCELLED'),
      executedPrice: Joi.number().positive(),
      executedQuantity: Joi.number().integer().min(0)
    });
    
    return updateSchema.validate(data);
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      symbol: this.symbol,
      orderType: this.orderType,
      orderStyle: this.orderStyle,
      quantity: this.quantity,
      price: this.price,
      status: this.status,
      executedPrice: this.executedPrice,
      executedQuantity: this.executedQuantity,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Order;
