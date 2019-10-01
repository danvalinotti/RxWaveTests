const xl = require('excel4node');
const fs = require('fs');
let mongoose = require('mongoose');
let {reportSchema, accuracyReportSchema} = require('./mongoConfig');
const filePath = __dirname + "/../reports/Report.xlsx"

function saveReportToDB(data) {
    var Reports = mongoose.model('reports', reportSchema);
    let report = {
        _id: mongoose.Types.ObjectId(),
        createDate: new Date(),
        tests: data.tests,
        passed: data.passed,
        failed: data.failed,
        numDrugs: data.length,
        programStats: data.program_stats,
        results: data.report
    };
    
    return Reports.create(report, function(err, reports) {
        if (err) throw err;
        return reports;
    });
}

function saveAccuracyReport(data) {
    var AccuracyReports = mongoose.model('accuracy_reports', accuracyReportSchema);
    let report = {
        _id: mongoose.Types.ObjectId(),
        createDate: data.createDate,
        totalAccuracy: data.totalAccuracy,
        compAccuracy: data.compAccuracy
    };

    return AccuracyReports.create(report, function(err, reports) {
        if (err) throw err;
        return reports;
    })
}

function genReport_JSON(data, tests, passed, program_stats) {
    let report = [];

    // console.log(__dirname + "/../mochawesome-report/mochawesome.json");

    let mochaReport = JSON.parse(fs.readFileSync(__dirname + "/../mochawesome-report/mochawesome.json"));

    data.forEach((entry) => {
        let p = [];
        for (let i = 0; i < entry.programs.length; i++) {
            p.push({
                id: i,
                price_exists: (entry.programs[i].price !== "N/A") ? true : false,
                program_name: entry.programs[i].program,
                prices: entry.programs[i].prices,
                pharmacy: entry.programs[i].pharmacy,
            });
        }

        report.push({
            name: entry.name,
            dosageStrength: entry.dosageStrength,
            quantity: entry.quantity,
            ndc: entry.ndc,
            latitude: entry.latitude,
            longitude: entry.longitude,
            zipcode: entry.zipcode,
            programs: p
        });
    });

    let fullReport = {
        tests: tests,
        passed: passed,
        failed: tests - passed,
        program_stats: program_stats,
        report: report,
    };

    saveReportToDB(fullReport);

    return fs.writeFile(__dirname + "/../test/reports/report.json", JSON.stringify(report, null, 2), 'utf8', function(err) {
        if (err) {
            console.log("Error writing json report file: ");
            return console.log(err);
        }

        return console.log("Successfully wrote to report.json");
    });
}

function genReportXL(data, location) {
    let setup = setupWorksheet();
    let wb = setup.wb;
    let ws = setup.ws;

    for (let i = 0; i < data.length; i++) {
        let row = i+2;

        ws.cell(row, 1).string(data[i].name);
        ws.cell(row, 2).string(data[i].dosageStrength);
        ws.cell(row, 3).number(data[i].quantity);
        ws.cell(row, 4).string(data[i].ndc);
        ws.cell(row, 5).number(data[i].latitude);
        ws.cell(row, 6).number(data[i].longitude);
        ws.cell(row, 7).string(data[i].zipcode);
        ws.cell(row, 8).string(data[i].programs[0].price);
        ws.cell(row, 9).string(data[i].programs[1].price);
        ws.cell(row, 10).string(data[i].programs[2].price);
        ws.cell(row, 11).string(data[i].programs[3].price);
        ws.cell(row, 12).string(data[i].programs[4].price);
        ws.cell(row, 13).string(data[i].programs[5].price);
        ws.cell(row, 14).string(data[i].programs[6].price);
    }

    return wb.write('Report.xlsx', function(err, stats) {
        if (err) {
            console.log(err);
        } else {
            return fs.writeFile(location, filePath, function(err) {
                if (err) throw err;
                return console.log('Wrote to Report xlsx file');
            });
        }
    });
}

function genReport(data) {
    let setup = setupWorksheet();
    let wb = setup.wb;
    let ws = setup.ws;

    for (let i = 0; i < data.length; i++) {
        let row = i+2;

        ws.cell(row, 1).string(data[i].name);
        ws.cell(row, 2).string(data[i].dosageStrength);
        ws.cell(row, 3).number(data[i].quantity);
        ws.cell(row, 4).string(data[i].ndc);
        ws.cell(row, 5).number(data[i].latitude);
        ws.cell(row, 6).number(data[i].longitude);
        ws.cell(row, 7).string(data[i].zipcode);
        ws.cell(row, 8).string(data[i].programs[0].price);
        ws.cell(row, 9).string(data[i].programs[1].price);
        ws.cell(row, 10).string(data[i].programs[2].price);
        ws.cell(row, 11).string(data[i].programs[3].price);
        ws.cell(row, 12).string(data[i].programs[4].price);
        ws.cell(row, 13).string(data[i].programs[5].price);
        ws.cell(row, 14).string(data[i].programs[6].price);
    }

    return wb.write('Report.xlsx', function(err, stats) {
        if (err) {
            console.log(err);
        } else {
            return fs.writeFile(__dirname + '/../test/reports/Report.xlsx', filePath, function(err) {
                if (err) throw err;
                return console.log('Wrote to Report xlsx file');
            });
        }
    });
}

function setupWorksheet() {
    let wb = new xl.Workbook();

    let ws = wb.addWorksheet('Report');

    ws.cell(1,1).string('Name');
    ws.cell(1,2).string('Dosage Strength');
    ws.cell(1,3).string('Quantity');
    ws.cell(1,4).string('NDC');
    ws.cell(1,5).string('Latitude');
    ws.cell(1,6).string('Longitude');
    ws.cell(1,7).string('Zipcode');
    ws.cell(1,8).string('InsideRx');
    ws.cell(1,9).string('USPharmCard');
    ws.cell(1,10).string('WellRx');
    ws.cell(1,11).string('MedImpact');
    ws.cell(1,12).string('SingleCare');
    ws.cell(1,13).string('Blink');
    ws.cell(1,14).string('GoodRx');

    ws.column(1).setWidth(40);
    ws.column(2).setWidth(30);
    ws.column(3).setWidth(10);
    ws.column(4).setWidth(20);
    ws.column(5).setWidth(10);
    ws.column(6).setWidth(10);
    ws.column(7).setWidth(10);
    ws.column(8).setWidth(10);
    ws.column(9).setWidth(10);
    ws.column(10).setWidth(10);
    ws.column(11).setWidth(10);
    ws.column(12).setWidth(10);
    ws.column(13).setWidth(10);

    // Header
    ws.addConditionalFormattingRule('A1:N1', {
        type: 'expression',
        priority: 1,
        formula: 'NOT(ISERROR(SEARCH("", A1)))',
        style: wb.createStyle({
            fill: {
                type: 'pattern',
                patternType: 'solid',
                bgColor: '#4f81bd',
                fgColor: '#4f81bd'
            },
            font: {
                bold: true,
                color: '#ffffff'
            }
        })
    });

    // Mark N/A cells
    ws.addConditionalFormattingRule('A1:N98', {
        type: 'expression',
        priority: 2,
        formula: 'NOT(ISERROR(SEARCH("N/A", A1)))',
        style: wb.createStyle({
            fill: {
                type: 'pattern',
                patternType: 'solid',
                bgColor: '#e6b8b7',
                fgColor: '#e6b8b7'
            },
            font: {
                bold: true
            }
        })
    });

    return {wb, ws}
}

module.exports = {
    genReport: genReport,
    genReport_JSON: genReport_JSON,
    genReportXL: genReportXL,
    saveAccuracyReport: saveAccuracyReport
}