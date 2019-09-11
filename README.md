# RxWaveTests
Mocha Test Suites for QA testing RxWave

## Installation 
Run `npm install`

## Tests
1. `npm run dev`
2. `npm run qa`
3. `npm run prod`

### Current progress
  1. Frontend Tests
    ✅ Login authentication
    ✅ Drug search
        ✅ Success
        ✅ Check if prices exist (Blink/GoodRx)
    ✖️ Dashboard
        ✖️ Add drug to dashboard
        ✖️ Remove drug from dashboard
        ✖️ Export dashboard
    ✖️ Reports
        ✖️ Download latest report
        ✖️ Create manual report
    ✖️ Admin View
        ✖️ Create User
        ✖️ Manage Drugs -> add drug
        ✖️ Manage Alerts -> add new alert
        ✖️ Requests -> add new drug request
    ✖️ Logout
  2. Backend tests
    ✖️ TBS
