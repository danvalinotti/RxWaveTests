'use strict';
let express = require('express');
let router = express.Router();
const {spawn} = require('child_process');

router.post('/', function(req, res, err) {
    console.log(`Starting ${req.body.env}`)
    let testResults = {
        total: 0,
        passed: 0,
        failed: 0,
        tests: []
    };

    const run = spawn(`cd ../ & npm`, ['run', `${req.body.env}`], {shell: true});

    run.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`)
        if (data.includes('√')) {
            testResults.total += 1;
            testResults.passed += 1;
            testResults.tests.push({
                name: data.toString().substring(data.indexOf('√') + 1, data.indexOf('\\n')),
                passed: true
            })
        } else if (data.includes(') GET') || data.includes(') POST')) {
            testResults.total += 1;
            testResults.failed += 1;
            testResults.tests.push({
                name: data.toString().substring(data.indexOf(')') + 1, data.indexOf('\\n')),
                passed: false
            })
        }
    });

    run.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`)
    });

    run.on('close', (code) => {
        console.log(`Process closed with exit code ${code}.`)
        res.json({
            success: true,
            results: testResults
        });
    });

    run.on('error', (err) => {
        console.error(`Failed to start: ${err}`)
        res.json({
            success: false,
            error: err
        });
    })
});

module.exports = router;