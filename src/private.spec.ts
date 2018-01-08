import {Private} from './private';

import 'mocha';
import {expect} from 'chai';
import * as nock from 'nock';
import { fail } from 'assert';

const base = 'https://coincheck.com'
nock.disableNetConnect();

describe('Private', () => {
  let p: Private;
  beforeEach(() => {
    p = new Private('key', 'secret');
  })

  describe('#new_order', () => {
    it('can request', () => {
      const res = {
        "success": true,
        "id": 12345,
        "rate": "28500.0",
        "amount": "0.0001",
        "order_type": "buy",
        "stop_loss_rate": null,
        "pair": "btc_jpy",
        "created_at": "2015-01-10T05:55:38.000Z"
      };

      const spec = nock(base).post('/api/exchange/orders', {amount: 0.0001, rate: 28500, order_type: 'buy', pair: 'btc_jpy'})
      .reply(200, res);

      return p.new_order({
        pair: 'btc_jpy',
        order_type: 'buy',
        amount: 0.0001,
        rate: 28500,
      }).then(data => {
        expect(data).to.deep.equals(res);
        expect(spec.isDone()).to.be.true;
        expect(Number(data.amount) - 1).to.equals(-0.9999);
        expect(Number(data.amount) + 1).to.equals(1.0001);
      })
    })
  })

  describe('#get_open_orders', () => {
    it('can request', () => {
      const res = {
        "success": true,
        "orders": [
          {
            "id": 202835,
            "order_type": "buy",
            "rate": 26890,
            "pair": "btc_jpy",
            "pending_amount": "0.5527",
            "pending_market_buy_amount": null,
            "stop_loss_rate": null,
            "created_at": "2015-01-10T05:55:38.000Z"
          },
          {
            "id": 202836,
            "order_type": "sell",
            "rate": 26990,
            "pair": "btc_jpy",
            "pending_amount": "0.77",
            "pending_market_buy_amount": null,
            "stop_loss_rate": null,
            "created_at": "2015-01-10T05:55:38.000Z"
          },
          {
            "id": 38632107,
            "order_type": "buy",
            "rate": null,
            "pair": "btc_jpy",
            "pending_amount": null,
            "pending_market_buy_amount": "10000.0",
            "stop_loss_rate": "50000.0",
            "created_at": "2016-02-23T12:14:50.000Z"
          }
        ]
      };
      const spec = nock(base)
      .get('/api/exchange/orders/opens')
      .reply(200, res);

      return p.get_open_orders().then(data => {
        expect(data).to.deep.equals(res);
        expect(spec.isDone()).to.be.true;
        expect(data.orders[0].rate === '26890');
        expect(data.orders[0].order_type === 'buy');
      })
    })
  })

  describe('#cancel_order', () => {
    it('can request', () => {
      const res = {
        "success": true,
        "id": 12345
      }

      const spec = nock(base)
      .delete('/api/exchange/orders/12345')
      .reply(200, res);

      return p.cancel_order(12345)
      .then(data => {
        expect(data).to.deep.equals(res);
        expect(spec.isDone()).to.be.true;
      })
    })
  })

  describe('#trade_history', () => {
    it('can request', () => {
      const res = {
        "success": true,
        "transactions": [
          {
            "id": 38,
            "order_id": 49,
            "created_at": "2015-11-18T07:02:21.000Z",
            "funds": {
              "btc": "0.1",
              "jpy": "-4096.135"
            },
            "pair": "btc_jpy",
            "rate": "40900.0",
            "fee_currency": "JPY",
            "fee": "6.135",
            "liquidity": "T",
            "side": "buy"
          },
          {
            "id": 37,
            "order_id": 48,
            "created_at": "2015-11-18T07:02:21.000Z",
            "funds": {
              "btc": "-0.1",
              "jpy": "4094.09"
            },
            "pair": "btc_jpy",
            "rate": "40900.0",
            "fee_currency": "JPY",
            "fee": "-4.09",
            "liquidity": "M",
            "side": "sell"
          }
        ]
      };

      const spec = nock(base)
      .get('/api/exchange/orders/transactions')
      .reply(200, res);

      return p.trade_history()
      .then(data => {
        expect(data).to.deep.equals(res);
        expect(spec.isDone()).to.be.true;
      })
    })
  })
})
