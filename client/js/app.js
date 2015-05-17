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
    "ChartUrl": "http://chartsjs-mmontes.rhcloud.com/chart"
    //"ChartUrl": "http://localhost:8080/chart"
});

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/info', {
            templateUrl: 'partials/pages/info.html', 
            controller: 'AccordionInfoCtrl'})
        .when('/manual', {
            templateUrl: 'partials/pages/manual.html', 
            controller: 'ManualCtrl'})
        .when('/random', {
            templateUrl: 'partials/pages/random.html',
            controller: 'RandomCtrl'
        })
        .when('/listCharts', {
            templateUrl: 'partials/pages/listCharts.html',
            controller: 'ChartTableCtrl'
        })
        .when('/chart/:id', {
            templateUrl: 'partials/pages/chartDetails.html',
            controller: 'ChartDetailsCtrl'
        })
        .otherwise({redirectTo: '/info'});
}]);
