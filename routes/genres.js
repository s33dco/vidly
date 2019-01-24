const express = require('express');
const router  = express.Router();

const genres          = [ {id:1, name: 'comedy'},
                          {id:2, name: 'thriller'},
                          {id:3, name: 'action'}];

router.get('/', (req, res) => {
  res.status(200).send(genres);
});

router.get('/:id', (req, res) => {
  const genre = genres.find(g => g.id === parseInt(req.params.id));

  if (!genre) {
    return res.status(404).send(`genre can't be found!`);
  }

  res.status(200).send(genre);
});

router.post('/', (req, res) => {
  const { error} = validateGenre(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const genre = { id: genres.length +1, name: req.body.name};

  genres.push(genre);

  res.status(200).send(genre);
});

router.put('/:id', (req, res) => {
  let genre = genres.find(g => g.id === parseInt(req.params.id));

  if (!genre) {
    return res.status(404).send(`genre can't be found!`);
  }

  const { error } = validateGenre(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  genre.name = req.body.name;
  res.send(genre);
});

router.delete('/:id', (req, res) => {
  const genre = genres.find(c => c.id === parseInt(req.params.id));
  if (!genre) return res.status(404).send('The genre with the given ID was not found.');

  const index = genres.indexOf(genre);
  genres.splice(index, 1);
  res.send(genre);
});

module.exports = router;
