'use strict';

/* Directives */


var directives = angular.module('directives', []);

directives.directive('navbar', ['$location', function ($location) {
    return {
        restrict: "E",
        templateUrl: "partials/directives/navbar.html",
        link: function (scope) {
            scope.isActive = function (path) {
                return path === $location.path();
            };
        }
    };
}]);

directives.directive('chart', ['Chart', function (Chart) {
    return {
        restrict: "E",
        controller: "ChartCtrl",
        templateUrl: "partials/directives/chart.html",
        link: function (scope, element, attributes) {
            scope.updateChart = function(jsonChart){
                jsonChart["chart"] = {
                    "renderTo": "chart"
                };
                jsonChart["credits"] = {
                    "enabled": false
                };
                jsonChart["exporting"] = {
                    "enabled": false
                };
                scope.chart = new Highcharts.Chart(angular.copy(jsonChart));
            };

            if (attributes.chartType && attributes.chartType === "manual") {
                scope.updateChart(scope.chartFormConfig);
            }
            if (attributes.chartType && attributes.chartType === "random") {
                scope.updateChart(scope.chartRandomConfig);
            }

            scope.isChartDetail = function () {
                return (attributes.chartType && attributes.chartType === "detail");
            };

            scope.clickSaveChart = function () {
                var data;
                if (attributes.chartType === "manual") {
                    data = scope.chartFormConfig;
                } else if (attributes.chartType === "random") {
                    data = scope.chartRandomConfig;
                }
                scope.newChart = {
                    type: attributes.chartType,
                    data: data
                };
                scope.showSaveChartDialog();
            };

            scope.exportChart = function() {
                scope.chart.exportChart({
                    type: 'image/png',
                    filename: 'chart'
                });
            }
        }
    }
}]);

directives.directive('customdialog',function(){
    return {
        restrict: "E",
        templateUrl: "partials/dialog/customdialog.html",
        link: function(scope, element, attributes){ 
            scope.showDialog = function(title,body){
                scope.titleDialog = title;
                scope.bodyDialog = body;
                $('#customdialog').modal({
                    keyboard: false
                });
            }
        }   
    };
});

directives.directive('savechartdialog', function () {
    return {
        restrict: "E",
        controller: "ChartCtrl",
        templateUrl: "partials/dialog/savechartdialog.html",
        link: function(scope, element, attributes){ 
            scope.showSaveChartDialog = function(){
                $('#savechartdialog').modal({ keyboard: false });
            };
            scope.closeSaveChartDialog = function () {
                $('#savechartdialog').modal('hide');
            }
        } 
    }
});

directives.directive("customSort", function() {
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            order: '=',
            sort: '='
        },
        template :
            ' <a ng-click="sort_by(order)" style="color: #555555;">'+
            '    <span ng-transclude></span>'+
            '    <i ng-class="selectedCls(order)"></i>'+
            '</a>',
        link: function(scope) {

            // change sorting order
            scope.sort_by = function(newSortingOrder) {
                var sort = scope.sort;

                if (sort.sortingOrder == newSortingOrder){
                    sort.reverse = !sort.reverse;
                }

                sort.sortingOrder = newSortingOrder;
            };


            scope.selectedCls = function(column) {
                if(column == scope.sort.sortingOrder){
                    return ('icon-chevron-' + ((scope.sort.reverse) ? 'down' : 'up'));
                }
                else{
                    return'icon-sort'
                }
            };
        }// end link
    }
});
