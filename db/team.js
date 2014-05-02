var mongoose = require('mongoose'),
	Team,
	teamSchema;

exports.setup = function () {
	teamSchema = mongoose.Schema({
		fake: Boolean,
		name: String,
		nameMed: String,
		nameShort: String,
		url: String,
		urlLower : String,
		delta: Number,
		placements: {type: Number,
				default: 0},
		nameLong: String,
		aliases: [{
			name: String,
			date: Date
		}],
		elo: Number,
		ranking: Number,
		regionRanking : Number,
		country: {
			type: String,
			default: 'unknown'
		},
		region : String,
		active: {type : Boolean,
			default: 1
		},
		logos: [String],
		games: {
			type: Number,
			default: 0
		},
		wins: { type: Number,
				default: 0
		},
		losses: { type: Number,
				default: 0
		}
	});
	Team = mongoose.model('Team', teamSchema);
};

exports.insert = function (data, callback) {
 	var team = new Team(data);
	team.save(callback || function () {});
};

exports.update = function(query, data, callback) {
	Team.update(query, data, callback);
};

exports.find = function (query, callback) {
	if (!callback && typeof query === 'function') {
		callback = query;
		query = {};
	}
	Team.find(query, callback);
};

exports.updateelo = function (team, newelo, wins, losses, placements,callback) {
	var games = wins+losses;
	Team.update({$or: [{name : team}, { aliases: { $elemMatch: { name: team } } }]}, 
			{
				elo : newelo,
				placements : placements, 	
				$inc : { games : games, 
						wins : wins,
						losses : losses,
					   },				
			}, {multi : true}, function (err, response){
		callback();
	});
};

exports.findbyelo = function (query, callback) {
	if (!callback && typeof query === 'function') {
		callback = query;
		query = {};
	}
	Team.find(query)
	.sort({elo : -1})
	.exec(callback);
};

exports.findvalidteams = function (query, callback) {
	if (!callback && typeof query === 'function') {
		callback = query;
		query = {};
	}

	Team.find({$and: [{games : { $gte : 15 }}, {active : 1}]})
	.sort({elo : -1})
	.exec(callback);
};

exports.countvalidteams = function (query, callback) {
	if (!callback && typeof query === 'function') {
		callback = query;
		query = {};
	}

	Team.find({$and: [{games : { $gte : 15 }}, {active : 1}]})
	.count()
	.exec(callback);
};

exports.findteamspage = function (skip, limit, query, callback) {
	if (!callback && typeof query === 'function') {
		callback = query;
		query = {};
	}

	Team.find({$and: [query, {games : { $gte : 15 }}, {active : 1}]})
	.sort({elo : -1})
	.skip(skip)
	.limit(limit)
	.exec(callback);
};