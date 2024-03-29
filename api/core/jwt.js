const expressJwt = require('express-jwt');
const secret = process.env.JWT_SECRET;
const userService = require('../components/users/user.service');

module.exports = jwt;

function jwt() {
  return expressJwt({ secret, isRevoked }).unless({
    path: [
      // public routes that don't require authentication
      '/users/authenticate',
      '/users/register',
      '/feed/getFeedBySearch',
      '/ml/getClassification',
      '/ml/getClassificationText',
      '/ml/checkClickbait',
      '/ml/checkWriting',
      '/ml/checkSentiment',
    ],
  });
}

async function isRevoked(req, payload, done) {
  const user = await userService.getById(payload.sub);

  // revoke token if user no longer exists
  if (!user) {
    return done(null, true);
  }

  done();
}
