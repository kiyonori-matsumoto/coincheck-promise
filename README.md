# coincheck-promise
## How to
```javascript
const Coincheck = require('coincheck-promise').Coincheck;
const coincheck = new Coincheck();

coincheck.Public.order_books()
.then( (data) => {
  console.log(data);
}).catch( (err) => {
  console.log(err.message);
})
```

## Set credential
key and secret are specified by following order

1. call coincheck.set_credential(key, secret);
2. set Environment Variable COINCHECK\_KEY and COINCHECK\_SECRET

## With options
```javascript
const Coincheck = require('coincheck-promise').Coincheck;
const coincheck = new Coincheck('API_KEY', 'SECRET_KEY');

// or alternatively, set credential by set_credential method.
coincheck.set_credential('key', 'secret');

coincheck.Private.new_order({
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

## Nonce protection (sequential requesting)
This library limits api request by one per API_KEY. Whatever you use Promise.all to request multiple, 
the request is issued sequentially.

## Supported order
all operations on [API Document](https://coincheck.com/ja/documents/exchange/api) are supported!

## Any issues?
please notify me on https://github.com/kiyonori-matsumoto/coincheck-promise/issues

## If you like this or want to try:
please register your account from here: https://coincheck.com/?c=9PPI2IoRhys

or give me some donates!
- btc: `15GnXQuw23udU8APYF8ayFeYVHnzZE38GZ`
- bch: `16eF3vBMgRB2QMsKhx7yN9LEq5g3m5pyfq`
- mona: `MSZcFBzwAeUrYBA8f6EDJRyQqc2n5p3Usq`
