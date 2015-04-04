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
})

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/info', {templateUrl: 'partials/info.html', controller: 'AccordionInfoCtrl'});
    $routeProvider.when('/form', {templateUrl: 'partials/form.html', controller: 'FormCtrl'});
    $routeProvider.when('/random', {
        templateUrl: 'partials/random.html',
        controller: 'RandomCtrl'
    });
    $routeProvider.otherwise({redirectTo: '/info'});
}]);
