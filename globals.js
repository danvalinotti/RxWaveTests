require('dotenv').config();

let glb = {};
switch(process.argv[9]) {
    case 'dev':
        glb = {
            API: process.env.DEV_API,
            SITE: process.env.DEV_SITE,
            DB_CONFIG: {
                host: process.env.DEV_DB_URL,
                port: 5432,
                database: process.env.DEV_DB,
                username: process.env.DEV_DB_USERNAME,
                password: process.env.DEV_DB_PASSWORD
            }
        }; break;
    case 'qa':
        glb = {
            API: process.env.QA_API,
            SITE: process.env.QA_SITE,
            DB_CONFIG: {
                host: process.env.QA_DB_URL,
                port: 5432,
                database: process.env.QA_DB,
                username: process.env.QA_DB_USERNAME,
                password: process.env.QA_DB_PASSWORD
            },
            DRUG_MASTER: []
        }; break;
    case 'prod':
        glb = {
            API: process.env.PROD_API,
            SITE: process.env.PROD_SITE,
            DB_CONFIG: {
                host: process.env.PROD_DB_URL,
                port: 5432,
                database: process.env.PROD_DB,
                username: process.env.PROD_DB_USERNAME,
                password: process.env.PROD_DB_PASSWORD
            }
        }; break;
    default:
        glb = {
            API: process.env.DEV_API,
            SITE: process.env.DEV_SITE,
            DB_CONFIG: {
                host: process.env.DEV_DB_URL,
                port: 5432,
                database: process.env.DEV_DB,
                username: process.env.DEV_DB_USERNAME,
                password: process.env.DEV_DB_PASSWORD
            }
        }; break;
}

glb.SITE_USERNAME = "admin@galaxe.com";
glb.SITE_PASSWORD = "password";

module.exports = glb;
