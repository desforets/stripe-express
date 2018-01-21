const keyPublishable = "pk_test_u77KpSLxrO1jKMrKyA9CZWhy";
const keySecret = "sk_test_0E1OHzPGuv4uzySbXoqRoboW";

const app = require("express")();
const stripe = require("stripe")(process.env.NODE_ENV === 'production' ? process.env.secretKey : keySecret);
require('./i2i.js')()

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

app.post('/newcustomer', (req, res) => {
  stripe.customers.create(req.body.customer)
  .then(customer => {
    res.json(customer)
  })
  .catch(error => {
    console.error(error)
    res.json(error)
  })
})

app.post('/charge', (req, res) => {
  const { customer, order, token } = req.body
  stripe.customers.create({
    email: customer.email,
    source: token.id
  }).then(customer =>
    stripe.charges.create({
      amount: order.subtotal.grandTotal * 100,
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
  customer.source = token.id
  stripe.customers.create(customer)
  .then(newCustomer => {
    stripe.orders.create({
      currency: 'cad',
      items: order,
      customer: newCustomer.id
    })
    .then(order => {
      stripe.orders.pay(order.id, { customer: newCustomer.id })
      .then(charge => {
        dispatchOrder(customer, order, charge)
        .then(dispatchResults => res.send({charge, order, dispatchResults}))
      })
      .catch(err => { console.error(err); res.send(err)})
    })
  })
})

app.listen(3000, () => {
  console.log(`Express-Stripe server listenning on port 3000 in ${process.env.NODE_ENV} mode`)
});
