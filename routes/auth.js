const bcrypt      = require('bcrypt');
const Joi         = require('joi');
const _           = require('lodash');    // or use destructuring instead of .pick
const mongoose    = require('mongoose');
const express     = require('express');
const router      = express.Router();
const {User}      = require('../models/users');

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({email : req.body.email });

  if (!user) return res.status(400).send('Invalid email or password.'); // not sending 404 just bad request

  // validate Password

  const validPassword = await bcrypt.compare(req.body.password, user.password);

  if (!validPassword) return res.status(400).send('Invalid email or password.');

  // send back a JWT
  // put in localstorage
  // jwt.io

  const token = user.generateAuthToken();

  // decode token give _id and iat (timestamp)

  res.send(token);

});

function validate(req) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  };

  return Joi.validate(req, schema);
}

module.exports = router;
