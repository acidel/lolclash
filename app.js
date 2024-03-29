if (process.env.NODETIME_ACCOUNT_KEY) {
	require('nodetime').profile({
	    accountKey: process.env.NODETIME_ACCOUNT_KEY,
	    appName: 'LoLClash'
	});
}

var app,
	db = require('./db'),
	express = require('express'),
	http = require('http'),
	path = require('path'),
	routes = require('./routes');

app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



db.setup(function () {
	app.get('/', routes.index(db));
	app.get('/Creating-a-rating-system-for-LoL', routes.ratingarticle(db));
	app.get('/ajax/loadcalendar/:id', routes.buildcalendar(db) );
	app.get('/calendar', routes.calendar(db));
	app.get('/calendar/time/:id', routes.calendar(db));
	app.get('/teams', routes.teams(db));
	app.get('/results', routes.results(db));
	app.get('/teams', routes.teams(db));
	app.get('/teams/page/:id', routes.teams(db));
	app.get('/teams/:id', routes.teamresults(db));
	app.get('/vods/:id', routes.eventresults(db));
	app.get('/vods/:eventId/:vodId/:vodName', routes.vod(db));
	app.get('/vods', routes.tourneys(db));
	app.get('/vods/page/:id', routes.tourneys(db));
});

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
