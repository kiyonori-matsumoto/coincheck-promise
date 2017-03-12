const rp = require('request-promise-native');

public_methods = ['order_books', 'ticker', 'trades'].reduce( (a, e) => {
  a[e] = (query = {}) => {
    const path = `/api/${e.toLowerCase()}`;
    const method = 'GET';

    const options = {
      url: 'https://coincheck.com' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      json: true,
      query: query
    };
    return rp(options);
  }
  return a
}, {})

module.exports = public_methods;
