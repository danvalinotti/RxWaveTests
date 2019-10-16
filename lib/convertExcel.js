const excelToJson = require('convert-excel-to-json');
const zipcodes = require('zipcodes');
const fs = require('fs');
const fetch = require('node-fetch');

function convertExcelToJson(source) {
    const result = excelToJson({
        sourceFile: source,
        header: {
            rows: 1
        },
        sheets: [{
            name: '90036',
            columnToKey: {
                A: 'drugName',
                B: 'drugRank',
                C: 'drugNDC',
                D: 'drugGSN',
                E: 'dosageStrength',
                F: 'quantity',
                G: 'zipCode',
                H: 'insideRxPrice',
                I: 'insideRxPharmacy',
                J: 'goodRxPrice',
                K: 'goodRxPharmacy',
                L: 'uspPrice',
                M: 'uspPharmacy',
                N: 'wellRxPrice',
                O: 'wellRxPharmacy',
                P: 'medImpactPrice',
                Q: 'medImpactPharmacy',
                R: 'singleCarePrice',
                S: 'singleCarePharmacy',
                T: 'blinkPrice',
                U: 'blinkPharmacy',
                V: 'recommendedPrice',
                W: 'diffPrice'
            }
        },{
            name: '30606',
            columnToKey: {
                A: 'drugName',
                B: 'drugRank',
                C: 'drugNDC',
                D: 'drugGSN',
                E: 'dosageStrength',
                F: 'quantity',
                G: 'zipCode',
                H: 'insideRxPrice',
                I: 'insideRxPharmacy',
                J: 'goodRxPrice',
                K: 'goodRxPharmacy',
                L: 'uspPrice',
                M: 'uspPharmacy',
                N: 'wellRxPrice',
                O: 'wellRxPharmacy',
                P: 'medImpactPrice',
                Q: 'medImpactPharmacy',
                R: 'singleCarePrice',
                S: 'singleCarePharmacy',
                T: 'blinkPrice',
                U: 'blinkPharmacy',
                V: 'recommendedPrice',
                W: 'diffPrice'
            }
        },{
            name: '60639',
            columnToKey: {
                A: 'drugName',
                B: 'drugRank',
                C: 'drugNDC',
                D: 'drugGSN',
                E: 'dosageStrength',
                F: 'quantity',
                G: 'zipCode',
                H: 'insideRxPrice',
                I: 'insideRxPharmacy',
                J: 'goodRxPrice',
                K: 'goodRxPharmacy',
                L: 'uspPrice',
                M: 'uspPharmacy',
                N: 'wellRxPrice',
                O: 'wellRxPharmacy',
                P: 'medImpactPrice',
                Q: 'medImpactPharmacy',
                R: 'singleCarePrice',
                S: 'singleCarePharmacy',
                T: 'blinkPrice',
                U: 'blinkPharmacy',
                V: 'recommendedPrice',
                W: 'diffPrice'
            }
        },{
            name: '10023',
            columnToKey: {
                A: 'drugName',
                B: 'drugRank',
                C: 'drugNDC',
                D: 'drugGSN',
                E: 'dosageStrength',
                F: 'quantity',
                G: 'zipCode',
                H: 'insideRxPrice',
                I: 'insideRxPharmacy',
                J: 'goodRxPrice',
                K: 'goodRxPharmacy',
                L: 'uspPrice',
                M: 'uspPharmacy',
                N: 'wellRxPrice',
                O: 'wellRxPharmacy',
                P: 'medImpactPrice',
                Q: 'medImpactPharmacy',
                R: 'singleCarePrice',
                S: 'singleCarePharmacy',
                T: 'blinkPrice',
                U: 'blinkPharmacy',
                V: 'recommendedPrice',
                W: 'diffPrice'
            }
        }, {
            name: '75034',
            columnToKey: {
                A: 'drugName',
                B: 'drugRank',
                C: 'drugNDC',
                D: 'drugGSN',
                E: 'dosageStrength',
                F: 'quantity',
                G: 'zipCode',
                H: 'insideRxPrice',
                I: 'insideRxPharmacy',
                J: 'goodRxPrice',
                K: 'goodRxPharmacy',
                L: 'uspPrice',
                M: 'uspPharmacy',
                N: 'wellRxPrice',
                O: 'wellRxPharmacy',
                P: 'medImpactPrice',
                Q: 'medImpactPharmacy',
                R: 'singleCarePrice',
                S: 'singleCarePharmacy',
                T: 'blinkPrice',
                U: 'blinkPharmacy',
                V: 'recommendedPrice',
                W: 'diffPrice'
            }
        }
        ]
    });

    return result;
}

async function getNdc(drug) {
    console.log(drug.drugName);
    let name = drug.drugName;
    if (name === "LISINOPRIL/HYDROCHLOROTHIAZIDE") {
        name = "Hydrochlorothiazide-Lisinopril";
    } else if (name === "AMOXICILLIN TRIHYDRATE") {
        name = "Amoxicillin"
    } else if (name === "LOSARTAN/HCTZ") {
        name = "Hydrochlorothiazide-Losartan"
    } else if (name === "LEVONORGESTREL-ETH ESTRA") {
        name = "Ethinyl Estradiol-Levonorgestrel"
    } else if (name === "NORETH A-ET ESTRA/FE FUMARATE") {
        name = "Ethinyl Estradiol-Norethindrone and Ferrous Fumarate"
        drug.dosageStrength = "with iron " + drug.dosageStrength;
    } else if (name === "DICLOFENAC SODIUM") {
        drug.dosageStrength = "sodium " + drug.dosageStrength;
    } else if (name === "HYDROXYZINE HYDROCHLORIDE") {
        drug.dosageStrength = "hydrochloride " + drug.dosageStrength;
    } else if (name === "DOXYCYCLINE MONOHYDRATE") {
        drug.dosageStrength = "monohydrate " + drug.dosageStrength;
    }
    const search = await fetch(`https://insiderx.com/request/medications/search?query=${encodeURIComponent(name.trim())}&limit=8&locale=en-US`, {
        method: 'get',
        headers: {
            headers: {
                "Cookie":"_hjid=aca602bf-1c36-4bc9-a61c-08b3c954bb07; _fbp=fb.1.1564432004779.1096871046; _gcl_au=1.1.179349884.1564432005; _ga=GA1.2.1491198620.1564432005; _gid=GA1.2.1893336521.1570544076; geocoords=40.7350747%2C-74.17390569999998; _hjIncludedInSample=1; _gat_UA-113293481-1=1; AWSALB=JlGAuVwvoq3PwuuyNntKl2UryOYwOL0LSZLpUD1OaIsWUChdjhZz74avG0Ya0xxrcuF8PUjDhZpE0eUtjbfc+diX1SsBwct3KQLJF9RXQNie7F/Z3YcYvAkv/s+6",
                "X-Requested-With":"XMLHttpRequest",
                "Accept":"application/json",
                "csrf-token":"Hi6yGXfg-vppErZsd2KXvKmH9LxjPBNJeK48",
            }
        }
    });
    const searchResult = await search.json();
    // console.log(searchResult);
    let ndc = undefined;
    try {
        if (searchResult.length > 0) {
            let doses = [];
            searchResult[0].dose.forEach((dosage) => {
                let label = dosage.label.toLowerCase().trim();
                if (label.includes("(")) {
                    label = dosage.label.substr(0, dosage.label.indexOf('(')).toLowerCase().trim();
                }
                doses.push({
                    d1: label,
                    d2: drug.dosageStrength.toLowerCase()
                });
                if (label == drug.dosageStrength.toLowerCase().trim()) {
                    ndc = dosage.value;
                }
            });
            
            if (ndc === undefined) {
                console.log(doses);
                throw new Error(`Unable to find NDC of drug ${drug.drugName}.`);
            } 
            return ndc;
        } else {
            throw new Error(`Error searching for ${drug.drugName}`)
        }
    } catch(error) {
        console.log(error);
    }
    
}

function generateDrugMasterQueries(json, startIndex) {
    let zips = ['10023', '30606', '60639', '75034', '90036'];
    let total = json.length;
    let count = 0;
    let index = startIndex + 1;
    json.forEach(async function(drug) {
        try {
            const ndc = await getNdc(drug);
            zips.forEach(async function(zip) {
                index += 1;
                count += 1;
                fs.appendFile(__dirname + '\\..\\drug_master_script.txt', 
                    `INSERT INTO drug_master(
                        id, dosage_strength, dosageuom, drug_type, gsn, name, ndc, quantity, report_flag, zip_code)
                        VALUES (${index}, '${drug.dosageStrength.toLowerCase()}', null, '${drug.drugForm}', '${drug.drugGSN}', '${drug.drugName}',
                            '${ndc}', ${drug.quantity}.0, true, '${zip}');\n`
                , function(err) {
                    if (err) throw err;
                });
            });
        } catch (error) {
            console.log(error);
        }

    });

    return {
        total: total,
        complete: count
    };
}

function generateQueries(json, startIndex) {
    let queries = [];
    let zips = ['10023', '30606', '60639', '75034', '90036'];
    let index = startIndex;

    zips.forEach((zip) => {
        const longitude = zipcodes.lookup(zip).longitude;
        const latitude = zipcodes.lookup(zip).latitude;
        json[zip].forEach((value) => {
            queries.push(
                `INSERT INTO public.drug_request(
                id, brand_indicator, drug_id, drug_name, gsn, latitude, longitude, ndc, program_id, quantity, zipcode, dosage_strength, drug_type, good_rx_id)
                VALUES (${index}, ${value.brandIndicator}, ${value.drugId}, ${value.drugName}, ${value.drugGsn}, ${latitude}, ${longitude}, ${value.drugNdc}, 
                    ${value.programId}, ${value.quantity}, ${zip}, ${value.dosageStrength}, ${value.drugType}, ${value.goodRxId});`
            );
        });
    })

    return queries;
}

module.exports = {
    convertExcelToJson,
    generateDrugMasterQueries,
    getNdc
}