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
const User = require('./models/user');
const recipeSchema = require('./models/recipe');
const commentSchema = require('./models/comment');

app.use(cors());
app.use(isAuth);
app.use(bodyParser.json());
app.post('/graphql', graphqlHttp({
    schema: buildSchema(schema),
    rootValue: resolver,
    graphiql: true
  })
);

app.get('/userid/:id', function (req, res) {
  if (req.params.id) {
    return User.findById(req.params.id)
      .then((r) => {
        res.send({
          message: `Your user ID is ${req.params.id}`,
          profile: r,
        });
      });
  }
});

app.put('/updateRecipe', function (req, res) {
  if (req.body) {
    console.log(req.body);
    const data = req.body;
    return recipeSchema.findOne({
      _id: data.id
    }).then((resp => {
      if (resp) {
        resp.updateTimestamp = new Date().getTime();
        resp.context = data.data;
        return resp.save()
          .then(() => {
            res.send({
              message: 'ok',
              id: req.body.id,
            });
          });
      }
    }))
      .catch((e) => {
        console.log(e);
      });
  }
});

app.put('/updateComment', function (req, res) {
  if (req.body) {
    console.log(req.body);
    const data = req.body;
    return commentSchema.findOne({
      _id: data.id
    }).then((resp => {
      if (resp) {
        resp.updateTimestamp = new Date().getTime();
        resp.comment = data.data;
        return resp.save()
          .then(() => {
            res.send({
              message: 'ok',
              id: req.body.id,
            });
          });
      }
    }))
      .catch((e) => {
        console.log(e);
      });
  }
});

app.delete('/deleteComment', function (req, res) {
  if (req.body.recipeId) {
    console.log(req.body.recipeId);
    return commentSchema.deleteOne({ _id: req.body.recipeId })
      .then((r) => {
        console.log(r);
        if (r.deletedCount) {
          res.send({
            message: 'ok',
            id: req.body.recipeId,
          });
        }
      });
  }
});


app.delete('/deleteRecipe', function (req, res) {
  if (req.body.id) {
    console.log(req.body.id);
    return recipeSchema.deleteOne({ _id: req.body.id })
      .then((r) => {
        console.log(r);
        if (r.deletedCount) {
          res.send({
            message: 'ok',
            id: req.body.id,
          });
        }
      });
  }
});

app.get('/newUserName/:name', function (req, res) {
  console.log(req.params);
  if (req.params.name) {
    const data = JSON.parse(req.params.name);
    return User.findOne({
      _id: data.id
    }).then((resp => {
      if (resp) {
        resp.name = data.new;
        resp.updateTimestamp = new Date().getTime();
        return resp.save()
          .then(() => {
            res.send({
              message: 'ok',
            });
          });
      }
    }))
      .catch((e) => {
        console.log(e);
      });
  }
});

mongoose.connect(hostname)
  .then(() => {
    app.listen(5000, function () {
      console.log('CORS-enabled web server listening on port 5000');
    });
  })
  .catch((e) => console.error(e));


