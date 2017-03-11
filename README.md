# coincheck node
## How to
```javascript
const coincheck = require('coincheck-promise');

coincheck.getBalance()
.then( (data) => {
  console.log(data);
}).catch( (err) => {
  console.log(err.message);
})
```

## Set credential
key and secret are specified by following order

1. call coincheck.setCredentials(key, secret);
2. set Environment Variable coincheck_KEY and coincheck_SECRET

## With options
```javascript
const coincheck = require('coincheck-promise');

coincheck.sendChildOrder({
  product_code: 'BTC_JPY',
  child_order_type: 'LIMIT',
  side: 'BUY',
  price: 100000,
  size: 0.001,
  minute_to_expire: 30,
})
.then((data) => {
  console.log(data);
}).catch( (err) => {
  console.error(err.message);
})
```

## Any issues?
please notify me on https://github.com/kiyonori-matsumoto/coincheck-promise/issues

## If you like this or want to register
https://coincheck.com/?c=9PPI2IoRhys

