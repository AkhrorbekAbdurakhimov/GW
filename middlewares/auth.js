
const jwt = require('jsonwebtoken');

const { APP } = require('../config');

const authMiddleware = (req, res, next) => {
	let authorizationHeader;

  if (req.method === 'GET' && req.query.token) 
		authorizationHeader = `Berear ${req.query.token}`;
  else 
		authorizationHeader = req.headers.authorization;

  if (authorizationHeader) {
    const token = authorizationHeader.split(' ')[1];

    return jwt.verify(token, APP.SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).send({
          type: 'AuthenticationError',
					message: 'You are unauthorized, try refreshing the page.'
        });
      }

      req.user = decoded.user;
      return next();
    });
  }
	
	return res.status(401).send({
		type: 'AuthenticationError',
		message: 'You are unauthorized, try refreshing the page.'
	});
}

module.exports = {
  authMiddleware
}