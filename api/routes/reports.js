let express = require('express');
let router = express.Router();
let fs = require('fs');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let reportSchema = new Schema({
  _id: String,
  createDate: Date,
  tests: Number,
  passed: Number,
  failed: Number,
  numDrugs: Number,
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

var Reports = mongoose.model('reports', reportSchema);

router.post('/new', function(req, res, next) {
  let data = fs.readFileSync(__dirname + '\\..\\report.json');
  let results = JSON.parse(data); 

  let report = {
    _id: mongoose.Types.ObjectId(),
    createDate: new Date(),
    tests: results.tests,
    passed: results.passed,
    failed: results.failed,
    numDrugs: results.report.length,
    results: results.report
  };

  Reports.create(report, function(err, reports) {
    if (err) throw err;
    res.json('Report added to db')
  })
})

/* GET reports listing. */
router.get('/', function(req, res, next) {
  Reports.find({}).sort({createDate: 'desc'}).exec(function (err, reports) {
    if (err) res.json(err);
    else res.json(reports);
  });
});

module.exports = router;