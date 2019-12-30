const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post('/signup', function (req, res, next) {
  console.log(req.body);
  res.json({ msg: req.body });
});

app.listen(5000, function () {
  console.log('CORS-enabled web server listening on port 5000');
});
