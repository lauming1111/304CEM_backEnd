const MongoClient = require('mongodb').MongoClient;

const hostname = 'mongodb+srv://root:Passw0rd@cluster0-lcz2p.azure.mongodb.net/test';

MongoClient.connect(hostname, (err, database) => {
  // ... start the server
});