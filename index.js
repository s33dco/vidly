const mongoose        = require('mongoose');
const appDebug        = require('debug')('app:startup');
const dbDebug         = require('debug')('app:db');
const config          = require('config');
const helmet          = require('helmet');
const morgan          = require('morgan');
const Joi             = require('joi');
Joi.objectId          = require('joi-objectId')(Joi);
const {loggerMessage, authMessage}  = require('./middleware');
const express         = require('express');
const port            = process.env.PORT || 3000;
const app             = express();
const genres          = require('./routes/genres');
const customers       = require('./routes/customers');
const movies          = require('./routes/movies');
const rentals         = require('./routes/rentals');
const users           = require('./routes/users');
const auth            = require('./routes/auth');


mongoose.set('debug', true);

mongoose.connect('mongodb://localhost/vidly', { useNewUrlParser: true })
  .then(() => dbDebug('Connected to MongoDB >;-)'))
  .catch((e) => dbDebug('oh noes could not connect', e.message));

app.set('view engine', 'pug');
app.set('views','./views');

console.log(`NODE_ENV = ${process.env.NODE_ENV}`);
console.log(`app: ${app.get('env')}`);

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static('public'));
app.use(helmet());
app.use('/api/genres', genres);
app.use('/api/customers', customers);
app.use('/api/movies', movies);
app.use('/api/rentals', rentals);
app.use('/api/users', users);
app.use('/api/auth', auth);
//  configuration

console.log(`app name : ${config.get('name')}`)
console.log(`app name : ${config.get('mail.host')}`)
appDebug('morgan enabled');

if (app.get('env') === 'development'){
  app.use(morgan('tiny'));
}

app.use(loggerMessage);

app.use(authMessage);

function validateGenre(genre) {
  const schema = {
    name: Joi.string().min(3).required()
  };

  return Joi.validate(genre, schema);
}

app.get('/', (req, res) => {
  res.render('index', {title: "My app", message: 'hi there!'})
})

app.listen(port, () => {
  appDebug(`listening on port ${port}`);
});
