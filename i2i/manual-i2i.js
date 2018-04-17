const crypto = require('crypto')
const request = require('request-promise');

var ship_order = JSON.stringify(
  { header:
    { po_no: 'PO-1234',
      service: 'GROUND',
      shipper: 'CANADA POST',
      number: 'or_ChHu4i9LxFrpW4',
      ref_no: 'or_ChHu4i9LxFrpW4',
      comment1: 'Earth Sun order for cus_ChHtZ3ge4Ofsxd',
      comment2: 'Order place via API v1.1',
      shipto:
       { name: 'kathleen shaffer',
         email: 'kittyshff@msn.com',
         address1: '338 Rively Ave',
         address2: '',
         code: 'Freya',
         city: 'Collingdale',
         country: 'US',
         postal: '19023',
         province: 'PA',
         phone: '' },
      soldto:
       { name: 'kathleen shaffer',
         email: 'kittyshff@msn.com',
         address1: '338 Rively Ave',
         address2: '',
         code: 'Freya',
         city: 'Collingdale',
         country: 'US',
         postal: '19023',
         province: 'PA',
         phone: '' } },
   lines:
    [ { description: 'BIOSHIELD 2015',
        item: 'ES-BIO-010',
        id: 462014,
        link: '/cstomers/162/items/id/462014',
        qty: 1 } ] }
)

const username = 'earths'
let customer_id = 'aaa4bac3a7c6'
const key = 'be7448380ec44d82a5ce81c38344ed10'
let baseURL = 'https://van.i2ilog.net:9090'
const urls = {
 getItems: `/ibis/api/v1.1/customers/${customer_id}/items`,
 getItemById: `/ibis/api/v1.1/customers/${customer_id}/items/id/<item_id>`,
 getOrders: `/ibis/api/v1.1/customers/${customer_id}/ship/orders`,
 getOrderById: `/ibis/api/v1.1/customers/${customer_id}/ship/order/<order_id>`,
 postOrder: `/ibis/api/v1.1/customers/${customer_id}/ship/orders`
}

const today = new Date(Date.now())
const utcMonth = today.getUTCMonth() + 1
const month = utcMonth > 9 ? utcMonth : `0${utcMonth}`
const date = today.getUTCDate() > 9 ? today.getUTCDate() : `0${today.getUTCDate()}`
const nonce = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000)
const msg = `POST+${urls.postOrder}+${today.getUTCFullYear()}${month}${date}+${nonce}`.toUpperCase()

// request.post({ url: `https://wh.automate.io/webhook/5ad111a8e191d220565a5e08`, form: {customer, order, charge, skus} })

request.post({
    headers: {
      'X-Echo-Signature': crypto.createHmac('sha256', key).update(msg).digest('base64'),
      'X-Echo-User': `earths:${nonce}`
    },
    url: baseURL + urls['postOrder'],
    form: {"order": ship_order},
  }).then(response => {
    response = JSON.parse(response)
    console.log(response.status)
    console.dir(response)
  })
