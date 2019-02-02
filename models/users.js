const config      = require('config');
const jwt         = require('jsonwebtoken');
const Joi = require('joi');
// const PasswordComplexity = require('joi-password-complexity');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1024,
  },
  isAdmin: Boolean
});

userSchema.methods.generateAuthToken = function (){
  const token = jwt.sign({_id: this._id, isAdmin: this.isAdmin, name: this.name}, config.get('jwtPrivateKey'), { expiresIn: '1h' });
  return token;
};

const User = mongoose.model('User', userSchema);

function validate(user) {
  const schema = {
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  };

  return Joi.validate(user, schema);
}


module.exports = {User, validate};
