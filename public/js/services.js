'use strict';

/* Services */

var services = angular.module('services', ['ngResource']);

var rootUrl = 'http://ec2-54-165-61-101.compute-1.amazonaws.com:8080/';
var serviceConfig = {
						pingUrl: rootUrl + 'ping',
						randomChartUrl: rootUrl + 'chart/random'
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




