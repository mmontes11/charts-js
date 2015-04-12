'use strict';

/* Controllers */

var controllers = angular.module('controllers', []);


controllers.controller('AccordionInfoCtrl', ['$scope', function ($scope) {
    $scope.groups = [
        {
            title: 'Manual',
            content: 'Generate a chart by your own.'
        },
        {
            title: 'Random',
            content: 'Generate a colourful random chart.'
        },
        {
            title: 'List of Charts',
            content: 'List of all charts.'
        },

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
        $scope.chartRandomConfig = jsonChart;
        $scope.updateChart(jsonChart);
    });

    $scope.saveChart = function () {
        $scope.newChart["description"] = $scope.description;
        Chart.save(null, $scope.newChart)
            .$promise.then(
            function (success) {
                $scope.closeSaveChartDialog();
                $scope.showDialog("Info", "Chart saved correctly");
            },
            function (error) {
                $scope.closeSaveChartDialog();
                $scope.showDialog("Error", "Chart couldn't be saved");
            }
        );
    }
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
                var chart = Chart.get(params, function(){
                    updateChart(chart);
                });
                break;
            case 1:
                var chart = Chart.minRandom(null, function(){
                    updateChart(chart);
                });  
                break;
            case 2:
                var chart = Chart.maxRandom(null, function(){
                    updateChart(chart);
                });  
                break;
        }
    }
}]);

controllers.controller('ChartTableCtrl', ['$scope', '$filter', 'Chart', function ($scope, $filter, Chart) {

    Chart.findAll()
        .$promise.then(
            function(charts){
                angular.forEach(charts,function(chart){
                    chart.creationDate = (new Date(chart.creationDate)).toLocaleString();
                });
                $scope.items = charts;
                $scope.search();
            },
            function(error){
                $scope.showDialog("Error","Error retrieving charts");
            }
        );

    // init
    $scope.sort = {
        sortingOrder : '_id',
        reverse : false
    };

    $scope.gap = 5;

    $scope.filteredItems = [];
    $scope.groupedItems = [];
    $scope.itemsPerPage = 20;
    $scope.pagedItems = [];
    $scope.currentPage = 0;

    var searchMatch = function (haystack, needle) {
        if (!needle) {
            return true;
        }
        return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
    };

    // init the filtered items
    $scope.search = function () {
        $scope.filteredItems = $filter('filter')($scope.items, function (item) {
            for(var attr in item) {
                if (searchMatch(item[attr], $scope.query))
                    return true;
            }
            return false;
        });
        // take care of the sorting order
        if ($scope.sort.sortingOrder !== '') {
            $scope.filteredItems = $filter('orderBy')($scope.filteredItems, $scope.sort.sortingOrder, $scope.sort.reverse);
        }
        $scope.currentPage = 0;
        // now group by pages
        $scope.groupToPages();
    };


    // calculate page in place
    $scope.groupToPages = function () {
        $scope.pagedItems = [];

        for (var i = 0; i < $scope.filteredItems.length; i++) {
            if (i % $scope.itemsPerPage === 0) {
                $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [ $scope.filteredItems[i] ];
            } else {
                $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredItems[i]);
            }
        }
    };

    $scope.range = function (size,start, end) {
        var ret = [];
        console.log(size,start, end);

        if (size < end) {
            end = size;
            start = size-$scope.gap;
        }
        for (var i = start; i < end; i++) {
            ret.push(i);
        }
        console.log(ret);
        return ret;
    };

    $scope.prevPage = function () {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
    };

    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.pagedItems.length - 1) {
            $scope.currentPage++;
        }
    };

    $scope.setPage = function () {
        $scope.currentPage = this.n;
    };

}]);

controllers.controller('ChartDetailsCtrl', ['$scope', 'Chart', '$routeParams', function ($scope, Chart, $routeParams) {

    $scope.chartID = $routeParams.id;
    
    Chart.findByID({ id : $scope.chartID })
        .$promise.then(
            function(chart){
                $scope.description = chart.description;
                $scope.updateChart(chart.data);
            },
            function( error ){
                $scope.showDialog("Error", "Chart couldn't be retrieved");
            }
        );
}]);
