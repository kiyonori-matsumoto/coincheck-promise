const prv = require('./lib/private');
const pub = require('./lib/public');

const methods = Object.assign({}, prv, pub);
methods.setCredentials  = (key, secret=null) => {
  if(typeof(key) === "string") {
    if(!secret) {
      throw "key and secret is required";
    }
    prv._setCredentials(key, secret);
  } else if(key.key && key.secret) {
    prv._setCredentials(key.key, key.secret);
  } else {
    throw "key and secret is required";
  }
}

module.exports = methods;
