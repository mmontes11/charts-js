var chart = require('./services/chart');

module.exports = function (app) {

    // api ---------------------------------------------------------------------
    //get all charts
    app.post('/chart', chart.saveChart);

    app.get('/chart', chart.generateRandomChart);

    app.get('/chart/all', chart.getAllCHarts);

    app.get('/chart/:chartID', chart.getChartByID);

    // application -------------------------------------------------------------
    app.get('*', function (req, res) {
        // load the single view file (angular will handle the page changes on the front-end)
        res.sendfile('./client/index.html');
    });
};