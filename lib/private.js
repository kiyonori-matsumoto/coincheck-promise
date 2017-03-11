const rp = require('request-promise-native');
const qs = require('qs');
const crypto = require('crypto');

let key = process.env.COINCHECK_KEY;
let secret = process.env.COINCHECK_SECRET;

const METHODS = [
  { name: 'trade', uri: 'exchange/orders', method: 'POST' },
  { name: 'balance', uri: 'accounts/balance', method: 'GET' },
  { name: 'cancelOrder', uri: 'exchange/orders/:id', method: 'DELETE' },
  { name: 'activeOrders', uri: 'exchange/orders/opens', method: 'GET'}
]

private_methods = METHODS.reduce( (a, e) => {
  a[e.name] = (query=null) => {
    if(!key || !secret) {
      return Promise.reject({message: "private method needs key and secret"});
    }
    const timestamp = Date.now().toString();
    const method = e.method;
    const query_str = (query && method === 'GET') ? `?${qs.stringify(query)}` : ''
    const path = `https://coincheck.com/api/${e.uri}${query_str}`;
    if (query && query.id) path.replace(/\/\:id\//, `/${query.id}/`)
    const body = (query && method === 'POST') ? JSON.stringify(query): "";
    const text = timestamp + path + body;
    const sign = crypto.createHmac('sha256', secret).update(text).digest('hex');

    const options = {
      url: path,
      method: method,
      headers: {
        'ACCESS-KEY': key,
        'ACCESS-NONCE': timestamp,
        'ACCESS-SIGNATURE': sign,
        'Content-Type': 'application/json'
      },
    };
    if(body && body !== "") {
      options.body = body;
    }
    return rp(options).then(JSON.parse);
  }
  return a;
}, {});

private_methods._setCredentials = (_key, _secret) => {
  key = _key;
  secret = _secret;
}

module.exports = private_methods;
