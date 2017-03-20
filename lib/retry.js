const rp = require('request-promise-native')

const history = {}

module.exports = {
  add: (method, request) => {
    history[method] = request;
    return request;
  },
  retry: (method) => {
    if(!history[method])
      return Promise.reject("no method executed")
    return rp(history[method]).then(JSON.parse)
           .catch( (e) => {
             if(e.statusCode ==  401 && e.error.match(/Nonce must be incremented/)) {
               return Promise.resolve("already successed")
             }
             return Promise.reject(e);
           })
  }
}