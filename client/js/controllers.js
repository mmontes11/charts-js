'use strict';

/* Controllers */

var controllers = angular.module('controllers', []);


controllers.controller('AccordionInfoCtrl', ['$scope', function ($scope) {
    $scope.groups = [
        {
            title: 'Form',
            content: 'Draw a chart using data from a Form.'
        },
        {
            title: 'Random',
            content: 'Get random chart data from a WebService and represent it.'
        }
    ];
}]);

controllers.controller('ChartCtrl', ['$scope', 'Chart', 'Random', function ($scope, Chart, Random) {
    $scope.chartFormConfig = {
        chart: {
            type: 'line'
        },
        title: {
            text: 'Candy Consumption'
        },
        credits: {
            enabled: false
        },
        xAxis: {
            categories: ['Lollipops', 'Jelly Beans', 'Bubble Gum']
        },
        yAxis: {
            title: {
                text: 'Candy eaten'
            }
        },
        series: [{
            name: 'Martin',
            data: [Random.getRandomInt(0, 5), Random.getRandomInt(0, 5), Random.getRandomInt(0, 5)]
        },
            {
                name: 'John',
                data: [Random.getRandomInt(0, 5), Random.getRandomInt(0, 5), Random.getRandomInt(0, 5)]
            },
            {
                name: 'Stacy',
                data: [Random.getRandomInt(0, 5), Random.getRandomInt(0, 5), Random.getRandomInt(0, 5)]
            }]
    };

    $scope.chartRandomConfig = {
        chart: {
            type: 'line'
        },
        credits: {
            enabled: false
        },
        title: {
            text: 'Random Chart'
        },
        xAxis: {
            categories: ['Category1', 'Category2', 'Category3', 'Category4', 'Category5']
        },
        yAxis: {
            title: {
                text: 'Series'
            }
        },
        series: [{
            name: 'Serie',
            data: [Random.getRandomInt(0, 5), Random.getRandomInt(0, 5), Random.getRandomInt(0, 5), Random.getRandomInt(0, 5), Random.getRandomInt(0, 5)]
        }]
    };

    //Form Chart Operations
    $scope.addConsumer = function (name, dashStyle, color, data) {
        $scope.chartFormConfig.series.push({name: name, dashStyle: dashStyle, color: color, data: data});
        $('#chart').highcharts(angular.copy($scope.chartFormConfig));
    };

    $scope.$on("UPDATE_CHART_FORM", function (event, data) {
        $scope.addConsumer(data.name, data.dashstyle, data.linecolor, data.series);
    });

    $scope.$on("UPDATE_CHART_WS", function (event, jsonChart) {
        $('#chart').highcharts(angular.copy(jsonChart));
    });
}]);


controllers.controller('ManualCtrl', ['$scope', function ($scope) {
    $scope.candies = [{"name": "Lollipops", "quantity": ""},
        {"name": "Jelly Beans", "quantity": ""},
        {"name": "Bubble Gum", "quantity": ""}];

    $scope.dashstyles = [{"id": "Solid", "title": "Solid"},
        {"id": "ShortDash", "title": "ShortDash"},
        {"id": "ShortDot", "title": "ShortDot"},
        {"id": "ShortDashDot", "title": "ShortDashDot"},
        {"id": "ShortDashDotDot", "title": "ShortDashDotDot"},
        {"id": "Dot", "title": "Dot"},
        {"id": "Dash", "title": "Dash"},
        {"id": "LongDash", "title": "LongDash"},
        {"id": "DashDot", "title": "DashDot"},
        {"id": "LongDashDot", "title": "LongDashDot"},
        {"id": "LongDashDotDot", "title": "LongDashDotDot"}];

    $scope.addConsumerForm = function () {
        var series = [];
        $.each($scope.candies, function (key, element) {
            series.push({
                color: $scope.pointcolor,
                y: parseInt(element.quantity)
            });
        });
        $scope.$broadcast("UPDATE_CHART_FORM", {
            name: $scope.name,
            dashstyle: $scope.dashstyle,
            linecolor: $scope.linecolor,
            series: series
        });
    }

}]);

controllers.controller('RandomCtrl', ['$scope', '$location', 'Chart', function ($scope, $location, Chart) {
    $scope.jsonData = "";

    $scope.randomChart = function (chartType) {
        var params = {numXaxis: $scope.numX, numYaxis: $scope.numY, min: $scope.min, max: $scope.max};

        var updateChart = function (data) {
            $scope.jsonData = data;
            $scope.$broadcast("UPDATE_CHART_WS", data);
        };

        switch (chartType) {
            case 0:
                var data = Chart.get(params, function () {
                    updateChart(data);
                });
                break;
            case 1:
                var data = Chart.minRandom({}, function () {
                    updateChart(data);
                });
                break;
            case 2:
                var data = Chart.maxRandom({}, function () {
                    updateChart(data);
                });
                break;
        }
    }
}]);

controllers.controller('ListChartsCtrl', ['$scope', '$location', 'Chart', function ($scope, $location, Chart) {

    Chart.all();
}]);