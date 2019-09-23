const {genReportXL} = require('./lib/genReport');
const fs = require('fs');

const report = JSON.parse(fs.readFileSync(__dirname + "\\test\\reports\\report.json"));

genReportXL(report, __dirname + "Report.xlsx");