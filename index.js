const {convertExcelToJson} = require('./lib/convertExcel');
const {generateDrugMasterQueries} = require('./lib/convertExcel');
const {getNdc} = require('./lib/convertExcel');
const fs = require('fs');

const drugs = fs.readFileSync(__dirname + "\\drugs.json");
let json = JSON.parse(drugs);
// let promise = getNdc(json[0]);
// promise.then((ndc) => {
//     console.log('done');
//     console.log(ndc);
// }).catch((error) => {
//     console.log(error);
// });

let result = generateDrugMasterQueries(json, 277140);
console.log(result);
console.log('Done');

// const result = convertExcelToJson(__dirname + "\\test-report.xlsx");
// fs.writeFileSync(__dirname + "\\convertedReport.json", JSON.stringify(result, null, 2), 'utf8', function(err) {
//     if (err) throw err;
//     console.log("Wrote converted json to convertedReport.json");
// });