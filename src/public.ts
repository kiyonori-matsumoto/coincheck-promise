import * as rp from 'request-promise-native';
import * as moment from 'moment';
import { Config } from './config';
import { Pagenation } from './private';

export class Public {
  public ticker(): Promise<TickerResponse> {
    return this.public_request('ticker');
  }

  public trades(pair = 'btc_jpy', option: Pagenation = {}): Promise<{data: TradesResponse[], pagination: Pagenation}> {
    return this.public_request('trades', Object.assign({pair}, option))
    .then(this.handle_response_success);
  }

  public order_books(): Promise<OrderBooksResponse> {
    return this.public_request('order_books');
  }

  public order_rate(option: OrderRateRequest): Promise<OrderRateResponse> {
    return this.public_request('exchange/orders/rate')
    .then(this.handle_response_success)
  }

  public rate(pair = 'btc_jpy'): Promise<{rate: number}> {
    return this.public_request(`rate/${pair}`);
  }

  private public_request(path: string, query:any = {}) {
    const _path = `/api/${path.toLowerCase()}`;
    const method = 'GET';

    const options = {
      url: 'https://coincheck.com' + _path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      json: true,
      qs: query
    };
    return rp(options);
  }

  private handle_response_success(response: any) {
    if (!response.success) {
      return Promise.reject(new Error(response.error))
    }
    return response; // TODO: ページネーションかっこ悪い
  }
}

export interface TickerResponse {
  last: number; ///最後の取引の価格
  bid: number; ///現在の買い注文の最高価格
  ask: number; ///現在の売り注文の最安価格
  high: number; ///24時間での最高取引価格
  low: number; ///24時間での最安取引価格
  volume: string; ///24時間での取引量
  timestamp: number; ///現在の時刻
}

export interface TradesResponse {
  id: string;
  amount: string;
  rate: string;
  pair: string;
  order_type: string;
  created_at: string;
}

export interface OrderBooksResponse {
  asks: [number, string][];
  bids: [number, string][];
}

export interface OrderRateRequest {
  order_type: 'sell'|'buy';
  pair: string;
  amount?: number;
  price?: number;
}

export interface OrderRateResponse {
  rate: number; /// 注文のレート
  price: number; /// 注文の金額
  amount: number; /// 注文の量
}
