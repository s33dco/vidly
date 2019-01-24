const appDebug        = require('debug')('app:startup');
const dbDebug         = require('debug')('app:db');
const config          = require('config');
const helmet          = require('helmet');
const morgan          = require('morgan');
const Joi             = require('joi');
const {logger, auth}  = require('./middleware');
const express         = require('express');
const port            = process.env.PORT || 3000;
const app             = express();
const genres         = require('./routes/genres');
app.set('view engine', 'pug');
app.set('views','./views');

console.log(`NODE_ENV = ${process.env.NODE_ENV}`);
console.log(`app: ${app.get('env')}`);

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static('public'));
app.use(helmet());
app.use('/api/genres', genres);

//  configuration

console.log(`app name : ${config.get('name')}`)
console.log(`app name : ${config.get('mail.host')}`)
appDebug('morgan enabled');
dbDebug('morgan enabled');

if (app.get('env') === 'development'){
  app.use(morgan('tiny'));

}

app.use(logger);

app.use(auth);

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
  console.log(`listening on port ${port}`);
});
