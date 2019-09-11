require('chromedriver');
const { describe, it, after, before } = require('mocha');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const globals = require('../globals.js');
const drugs = require('../lib/drugs');
const {By, until} = webdriver;
const fs = require('fs');
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
            let dl_dir;
            
            // Build Chrome WebDriver
            before(() => {
                dl_dir = __dirname + "\\downloads";

                // Set chrome options
                let options = new chrome.Options();
                options.setUserPreferences({
                    "plugins.plugins_list": [{"enabled":false,"name":"Chrome PDF Viewer"}],
                    "download": {
                        "prompt_for_download": false,
                        "default_directory"  : dl_dir
                    }
                });
                options.addArguments('--disable-application-cache', '--incognito');
            
                // Build chromedriver instance
                driver = new webdriver.Builder()
                    .forBrowser('chrome')
                    .setChromeOptions(options)
                    .build();
            });

            // Login Tests suite
            describe ('Login tests', async function() {
                
                // Tests if login page loads
                it ('Test page load', async function() {                    
                    await driver.get(globals.SITE);
                    let title = await driver.getTitle();
                    chai.assert.equal(title, 'Inside Rx');
                });     // End login page load test

                // Test is login with admin creds is successful    
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
                });     // End login auth test
            });     // End Login test suite

            // Dashboard page Test Suite
            describe ('Dashboard Page Tests', async function() {
                
                // Test if page loads
                it ('Test if Dashboard page loads', async function() {
                    let tabs = await driver.findElements(By.css('button[role="tab"]'));
                    await tabs[1].click();
                    
                    await driver.wait(async function() {
                        try {
                            await driver.findElement(By.css('span.programPrice>div>span')).isDisplayed();
                            return true;
                        } catch (e) {
                            return false;
                        }
                    });

                    let currentUrl = await driver.getCurrentUrl();
                    chai.assert.isTrue(currentUrl === globals.SITE + "/#/viewDashboard");
                });     // End page load test

                // Test if prices in report are not $0.00
                it ('Test if prices display', async function() {
                    let dashPrices = await driver.findElements(By.css('span.programPrice>div>span'));
                    let pass = true;
                    for (const p of dashPrices) {
                        let t = p.getText();
                        if (t === "$0.00") {
                            pass = false;
                        }
                    }

                    chai.assert.isTrue(pass);
                });     // End price display test
            });     // End Dashboard test suite

            // Reports page Test Suite
            describe('Reports Page Tests', async function() {

                // Test if page loads
                it ('Test if Reports page loads', async function() {
                    let tabs = await driver.findElements(By.css('button[role="tab"]'));
                    await tabs[2].click();
                    
                    await driver.wait(async function() {
                        try {
                            await driver.findElement(By.css('svg.pointer')).isDisplayed();
                            return true;
                        } catch (e) {
                            return false;
                        }
                    });

                    let currentUrl = await driver.getCurrentUrl();
                    chai.assert.isTrue(currentUrl === globals.SITE + "/#/reports");
                });     // End page load test

                // Downloads latest report and tests if file exists
                it ('Test if latest report successfully downloads', async function() {
                    await driver.findElement(By.css('svg.pointer')).click();
                    // Wait for file to download
                    await sleep(3000);

                    // Finds downloaded file - if found, deletes
                    let found = false;
                    try {
                        await fs.promises.access(dl_dir + "\\poi-generated-file.xlsx");
                        found = true;
                        await fs.promises.unlink(dl_dir + "\\poi-generated-file.xlsx")
                    } catch (error) {
                        console.log("Downloaded report not found: ", error);
                    }

                    chai.assert.isTrue(found);
                });     // End download test
            });     // End Dashboard test suite

            // Drug Search test suite
            describe ('Drug Search Tests', async function() {
                
                // Loop through list of drugs in `drugs.js`
                drugs.forEach((drug) => {

                    // Test suite for specific drug
                    describe (`Test search for drug ${drug.Name} `, async function() {
                        let prices;

                        // Instantiate prices array
                        before (() => {
                            prices = [];
                        }); 

                        // See below. vvv
                        it ('Test if search is successful ', async function() {
                            let averagePrice = undefined;
                            let currentPrice = undefined;
                            let lmPrice = undefined;
                            try {
                                let tabs = await driver.findElements(By.css('button[role="tab"]'));
                                await tabs[0].click();
                                await driver.findElement(By.id('downshift-simple-input')).sendKeys(drug.Name);
                                await sleep(1250);    // Wait for search suggestions to populate
                                await driver.findElement(By.id('downshift-simple-item-0')).click();
                                await driver.findElement(By.id('myZipCode')).sendKeys(drug.ZipCode);

                                 // Finds correct dosage and selects
                                await driver.findElement(By.css('.form-control[name="drugStrength"]')).click();                
                                let dosages = await driver.findElements(By.css('.form-control[name="drugStrength"]>option'));
                                for (const dosage of dosages) {                            
                                    let text = await dosage.getText();
                                    if (text.includes(drug.Dosage)) {
                                        await dosage.click();
                                        // console.log("clicked d");
                                    }
                                }

                                // Finds correct quantity and selects
                                await driver.findElement(By.css('select[name="drugQuantity"]')).click();
                                let quantities = await driver.findElements(By.css('select[name="drugQuantity"]>option'));
                                for (const quantity of quantities) {                        
                                    let text = await quantity.getText();
                                    if (text.includes(drug.Quantity)) {
                                        await quantity.click();
                                        // console.log("clicked q");
                                    }
                                }
                                
                                // Wait for search to finish before continuing
                                await driver.findElement(By.css('.form-control.pointer')).click();
                                await driver.wait(async function() {                       
                                    try {
                                        await driver.findElement(By.className('MuiDialog-root')).isDisplayed();
                                        return false;
                                    } catch (e) {
                                        return true;
                                    }
                                });
                                
                                try {
                                    // Retrieves all header prices
                                    let overallPrices = await driver.findElements(By.css('div.overallPrice>div.headerhelp'));
                                    averagePrice = await overallPrices[0].getText();
                                    currentPrice = await overallPrices[1].getText();
                                    lmPrice = await overallPrices[2].getText();

                                    // Save each program's price in prices array
                                    let priceElements = await driver.findElements(By.className('compPrice'));
                                    for (let i = 0; i < priceElements.length; i++) {            
                                        let text = await priceElements[i].getText();
                                        prices.push(text);
                                    }
                                    await driver.findElement(By.css('.MuiButtonBase-root.MuiTab-root.MuiTab-textColorInherit.Mui-selected')).click();

                                    // Clear text fields in the case of a failed search
                                    await driver.findElement(By.id('downshift-simple-input')).clear();
                                    await driver.findElement(By.id('myZipCode')).clear();
                                } catch (e) {
                                    // Refresh if error occurs
                                    await driver.navigate().refresh();
                                }
                            } catch (e) {
                                console.log(e);
                            } finally {
                                // Asserts that all header prices exist
                                chai.assert.isTrue(
                                    averagePrice !== "N/A" &&
                                    currentPrice !== "N/A" &&
                                    lmPrice !== "N/A"
                                );
                            }
                        });

                        // Test WellRx price exists
                        it ('Check if price exists for WellRx', function() {
                            chai.assert.isTrue(prices[3] !== "N/A");
                        });
                        
                        // Test Blink Health price exists
                        it ('Check if price exists for Blink Health', function() {
                            chai.assert.isTrue(prices[4] !== "N/A");
                        });
                        
                        // Test GoodRx price exists
                        it ('Check if price exists for GoodRx', function() {
                            chai.assert.isTrue(prices[5] !== "N/A");
                        });

                    });     // End specific drug tests
                });     // End drugs loop
            });     // End Drug Search test suite

            // Admin View test suite
            describe('Admin View tests', async function() {

                // Page load test
                it ('Test if admin view loads', async function() {
                    // Click top-right button and click admin view
                    await driver.findElement(By.css('.MuiButtonBase-root.MuiButton-root.MuiButton-text')).click();
                    await driver.wait(async function() {
                        try {
                            let dropDownItems = await driver.findElements(By.css('.MuiButtonBase-root.MuiListItem-root.MuiMenuItem-root.MuiMenuItem-gutters.MuiListItem-gutters.MuiListItem-button'));
                        await dropDownItems[1].click();
                            return true;
                        } catch(e) {
                            return false;
                        }
                    });

                    // Check if current URL is that of the admin page
                    let url = await driver.getCurrentUrl();
                    chai.assert.isTrue(url === globals.SITE + "/#/admin/manage/users");
                });     //End page load test

                // TODO: Manage users -> add user
                //       Manage alerts -> add alert
                //       Manage requests -> add request

            });     // End Admin View test suite

            // TODO: General -> logout test

            // Quit driver when finished testing
            after(() => {
                driver.quit();
            });
        });
    } catch(error) {
        done(error);
    } finally {
        driver.quit();
        done();
    }
})();