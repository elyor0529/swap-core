import bitcoin from 'bitcoinjs-lib'
import { request } from '../util'


class Bitcoin {

  constructor() {
    this.core = bitcoin
    this.testnet = bitcoin.networks.testnet
  }

  getRate() {
    return new Promise((resolve) => {
      request.get('https://noxonfund.com/curs.php')
        .then(({ price_btc }) => {
          resolve(price_btc)
        })
    })
  }

  login(_privateKey) {
    let privateKey = _privateKey

    if (!privateKey) {
      const keyPair = this.core.ECPair.makeRandom({ network: this.testnet })
      privateKey    = keyPair.toWIF()
    }

    const account     = new this.core.ECPair.fromWIF(privateKey, this.testnet)
    const address     = account.getAddress()
    const publicKey   = account.getPublicKeyBuffer().toString('hex')

    account.__proto__.getPrivateKey = () => privateKey

    console.info('Logged in with Bitcoin', {
      account,
      address,
      privateKey,
      publicKey,
    })

    return account
  }

  fetchBalance(address) {
    return request.get(`https://test-insight.bitpay.com/api/addr/${address}`)
      .then(({ balance }) => {
        console.log('BTC Balance:', balance)

        return balance
      })
  }

  fetchUnspents(address) {
    return request.get(`https://test-insight.bitpay.com/api/addr/${address}/utxo`)
  }

  broadcastTx(txRaw) {
    return request.post(`https://test-insight.bitpay.com/api/tx/send`, {
      body: {
        rawtx: txRaw,
      },
    })
  }
}


export default new Bitcoin()

export {
  Bitcoin,
}
