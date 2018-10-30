const app = require("express")();
const stripe = require("stripe")(process.env.keySecret || 'sk_test_0E1OHzPGuv4uzySbXoqRoboW');
require('./i2i/i2i.js')()

const bodyParser = require('body-parser');
const cors = require('cors')
const automate = {
  customer: {
    wholesale: `https://wh.automate.io/webhook/5ad10228e191d220565a5c30`,
    regular: ``
  },
  order: `https://wh.automate.io/webhook/5ad111a8e191d220565a5e08`
}
const request = require('request-promise')

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors())
app.get('/', (req, res) => res.sendStatus(200))

app.post('/test', function(req, res) {
    console.log("Information received !");
    console.log(req.body);
    res.sendStatus(200);
});

app.post('/retrieveCustomer', (req, res) => {
  stripe.customers.list({email: req.body.customer.email}).then(list => {
    console.dir(list)
    if (list.data.length) {
      if (list.data[0].id === req.body.customer.id) {
        res.json({customer: list.data[0]})
      } else {
        res.json({error: 'That account number does not match this email'})
      }
    } else {
      res.json({error: 'No customers found with that email'})
    }
  })
})

app.post('/lookupCustomer', (req, res) => stripe.customers.list({email: req.body.customer.email}).then(list => res.json(list.data.length ? {customer: list.data[0]} : {error: 'not found'})))

app.post('/newcustomer', (req, res) => {
  console.log('new custy route')
  let formData = req.body
  stripe.customers.create(req.body.customer)
  .then(customer => {
    request.post({ url: automate.customer.wholesale, form: customer })
    res.json(customer)
  })
  .catch(error => res.json(error))
})

app.post('/addPaymentSource', (req, res) => stripe.customers.update(req.body.customer.id, { source: req.body.token.id }).then(results => res.json(results)).catch(err => res.json(error)))

app.post('/charge', (req, res) => {
  const { customer, order } = req.body
  console.dir(customer)
  console.dir(order)
  return stripe.orders.create({
    currency: 'cad',
    items: order,
    customer: customer.id
  })
  .then(order => {
    return stripe.orders.pay(order.id, { customer: customer.id })
    .then(charge => {
      console.log(' === created a charge')
      console.dir(charge)
      if (charge.status === 'paid') {
        dispatchOrder(customer, order, charge, false)
        .then(dispatchResults => {
          res.send({charge, order, dispatchResults})
        })
      } else {
        console.log('charge status was not paid')
        res.send({charge, order, dispatchResults: null})
      }
    })
  })
  .catch(error => res.send(error))
});

app.post('/order', (req, res) => {
  const { customer, order, token } = req.body
  console.log('==== post req to order endpoint ==== ')
  console.dir(customer)
  console.dir(order)
  console.dir(token)
  customer.source = token.id
  return stripe.customers.create(customer)
  .then(newCustomer => {
    console.log(' === created new customer: ' + newCustomer.id)
    let skus = order.map(item => item.parent).join()
    return stripe.orders.create({
      currency: 'cad',
      items: order,
      customer: newCustomer.id
    })
    .then(order => {
      // request.post({ url: automate.customer.regular, form: customer })
      console.log(`=== created order: ${order.id} ===`)
      return stripe.orders.pay(order.id, { customer: newCustomer.id })
      .then(charge => {
        console.log(`=== created a charge ${charge.id} ===`)
        console.dir(charge)
        if (charge.status === 'paid') {
          if (process.env.NODE_ENV === 'production') {
            request.post({ url: automate.order, form: {customer, order, charge, skus} })
          }
          dispatchOrder(customer, order, charge, false)
          .then(dispatchResults => {
            console.log('=== Dispatch resulsts ===')
            console.dir(dispatchResults)
            res.send({charge, order, dispatchResults})
          })
          .catch(error => {
            console.log('caught error from dispatch results')
            res.send({charge, order, error})
          })
        } else {
          console.log('charge status was not paid')
          res.status(400).send({response: {data: {message: 'Payment failed. Card declined.'}}})
        }
      })
    })
  })
  .catch(err => {
    console.log('---- ORDERS ENDPOINT CAUGHT ERROR ----')
    console.error(err)
    res.status(err.statusCode).send(err)
  })
})

app.post('/createWholesaleOrder', (req, res) => {
  const { customer, order } = req.body
  console.log('create wholesale order')
  console.dir(customer)
  console.dir(order)
  stripe.orders.create({
    currency: 'cad',
    items: order,
    customer: customer.id
  })
  .then(order => {
    console.log('created an order')
    console.dir(order)
    stripe.orders.pay(order.id, { customer: customer.id })
    .then(charge => {
      console.log('created a charge, dispatching wholesale')
      dispatchOrder(customer, order, charge, true)
      .then(dispatchResults => res.send({charge, order, dispatchResults}))
    })
    .catch(err => {
      console.error(err);
      res.status(err.statusCode).send(err.message)
    })
  })
  .catch(err => {
    console.error(err)
    res.status(err.statusCode).send(err.message)
  })
})

app.post('/chargeWholesaleOrder', (req, res) => {
  console.log('chargeWholesaleOrder')
  console.dir(req.body)
  res.sendStatus(200)
})

app.listen(3000, () => {
  console.log(`Express-Stripe server listenning on port 3000 in ${process.env.NODE_ENV} mode with ${process.env.keySecret ? 'secret' : 'test'} key`)
});
