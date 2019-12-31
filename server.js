const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const fs = require('fs');
const schema = fs.readFileSync('./graphql/schema.graphql').toString();
const resolver = require('./graphql/resolver');
const { hostname } = require('./lib/config');
const isAuth = require('./middleware/is-auth');


app.use(cors());
app.use(isAuth);
app.use(bodyParser.json());
app.use('/graphql', graphqlHttp({
    schema: buildSchema(schema),
    rootValue: resolver,
    graphiql: true
  })
);

app.post('/signup', function (req, res, next) {
  console.log(req.body);
  res.json({ msg: req.body });
});

mongoose.connect(hostname)
  .then(() => {
    app.listen(5000, function () {
      console.log('CORS-enabled web server listening on port 5000');
    });
  })
  .catch((e) => console.error(e));


