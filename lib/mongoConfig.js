let mongoose = require('mongoose');

var options = {
  bufferMaxEntries: 0,
  reconnectTries: 5000,
  useNewUrlParser: true,
  useUnifiedTopology: true
}

mongoose.connect('mongodb://ec2-54-81-21-172.compute-1.amazonaws.com:27017/rxwave_testing', options);

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error connecting with MongoDB: '))
db.once('open', function () {
  console.log('Connected to MongoDB')
});
db.on('disconnected', function () {
  mongoose.connect('mongodb://ec2-54-81-21-172.compute-1.amazonaws.com:27017/rxwave_testing', options);
  db = mongoose.connection;
});

let accuracyReportSchema = new mongoose.Schema({
  _id: String,
  createDate: Date,
  totalAccuracy: Number,
  compAccuracy: [{
    id: Number,
    program_name: String,
    accuracy: Number
  }]
}, {
  collection: 'accuracy_reports'
});

let reportSchema = new mongoose.Schema({
  _id: String,
  createDate: Date,
  tests: Number,
  passed: Number,
  failed: Number,
  numDrugs: Number,
  programStats: Array,
  results: [{
    name: String,
    dosageStrength: String,
    quantity: Number,
    ndc: String,
    latitude: Number,
    longitude: Number,
    zipCode: String,
    programs: [{
      id: Number,
      program_name: String,
      pharmacy: String,
      price_exists: Boolean,
      prices: [{
        program: String,
        pharmacy: String,
        price: String,
        diff: String,
        diffPerc: String
      }]
    }]
  }]
}, {
  collection: 'reports'
});

module.exports = {
  db: db,
  reportSchema: reportSchema,
  accuracyReportSchema: accuracyReportSchema
};