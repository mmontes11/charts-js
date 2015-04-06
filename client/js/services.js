
'use strict';

/* services */

var services = angular.module('services', ['ngResource']);

services.factory('Chart', ['$resource','Config', function ($resource,Config) {
    return $resource(
        //Resource URL
        Config.ChartUrl,
        //Default Parameters
        null,
        //Actions
        {
            minRandom: {
                method: 'GET',
                params: {
                    numXaxis: 2,
                    numYaxis: 2,
                    min: 0,
                    max: 20
                },
                isArray: false
            },
            maxRandom: {
                method: 'GET',
                params: {
                    numXaxis: 10,
                    numYaxis: 10,
                    min: 0,
                    max: 100
                },
                isArray: false
            },
            findAll: {
                method: 'GET',
                url: Config.ChartUrl + '/all',
                isArray: true
            },
            findByID: {
                method: 'GET',
                url: Config.ChartUrl + '/:id',
                isArray: false
            }
        }
    );
}]);


services.service('Random', function () {
    this.getRandomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    this.getRandomColor = function () {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
});




