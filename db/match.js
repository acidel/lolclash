var Match,
	matchesSchema,
	mongoose = require('mongoose');

exports.setup = function () {
	matchesSchema = mongoose.Schema({
		teams: [String],
		teamsMed: [String],
		teamsLower: [String],
		vodId : String,
		url: [String],
		date: Date,
		result: [Number],
		unranked: Boolean,
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
		hotness: Number,
		vods: [{
			name: String,
			path: String,
			url: String
		}]
	});
	Match = mongoose.model('Match', matchesSchema);
};

exports.insert = function (data, callback) {
	var match = new Match(data);
	match.save(callback || function () {});
};

exports.find = function (query, callback) {
	if (!callback && typeof query === 'function') {
		callback = query;
		query = {};
	}
	Match.find(query, callback);
};

exports.findbydate = function (query, callback) {
	if (!callback && typeof query === 'function') {
		callback = query;
		query = {};
	}
	Match.find(query)
	.sort({date : 1})
	.exec(callback);
};