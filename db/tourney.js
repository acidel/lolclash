var mongoose = require('mongoose'),
	Tourney,
	tourneySchema;

exports.setup = function () {
	tourneySchema = mongoose.Schema({
		name: String,
		startDate: Date,
		url: String,
		website: String,
		region: String,
		endDate: Date,
		description: String,
		score: Number,
		bio: String,
		related: [{
			name: [String],
			url: [String]
		}],
		progress: String
	});
	Tourney = mongoose.model('Tourney', tourneySchema);
};

exports.insert = function (data, callback) {
 	var tourney = new Tourney(data);
	tourney.save(callback || function () {});
};

exports.update = function(query, data, callback) {
	Tourney.update(query, data, callback);
};

exports.find = function (query, callback) {
	if (!callback && typeof query === 'function') {
		callback = query;
		query = {};
	}
	Tourney.find(query, callback);
};

exports.counttourneys = function (query, callback) {
	if (!callback && typeof query === 'function') {
		callback = query;
		query = {};
	}

	Tourney.find()
	.count()
	.exec(callback);
};

exports.findtourneyspage = function (skip, limit, query, callback) {
	if (!callback && typeof query === 'function') {
		callback = query;
		query = {};
	}

	Tourney.find()
	.sort({score : -1, endDate : -1})
	.skip(skip)
	.limit(limit)
	.exec(callback);
};