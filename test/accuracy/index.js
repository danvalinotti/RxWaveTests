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

chai.use(chaiAsPromised);
process.on('unhandledRejection', () => {});

const instance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

const grxInstance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    }),
    headers: {
        "Content-Type": "application/json",
        "Accept": "*/*",
        "Connection": "keep-alive",
        "User-Agent": "PostmanRuntime/7.16.3"
    }
});

function fixDrugName(name) {

}

drug_requests.forEach((drug) => {
    describe('Accuracy test for ' + drug.name, function() {
        this.timeout(30000);
        let price = {};
        let tracker = [0,0,0,0,0,0,0];

        before (async () => {
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
                var data = response.data;

                price = {
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
            } catch (error) {
                console.log(error);
            }
        });

        // it ('InsideRx Price Accuracy', async function() {
            // let req = {
            //     ndc: drug.ndc,
            //     latitude: drug.latitude,
            //     longitude: drug.longitude,
            //     quantity: drug.quantity,
            //     referrer: "null",
            //     site_identity: "irx"
            // };

        //     let rxwPrice = price.programs[0].price;
        //     let irxPrice = null;

        //     try {
        //         const response = await instance.post('https://insiderx.com/request/pharmacies', req);

        //         var json = response.data;
    
        //         var lowestPrice =  json.prices[0].price;
        //         json.prices.forEach(function(value){
        //             if(value!= null){
        //                 if(parseFloat(lowestPrice) > parseFloat(value.price)){
        //                     lowestPrice =  value.price;
        //                 }
        //                 if(value.uncPrice != undefined && value.uncPrice != null && parseFloat(lowestPrice) > parseFloat(value.uncPrice)){
        //                     lowestPrice = value.uncPrice;
        //                 }
        //             }
        //         });
    
        //         if (rxwPrice !== "N/A") {
        //             rxwPrice = parseFloat(rxwPrice);
        //             irxPrice = parseFloat(lowestPrice);

        //             if (rxwPrice === irxPrice) {
        //                 tracker[0] += 1;
        //             }
        //         };
                
        //     } catch(err) {
        //         console.log(err);
        //     }
        //     chai.assert.notStrictEqual(rxwPrice, "N/A", 'Price exists on RxWave')
        //     chai.assert.strictEqual(rxwPrice, irxPrice, 'RxWave price = InsideRx Price');
        // });

        // it ('US Pharmacy Card Price Accuracy', async function() {
        //     let drugName = drug.name;
        //     let drugNDC = drug.ndc;
        //     if (drug.name.includes("Amox")) {
        //         drugName = drug.name.slice(0, drug.name.indexOf('-') + 1) + "Pot " + drug.name.slice(drug.name.indexOf('-') + 1);
        //     }

        //     if ([...drug.ndc.slice(0, 3)].filter(letter => letter === '0').length > 2) {
        //         drugNDC = drug.ndc.slice(1);
        //     }

        //     console.log(drugNDC);
        //     let url = "https://api.uspharmacycard.com/drug/price/147/none/"+drug.zipCode+"/"+drugNDC+"/"+encodeURIComponent(drugName)+"/"+drug.drugType+"/"+drug.quantity+"/8"
        //     console.log(url);

        //     let rxwPrice = price.programs[1].price;
        //     let uspPrice;

        //     try {
        //         const response = await instance.get(url);
        //         var json = response.data;

        //         uspPrice = json.priceList[0].discountPrice;
        //         uspPrice = parseFloat(uspPrice.replace('$', ''));

        //         if (rxwPrice !== "N/A") {
        //             rxwPrice = parseFloat(rxwPrice);
        //             if (uspPrice === rxwPrice) {
        //                 tracker[1] += 1;
        //             }
        //         };
        //     } catch(err) {
        //         // console.log(err.response.data);
        //         if (err.response.data === 'No Pricing Available') {
        //             uspPrice = "N/A";
        //         } else {
        //             console.log(err.message);
        //         }
        //     }

        //     let pass = (rxwPrice !== "N/A" || uspPrice !== "N/A");

        //     chai.assert.notStrictEqual(rxwPrice, "N/A", 'Price exists on RxWave');
        //     chai.assert.notStrictEqual(uspPrice, "N/A", 'Price exists on USPharmacyCard');
            
        //     if (pass) chai.assert.strictEqual(uspPrice, uspPrice, 'RxWave price = USPharmacyCard Price');
        // });

        // it ('SingleCare Price Accuracy', async function() {
        //     let url = "https://webapi.singlecare.com/api/pbm/tiered-pricing/" + drug.ndc + "?qty=" + drug.quantity + "&zipCode=" + drug.zipCode;
        //     let singlePrice = "N/A";
        //     // console.log(price);
        //     let rxwPrice;
        //     try {
        //         const response = await instance.get(url);
        //         let data = response.data;
        //         singlePrice = parseFloat(data.Result.PharmacyPricings[0].Prices[0].Price);
                
        //         chai.assert.notStrictEqual(price.programs[4].price, "N/A", 'Price exists on RxWave');
        //         rxwPrice = parseFloat(price.programs[4].price);
                
        //         // console.log(rxwPrice, singlePrice);
                
        //     } catch(err) {
        //         console.log(err);
        //     }
        //     chai.assert.notStrictEqual(singlePrice, "N/A", 'Price exists on SingleCare');
        //     chai.assert.strictEqual(singlePrice, rxwPrice, 'RxWave price = SingleCare price');
        // });

        it ('GoodRx Price Accuracy', async function() {
            let coords = zipcodes.lookup(drug.zipCode);
            let url = `https://www.goodrx.com/api/v4/drugs/${drug.goodRxId}/prices?location=${coords.longitude},${coords.latitude}&location_type=LAT_LNG_GEO_IP&quantity=${drug.quantity}`;
            console.log(url);
            let rxwPrice;
            let grxPrice = "N/A";
            
            try {
                chai.assert.notStrictEqual(price.programs[6].price, "N/A", 'Price exists on RxWave');
                const response = await grxInstance.get(url);
                // console.log(response);
                await sleep(5000);
                data = response.data;
                let results = data.results;
                let lowestPrice = parseFloat(data.results[0].prices[0].price);
                results.forEach((result) => {
                    if (parseFloat(result.prices[0].price) < lowestPrice) {
                        lowestPrice = parseFloat(result.prices[0].price);
                    }
                });
                grxPrice = lowestPrice;

                rxwPrice = parseFloat(price.programs[6].price);

            } catch (err) {
                console.log(err);
            }
            console.log(rxwPrice, grxPrice);
            console.log(rxwPrice === grxPrice);

            chai.assert.notStrictEqual(grxPrice, "N/A", 'Price exists on GoodRx');
            chai.assert.strictEqual(rxwPrice, grxPrice, 'RxWave price = GoodRx price');
        })

        after(() => {

        });
    });
});