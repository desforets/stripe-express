const crypto = require('crypto')
const request = require('request-promise');

var ship_order = JSON.stringify(
   { header:
      { po_no: 'PO-1234',
        service: 'GROUND',
        shipper: 'CANADA POST',
        number: 'or_CiRtHHa2PkMvz7',
        ref_no: 'or_CiRtHHa2PkMvz7',
        comment1: 'Earth Sun order for 490189',
        comment2: 'Order place via API v1.1',
        shipto:
         { name: 'Living Earth Beauty',
           email: 'delight@livingearthbeauty.com',
           address1: '3225 E Iris Ct',
           address2: '',
           code: 'Freya',
           city: 'Chandler',
           country: 'US',
           postal: '85286',
           province: 'AZ',
           phone: '' },
        soldto:
         { name: 'Living Earth Beauty',
           email: 'delight@livingearthbeauty.com',
           address1: '3225 E Iris Ct',
           address2: '',
           code: 'Freya',
           city: 'Chandler',
           country: 'US',
           postal: '85286',
           province: 'AZ',
           phone: '' } },
     lines:
      [ { description: 'Sn Sheer 2015',
          item: 'ES-SUN-008',
          id: 463604,
          link: '/cstomers/162/items/id/463604',
          qty: 36 } ] }

)

const username = 'earths'
let customer_id = 'aaa4bac3a7c6'
const key = 'be7448380ec44d82a5ce81c38344ed10'
let baseURL = `https://van.i2ilog.net:9090`
const urls = {
 getItems: `/ibis/api/v1.1/customers/${customer_id}/items`,
 getItemById: `/ibis/api/v1.1/customers/${customer_id}/items/id/<item_id>`,
 getOrders: `/ibis/api/v1.1/customers/${customer_id}/ship/orders`,
 getOrderById: `/ibis/api/v1.1/customers/${customer_id}/ship/order/<order_id>`,
 postOrder: `/ibis/api/v1.1/customers/${customer_id}/ship/orders`
}

const today = new Date()
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
