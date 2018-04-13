const axios = require('axios')
const crypto = require('crypto')
const request = require('request-promise');

var ship_order = JSON.stringify({
    'header': {
      'comment1': 'Order Created using ReST v1.1',
      'comment2': 'TESTORDER_aaa4bac3a7c6',
      'number': 'or_Ce1D1RfzzbK8KB_123',
      'ref_no': 'or_Ce1D1RfzzbK8KB_123',
      'po_no': 'PO-1234',
      'service': 'GROUND',
      'shipper': 'CANADA POST',
      'shipto': {
        'name': 'TEST DO NOT SHIP',
        'email': 'earthsunorganics@gmail.com',
        'address1': '437 Linden Ave, Box 302',
        'address2': '',
        'city': 'Kaleden',
        'code': 'Freya',
        'country': 'Canada',
        'postal': 'V0H 1K0',
        'province': 'British Columbia',
        'phone': ''
      },
      'soldto': {
        'name': 'TEST DO NOT SHIP',
        'email': 'earthsunorganics@gmail.com',
        'address1': '437 Linden Ave, Box 302',
        'address2': '',
        'code': 'Freya',
        'city': 'Kaleden',
        'country': 'Canada',
        'postal': 'V0H 1K0',
        'province': 'British Columbia',
        'phone': ''
      }
    },
    'lines': [
      {'description': 'BIOSHIELD 2015',
       'item': 'ES-BIO-010',
       'id': 462014,
       'qty': 1,
       'link': '/cstomers/162/items/id/462014'},
      {'description': 'BELEIA 2015',
       'item': 'ES-BEL-010',
       'id': 462016,
       'qty': 1,
       'link': '/cstomers/162/items/id/462016'}
      // {'description': 'Bioshield', 'item': 'BIO-0001', 'qty': 6},
      //  {'description': 'BIOSHIELD',
      //   'item': 'CAN-BIO-001',
      //   'qty': 11},
      //  {'description': 'VEGAN BIOSHIELD',
      //   'item': 'CAN-VEG-001',
      //   'qty': 12},
      //  {'description': 'PROMOTIONAL BIOSHIELD SAMPLES',
      //   'item': 'PRO-SAM-001',
      //   'qty': 6},
      //  {'description': 'PROMOTIONAL PLASTIC DISPLAY',
      //   'item': 'PRO-DIS-001',
      //   'qty': 3},
      //  {'description': 'PROMOTIONAL FLYERS singles',
      //   'item': 'PRO-FLY-001',
      //   'qty': 6},
      //  {'description': 'BIOSHIELD SAMPLES',
      //   'item': 'PRO-SAM-002',
      //   'qty': 18}
    ]
});

const username = 'earths'
let customer_id = 'aaa4bac3a7c6'
const key = 'be7448380ec44d82a5ce81c38344ed10'
let baseURL = process.env.NODE_ENV === 'development' ? 'https://dev.i2ilog.net:9090' : 'https://van.i2ilog.net:9090'
const method = process.env.TEST
const urls = {
 getItems: `/ibis/api/v1.1/customers/${customer_id}/items`,
 getItemById: `/ibis/api/v1.1/customers/${customer_id}/items/id/<int:item_id>`,
 getOrders: `/ibis/api/v1.1/customers/${customer_id}/ship/orders`,
 getOrderById: `/ibis/api/v1.1/customers/${customer_id}/ship/order/<int:order_id>`,
 postOrder: `/ibis/api/v1.1/customers/${customer_id}/ship/orders`
}

const today = new Date(Date.now())
const utcMonth = today.getUTCMonth() + 1
const month = utcMonth > 9 ? utcMonth : '0' + utcMonth
const date = today.getUTCDate() > 9 ? today.getUTCDate() : '0' + today.getUTCDate()
const nonce = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000)
const msg = `${method}+${process.env.TEST === 'GET' ? urls.getItems : urls.postOrder}+${today.getUTCFullYear()}${month}${date}+${nonce}`.toUpperCase()

console.log(`${process.env.NODE_ENV} mode == URL: ${baseURL}`)
console.log(`${process.env.TEST} request == to: ${urls[process.env.TEST === 'GET' ? 'getItems' : 'postOrder']}`)

request.post({
    headers: {
      'X-Echo-Signature': crypto.createHmac('sha256', key).update(msg).digest('base64'),
      'X-Echo-User': `earths:${nonce}`
    },
    url: baseURL + urls[process.env.TEST === 'GET' ? 'getItems' : 'postOrder'],
    form: {"order": ship_order},
  }).then(response => {
    response = JSON.parse(response)
    console.log(response.status)
    console.dir(response)
  })
