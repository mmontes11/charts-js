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

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/info', {templateUrl: 'partials/info.html', controller: 'AccordionInfoCtrl'}); 	
  $routeProvider.when('/chartForm', {templateUrl: 'partials/chartForm.html', controller: 'ChartFormCtrl'});
  $routeProvider.when('/chartWebService', {templateUrl: 'partials/chartWebService.html', controller: 'ChartWebServiceCtrl'}); 
	$routeProvider.when('/highcharts-ng', {templateUrl: 'partials/highcharts-ng.html', controller: 'HighchartsNgCtrl'});
  $routeProvider.when('/errorWS', {templateUrl: 'partials/errors/errorWS.html'});    			
	$routeProvider.otherwise({redirectTo: '/info'});
}]);
