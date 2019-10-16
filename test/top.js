// let mongoose = require('mongoose');

function importTest(name, path) {
    describe(name, function() {
        require(path);
    });
}

let common = require('./common');

describe("Top-Level", function() {
    importTest('Backend', './backend');
    // importTest('Frontend', './frontend');
    // importTest('Accuracy', './accuracy');

    this.afterAll(function() {
        console.log("Done!");
        // let promise = mongoose.disconnect()
        // promise.then((err) => {
        //     if (err) throw err;
        //     else {
        //         console.log("Disconnected from MongoDB.");
        //         process.exit();
        //     }
        // })
    });
});

module.exports = importTest;