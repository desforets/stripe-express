const axios = require('axios')
const crypto = require('crypto')
const itemsArray = require('./i2i-items-array.js')

module.exports = function () {
  const orderTemplate = {
    'header': {
      'comment1': 'Test order comment line 1',
      'comment2': 'Test order comment line 2',
      'number': 'T-1234%s',
      'ref_no': '5445107777',
      'po_no': 'PO-1234',
      'service': 'GROUND',
      'shipper': 'FEDEX',
      'shipto': {
        'address1': '2318 Kilmarnock Cresc',
        'address2': '',
        'city': 'Vancouver',
        'code': 'JACEK',
        'country': 'CA',
        'email': 'jacek@myecho.ca',
        'name': 'Jacek Pawlowski',
        'postal': 'V7J 2Z2 1H0',
        'phone': '123456',
        'province': 'BC'
      },
      'soldto': {
        'address1': '2318 Kilmarnock Cresc',
        'address2': '',
        'city': 'North Vancouver',
        'code': 'JP',
        'country': 'CA',
        'email': 'jacek@myecho.ca',
        'name': 'J Pawlowski',
        'postal': 'V7J 2Z2',
        'phone': '123456',
        'province': 'BC'
       }
    },
    'lines': [
      {
        'description': 'FG:F01 Topicals.33338',
        'item': '33338',
        'qty': 2
      }, {
        'description': 'Triple Action Back Pain',
        'item': '00089',
        'qty': 12
      }
    ]
  }
  let newOrder = {
    header: {},
    lines: []
  }

  const username = 'earths'
  const customer_id = 162
  const key = 'be7448380ec44d82a5ce81c38344ed10'
  const method = 'GET'
  const dev = 'https://dev.i2ilog.net:9090'
  const server = 'https://van.i2ilog.net:9090'
  const url_rule = `/ibis/api/v1.0/customers/${customer_id}/items`

  const urls = {
    getItems: `/ibis/api/v1.0/customers/${customer_id}/items`,
    getItemById: `/ibis/api/v1.0/customers/${customer_id}/items/id/<int:item_id>`,
    getOrders: `/ibis/api/v1.0/customers/${customer_id}/ship/orders`,
    getOrderById: `/ibis/api/v1.0/customers/${customer_id}/ship/order/<int:order_id>`,
    postOrder: `/ibis/api/v1.0/customers/${customer_id}/ship/order`
  }

  const today = new Date(Date.now())
  const utcMonth = today.getUTCMonth() + 1
  const month = utcMonth > 9 ? utcMonth : '0' + utcMonth
  const date = today.getUTCDate() > 9 ? today.getUTCDate() : '0' + today.getUTCDate()
  const nonce = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000)
  const msg = `${method}+${url_rule}+${today.getUTCFullYear()}${month}${date}+${nonce}`.toUpperCase()

  this.dispatchOrder = (customer, order, charge) => {
    customerOrder = {
      name: customer.shipping.name,
      email: customer.email,
      address1: customer.shipping.address.line1,
      address2: '',
      city: customer.shipping.address.city,
      country: customer.shipping.address.country,
      postal: customer.shipping.address.postal_code,
      province: customer.shipping.address.state,
      phone: ''
    }
    newOrder.header = {
      po_no: 'PO-1234',
      service: 'GROUND',
      shipper: 'FEDEX',
      shipto: customerOrder,
      soldto: customerOrder
    }

    newOrder.number = order.id
    newOrder.ref_no = order.id
    newOrder.lines = items.map(i => Object.assign({}, itemsDictionary[i.parent], {qty: i.quantity}))
    console.dir(newOrder)
    return axios.post(urls.postOrder, {
      baseURL: process.env.NODE_ENV === 'development' ? dev : server,
      headers: {
        'X-Echo-Signature': crypto.createHmac('sha256', key).update(msg).digest('base64'),
        'X-Echo-User': `earths:${nonce}`
      },
      body: newOrder
      }).then(response => {
        console.dir(response.data)
        return response.data
      }).catch(error => {
        console.error(error)
      })
  }
}
