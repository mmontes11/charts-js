'use strict';

/* Services */

var services = angular.module('services', ['ngResource']);

var amazonUrl = 'http://ec2-54-165-61-101.compute-1.amazonaws.com:8080/';
var apiUrl = 'http://localhost:8080/api/';
var serviceConfig = {
	pingUrl: amazonUrl + 'ping',
	randomChartUrl: amazonUrl + 'chart/random',
	chartsUrl: apiUrl + 'charts'
};


services.factory('Ping',  function(){
	return {
		getUrl: function(){
			return serviceConfig.pingUrl;
		}
	}
});

services.factory('RandomChart', ['$resource', function($resource){
	return $resource( 
		//Resource URL
		serviceConfig.randomChartUrl + '?numXaxis=:numXaxis&numYaxis=:numYaxis&min=:min&max=:max',
		//Default URL params
		{numXaxis: 3, numYaxis: 3, min: 0, max: 10},
		//Resource method
		{max: {method: 'GET', params:{numXaxis: 10, numYaxis: 10, min: 0, max: 100}}}
	);	
}]);

services.factory('Chart', ['$resource', function($resource){
	return $resource( 
		//Resource URL
		serviceConfig.chartsUrl ,
		//Default Parameters
		{},
		//CustomActions
		{},
		//Options
		{}
	);	
}]);




