var Result,
	resultsSchema,
	mongoose = require('mongoose');

exports.setup = function () {
	resultsSchema = mongoose.Schema({
		teams: [String],
		teamsMed: [String],
		teamsShort: [String],
		teamsLower: [String],
		vodId : String,
		url: [String],
		date: Date,
		result: [Number],
		eloBefore: [Number],
		eloAfter: [Number],
		logos: ({
			team1: [String],
			team2: [String]
		}),
		eventName: String,
		eventStage: String,
		eventSub: String,
		eventUrl: String,
		region: String,
		unranked: Boolean,
		fake: [Boolean],
		hotness: Number,
		vods: [{
			name: String,
			path: String,
			url: String
		}]
	});
	Result = mongoose.model('Result', resultsSchema);
};

exports.insert = function (data, callback) {
	var result = new Result(data);
	result.save(callback || function () {});
};

exports.find = function (query, callback) {
	if (!callback && typeof query === 'function') {
		callback = query;
		query = {};
	}
	Result.find(query, callback);
};

exports.count = function (query, callback) {
	if (!callback && typeof query === 'function') {
		callback = query;
		query = {};
	}
	Result.find(query)
	.count()
	.exec(callback)
};

exports.findbydate = function (query, callback) {
	if (!callback && typeof query === 'function') {
		callback = query;
		query = {};
	}
	Result.find(query)
	.sort({date : -1, region: -1})
	.exec(callback);
};

exports.findresultspage = function (skip, limit, query, callback) {
	if (!callback && typeof query === 'function') {
		callback = query;
		query = {};
	}

	Result.find(query)
	.sort({date : -1, region: -1})
	.skip(skip)
	.limit(limit)
	.exec(callback);
};
