const axios = require('axios')
const crypto = require('crypto')

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

  const username = 'earths'
  const customer_id = 162
  const key = 'be7448380ec44d82a5ce81c38344ed10'
  const method = 'GET'
  const dev = 'https://dev.i2ilog.net:9090'
  const server_ = 'https://van.i2ilog.net:9090'
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
    console.log('dispatch order')
    console.dir(customer)
    console.dir(order)
    console.dir(charge)
    return axios.post(urls.postOrder, {
      baseURL: server,
      headers: {
        'X-Echo-Signature': crypto.createHmac('sha256', key).update(msg).digest('base64'),
        'X-Echo-User': `earths:${nonce}`
      },
      body: Object.assign({}, orderTemplate, order)
      }).then(response => {
        console.dir(response.data)
        return response.data
      }).catch(error => {
        console.error(error)
      })
  }
}
