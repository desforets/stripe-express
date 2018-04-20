const request = require('request-promise')
const crypto = require('crypto')
const items = require('./i2i-items-dictionary.js')

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
  let ship_order = {
    header: {},
    lines: []
  }

  const username = 'earths'
  const customer_id = 'aaa4bac3a7c6'
  const key = 'be7448380ec44d82a5ce81c38344ed10'
  const baseURL = process.env.NODE_ENV === 'production' ? `https://van.i2ilog.net:9090` : `https://dev.i2ilog.net:9090/`
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
  const msg = `POST+/ibis/api/v1.1/customers/${customer_id}/ship/orders+${today.getUTCFullYear()}${month}${date}+${nonce}`.toUpperCase()

  let hmac = crypto.createHmac('sha256', key)
  hmac.update(msg)
  const calculated_hmac_digest = hmac.digest('base64')

  this.dispatchOrder = (customer, order, charge, wholesale) => {

    console.log(' ++++ dispatch Order')

    customerOrder = {
      name: customer.shipping.name,
      email: customer.email,
      address1: customer.shipping.address.line1,
      address2: '',
      code: 'Freya',
      city: customer.shipping.address.city,
      country: customer.shipping.address.country,
      postal: customer.shipping.address.postal_code,
      province: customer.shipping.address.state,
      phone: ''
    }
    ship_order.header = {
      'po_no': 'PO-1234',
      'service': 'GROUND',
      'shipper': 'CANADA POST',
      'number': order.id,
      'ref_no': order.id,
      'comment1': `Earth Sun order for ${order.customer}`,
      'comment2': 'Order place via API v1.1',
      'shipto': customerOrder,
      'soldto': customerOrder
    }

    ship_order.lines = order.items.map(i => Object.assign({}, items.dictionary[i.parent], {qty: wholesale ? i.quantity * 12 : i.quantity})).filter(item => item.qty)
    console.log(' ++++ processed new order')
    console.dir(ship_order)
    console.log('post to: ' + baseURL + urls['postOrder'])
    console.log(msg)
    let data = {"order": JSON.stringify(ship_order)}
    return request.post({
      headers: {
        'X-Echo-Signature': calculated_hmac_digest,
        'X-Echo-User': `earths:${nonce}`
      },
      url: `${baseURL}/ibis/api/v1.1/customers/aaa4bac3a7c6/ship/orders`,
      form: data
    }).then(response => {
      response = JSON.parse(response)
      console.dir(response)
      return response.status === 'ERR' ? {error: true, message: response.data} : {error: false, orderId: response.data}
    }).catch(error => {
      console.error(error)
      return {error: true, message: error.message}
    })
  }
}
