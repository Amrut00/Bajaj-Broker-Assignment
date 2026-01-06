const Joi = require('joi');

/**
 * Generic validation middleware factory
 * Creates middleware that validates request data against a Joi schema
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all validation errors
      stripUnknown: true // Remove unknown properties
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errorMessages
      });
    }

    // Replace the original data with the validated (and potentially transformed) data
    req[property] = value;
    next();
  };
};

// Common validation schemas
const schemas = {
  // Order creation validation
  createOrder: Joi.object({
    symbol: Joi.string().required().min(1).max(20).messages({
      'string.empty': 'Symbol is required',
      'string.max': 'Symbol must be less than 20 characters'
    }),
    orderType: Joi.string().valid('BUY', 'SELL').required().messages({
      'any.only': 'Order type must be either BUY or SELL'
    }),
    orderStyle: Joi.string().valid('MARKET', 'LIMIT').required().messages({
      'any.only': 'Order style must be either MARKET or LIMIT'
    }),
    quantity: Joi.number().integer().min(1).max(10000).required().messages({
      'number.min': 'Quantity must be at least 1',
      'number.max': 'Quantity cannot exceed 10000',
      'number.integer': 'Quantity must be a whole number'
    }),
    price: Joi.when('orderStyle', {
      is: 'LIMIT',
      then: Joi.number().positive().required().messages({
        'number.positive': 'Price must be positive',
        'any.required': 'Price is required for LIMIT orders'
      }),
      otherwise: Joi.number().positive().optional()
    })
  }),

  // Parameter validation
  orderId: Joi.object({
    orderId: Joi.string().uuid().required().messages({
      'string.guid': 'Invalid order ID format'
    })
  }),

  // Query parameter validation
  queryParams: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(50),
    offset: Joi.number().integer().min(0).default(0),
    status: Joi.string().valid('NEW', 'PLACED', 'EXECUTED', 'CANCELLED').optional(),
    symbol: Joi.string().min(1).max(20).optional()
  })
};

// Pre-configured validation middleware
const validateCreateOrder = validate(schemas.createOrder, 'body');
const validateOrderId = validate(schemas.orderId, 'params');
const validateQueryParams = validate(schemas.queryParams, 'query');

module.exports = {
  validate,
  schemas,
  validateCreateOrder,
  validateOrderId,
  validateQueryParams
};
