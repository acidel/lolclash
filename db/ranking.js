var mongoose = require('mongoose'),
	Ranking,
	rankingSchema;

exports.setup = function () {
	rankingSchema = mongoose.Schema({
		date: Date,
		list: [{
			name: String,
			ranking: String,
			region: String
		}]
	});
	Ranking = mongoose.model('Ranking', rankingSchema);
};

exports.insert = function (data, callback) {
 	var ranking = new Ranking(data);
	ranking.save(callback || function () {});
};

exports.update = function(query, data, callback) {
	Ranking.update(query, data, callback);
};

exports.find = function (query, callback) {
	if (!callback && typeof query === 'function') {
		callback = query;
		query = {};
	}
	Ranking.find(query)
	.exec(callback);
};

exports.findone = function (query, callback) {
	if (!callback && typeof query === 'function') {
		callback = query;
		query = {};
	}
	Ranking.find(query)
	.sort({date: -1})
	.limit(1)
	.exec(callback);
};