const logger = (req, res, next) => {
  console.log('logging...');
  next();
};

const auth = (req, res, next) => {
  console.log('authenticating...');
  next();
}

module.exports = { logger, auth };
