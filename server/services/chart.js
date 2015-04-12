
var mongoose = require('mongoose');
var db_chart = require('../../db/models/chart');
var random = require('../utils/random');


exports.saveChart = function(req,res){
    var type = req.body.type || '';
    var description = req.body.description || '';
    var data = req.body.data || '';

    if (type == '' || data == '') {
        return res.send(400);
    }

    var chart = new db_chart.chartModel();
    chart.type = type;
    chart.description = description;
    chart.data = data;

    chart.save(function (err, char) {
        if (err) {
            console.log(err);
            return res.send(500);
        } else {
            return res.send(201);
        }
    });
};

exports.generateRandomChart = function(req,res){
    var numXaxis = req.param("numXaxis") || '';
    var numYaxis = req.param("numYaxis") || '';
    var min = req.param("min") || '';
    var max = req.param("max") || '';

    if (numXaxis == '' || numYaxis == '' || min == '' || max == '') {
        return res.send(400);
    }

    var randomChart = {
        chart: {
            type: ''
        },
        credits: {
            enabled: false
        },
        title: {
            text: 'Random Chart'
        },
        dashstyle: '',
        linecolor: '',
        xAxis: {
            categories: []
        },
        yAxis: {
            title: {
                text: 'RandomSeries'
            }
        },
        series: []
    };
    var chartTypes = ["line", "spline", "area", "areaspline", "column", "bar", "pie", "scatter"];
    var dashStyles = ["Solid", "ShortDash", "ShortDot", "ShortDashDot", "ShortDashDotDot", "Dot", "Dash", "LongDash", "DashDot",
        "LongDashDot", "LongDashDotDot", "LongDashDotDot"];

    randomChart.chart.type = chartTypes[random.getRandomInt(0, (chartTypes.length - 1))];
    randomChart.dashstyle = dashStyles[random.getRandomInt(0, (dashStyles.length - 1))];
    randomChart.linecolor = random.getRandomColor();

    for (var i = 0; i < numXaxis; i++) {
        randomChart.xAxis.categories.push("Category " + (i + 1));
    }
    for (var i = 0; i < numYaxis; i++) {
        var dataSeries = [];
        for (var j = 0; j < numXaxis; j++) {
            dataSeries.push({
                name: "Point " + (j + 1),
                color: random.getRandomColor(),
                y: parseInt(random.getRandomInt(min, max))
            });
        }
        randomChart.series.push({
            name: "Random " + (i + 1),
            data: dataSeries
        });
    }

    return res.json(randomChart);
};

exports.getAllCHarts = function (req, res) {
    db_chart.chartModel
        .find()
        .sort({creationDate: -1})
        .select('_id type description creationDate')
        .exec(function (err, charts) {
        if (err) {
            console.log(err);
            res.send(500);
        } else {
            res.json(charts);
        }
    })
};

exports.getChartByID = function(req,res){
    var chartID = req.param("chartID");
    var ObjectId = mongoose.Types.ObjectId;

    if (chartID == ''){
        return res.send(404);
    }
    if (!ObjectId.isValid(chartID)){
        return res.status(400).json({
            error: 'Bad ID'
        });
    }

    db_chart.chartModel
        .findOne()
        .where('_id').equals(ObjectId(chartID))
        .exec(function (err,chart){
            if (err || chart == undefined){
                console.log(err);
                return res.send(404);
            }
            return res.json(chart);
        });
}