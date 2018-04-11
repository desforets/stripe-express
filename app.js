const app = require("express")();
const stripe = require("stripe")(process.env.keySecret || 'sk_test_0E1OHzPGuv4uzySbXoqRoboW');
require('./i2i/i2i.js')()

const bodyParser = require('body-parser');
const cors = require('cors')
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
  if (!req.body.token) {
    stripe.customers.list({email: req.body.customer.email}).then(list => {
      let customer = list.data[0]
      if (customer) {
        res.json(customer)
      } else {
        stripe.customers.create(req.body.customer).then(customer => res.json(customer)).catch(error => res.json(error))
      }
    })
  } else {
    stripe.customers.create(req.body.customer).then(customer => res.json(customer)).catch(error => res.json(error))
  }
})

app.post('/addPaymentSource', (req, res) => stripe.customers.update(req.body.customer.id, { source: req.body.token.id }).then(results => res.json(results)).catch(err => res.json(error)))

app.post('/charge', (req, res) => {
  const { customer, order, token } = req.body
  stripe.customers.create({
    email: customer.email,
    source: token.id
  }).then(customer =>
    stripe.charges.create({
      amount: Math.round(order.subtotal.grandTotal * 100),
      description: `Payment to Earth Sun`,
      statement_descriptor: 'Earth Sun ltd',
      receipt_email: customer.email,
      currency: 'cad',
      customer: customer.id
    }))
  .then(charge => res.send(charge))
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
    return stripe.orders.create({
      currency: 'cad',
      items: order,
      customer: newCustomer.id
    })
    .then(order => {
      console.log(' === created order: ' + order.id)
      return stripe.orders.pay(order.id, { customer: newCustomer.id })
      .then(charge => {
        console.log(' === created a charge')
        console.dir(charge)
        if (charge.status === 'paid') {
          dispatchOrder(customer, order, charge)
          .then(dispatchResults => {
            res.send({charge, order, dispatchResults})
          })
        } else {
          console.log('charge status was not paid')
          res.send({charge, order, dispatchResults: null})
        }
      })
    })
  })
  .catch(err => { console.error(err); res.send(err)})
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
      dispatchOrder(customer, order, charge)
      .then(dispatchResults => res.send({charge, order, dispatchResults}))
    })
    .catch(err => { console.error(err); res.send(err)})
  })
})

app.listen(3000, () => {
  console.log(`Express-Stripe server listenning on port 3000 in ${process.env.NODE_ENV} mode`)
});
