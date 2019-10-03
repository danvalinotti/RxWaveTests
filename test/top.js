function importTest(name, path) {
    describe(name, function() {
        require(path);
    });
}

let common = require('./common');

describe("Top-Level", function() {
    // importTest('Frontend', './frontend');
    importTest('Backend', './backend');
    // importTest('Accuracy', './accuracy');

    this.afterAll(function() {
        console.log("Done!");
    });
});

module.exports = importTest;