'use strict';

/* Controllers */

var controllers = angular.module('controllers', []);


controllers.controller('AccordionInfoCtrl', ['$scope', function($scope) {
  $scope.groups = [
    {
      title: 'Form',
      content: 'Draw a chart using data from a Form.'
    },
    {
      title: 'WebService',
      content: 'Get data from a WebService and represent a random chart.'
    },
    {
      title: 'Highcharts-ng',
      content: 'Example of highcharts-ng directive.'
    }
  ];
}]);

controllers.controller('ChartCtrl', ['$scope', function($scope) {
    $scope.chartFormConfig = {
          chart: {
              type: 'line'
          },
          title: {
              text: 'Candy Consumption'
          },
          xAxis: {
              categories: ['Lollipops', 'Jelly Beans', 'Bubble Gum']
          },
          yAxis: {
              title: {
                  text: 'Candy eaten'
              }
          },
          series: [{
              name: 'Martin',
              data: [3, 4, 3],
          },
          {
              name: 'John',
              data: [5, 1, 8]
          },
          {
              name: 'Stacy',
              data: [8, 2, 7]
          }]
     };

    $scope.chartWebServiceConfig= {
        chart: {
              type: 'line'
        },
        title: {
              text: 'This chart will be filled by the WebService'
        },
        xAxis: {
              categories: ['Category1', 'Category2', 'Category3', 'Category4', 'Category5' ]
        },
        yAxis: {
              title: {
                  text: 'Series'
              }
        },
        series: [{
              name: 'Serie',
              data: [1, 2, 3, 4, 5],
        }]
    };

  //Form Chart Operations
  $scope.addConsumer = function (name, dashStyle, color, data){
    $scope.chartFormConfig.series.push({ name: name, dashStyle: dashStyle, color: color, data: data});
    $('#chart').highcharts($scope.chartFormConfig);
   }
    
  $scope.$on("UPDATE_CHART_FORM", function(event, data){
    $scope.addConsumer(data.name, data.dashstyle, data.linecolor, data.series);
  });

  
  //WebService Chart Operations
  $scope.updateChartWS = function (jsonChart){
    $('#chart').highcharts(jsonChart);
  }

  $scope.$on("UPDATE_CHART_WS", function(event, data){
    $scope.updateChartWS(data);
  });

}]);


controllers.controller('ChartFormCtrl', ['$scope', function($scope) {
  $scope.candies = [  { "name" : "Lollipops", "quantity" : "" } , 
            { "name" : "Jelly Beans", "quantity" : "" } , 
            { "name" : "Bubble Gum", "quantity" : "" } ];
  
  $scope.dashstyles = [   {"id": "Solid", "title": "Solid"},
              {"id": "ShortDash", "title": "ShortDash"},
              {"id": "ShortDot", "title": "ShortDot"},
              {"id": "ShortDashDot", "title": "ShortDashDot"},
              {"id": "ShortDashDotDot", "title": "ShortDashDotDot"},
              {"id": "Dot", "title": "Dot"},
              {"id": "Dash", "title": "Dash"},
              {"id": "LongDash", "title": "LongDash"},
              {"id": "DashDot", "title": "DashDot"},
              {"id": "LongDashDot", "title": "LongDashDot"},
              {"id": "LongDashDotDot", "title": "LongDashDotDot"} ];

  $scope.addconsumer = function (){
    var series = [];
    $.each($scope.candies, function(key, element){
      series.push({
        color: $scope.pointcolor,
        y: parseInt(element.quantity)
      });
    }); 
    $scope.$broadcast("UPDATE_CHART_FORM",{name: $scope.name, dashstyle: $scope.dashstyle, linecolor: $scope.linecolor, series: series});
  }
}]);

controllers.controller('ChartWebServiceCtrl', 
  ['$scope','$location', '$http', 'Ping', 'RandomChart', function($scope, $location, $http, Ping, RandomChart){   
  $scope.jsonData = "";

  $http({
      method: 'GET',
      url: Ping.getUrl(),
    }).success(function(data){
      $scope.wsEnabled = true;
    }).error(function(){
      $scope.wsEnabled = false;
      $location.url("errorWS");
    });

  $scope.randomChart = function(chartType){

    var params = {numXaxis: $scope.numX, numYaxis: $scope.numY, min: $scope.min, max: $scope.max};

    var updateChart = function(data){
      $scope.jsonData = data;
      $scope.$broadcast("UPDATE_CHART_WS", data);
    };

    switch (chartType) {
      case 0:
        var data = RandomChart.get(params, function(){
          updateChart(data);
        });
        break;
      case 1:
        var data = RandomChart.get({}, function(){
          updateChart(data); 
        });
        break;
      default:
        var data = RandomChart.max({}, function(){
          updateChart(data);   
        });
        break;
    }
  }
}]);


controllers.controller('HighchartsNgCtrl', ['$scope', function($scope){
  $scope.chartTypes = [
    {"id": "line", "title": "Line"},
    {"id": "spline", "title": "Smooth line"},
    {"id": "area", "title": "Area"},
    {"id": "areaspline", "title": "Smooth area"},
    {"id": "column", "title": "Column"},
    {"id": "bar", "title": "Bar"},
    {"id": "pie", "title": "Pie"},
    {"id": "scatter", "title": "Scatter"}
  ];

  $scope.dashStyles = [
    {"id": "Solid", "title": "Solid"},
    {"id": "ShortDash", "title": "ShortDash"},
    {"id": "ShortDot", "title": "ShortDot"},
    {"id": "ShortDashDot", "title": "ShortDashDot"},
    {"id": "ShortDashDotDot", "title": "ShortDashDotDot"},
    {"id": "Dot", "title": "Dot"},
    {"id": "Dash", "title": "Dash"},
    {"id": "LongDash", "title": "LongDash"},
    {"id": "DashDot", "title": "DashDot"},
    {"id": "LongDashDot", "title": "LongDashDot"},
    {"id": "LongDashDotDot", "title": "LongDashDotDot"}
  ];

  $scope.chartSeries = [
    {"name": "Some data", "data": [1, 2, 4, 7, 3]},
    {"name": "Some data 3", "data": [3, 1, null, 5, 2], connectNulls: true},
    {"name": "Some data 2", "data": [5, 2, 2, 3, 5], type: "column"},
    {"name": "My Super Column", "data": [1, 1, 2, 3, 2], type: "column"}
  ];

  $scope.chartStack = [
    {"id": '', "title": "No"},
    {"id": "normal", "title": "Normal"},
    {"id": "percent", "title": "Percent"}
  ];

  $scope.addPoints = function () {
    var seriesArray = $scope.chartConfig.series;
    var rndIdx = Math.floor(Math.random() * seriesArray.length);
    seriesArray[rndIdx].data = seriesArray[rndIdx].data.concat([1, 10, 20])
  };

  $scope.addSeries = function () {
    var rnd = []
    for (var i = 0; i < 10; i++) {
      rnd.push(Math.floor(Math.random() * 20) + 1)
    }
    $scope.chartConfig.series.push({
      data: rnd
    })
  }

  $scope.removeRandomSeries = function () {
    var seriesArray = $scope.chartConfig.series;
    var rndIdx = Math.floor(Math.random() * seriesArray.length);
    seriesArray.splice(rndIdx, 1)
  }

  $scope.removeSeries = function (id) {
    var seriesArray = $scope.chartConfig.series;
    seriesArray.splice(id, 1)
  }

  $scope.toggleHighCharts = function () {
    this.chartConfig.useHighStocks = !this.chartConfig.useHighStocks
  }

  $scope.replaceAllSeries = function () {
    var data = [
      { name: "first", data: [10] },
      { name: "second", data: [3] },
      { name: "third", data: [13] }
    ];
    $scope.chartConfig.series = data;
  };

  $scope.chartConfig = {
    options: {
      chart: {
        type: 'areaspline'
      },
      plotOptions: {
        series: {
          stacking: ''
        }
      }
    },
    series: $scope.chartSeries,
    title: {
      text: 'highcharts-ng directive example'
    },
    credits: {
      enabled: true
    },
    loading: false,
    size: {}
  }

  $scope.reflow = function () {
    $scope.$broadcast('highchartsng.reflow');
  };

}]);