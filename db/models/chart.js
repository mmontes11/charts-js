var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ChartSchema = new Schema({
    type: {type: String, default: ''},
    description: {type: String, default: ''},
    data: {type: Object},
    creationDate: {type: Date, default: Date.now}
});

var chartModel = mongoose.model('Chart', ChartSchema);

exports.chartModel = chartModel;