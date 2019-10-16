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
const {serializeDrugName, randomUser} = require('../lib/utils');
const {genReport, genReport_JSON} = require('../../lib/genReport');

chai.use(chaiAsPromised);
process.on('unhandledRejection', () => {});

const instance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

let report = [];
let token = undefined;

// SIGNUP //
describe ('Signup endpoint tests', function() {
    this.timeout(30000);
    this.slow(10000);
    const req = randomUser();   

    it ('POST /signUp', async function() {
        try {
            const res = await instance.post(`${globals.API}/signUp`, req);
            chai.assert.equal(res.status, 200);
        } catch(err) {
            chai.assert.isTrue(false, `Error: ${err.message}`);
        }
    });

    it ('POST /update/password', async function() {
        try {
            const request = {
                username: globals.SITE_USERNAME,
                password: globals.SITE_PASSWORD,
                role: globals.SITE_PASSWORD
            };

            const res = await instance.post(`${globals.API}/update/password`, request);
            chai.assert.equal(res.status, 200);
        } catch(err) {
            chai.assert.isTrue(false, `Error: ${err.message}`);
        }
    });
}); // END SIGNUP

// LOGIN //
describe ('Login endpoint tests', function() {
    this.timeout(30000);
    this.slow(10000);
    it ('GET /create/token', async function() {
        const profile = {
            password: globals.SITE_PASSWORD,
            username: globals.SITE_USERNAME
        };

        let pass = false;
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
        const response = await axios.post(`${globals.API}/create/token`, profile, {
            headers: {
                'Referrer': globals.SITE,
                'Origin': globals.SITE,
                'Content-Type': 'application/json;charset=UTF-8',
                'Accept': 'application/json, text/plain, */*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
                'Sec-Fetch-Mode': 'cors'
            }
        }).then((response) => {
            token = response.data.name;
            if (typeof token == 'string') {
                pass = true;
            } 
        }).catch((error) => {
            console.log(error);
        });
        chai.assert.isTrue(pass);
    });

    it ('POST /authenticate/token', async function() {
        if (token !== undefined) {
            let pass = false;
            const profile = {
                name: token
            }
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
            const response = await axios.post(`${globals.API}/authenticate/token`, profile, {
                headers: {
                    'Referrer': globals.SITE,
                    'Origin': globals.SITE,
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Accept': 'application/json, text/plain, */*',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
                    'Sec-Fetch-Mode': 'cors'
                }
            });
            let res = response.data;
            if (res.name == token && res.username == globals.SITE_USERNAME && res.password == token) {
                pass = true;
            }
            chai.assert.isTrue(pass);
        }
    })
}); // END LOGIN

// ADMIN //
describe ('Admin endpoint tests', async function() {
    this.timeout(30000);
    this.slow(10000);

    it ('GET /admin/get/users', async function() {
        try {
            const response = await instance.get(`${globals.API}/admin/get/users`);
            chai.assert.isTrue(response.data.length > 0);
        } catch (error) {
            chai.assert.isTrue(false, `Error: ${error.message}`);
        }
    });

    it ('POST /admin/create/user', async function() {
        try {
            const user = randomUser();
            const req = {
                name: user.name,
                role: 'user',
                username: user.email
            };

            const res = await instance.post(`${globals.API}/admin/create/user`, req);
            chai.assert.equal(res.status, 200);
        } catch (error) {
            chai.assert.isTrue(false, `Error: ${error.message}`);
        }
    });
}); // END ADMIN

describe ('Alert endpoint tests', async function() {
    this.timeout(30000);
    this.slow(10000);

    it ('GET /get/alerts/all', async function() {
        try {
            const response = await instance.get(`${globals.API}/get/alerts/all`);
            chai.assert.isTrue(response.data.length > 0);
        } catch(error) {
            console.log(error);
            chai.assert.isTrue(false);
        }
    });

    it ('POST /create/alert/type', async function() {
        try {
            const request = {
                name: 'Test alert',
                header: 'Test header',
                footer: 'Test footer',
                summary: 'Summary',
                deliveryType: 'email',
                active: false,
                recipients: 'dvalinotti@icloud.com'
            };

            const response = await instance.post(`${globals.API}/create/alert/type`, request);
            chai.assert.isTrue(response.status === 200);
        } catch (error) {
            chai.assert.isTrue(false, `Error: ${error.message}`);
        }
    });
});

// DRUG REQUEST //
describe ('Drug request endpoint tests', async function() {
    this.timeout(30000);
    this.slow(10000);

    it ('GET /get/requests', async function() {
        try {
            const response = await instance.get(`${globals.API}/get/requests`);
            chai.assert.isTrue(response.data.length > 0);
        } catch(error) {
            chai.assert.isTrue(false, `Error: ${erorr.message}`);
        }
    });
}); // END DRUG REQUEST

// REPORTS //
describe ('Report endpoint tests', async function() {
    this.timeout(90000);
    this.slow(30000);
    let id = 0;
    let i = 0;

    it ('GET /reports/getAll', async function() {
        try {
            const response = await instance.get(`${globals.API}/reports/getAll`);
            if (response.data.length > 0) {
                i = Math.floor(Math.random() * Math.floor(response.data.length - 1));
                id = response.data[i].id;
            }
            chai.assert.isTrue(response.data.length > 0);
        } catch (error) {
            chai.assert.isTrue(false, `Error: ${error.message}`);
        }
    });

    // it ('POST /reports/saved/get', async function() {
    //     try {
    //         const req = {
    //             key: token,
    //             value: token
    //         };

    //         const res = await instance.post(`${globals.API}/reports/saved/get`, req);
    //         chai.assert.equal(res.status, 200);
    //     } catch (error) {
    //         chai.assert.isTrue(false, `Error: ${error.message}`);
    //     }
    // });

    it ('GET /reports/get/between/{start}/{end}', async function() {
        try {
            const response = await instance.get(`${globals.API}/reports/get/between/09-08-2019/10-08-2019`);
            chai.assert.isTrue(response.data.length > 0);
        } catch (error) {
            chai.assert.isTrue(false, `Error: ${error.message}`);
        }
    });

    it ('GET /reports/get/drugCount/{drugCount}', async function() {
        try {
            const response = await instance.get(`${globals.API}/reports/get/drugCount/496`);
            chai.assert.isTrue(response.data.length > 0);
        } catch (error) {
            chai.assert.isTrue(false, `Error: ${error.message}`);
        }
    });

    it ('GET /asd/{id}', async function() {
        try {
            const response = await instance.get(`${globals.API}/asd/${id}`, {
                responseType: 'blob'
            });
            const filename = decodeURI(response.headers['content-disposition'].split('filename=')[1]);
            chai.assert.isTrue(filename == 'poi-generated-file.xlsx' && response.headers['content-length'] > 0);
        } catch (error) {
            chai.assert.isTrue(false, `Error: ${error.message}`)
        }
    });
}); // END REPORTS

// DRUG //
describe ('Drug endpoint tests', async function() {
    this.slow(10000);
    this.timeout(15000);
    let tests = 0;
    let passed = 0;
    let program_stats = [0,0,0,0,0,0,0];
    let random_drug = Math.floor(Math.random() * Math.floor(drug_requests.length - 1));
    let drug = drug_requests[random_drug];
    
    describe ('Drugmaster endpoint tests', function() {
        let id = '';
        let name = '';
        // Test Get DrugMaster List 
        it ('GET /drugmaster/get/all', async function() {
            tests += 1;
            // let pass = false;
            try {
                let response = await instance.get(`${globals.API}/drugmaster/get/all`);
                let drugMasterList = response.data;
                if (drugMasterList.length > 0) {
                    id = drugMasterList[random_drug].id;
                    name = drugMasterList[random_drug].name;
                }
                chai.assert.isTrue(drugMasterList.length > 0);
            } catch (error) {
                chai.assert.isTrue(false, `Error: ${err.message}`)
            }
            
            // if (pass) {
            //     passed += 1;
            // }
        });

        it ('GET /drugmaster/get/id/{id}', async function() {
            let pass;
            if (id !== '' && name !== '') {
                try {
                    const response = await instance.get(`${globals.API}/drugmaster/get/id/${id}`);
                    pass = (id === response.data.id && name === response.data.name);
                } catch(error) {
                    chai.assert.isTrue(false, `Error: ${err.message}`);
                }
            }
            chai.assert.isTrue(pass);
        });
    });

    describe (`Drug search endpoint tests`, function() {
        let data;
        let reportData = {};

        // Test: Get Drug Info (autocomplete results)
        it (`GET /getDrugInfo/${drug.name}`, async function() {
            tests += 1;

            let pass = false;
            try {
                const response = await instance.get(`${globals.API}/getDrugInfo/${drug.name}`);
                if (serializeDrugName(response.data[0].name).includes(serializeDrugName(drug.name))) {
                    pass = true;
                }
            } catch (error) {
                console.log(error);
            }
            // await sleep(1000);

            if (pass) {
                passed += 1;
            }

            chai.assert.isTrue(pass);
        });     // End /getDrugInfo/{name} test
        // Test: Search and recieve response
        it ('POST /getPharmacyPrice', async function() {
            tests += 1;

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

                for (let i = 0; i < data.programs.length; i++) {
                    tests += 1;
                    if (data.programs[i].prices.length > 0 && data.programs[i].prices[0].price !== "N/A") {
                        passed += 1;
                    } else {
                        program_stats[i] += 1;
                    }
                }
            } catch (error) {
                console.log(error);
            }

            report.push(reportData);

            if (pass) {
                passed += 1;
            }

            chai.assert.isTrue(pass);
        });
    });

    
    describe ('Dashboard endpoint tests', function() {
        this.timeout(60000);
        this.slow(30000);

        it ('POST /dashboard/get', async function() {
            try {
                const req = {
                    key: token,
                    value: token
                };

                const res = await instance.post(`${globals.API}/dashboard/get`, req);
                chai.assert.equal(res.status, 200);
            } catch(err) {
                chai.assert.isTrue(false, `Error: ${err.message}`);
            }
        });

        it ('POST /dashboard/drugs/add', async function() {
            try {
                const req = {
                    zipcode: '75034',
                    drugName: drug.name,
                    dosageStrength: drug.dosageStrength,
                    quantity: drug.quantity,
                    drugNDC: drug.ndc,
                    drugType: drug.drugType,
                    longitude: 'longitude',
                    latitude: 'latitude',
                    token: token
                };

                const res = await instance.post(`${globals.API}/dashboard/drugs/add`, req);
                chai.assert.equal(res.status, 200);
            } catch(err) {
                chai.assert.isTrue(false, `Error: ${err.message}`);
            }
        });

        it ('POST /dashboard/drug/delete', async function() {
            try {
                const req = {
                    average: null,
                    averageDiff: null,
                    created: null,
                    description: null,
                    diffFromLast: null,
                    dosageStrength: "90 mg-8 mg",
                    dosageUOM: null,
                    drugType: null,
                    id: null,
                    modified: null,
                    name: null,
                    ndc: drug.ndc,
                    pharmacyName: null,
                    programs: null,
                    quantity: drug.quantity,
                    recommendedDiff: null,
                    recommendedPrice: "266.56",
                    zipcode: "75034"
                };
    
                const res = await instance.post(`${globals.API}/dashboard/drug/delete`, req);
                chai.assert.equal(res.status, 200);
            } catch (err) {
                chai.assert.isTrue(false, `Error: ${err.message}`);
            }
        });
    });
    // after(async () => {
    //     await genReport_JSON(report, tests, passed, program_stats);
    //     genReport(report);
    // })
});     // End Drug Search test suite

// LOGOUT //
describe ('Logout endpoint tests', function() {
    this.timeout(30000);
    this.slow(10000);

    it ('POST /profile/logout', async function() {
        try {
            const req = {name: token};
            const res = await instance.post(`${globals.API}/profile/logout`, req);
            
            chai.assert.equal(res.status, 200);
        } catch (err) {
            chai.assert.isTrue(false, `Error: ${err.message}`);
        }
    });
}); // END LOGOUT