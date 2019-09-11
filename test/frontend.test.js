require('chromedriver');
const { describe, it, after, before } = require('mocha');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const webdriver = require('selenium-webdriver');
const globals = require('../globals.js');
const drugs = require('../lib/drugs');
const {By, until} = webdriver;
chai.use(chaiAsPromised);
process.on('unhandledRejection', () => {});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let driver;
(async function testDbConfig() {
    try {
        describe ('Frontend Tests', async function() {
            this.timeout(15000);
            before(() => {
                driver = new webdriver.Builder()
                    .forBrowser('chrome')
                    .build();
            })

            describe ('Login tests', async function() {
                it ('Test page load', async function() {
                    await driver.get(globals.SITE);
                    let title = await driver.getTitle();
                    chai.assert.equal(title, 'Inside Rx');
                });
    
                it ('Test login authentication', async function() {
                    let fields = await driver.findElements(By.css('.MuiInputBase-input.MuiOutlinedInput-input'));
                    await fields[0].sendKeys(globals.SITE_USERNAME);
                    await fields[1].sendKeys(globals.SITE_PASSWORD);
                    let buttons = await driver.findElements(By.css('.MuiButtonBase-root.MuiButton-root.MuiButton-contained'));
                    await buttons[0].click();
                    await driver.wait(async function() {
                        return await driver.getCurrentUrl() === globals.SITE + "/#/search";
                    });
                    let url = await driver.getCurrentUrl();
    
                    chai.assert.equal(url, globals.SITE + '/#/search');
                });
            })
            describe ('Drug Search Tests', async function() {
                drugs.forEach((drug) => {
                    describe (`Test search for drug ${drug.Name} `, async function() {
                        let prices;
                        let program_id = 0;

                        before (() => {
                            prices = [];
                        }); 

                        it ('Test if search is successful ', async function() {
                            let price = undefined;
                            try {
                                await driver.findElement(By.id('downshift-simple-input')).sendKeys(drug.Name);
                                await sleep(1250);
                                await driver.findElement(By.id('downshift-simple-item-0')).click();
                                await driver.findElement(By.id('myZipCode')).sendKeys(drug.ZipCode);
                                await driver.findElement(By.css('.form-control[name="drugStrength"]')).click();
        
                                console.log("SEARCH HERE");
        
                                let dosages = await driver.findElements(By.css('.form-control[name="drugStrength"]>option'));
        
                                for (const dosage of dosages) {
                                    let text = await dosage.getText();
                                    if (text.includes(drug.Dosage)) {
                                        await dosage.click();
                                        console.log("clicked d");
                                    }
                                }
                                
                                await driver.findElement(By.css('select[name="drugQuantity"]')).click();
                                let quantities = await driver.findElements(By.css('select[name="drugQuantity"]>option'));
        
                                for (const quantity of quantities) {
                                    let text = await quantity.getText();
                                    if (text.includes(drug.Quantity)) {
                                        await quantity.click();
                                        console.log("clicked q");
                                    }
                                }
                                
                                await driver.findElement(By.css('.form-control.pointer')).click();
                                await driver.wait(async function() {
                                    try {
                                        await driver.findElement(By.className('MuiDialog-root')).isDisplayed();
                                        return false;
                                    } catch (e) {
                                        console.log("Dialog not found");
                                        return true;
                                    }
                                });
                                
                                try {
                                    price = await driver.findElement(By.css('.overallPrice.col-sm>.headerhelp')).getText();
                                    let priceElements = await driver.findElements(By.className('compPrice'));
                                    let count = 0;
                                    for (let i = 0; i < priceElements.length; i++) {
                                        let text = await priceElements[i].getText();
                                        if (text !== "N/A") {
                                            prices.push(text);
                                        }
                                    }
                                    await driver.findElement(By.css('.MuiButtonBase-root.MuiTab-root.MuiTab-textColorInherit.Mui-selected')).click();
                                    await driver.findElement(By.id('downshift-simple-input')).clear();
                                    await driver.findElement(By.id('myZipCode')).clear();
                                } catch (e) {
                                    price = undefined;
                                    console.log("ERROR");
                                    await driver.navigate().refresh();
                                }
                            } catch (e) {
                                console.log(e);
                            } finally {
                                chai.assert.isTrue(price !== undefined);
                            }
                        });
                        
                        // it ('Check if price exists for SingleCare', function() {
                        //     chai.assert.isTrue(prices[0] !== undefined);
                        // });
                        // it ('Check if price exists for MedImpact', function() {
                        //     chai.assert.isTrue(prices[1] !== undefined);
                        // });
                        // it ('Check if price exists for WellRx', function() {
                        //     chai.assert.isTrue(prices[2] !== undefined);
                        // });
                        // it ('Check if price exists for US Pharmacy Card', function() {
                        //     chai.assert.isTrue(prices[3] !== undefined);
                        // });
                        it ('Check if price exists for Blink Health', function() {
                            chai.assert.isTrue(prices[4] !== undefined);
                        });
                        it ('Check if price exists for GoodRx', function() {
                            chai.assert.isTrue(prices[5] !== undefined);
                        });
                    });
                });
            });
        });
    } catch(error) {
        done(error);
    } finally {
        driver.quit();
        done();
    }
})();