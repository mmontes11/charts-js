'use strict';

/* Directives */


var directives = angular.module('directives', []);

directives.directive('navbar',['$location', function($location){
	return {
		restrict: "E",
		templateUrl: "partials/navbar.html",
		link: function(scope) {
			scope.isActive = function(path) {
				return path === $location.path();
			};
		}
	};	
}]);

directives.directive('chart',function(){
	return {
		restrict: "E",
		controller: "ChartCtrl",
		templateUrl: "partials/chart.html",
		link: function(scope, element, attributes){
			if (attributes.chartType === "form"){
				$('#chart').highcharts(scope.chartFormConfig);
			}
			if (attributes.chartType === "ws"){
				$('#chart').highcharts(scope.chartWebServiceConfig);
			}			
        }
	};	
})
