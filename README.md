# coincheck node
## How to
```javascript
const coincheck = require('coincheck-promise');

coincheck.order_books()
.then( (data) => {
  console.log(data);
}).catch( (err) => {
  console.log(err.message);
})
```

## Set credential
key and secret are specified by following order

1. call coincheck.setCredentials(key, secret);
2. set Environment Variable COINCHECK\_KEY and COINCHECK\_SECRET

## With options
```javascript
const coincheck = require('coincheck-promise');

coincheck.trade({
  pair: 'btc_jpy',
  order_type: 'buy',
  rate: 100000,
  amount: 0.001
})
.then((data) => {
  console.log(data);
}).catch( (err) => {
  console.error(err.message);
})
```

## Retry
You can retry latest order.
```javascript
const coincheck = require('coincheck-promise');

coincheck.trade({
  pair: 'btc_jpy', 
  order_type: 'buy',
  rate: 100000,
  amount: 0.001
}).then(console.log)
.catch( (err) => {
  return coincheck.retry('trade')
  .then( (d) => console.log("success"))
  .catch( (e) => console.log("error"))
})
```

## Supported order
Supported orders are currently limited to followings.

### Public API
- ticker
- order_books
- trades

### Private API
- trade
- balance
- cancelOrder
- activeOrders
- transactions

## Any issues?
please notify me on https://github.com/kiyonori-matsumoto/coincheck-promise/issues

## If you like this or want to try:
https://coincheck.com/?c=9PPI2IoRhys

