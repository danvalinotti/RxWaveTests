const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://ec2-54-81-21-172.compute-1.amazonaws.com:27017/rxwave_testing';
let _db;
let options = {
    bufferMaxEntries: 0,
    reconnectTries: 5000,
    useNewUrlParser: true,
    useUnifiedTopology: true
};

module.exports = {
    mongoConnect: function(callback) {
        MongoClient.connect(url, options, function(err, client) {
            _db = client.db('rxwave_testing');
            return callback(err);
        });
    },

    getDb: function() {
        return _db;
    }
};