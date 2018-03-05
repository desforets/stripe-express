const axios = require('axios')
const crypto = require('crypto')

const username = <username>
const customer_id = <id>
const key = <key>
const server = 'https://dev.i2ilog.net:9090'
const url_rule = `/ibis/api/v1.0/customers/${customer_id}/items`

const today = new Date(Date.now())
const utcMonth = today.getUTCMonth() + 1
const month = utcMonth > 9 ? utcMonth : '0' + utcMonth
const date = today.getUTCDate() > 9 ? today.getUTCDate() : '0' + today.getUTCDate()
const nonce = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000)
const msg = `${method}+${url_rule}+${today.getUTCFullYear()}${month}${date}+${nonce}`.toUpperCase()
  
axios.get(url_rule, {
  baseURL: server,
  headers: {
      'X-Echo-Signature': crypto.createHmac('sha256', key).update(msg).digest('base64'),
      'X-Echo-User': `earths:${nonce}`
    }
}).then(response => {
  console.dir(response.data)
}).catch(error => {
  console.error(error)
})
