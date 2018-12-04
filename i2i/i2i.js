const request = require('request-promise')
const crypto = require('crypto')
const items = require('./i2i-items-dictionary.js')

module.exports = function () {

  this.dispatchOrder = (customer, order, charge, wholesale) => {

    let ship_order = {
      header: {},
      lines: []
    }

    const username = 'earths'
    const customer_id = 'aaa4bac3a7c6'
    const key = 'be7448380ec44d82a5ce81c38344ed10'
    const baseURL = 'https://van.i2ilog.net:9090'
    const baseURLtest = `https://dev.i2ilog.net:9090`

    const urls = {
      getItems: `/ibis/api/v1.1/customers/${customer_id}/items`,
      getItemById: `/ibis/api/v1.1/customers/${customer_id}/items/id/<item_id>`,
      getOrders: `/ibis/api/v1.1/customers/${customer_id}/ship/orders`,
      getOrderById: `/ibis/api/v1.1/customers/${customer_id}/ship/order/<order_id>`,
      postOrder: `/ibis/api/v1.1/customers/${customer_id}/ship/orders`
    }

    const today = new Date()
    console.log(`dispatching at: ${today}`)
    const utcMonth = today.getUTCMonth() + 1
    const month = utcMonth > 9 ? utcMonth : `0${utcMonth}`
    const date = today.getUTCDate() > 9 ? today.getUTCDate() : `0${today.getUTCDate()}`
    const nonce = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000)
    const msg = `POST+/ibis/api/v1.1/customers/${customer_id}/ship/orders+${today.getUTCFullYear()}${month}${date}+${nonce}`.toUpperCase()

    console.log(' ++++ dispatch Order')

    customerOrder = {
      name: customer.shipping.name,
      email: customer.email,
      address1: customer.shipping.address.line1,
      address2: '',
      code: 'Website',
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

    ship_order.lines = order.items.map(i => Object.assign({}, items.dictionary[i.parent], {qty: wholesale ? i.units : i.quantity})).filter(item => item.qty)
    console.log(' ++++ processed new order ++++')
    console.dir(ship_order)
    console.log(`POST to: ${baseURL}/ibis/api/v1.1/customers/aaa4bac3a7c6/ship/orders`)
    console.log(msg)
    console.log('HEADERS')
    console.log(crypto.createHmac('sha256', key).update(msg).digest('base64'))
    console.log(`earths:${nonce}`)
    return request.post({
      headers: {
        'X-Echo-Signature': crypto.createHmac('sha256', key).update(msg).digest('base64'),
        'X-Echo-User': `earths:${nonce}`
      },
      url: `${baseURL}/ibis/api/v1.1/customers/aaa4bac3a7c6/ship/orders`,
      form: {"order": JSON.stringify(ship_order)}
    }).then(response => {
      response = JSON.parse(response)
      console.dir(response)
      return response.status === 'ERR' ? {error: true, message: response.data} : {error: false, orderId: response.data}
    }).catch(error => {
      console.error(error)
      return {error: true, message: error.message}
    })
  }

  this.shopifyOrder = (req, shopify_secret) => {
    console.dir(req.shopify_data)
    let hmac = req.get('X-Shopify-Hmac-SHA256')
    let computed_hmac = crypto.createHmac('sha256', shopify_secret).update(JSON.stringify(req.shopify_data || req.body)).digest('base64')
    let computed_hmac_hex = crypto.createHmac('sha256', shopify_secret).update(JSON.stringify(req.shopify_data || req.body)).digest('hex')
    console.log(hmac)
    console.log(computed_hmac)
    console.log(computed_hmac_hex)
    if (hmac === computed_hmac) {
      console.log('it works!')
    } else if (hmac === computed_hmac_hex) {
      console.log('works with hex')
    }

  }
}
