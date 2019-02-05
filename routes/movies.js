const asyncMiddleware = require('../middleware/async');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const { Movie, validate} = require('../models/movies');
const { Genre }  = require('../models/genres');

router.get('/', asyncMiddleware(async (req, res) => {
  const genres = await Movie.find().sort('name');
  res.send(genres);
}));

router.post('/', auth, asyncMiddleware(async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId)
  if(!genre) return res.status(400).send('Invalid Genre')

  let movie = new Movie({
      title: req.body.title,
      numberInStock : req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate,
      genre : {
        _id: genre._id,
        name: genre.name
      }});
  movie = await movie.save();

  res.send(movie);
}));

router.put('/:id', auth, asyncMiddleware(async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send('Invalid genre.');

  const movie = await Movie.findByIdAndUpdate(req.params.id,
    {
      title: req.body.title,
      genre: {
        _id: genre._id,
        name: genre.name
      },
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate
    }, { new: true });

  if (!movie) return res.status(404).send('The movie with the given ID was not found.');

  res.send(movie);
}));

router.delete('/:id', auth, asyncMiddleware(async (req, res) => {
  const movie = await Movie.findByIdAndRemove(req.params.id);

  if (!movie) return res.status(404).send('The movie with the given ID was not found.');

  res.send(movie);
}));

router.get('/:id', asyncMiddleware(async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) return res.status(404).send('The movie with the given ID was not found.');

  res.send(movie);
}));



module.exports = router;
