// // API TESTS // // 
// Test for InsideRx result
it('Test: InsideRx price exists', function () {
    tests += 1;
    let pass = data.programs[0].prices.length > 0 && data.programs[0].prices[0].price !== "N/A";

    if (pass) {
        passed += 1;
    } else {
        program_stats[0] += 1;
    }

    chai.assert.isTrue(pass);
});

// Test for UsPharm result
it('Test: UsPharmCard price exists', function () {
    tests += 1;
    let pass = data.programs[1].prices.length > 0 && data.programs[1].prices[0].price !== "N/A";

    if (pass) {
        passed += 1;
    } else {
        program_stats[1] += 1;
    }

    chai.assert.isTrue(pass);
});

// Test for WellRX result
it('Test: WellRX price exists', function () {
    tests += 1;
    let pass = data.programs[2].prices.length > 0 && data.programs[2].prices[0].price !== "N/A";

    if (pass) {
        passed += 1;
    } else {
        program_stats[2] += 1;
    }

    chai.assert.isTrue(pass);
});

// Test for MedImpact result
it('Test: MedImpact price exists', function () {
    tests += 1;
    let pass = data.programs[3].prices.length > 0 && data.programs[3].prices[0].price !== "N/A";

    if (pass) {
        passed += 1;
    } else {
        program_stats[3] += 1;
    }

    chai.assert.isTrue(pass);
});

// Test for SingleCare result
it('Test: SingleCare price exists', function () {
    tests += 1;
    let pass = data.programs[4].prices.length > 0 && data.programs[4].prices[0].price !== "N/A";

    if (pass) {
        passed += 1;
    } else {
        program_stats[4] += 1;
    }

    chai.assert.isTrue(pass);
});

// Test for Blink result
it('Test: Blink price exists', function () {
    tests += 1;
    let pass = data.programs[5].prices.length > 0 && data.programs[5].prices[0].price !== "N/A";

    if (pass) {
        passed += 1;
    } else {
        program_stats[5] += 1;
    }

    chai.assert.isTrue(pass);
});

// Test for GoodRx result
it('Test: GoodRx price exists', function () {
    tests += 1;
    let pass = data.programs[6].prices.length > 0 && data.programs[6].prices[0].price !== "N/A";

    if (pass) {
        passed += 1;
    } else {
        program_stats[6] += 1;
    }

    chai.assert.isTrue(pass);
});