require('chromedriver');
const { describe, it, after, before } = require('mocha');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const globals = require('../../globals.js');
const drugs = require('../../lib/drugs');
const logging = webdriver.logging;
const {By} = webdriver;
const fs = require('fs');
chai.use(chaiAsPromised);
process.on('unhandledRejection', () => {});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe ('Frontend Tests', async function() {
    this.slow(10000);
    this.timeout(15000);
    let dl_dir;
    let random_drug = Math.floor(Math.random() * Math.floor(drugs.length - 1));
    let drug = drugs[random_drug];
        
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
        options.addArguments('--allow-insecure-localhost', '--test-type', '--incognito', '--ignore-urlfetcher-cert-requests', '--ignore-ssl-errors', 
                             '--ignore-certificate-errors', '--ignore-certificate-errors-spki-list');
        // var logPrefs = new logging.Preferences();
        // logPrefs.setLevel(logging.Type.BROWSER, logging.Level.OFF);
        // var caps = new webdriver.Capabilities();
        // caps.setBrowserName('chrome');
        // caps.set('acceptSslCerts', false);
        // caps.setLoggingPrefs(logPrefs);
        
    
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
        
        // SKIPS THIS TEST
        return this.skip();
        
        // Test if page loads
        it ('Test if Dashboard page loads', async function() {
            let tabs = await driver.findElements(By.css('button[role="tab"]'));
            await tabs[1].click();
            
            await driver.wait(async function() {
                try {
                    await driver.findElement(By.css('.btn.btn-outline-primary')).isDisplayed();
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

    describe('Resolved bug tests', async function() {
        this.timeout(90000);
        this.slow(30000);

        it ('Test drug search form verification', async function() {
            let tabs = await driver.findElements(By.css('button[role="tab"]'));
            await tabs[0].click();
            
            try {
                await driver.findElement(By.id('downshift-simple-input')).sendKeys("Lisinopril");
                await sleep(1200);
                await driver.findElement(By.id('downshift-simple-item-0')).click();
                await driver.findElement(By.id('myZipCode')).sendKeys("hello");
                await driver.findElement(By.css('.form-control.pointer')).click();
                
                await driver.wait(async function() {
                    try {
                        await driver.findElement(By.css('div.MuiSnackbarContent-message')).isDisplayed();
                        return true;
                    } catch(err) {
                        return false;
                    }
                });

                // await driver.findElement(By.css('input.AutoSuggestComponent-inputInput-363')).clear();
                await driver.findElement(By.id('myZipCode')).clear();
                chai.assert.isTrue(true);

            } catch (error) {
                chai.assert.isTrue(false, `Error: ${error.message}`)
            }
        });
        
        it ('Test add drug to dashboard', async function() {
            try {
                // await driver.findElement(By.id('downshift-simple-input')).sendKeys("Lisinopril");
                // await sleep(1200);
                // await driver.findElement(By.id('downshift-simple-item-0')).click();
                await driver.findElement(By.id('myZipCode')).sendKeys("30606");

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

                await driver.findElement(By.css('button.trackListing')).click();
                
                await driver.wait(async function() {
                    try {
                        await driver.findElement(By.css('div#customized-dialog-title')).isDisplayed();
                        return false;
                    } catch (e) {
                        return true;
                    }
                });

                let tabs = await driver.findElements(By.css('button[role="tab"]'));
                await tabs[1].click();
                await sleep(2000);

                try {
                    let drugName = await driver.findElement(By.css('#app > div > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > table > tbody > tr > td:nth-child(1) > span > strong'))
                                    .getText();

                    chai.assert.equal(drugName.toLowerCase(), 'lisinopril');
                } catch (error) {
                    chai.assert.isTrue(false, error.message)
                } finally {
                    await driver.findElement(By.css('#app > div > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > table > tbody > tr > td:nth-child(10) > div')).click();
                    await sleep(1000);
                }
            } catch (error) {
                chai.assert.isTrue(false, `Error: ${error.message}`)
            }
        });
    });

    // Drug Search test suite
    describe ('Drug Search Tests', async function() {
        // Loop through list of drugs in `drugs.js`
        // drugs.forEach((drug) => {

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
                    await driver.findElement(By.id('downshift-simple-input')).clear();
                    await driver.findElement(By.id('myZipCode')).clear();
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
                    await sleep(1000);
                    await driver.wait(async function() {                       
                        try {
                            await driver.findElement(By.className('MuiDialog-root')).isDisplayed();
                            await sleep(250);
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

                        // let postRows = [];
                        // for (let j = 0; j < 7; j++) {
                        //     const selector = `div#\\3${j} > div > p`;
                        //     let exp = await driver.findElement(By.id(`${j}`));
                        //     await exp.click();
                        //     let mainPrice = await driver.findElement(By.css(selector));
                        //     let subPrices = await driver.findElements(By.css(`div.top4-${j}>div[class^=\"makeStyles-topFourRow-\"] > div[class^=\"makeStyles-topFourPrices-\"]`));
                        //     let mainText = await mainPrice.getText();
                        //     let obj = [mainText];   
                        //     for (const sub of subPrices) {
                        //         let subText = await sub.getText();
                        //         obj.push(subText);
                        //     }

                        //     if (mainText !== 'N/A') {
                        //         postRows.push(obj); 
                        //     } else {
                        //         postRows.push(['N/A']);
                        //     }
                        // }
                        
                        // prices = postRows;
                        // await driver.findElement(By.css('.MuiButtonBase-root.MuiTab-root.MuiTab-textColorInherit.Mui-selected')).click();

                        // Clear text fields in the case of a failed search
                        // await driver.findElement(By.id('downshift-simple-input')).clear();
                        // await driver.findElement(By.id('myZipCode')).clear();
                    } catch (e) {
                        console.log(e);
                        chai.assert.isTrue(false, e.message);
                        // Refresh if error occurs
                        // await driver.navigate().refresh();
                    }
                } catch (e) {
                    console.log(e);
                    chai.assert.isTrue(false, e.message);
                } finally {
                    // Asserts that all header prices exist
                    chai.assert.isTrue(
                        averagePrice !== "N/A" &&
                        currentPrice !== "N/A" &&
                        lmPrice !== "N/A"
                    );
                }
            });

            // // Test InsideRx price exists
            // it ('Check if price exists for InsideRx', function() {
            //     chai.assert.isTrue(prices[0][0] !== 'N/A' && prices[0].length > 1);
            // });
            // // Test USP price exists
            // it ('Check if price exists for USP', function() {
            //     chai.assert.isTrue(prices[1][0] !== 'N/A' && prices[1].length > 1);
            // });
            // // Test WellRx price exists
            // it ('Check if price exists for WellRx', function() {
            //     chai.assert.isTrue(prices[2][0] !== 'N/A' && prices[2].length > 1);
            // });
            // // Test MedImpact price exists
            // it ('Check if price exists for MedImpact', function() {
            //     chai.assert.isTrue(prices[3][0] !== 'N/A' && prices[3].length > 1);
            // });
            // // Test SingleCare price exists
            // it ('Check if price exists for SingleCare', function() {
            //     chai.assert.isTrue(prices[4][0] !== 'N/A' && prices[4].length > 1);
            // });
            // // Test Blink Health price exists
            // it ('Check if price exists for Blink Health', function() {
            //     chai.assert.isTrue(prices[5][0] !== 'N/A' && prices[5].length > 1);
            // });
            // // Test GoodRx price exists
            // it ('Check if price exists for GoodRx', function() {
            //     chai.assert.isTrue(prices[6][0] !== 'N/A' && prices[5].length > 1);
            // });

        });     // End specific drug tests
    });     // End Drug Search test suite

    // Reports page Test Suite
    describe('Reports Page Tests', async function() {
        
        // SKIPS THIS TEST
        // return this.skip();
        
        this.timeout(180000);
        this.slow(30000);
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
            await sleep(1000);
            // Wait for file to download
            await driver.wait(async function() {
                try {
                    await driver.findElement(By.css('div#customized-dialog-title')).isDisplayed();
                    return false;
                } catch (e) {
                    return true;
                }
            });

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

    // Admin View test suite
    describe('Admin View tests', async function() {
        this.timeout(90000);
        this.slow(30000);
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