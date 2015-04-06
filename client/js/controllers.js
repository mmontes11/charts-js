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
        title: {
            text: 'Candy Consumption'
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
        $scope.updateChart($scope.chartFormConfig);
    };

    $scope.$on("UPDATE_CHART_FORM", function (event, data) {
        $scope.addConsumer(data.name, data.dashstyle, data.linecolor, data.series);
    });

    $scope.$on("UPDATE_CHART_WS", function (event, jsonChart) {
        $scope.updateChart(jsonChart);
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

    $scope.randomChart = function (chartType) {
        var params = {numXaxis: $scope.numX, numYaxis: $scope.numY, min: $scope.min, max: $scope.max};

        var updateChart = function (data) {
            $scope.$broadcast("UPDATE_CHART_WS", data);
        };

        switch (chartType) {
            case 0:
                Chart.get(params)
                    .$promise.then(
                        function(chart){
                            updateChart(chart);
                        },
                        function(error){
                            $scope.showDialog("Error","Error generating random chart");
                        }
                    );
                break;
            case 1:
                Chart.minRandom()
                    .$promise.then(
                        function(chart){
                            updateChart(chart);
                        },
                        function(error){
                            $scope.showDialog("Error","Error generating random chart");
                        }
                    );
                break;
            case 2:
                Chart.maxRandom()
                    .$promise.then(
                        function(chart){
                            updateChart(chart);
                        },
                        function(error){
                            $scope.showDialog("Error","Error generating random chart");
                        }
                    );
                break;
        }
    }
}]);

controllers.controller('ListChartsCtrl', ['$scope', 'Chart', function ($scope, Chart) {

    Chart.findAll()
        .$promise.then(
            function(charts){
                console.log(charts);
            },
            function(error){
                console.log(error);
            }
        );
}]);

controllers.controller('ChartDetailsCtrl', ['$scope', 'Chart', '$routeParams', 
    function ($scope, Chart, $routeParams) {

    $scope.chartID = $routeParams.id;
    
    Chart.findByID({ id : $scope.chartID })
        .$promise.then(
            function(chart){
                console.log(chart);
            },
            function( error ){
                console.log(error);
            }
        );
}]);