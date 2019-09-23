let mongoose = require('mongoose');

var options = {
    bufferMaxEntries: 0,
    reconnectTries: 5000,
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.connect('mongodb://localhost:27017/rxwave_testing', options);

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error connecting with MongoDB: '))
db.once('open', function() {
    console.log('Connected to MongoDB')
});
db.on('disconnected', function () {
    mongoose.connect('mongodb://localhost:27017/rxwave_testing', options);
    db = mongoose.connection;
});

let reportSchema = new mongoose.Schema({
    _id: String,
    createDate: Date,
    tests: Number,
    passed: Number,
    failed: Number,
    numDrugs: Number,
    programStats: Array,
    results: [
      {
        name: String,
        dosageStrength: String,
        quantity: Number,
        ndc: String,
        latitude: Number,
        longitude: Number,
        zipCode: String,
        programs: [
          {
            id: Number,
            program_name: String,
            price: String,
            pharmacy: String,
            price_exists: Boolean
          }
        ]
      }
    ]
  }, { collection: 'reports' });

module.exports = {
    db: db,
    reportSchema: reportSchema
};