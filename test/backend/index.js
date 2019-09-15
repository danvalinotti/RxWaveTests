const https = require('https');
const zipcodes = require('zipcodes');
const { describe, it, after, before } = require('mocha');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const globals = require('../../globals.js');
const drugs = require('../../lib/drugs');
const drug_requests = require('../../lib/drug_requests');
const axios = require('axios').default;
const {sleep} = require('../lib/utils');
const {serializeDrugName} = require('../lib/utils');
const {genReport} = require('../../lib/genReport');

chai.use(chaiAsPromised);
process.on('unhandledRejection', () => {});

const instance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

let report = [];

describe ('Login tests', function() {

    // it ('Create token ( /create/token )', async function() {
    //     const profile = {
    //         password: globals.SITE_PASSWORD,
    //         username: globals.SITE_USERNAME
    //     };

    //     console.log(profile);

    //     let pass = false;
    //     try {
    //         const response = await axios.post(`${globals.API}/create/token`, profile, {
    //             headers: {
    //                 'Referrer': 'https://rxwave.galaxe.com',
    //                 'Origin': 'https://rxwave.galaxe.com',
    //                 'Content-Type': 'application/json;charset=UTF-8',
    //                 'Accept': 'application/json, text/plain, */*',
    //                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
    //                 'Sec-Fetch-Mode': 'cors'
    //             }
    //         });
    //         console.log(response);
    //         pass = true;
    //     } catch(err) {
    //         console.log(err);
    //     }
    //     chai.assert.isTrue(pass);
    // });
});

// Drug Search test suite
describe ('Drug Search tests', async function() {
    this.slow(10000);
    this.timeout(15000);

    describe ('Drugmaster endpoint test', function() {
        // Test Get DrugMaster List 
        it ('Test /drugmaster/get/all', async function() {
            let pass = false;
            try {
                let response = await instance.get(`${globals.API}/drugmaster/get/all`);
                let drugMasterList = response.data;
                if (drugMasterList.length > 0) {
                    console.log(drugMasterList.length);
                    pass = true;
                }
            } catch (error) {
                console.log(error);
            }
    
            chai.assert.isTrue(pass);
        });
    });

    drug_requests.forEach((drug) => {
        describe (`Drug search test for ${drug.name}`, function() {
            let data;
            let reportData = {};

            // Test: Get Drug Info (autocomplete results)
            it (`Test /getDrugInfo/${drug.name}`, async function() {
                let pass = false;
                try {
                    const response = await instance.get(`${globals.API}/getDrugInfo/${drug.name}`);
                    if (serializeDrugName(response.data[0].name).includes(serializeDrugName(drug.name))) {
                        console.log(response.data[0].name);
                        console.log(drug.name);
                        pass = true;
                    }
                } catch (error) {
                    console.log(error);
                }
                await sleep(1000);
    
                chai.assert.isTrue(pass);
            });     // End /getDrugInfo/{name} test
            // Test: Search and recieve response
            it ('Test successful search', async function() {
                let pass = false;
                try {
                    const options = {
                        dosageStrength: drug.dosageStrength,
                        drugNDC: drug.ndc,
                        drugName: drug.name,
                        drugType: drug.drugType,
                        latitude: zipcodes.lookup(drug.zipCode).latitude,
                        longitude: zipcodes.lookup(drug.zipCode).longitude,
                        quantity: drug.quantity,
                        zipcode: drug.zipCode,
                    }
                    const response = await instance.post(`${globals.API}/getPharmacyPrice`, options);
                    data = response.data;

                    reportData = {
                        name: drug.name,
                        dosageStrength: drug.dosageStrength,
                        quantity: drug.quantity,
                        ndc: drug.ndc,
                        latitude: options.latitude,
                        longitude: options.longitude,
                        zipcode: drug.zipCode,
                        programs: [
                            data.programs[0],
                            data.programs[1],
                            data.programs[2],
                            data.programs[3],
                            data.programs[4],
                            data.programs[5],
                            data.programs[6]
                        ]
                    };

                    pass = true;
                } catch (error) {
                    console.log(error);
                }

                report.push(reportData);
    
                chai.assert.isTrue(pass);
            });
    
            // // Test for WellRx result
            // it ('Test: WellRx price exists', function() {
            //     chai.assert.isTrue(data.programs[2].price !== 'N/A');
            // });
    
            // // Test for Blink Health result
            // it ('Test: Blink Health price exists', function() {
            //     chai.assert.isTrue(data.programs[5].price !== 'N/A');
            // });
    
            // Test for GoodRx result
            it ('Test: GoodRx price exists', function() {
                chai.assert.isTrue(data.programs[6].price !== 'N/A');
            });
        });
    });     // End {drugs} forEach

    after(() => {
        genReport(report);
    })
});     // End Drug Search test suite