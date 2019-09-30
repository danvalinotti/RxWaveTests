# RxWaveTests
Mocha Test Suites for QA testing RxWave

## Installation 
1. Run `npm install`
2. Set up `.env` based on Private Documentation
3. Create `downloads` directory in project root

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
    ✅ Dashboard (load page)
        ✖️ Add drug to dashboard
        ✖️ Remove drug from dashboard
        ✖️ Export dashboard
    ✅ Reports (load page)
        ✅ Download latest report
        ✖️ Create manual report
    ✅ Admin View (load page)
        ✖️ Create User
        ✖️ Manage Drugs -> add drug
        ✖️ Manage Alerts -> add new alert
        ✖️ Requests -> add new drug request
    ✅ Logout
    
  2. Backend tests
  
    ✅ getPharmacyPrice endpoints
  
  3. Accuracy Tests
  
    ✅ Start
