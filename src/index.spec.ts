import {Coincheck} from './index';

import 'mocha';
import {expect} from 'chai';

describe('Coincheck', () => {
  it('can instantiate', () => {
    const c = new Coincheck();
    expect(c.Public).not.to.be.null;
    expect(c.Private).not.to.be.null;
  })
})
