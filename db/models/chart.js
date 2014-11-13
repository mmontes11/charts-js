var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ChartSchema = new Schema({
				      chart: {
				          type: {type : String, default: ''}
				      },
				      title: {
				          text: {type : String, default: ''}
				      },
				      xAxis: {
				          categories: []
				      },
				      yAxis: {
				          title: {
				              text: {type : String, default: ''}
				          }
				      },
				      series: []
				});

module.exports = mongoose.model('Chart',ChartSchema);