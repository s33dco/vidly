const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Fawn = require('fawn');
const dbDebug   = require('debug')('app:db');
const { Movie } = require('../models/movies');
const { Customer }  = require('../models/customers');
const { Rental, validate }  = require('../models/rentals');

Fawn.init(mongoose);

router.get('/', async (req, res) => {
  const rentals = await Rental.find().sort('-dateOut');
  res.send(rentals);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId)
  dbDebug(customer);
  if(!customer) return res.status(400).send('Invalid Customer')

  const movie = await Movie.findById(req.body.movieId)
  dbDebug(movie);
  if(!movie) return res.status(400).send('Invalid Movie')

  if (movie.numberInStock === 0) return res.status(400).send('Movie not in stock.');

  let rental = new Rental({
      movie : {
        _id: movie._id,                         //id passed from original movieSchema into custom schema
        title: movie.title,                     // light version of full movie schema
        dailyRentalRate: movie.dailyRentalRate
      },
      customer : {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
        isGold: customer.isGold
      }
    });

  // rental = await rental.save(); // rental save
  //
  // movie.numberInStock--;        // amend stock level
  // movie.save();                 // needs to be in a transaction/atomic

  try {                                       // task in try block...
    new Fawn.Task()                           // set up atomic task
      .save('rentals', rental)                // collection name, obj
      .update('movies', {_id: movie._id}, {   // collection, {obj}, {udpate doc}
          $inc :{ numberInStock: -1 }
      })
      .run();

    res.send(rental);
  }
  catch(e) {
    res.status(500).send('Something went wrong');
  }



});

router.delete('/:id', async (req, res) => {
  const rental = await Rental.findByIdAndRemove(req.params.id);

  if (!rental) return res.status(404).send('The rental with the given ID was not found.');

  res.send(rental);
});

router.get('/:id', async (req, res) => {
  const rental = await Rental.findById(req.params.id);

  if (!rental) return res.status(404).send('The rental with the given ID was not found.');

  res.send(rental);
});

module.exports = router;
