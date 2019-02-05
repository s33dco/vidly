const error           = require('./middleware/error');
const mongoose        = require('mongoose');
const appDebug        = require('debug')('app:startup');
const dbDebug         = require('debug')('app:db');
const config          = require('config');
const helmet          = require('helmet');
const morgan          = require('morgan');
const Joi             = require('joi');
Joi.objectId          = require('joi-objectId')(Joi);
const express         = require('express');
const port            = process.env.PORT || 3000;
const app             = express();
const genres          = require('./routes/genres');
const customers       = require('./routes/customers');
const movies          = require('./routes/movies');
const rentals         = require('./routes/rentals');
const users           = require('./routes/users');
const auth            = require('./routes/auth');

if (!config.get('jwtPrivateKey')){
  console.error("FATAL ERROR: jwtPrivateKey not defined.");
  process.exit(1);
}

mongoose.set('debug', true);

mongoose.connect('mongodb://localhost/vidly', { useNewUrlParser: true })
  .then(() => dbDebug('Connected to MongoDB >;-)'))
  .catch((e) => dbDebug('oh noes could not connect', e.message));

app.set('view engine', 'pug');
app.set('views','./views');


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

if (app.get('env') === 'development'){
  console.log(`strating in development....`);
  app.use(morgan('tiny'));
  appDebug('morgan enabled');
}


app.get('/', (req, res) => {
  res.render('index', {title: "My app", message: 'hi there!'})
})

app.use(error);

app.listen(port, () => {
  appDebug(`listening on port ${port}`);
});
