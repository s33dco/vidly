const Joi = require('joi');
const mongoose = require('mongoose');
const {genreSchema} = require('./genres');

const Movie = mongoose.model('Movie', new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 255
  },
  numberInStock : {
    type : Number,
    required: true,
    min: 0,
    max: 255
  },
  dailyRentalRate : {
    type: Number,
    required: true,
    min: 0,
    max: 255
  },
  genre : {
    type: genreSchema,
    required : true
  }
}));

function validate(movie) {
  const schema = {
    title: Joi.string().min(5).max(50).required(),
    numberInStock: Joi.number().integer().min(0).max(255),
    dailyRentalRate: Joi.number().precision(2).min(0).max(255),
    genreId: Joi.string().required()
    // what about genre..
  };

  return Joi.validate(movie, schema);
}

module.exports = { Movie, validate}
