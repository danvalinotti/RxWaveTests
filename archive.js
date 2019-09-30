it('US Pharmacy Card Price Accuracy', async function () {
    let drugName = drug.name;
    let drugNDC = drug.ndc;
    if (drug.name.includes("Amox")) {
        drugName = drug.name.slice(0, drug.name.indexOf('-') + 1) + "Pot " + drug.name.slice(drug.name.indexOf('-') + 1);
    }

    if ([...drug.ndc.slice(0, 3)].filter(letter => letter === '0').length > 2) {
        drugNDC = drug.ndc.slice(1);
    }

    console.log(drugNDC);
    let url = "https://api.uspharmacycard.com/drug/price/147/none/" + drug.zipCode + "/" + drugNDC + "/" + encodeURIComponent(drugName) + "/" + drug.drugType + "/" + drug.quantity + "/8"
    console.log(url);

    let rxwPrice = price.programs[1].price;
    let uspPrice;

    try {
        const response = await instance.get(url);
        var json = response.data;

        uspPrice = json.priceList[0].discountPrice;
        uspPrice = parseFloat(uspPrice.replace('$', ''));

        if (rxwPrice !== "N/A") {
            rxwPrice = parseFloat(rxwPrice);
            if (uspPrice === rxwPrice) {
                tracker[1] += 1;
            }
        };
    } catch (err) {
        // console.log(err.response.data);
        if (err.response.data === 'No Pricing Available') {
            uspPrice = "N/A";
        } else {
            console.log(err.message);
        }
    }

    let pass = (rxwPrice !== "N/A" || uspPrice !== "N/A");

    chai.assert.notStrictEqual(rxwPrice, "N/A", 'Price exists on RxWave');
    chai.assert.notStrictEqual(uspPrice, "N/A", 'Price exists on USPharmacyCard');

    if (pass) chai.assert.strictEqual(uspPrice, uspPrice, 'RxWave price = USPharmacyCard Price');
});