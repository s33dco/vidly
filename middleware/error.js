module.exports = (err, req, res, next) => {
  // log exception
  res.status(500).send('something went wrong')
};
