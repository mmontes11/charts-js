'use strict';

/* services */

var services = angular.module('services', ['ngResource']);

services.factory('Chart', ['$resource','Config', function ($resource,Config) {
    return $resource(
        //Resource URL
        Config.ChartUrl + '?numXaxis=:numXaxis&numYaxis=:numYaxis&min=:min&max=:max',
        //Default URL params
        {numXaxis: 3, numYaxis: 3, min: 0, max: 10},
        //Resource method
        {max: {method: 'GET', params: {numXaxis: 10, numYaxis: 10, min: 0, max: 100}}},
        {min: {method: 'GET', params: {numXaxis: 1, numYaxis: 1, min: 0, max: 20}}}
    );
}]);




