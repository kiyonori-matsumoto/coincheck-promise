import { Public } from "./public";
import { Private } from "./private";

export class Coincheck {
  public readonly Public: Public
  public readonly Private: Private;

  constructor(key?: string, secret?: string) {
    this.Public = new Public();
    this.Private = new Private(key, secret);
  }

  public set_credential(key: string, secret: string) {
    this.Private.set_credential(key, secret);
  }
}
