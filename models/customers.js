const Joi = require('joi');
const mongoose = require('mongoose');

const Customer = mongoose.model('Customer', new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  phone: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 15
  },
  isGold: {
    type: Boolean,
    default: false,
    required: true
  }
}));

function validate(customer) {
  const schema = {
    name: Joi.string().min(5).max(50).required(),
    phone: Joi.string().min(3).required(),
    isGold: Joi.boolean()
  };

  return Joi.validate(customer, schema);
}


module.exports = {Customer, validate};
