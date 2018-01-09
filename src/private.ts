import {Config} from './config';

import * as rp from 'request-promise-native';
import * as moment from 'moment';
import * as crypto from 'crypto';
import * as AsyncLock from 'async-lock';
import * as qs from 'qs'

const lock = new AsyncLock();

export class Private {
  private key:string = process.env.COINCHECK_KEY || '';
  private secret:string = process.env.COINCHECK_SECRET || '';

  constructor(key?:string, secret?:string) {
    if (key) this.key = key;
    if (secret) this.secret = secret;
  }

  public set_credential(key: string, secret: string) {
    this.key = key;
    this.secret = secret;
  }

  public new_order(option: NewOrderRequest): Promise<NewOrderResponse> {
    return this.private_request('POST', '/api/exchange/orders', option);
  }

  public get_open_orders(): Promise<GetOpenOrdersResponse> {
    return this.private_request('GET', '/api/exchange/orders/opens')
  }

  public cancel_order(id: number): Promise<{id: number}> {
    return this.private_request('DELETE', `/api/exchange/orders/${id}`);
  }

  public trade_history() {
    return <Promise<{transactions: TradeHistoryResponse[]}>>this.private_request('GET', '/api/exchange/orders/transactions');
  }

  public trade_history_page(option: Pagenation) {
   return <Promise<{data: TradeHistoryResponse[], pagination: Pagenation}>>this.private_request('GET', '/api/exchange/orders/transactions_pagination', option);
  }

  public positions(option: {status: 'open'|'closed'}): Promise<{data: PositionsResponse[]}> {
    return this.private_request('GET', '/api/exchange/leverage/positions', option)
  }

  public balances(): Promise<{[x: string]: number}> {
    return this.private_request('GET', '/api/accounts/balance');
  }

  public leverage_balances(): Promise<LeverageBalancesResponse> {
    return this.private_request('GET', '/api/accounts/leverage_balance');
  }

  public send_money(option: SendMoneyRequest): Promise<{sends: SendMoneyResponse[]}> {
    return this.private_request('POST', '/api/send_money', option);
  }

  public send_money_history(option: {currency: 'BTC'}): Promise<SendMoneyHistoryResponse> {
    return this.private_request('GET', '/api/send_money', option);
  }

  public deposit_money_history(option: {currency: 'BTC'}): Promise<{deposits: DepositMoneyHistoryResponse[]}> {
    return this.private_request('GET', '/api/deposit_money', option);
  }

  public fast_deposit_money(id: number): Promise<void> {
    return this.private_request('POST', `/api/deposit_money/${id}/fast`);
  }

  public account(): Promise<AccountResponse> {
    return this.private_request('GET', '/api/accounts');
  }

  public bank_accounts(): Promise<{data: BankAccountsResponse[]}> {
    return this.private_request('GET', '/api/bank_accounts');
  }

  public new_bank_account(option: BankAccountRequest): Promise<{data: BankAccountsResponse}> {
    return this.private_request('POST', '/api/bank_accounts', option);
  }

  public delete_bank_account(id: number): Promise<void> {
    return this.private_request('DELETE', `/api/bank_accounts/${id}`);
  }

  public withdraws(option: Pagenation): Promise<{data: WithdrawResponses[], pagination: Pagenation}> {
    return this.private_request('GET', '/api/withdraws');
  }

  public new_withdraw(option: WithdrawRequest): Promise<{data: WithdrawResponses}> {
    return this.private_request('POST', '/api/withdraws');
  }

  public cancel_withdraw(id: number): Promise<void> {
    return this.private_request('DELETE', `/api/withdraws/${id}`)
  }

  public lend_borrow(option: LendBorrowRequest): Promise<LendBorrowResponse> {
    return this.private_request('POST', '/api/lending/borrows', option);
  }

  public borrows(): Promise<{matches: BorrowResponse[]}> {
    return this.private_request('GET', '/api/lending/borrows/matches');
  }

  public repay_borrow(id: number): Promise<{id: number}> {
    return this.private_request('POST', `/api/lending/borrows/${id}/repay`);
  }

  public transfer_from_leverage(option: TransferLeverageRequest): Promise<void> {
    return this.private_request('POST', '/api/exchange/transfers/from_leverage', option);
  }

  public transfer_to_leverage(option: TransferLeverageRequest): Promise<void> {
    return this.private_request('POST', '/api/exchange/transfers/to_leverage', option);
  }

  private private_request(method: string, path: string, query?: any): Promise<any> {
    if (!this.key || !this.secret) {
      return Promise.reject(new Error('key and secret must be set to use Private methods.'))
    }
    return new Promise((resolve, reject) => {
      lock.acquire(this.key, () => {
        const timestamp = Date.now().toString();
        const query_str = (query && method === 'GET') ? `?${qs.stringify(query)}` : ''
        const _path = Config.endpoint + path + query_str;
        const body = (query && (method === 'POST' || method === 'PUT')) ? JSON.stringify(query): '';
        
        const text = timestamp + _path + body;
        const sign = crypto.createHmac('sha256', this.secret).update(text).digest('hex');

        const options: any = {
          url: _path,
          method: method,
          headers: {
            'ACCESS-KEY': this.key,
            'ACCESS-NONCE': timestamp,
            'ACCESS-SIGNATURE': sign,
            'Content-Type': 'application/json'
          },
        };
        if(body && body !== "") {
          options.body = body;
        }
        return rp(options)
          .then(JSON.parse)
          .then(resolve, reject);
      })
    })
  }
}

export interface Pagenation {
  limit?: number; /// 1ページあたりの取得件数を指定できます。
  order?: 'asc'|'desc'; /// "desc", "asc" を指定できます。
  starting_after?: number; /// IDを指定すると絞り込みの開始位置を設定できます。
  ending_before?: number; /// IDを指定すると絞り込みの終了位置を設定できます。
}

export interface NewOrderRequest {
  pair: string; /// 取引ペア。現在は "btc_jpy" のみです。
  order_type: string; /// 注文方法
  rate?: number; /// 注文のレート。（例）28000
  amount?: number; /// 注文での量。（例）0.1
  market_buy_amount?: number; /// 成行買で利用する日本円の金額。（例）10000
  position_id?: number; /// 決済するポジションのID
  stop_loss_rate?: number; /// 逆指値レート ( 逆指値とは？ )
}

export interface NewOrderResponse {
  id: number; /// 新規注文のID
  rate: string; /// 注文のレート
  amount: string; /// 注文の量
  order_type: string; /// 注文方法
  stop_loss_rate: string|null; /// 逆指値レート
  pair: string; /// 取引ぺア
  created_at: string; /// 注文の作成日時
}

export interface GetOpenOrdersResponse {
  orders: {
    id: number; /// 注文のID（新規注文でのIDと同一です）
    rate: string | null; /// 注文のレート（ null の場合は成り行き注文です）
    pending_amount: string; /// 注文の未決済の量
    pending_market_buy_amount: string|null; /// 注文の未決済の量（現物成行買いの場合のみ
    order_type: 'sell'|'buy'; /// 注文のタイプ（"sell" or "buy"）
    stop_loss_rate: string; /// 逆指値レート
    pair: string; /// 取引ペア
    created_at: string; /// 注文の作成日時
  }[];
}

export interface TradeHistoryResponse {
  id: number; /// ID
  order_id: number; /// 注文のID
  created_at: string; /// 取引が行われた時間
  funds: number; /// 各残高の増減分
  pair: number; /// 取引ペア
  rate: number; /// 約定価格
  fee_currency: string; /// 手数料の通貨
  fee: number; /// 発生した手数料
  liquidity: string; /// "T" ( Taker ) or "M" ( Maker )
  side: string; /// "sell" or "buy"
}

export interface PositionsResponse {
  pagination: Pagenation;
  data: {
    id: number; /// ID
    pair: string; /// 取引ペア
    status: string; /// ポジションの状態 ( "open", "closed" )
    created_at: string; /// ポジションの作成日時
    closed_at: string; /// ポジションの決済完了日時
    open_rate: number; /// ポジションの平均取得価格
    closed_rate: number; /// ポジションの平均決済価格
    amount: number; /// 現在のポジションの数量（BTC）
    all_amount: number; /// ポジションの数量（BTC）
    side: string; /// ポジションの種類 ( "buy", "sell" )
    pl: number; /// 利益
    new_order: {
      id: number;
      side: string;
      rate: number;
      amount: number;
      pending_amount: number;
      status: string;
      created_at: string;
    }; /// 新規注文についての情報
    close_orders: {
      id: number;
      side: string;
      rate: number;
      amount: number;
      pending_amount: number;
      status: string;
      created_at: string;
    }[]; /// 決済注文についての情報
  }[]
}

export interface LeverageBalancesResponse {
  margin: {[currency: string]: number};
  margin_available: {[currency: string]: number};
  margin_level: number;
}

export interface SendMoneyRequest {
  address: string; /// 送り先のビットコインアドレス
  amount: number; /// 送りたいビットコインの量
}

export interface SendMoneyResponse {
  id: number; /// 送金のIDです
  address: string; /// 送った先のbitcoinアドレス
  amount: number; /// 送ったbitcoinの量
  fee: number; /// 手数料
}

export interface SendMoneyHistoryResponse extends SendMoneyResponse {
  currency: 'BTC'; /// 通貨
  created_at: string; /// 送信処理の作成日時
}

export interface DepositMoneyHistoryResponse { 
  id: number; /// 受け取りのID
  amount: number; /// 受け取ったビットコインの量
  currency: number; /// 通貨
  address: string; /// 受け取り元のビットコインアドレス
  status: string; /// ステータス
  confirmed_at: string; /// 受け取りの承認日時
  created_at: string; /// 受け取り処理の作成日時
}

export interface AccountResponse {
  id: number; /// アカウントのID。日本円入金の際に指定するIDと一致します。
  email: string; /// 登録されたメールアドレス
  identity_status: string; /// 本人確認書類の提出状況を表示します。
  bitcoin_address: string; /// あなたのデポジット用ビットコインのアドレス
  lending_leverage: number; /// あなたのレバレッジを表示します。
  taker_fee: number; /// Takerとして注文を行った場合の手数料を表示します。
  maker_fee: number; /// Makerとして注文を行った場合の手数料を表示します。
}

export interface BankAccountRequest {
  bank_name: string; /// 銀行名
  branch_name: string; /// 支店名
  bank_account_type: string; /// 銀行口座の種類（futsu : 普通口座, toza : 当座預金口座）
  number: string; /// 口座番号（例）"0123456"
  name: string; /// 口座名義
}

export interface BankAccountsResponse {
  id: number; /// ID
  bank_name: string; /// 銀行名
  branch_name: string; /// 支店名
  bank_account_type: 'futsu'|'toza'; /// 銀行口座の種類（futsu : 普通口座, toza : 当座預金口座
  number: string; /// 口座番号
  name: string; /// 口座名義
}

export interface WithdrawRequest {
  bank_account_id: number; /// 銀行口座のID
  amount: number; /// 金額
  currency: string; /// 通貨 ( 現在は "JPY" のみ対応)
}

export interface WithdrawResponses{
  id: number; /// ID
  status: string; /// 出金の状態 ( pending 未処理, processing 手続き中, finished 完了, canceled キャンセル済み)
  amount: number; /// 金額
  currency: string; /// 通貨
  created_at: string; /// 作成日時
  bank_account_id: number; /// 銀行口座のID
  fee: number; /// 振込手数料
  is_fast: boolean; /// 高速出金のオプション
}

export interface LendBorrowRequest {
  amount: number; /// 借りたい量
  currency: string; /// 通貨（BTC, ETH）
}

export interface LendBorrowResponse {
  rate: number; /// 日当たりのレート（BTCは0.05%, ETHは0.05%）
  id: number; /// ID
  amount: number; /// 注文の量
  currency: string; /// 通貨
  created_at: string; /// 注文の作成日時
}

export interface BorrowResponse {
  id: number; /// ID
  borrow_id: number; /// 借入申請のID
  rate: number; /// 日当たりのレート（現在は 0.05% に固定）
  amount: number; /// 借りた量
  pending_amount: number; /// 借りている量（利子付き）
  currency: string; /// 通貨
  deadline: string; /// 返却期日
}

export interface TransferLeverageRequest {
  currency: string; /// 通貨（現在は JPY のみ対応）
  amount: number; /// 移動する数量
}
