const keyPublishable = "pk_test_yTXzIGll1qz4bb0a19zOku70";
const keySecret = "sk_test_qK9z9eiKlAyaskS3K1SnxvRJ";

const app = require("express")();
const stripe = require("stripe")(keySecret);

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

app.post('/charge', (req, res) => {
  const { customer, order, token } = req.body
  stripe.customers.create({
    email: customer.email,
    source: token.id
  }).then(customer =>
    stripe.charges.create({
      amount: order.subtotal.grandTotal * 100,
      description: `Payment to Earth Sun for order #`,
      statement_descriptor: 'Earth Sun ltd',
      currency: 'cad',
      customer: customer.id
    }))
  .then(charge => res.send(charge))
  .catch(error => res.send(error))
});

app.listen(3000, () => {
  console.log(`Express-Stripe server listenning on port 3000`)
});
