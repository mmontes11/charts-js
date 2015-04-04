'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('chartsJS', [
    'ngRoute',
    'controllers',
    'filters',
    'services',
    'directives',
    'ui.bootstrap',
    'highcharts-ng',
    'colorpicker.module'
]);

app.constant("Config", {
    "ChartUrl": "http://localhost:8080/chart"
});

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/info', {templateUrl: 'partials/info.html', controller: 'AccordionInfoCtrl'});
    $routeProvider.when('/manual', {templateUrl: 'partials/manual.html', controller: 'ManualCtrl'});
    $routeProvider.when('/random', {
        templateUrl: 'partials/random.html',
        controller: 'RandomCtrl'
    });
    $routeProvider.when('/listCharts', {
        templateUrl: 'partials/listCharts.html',
        controller: 'ListChartsCtrl'
    });
    $routeProvider.otherwise({redirectTo: '/info'});
}]);
