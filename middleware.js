const loggerMessage = (req, res, next) => {
  console.log('logging...');
  next();
};

const authMessage = (req, res, next) => {
  console.log('authenticating...');
  next();
}

module.exports = { loggerMessage, authMessage };
