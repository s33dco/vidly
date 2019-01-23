const config          = require('config');
const helmet          = require('helmet');
const morgan          = require('morgan');
const Joi             = require('joi');
const {logger, auth}  = require('./middleware');
const express         = require('express');
const port            = process.env.PORT || 3000;
const app             = express();
const genres          = [ {id:1, name: 'comedy'},
                          {id:2, name: 'thriller'},
                          {id:3, name: 'action'}];


console.log(`NODE_ENV = ${process.env.NODE_ENV}`);
console.log(`app: ${app.get('env')}`);

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static('public'));
app.use(helmet());

//  configuration

console.log(`app name : ${config.get('name')}`)
console.log(`app name : ${config.get('mail.host')}`)

if (app.get('env') === 'development'){
  app.use(morgan('tiny'));
  console.log('morgan enabled');
}

app.use(logger);

app.use(auth);

function validateGenre(genre) {
  const schema = {
    name: Joi.string().min(3).required()
  };

  return Joi.validate(genre, schema);
}

app.get('/api/genres', (req, res) => {
  res.status(200).send(genres);
});

app.get('/api/genres/:id', (req, res) => {
  const genre = genres.find(g => g.id === parseInt(req.params.id));

  if (!genre) {
    return res.status(404).send(`genre can't be found!`);
  }

  res.status(200).send(genre);
});

app.post('/api/genres', (req, res) => {
  const { error} = validateGenre(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const genre = { id: genres.length +1, name: req.body.name};

  genres.push(genre);

  res.status(200).send(genre);
});

app.put('/api/genres/:id', (req, res) => {
  let genre = genres.find(g => g.id === parseInt(req.params.id));

  if (!genre) {
    return res.status(404).send(`genre can't be found!`);
  }

  const { error } = validateGenre(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  genre.name = req.body.name;
  res.send(genre);
});

app.delete('/api/genres/:id', (req, res) => {
  const genre = genres.find(c => c.id === parseInt(req.params.id));
  if (!genre) return res.status(404).send('The genre with the given ID was not found.');

  const index = genres.indexOf(genre);
  genres.splice(index, 1);
  res.send(genre);
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
