import { Public } from './public';

import 'mocha';
import {expect} from 'chai';
import * as nock from 'nock';
import { fail } from 'assert';
const base = 'https://coincheck.com';

describe('Public', () => {
  let pub: Public
  before(() => {
    pub = new Public();
  })

  it('can instantiate', () => {
    expect(pub).not.to.be.null;
  })

  describe('trades', () => {
    it('can get data', () => {
      const res = {
        "success": true,
        "pagination": {
          "limit": 1,
          "order": "desc",
          "starting_after": null,
          "ending_before": null
        },
        "data": [
          {
            "id": 82,
            "amount": "0.28391",
            "rate": 35400,
            "pair": "btc_jpy",
            "order_type": "sell",
            "created_at": "2015-01-10T05:55:38.000Z"
          },
          {
            "id": 81,
            "amount": "0.1",
            "rate": 36120,
            "pair": "btc_jpy",
            "order_type": "buy",
            "created_at": "2015-01-09T15:25:13.000Z"
          }
        ]
      };
      const spec = nock(base)
      .get('/api/trades')
      .query({pair: 'btc_jpy'})
      .reply(200, res)

      pub.trades('btc_jpy').then(data => {
        expect(data).to.be.deep.equal(res);
        expect(spec.isDone()).to.be.true;
      })
    })
  })
})
