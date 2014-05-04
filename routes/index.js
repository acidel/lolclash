exports.index = function(db) {
    return function(req, res) {
        doneResults = false;
        doneTeams = false;
        doneTourneys = false;

        function done () { 
            if (doneResults && doneTeams && doneTourneys) {
                res.render('index', {
                        'teams': teamsData,
                        'results' : resultsData,
                        'tourneys' : tourneysData
                });
            }
        }

        db.tourney.findtourneyspage(0,6,function (err, tourneys){
            tourneysData = tourneys;
            doneTourneys = true;
            done();
        });
        db.result.findresultspage(0,6,{result: {$gt:0}},  function (err, results) {
             resultsData = results;
             doneResults = true;
             done();
        });
        db.team.findteamspage(0,10,function (err, teams){
            teamsData = teams;
            doneTeams = true;
            done();

        });
    };
};

exports.buildcalendar = function(db) {
    return function (req, res) {
        var offset = 0;

         if (req.params.id && (isNaN(req.params.id) || req.params.id < -1440 || req.params.id > 1440)) {
            res.send("Error building calendar: invalid timezone data")
         }
         else if (req.params.id) {
                offset = (req.params.id/60);
         }

        //        
        var today = new Date();
        today.setHours(0,0,0,0);
        today.setHours(today.getHours()+offset)

        var thisWeek = new Date(today);
        thisWeek.setDate(today.getDate() - today.getDay()+1);


        var last2Week = new Date(thisWeek);
        var next4Week = new Date(thisWeek);
        var curDay = new Date(today);
        var resultData;

        
        last2Week.setDate(thisWeek.getDate()-14);
        next4Week.setDate(thisWeek.getDate()+28);
        curDay = last2Week

        var calendarData = [];
        var curResult = 0;
        var curDayCounter = 0;

        calendarData[0] = {}
        calendarData[0].date = new Date(curDay);
        calendarData[0].results = [];


        function done() {
        res.render('buildcalendar', {
                'calendarData': calendarData,
            });
        }

        function parseResult () {

            if (resultData[curResult]) {
                var matchDay = new Date(resultData[curResult].date)
            }

            if (curResult >= resultData.length-1 && curDay >= next4Week) {
                done();
            }
            else if (matchDay && matchDay.setHours(0,0,0,0) === curDay.setHours(0,0,0,0)) {
              //  console.log("NEXT RESULTS")

                
                calendarData[curDayCounter].results.push(resultData[curResult])
                curResult++
                parseResult();
            }
            else {
                //this moves to the next day and also sets the next value in calendarData
                curDayCounter++;
                curDay.setDate(curDay.getDate()+1)
                newDate = new Date(curDay)
                calendarData[curDayCounter] = {};
                calendarData[curDayCounter].results = [];          
                calendarData[curDayCounter].date = newDate
                parseResult();

            }
        }

        function timeChange () {
            resultData.forEach(function (result) { 
                result.date.setHours(
                    result.date.getHours()-offset
                    )
            });

            parseResult();
        }

        db.result.findbydate(
                {date: {$gte: last2Week, $lte: next4Week}},
                 function (err, results) {
                    resultData = results;
                    results.reverse()
                    timeChange();
        });
    };
}


exports.calendar = function(db) {
return function (req, res) {
        res.render('calendar', {
            });
    };
};

exports.results = function(db) {
    return function (req, res) {
        //        
        var today = new Date();
        today.setHours(0,0,0,0)

        var yesterday = new Date(today);
        var tomorrow = new Date(today);  
        var thisWeek = new Date(today);
                //
        var resultsToday = [];
        var resultsThisWeek = [];
        var resultsLastWeek = [];
        var resultsYesterday = [];
        var resultsMonth = [];

        var totalMatches = 0;

        function done() {
            res.render('results', {
                    'resultsToday': resultsToday,
                    'resultsYesterday' : resultsYesterday,
                    'resultsThisWeek': resultsThisWeek,
                    'resultsLastWeek': resultsLastWeek,
                    'resultsMonth' : resultsMonth
                });
        }


        tomorrow.setDate(today.getDate()+1);
        yesterday.setDate(today.getDate()-1); 
        thisWeek.setDate(today.getDate() - today.getDay()+1);

        var lastWeek = new Date(thisWeek);
        lastWeek.setDate(lastWeek.getDate()-7);

        var last2Week = new Date(thisWeek);
        last2Week.setDate(lastWeek.getDate()-14);
        

        db.result.findbydate(
                {date: {$gte: lastWeek, $lt: tomorrow}},
                 function (err, results) {
            results.forEach (function (result) {
                
                //either take last 2 weeks of matches, or keep going until we get 40
                if (totalMatches <40 && result.date > lastWeek)
                {

                    var matchDay = new Date(result.date)
                    matchDay.setHours(0,0,0,0)

                        if (matchDay.getDate() === today.getDate()) {
                            resultsToday.push(result);
                        }

                        else if (matchDay.getDate() === yesterday.getDate()) {
                            resultsYesterday.push(result);
                        }

                        else if (matchDay < yesterday &&
                                matchDay >= thisWeek) {
                            resultsThisWeek.push(result);
                        }
                        else if (matchDay <= thisWeek &&
                                matchDay >= lastWeek) {
                            resultsLastWeek.push(result);
                        }
                        else {
                            resultsMonth.push(result)
                        }
                }

                else 
                {
                    done();
                }


                totalMatches++;
            });
            done();
        });
    };
};


exports.teams = function(db) {
    return function(req, res) {

        var skip;
        var page;
        var countData;
        var teamsData;
        var naTeams;
        var euTeams;
        var chinaTeams;
        var koreaTeams;
        var seaTeams;

        if (req.params.id && (isNaN(req.params.id) || req.params.id <=0))
        {
            res.status(404).send('Not Found');
        }
        else if (req.params.id) {
            skip = (req.params.id-1)*20;
            page = req.params.id;
        }
        else {
            skip = 0;
            page = 1;
        }

        function done () {
            if (countData && teamsData && naTeams && euTeams && chinaTeams && koreaTeams && seaTeams) {
                res.render('teams', {
                    'naTeams' : naTeams,
                    'euTeams' : euTeams,
                    'chinaTeams' : chinaTeams,
                    'koreaTeams' : koreaTeams,
                    'seaTeams' : seaTeams,
                    'teams': teamsData, 
                    'page' : page,
                    'count' : countData
                });
            }       
        }

        db.team.countvalidteams(function (err, count)
        {
            countData = count;
            done();
        });
        
        db.team.findteamspage((skip),20,function (err, teams){
            if (teams.length === 0) {
                res.status(404).send('Not found');
            }
            else {
                teamsData = teams;
                done();
            }
        });

        db.team.findteamspage(0,10,{region : "NA"},function (err, teams){
                naTeams = teams;
                done();
        });

        db.team.findteamspage(0,10,{region : "EU"},function (err, teams){
            euTeams = teams;
            done();
        });

        db.team.findteamspage(0,10,{region : "China"},function (err, teams){
                chinaTeams = teams;
                done();
        });

        db.team.findteamspage(0,10,{region : "Korea"},function (err, teams){
                koreaTeams = teams;
                done();
        });

        db.team.findteamspage(0,10,{region : "SEA"},function (err, teams){
                seaTeams = teams;
                done();
        });
    };
};

exports.tourneys = function(db) {
    return function(req, res) {

        var skip;
        var page;
        var countData;
        var tourneysData;

        if (req.params.id && (isNaN(req.params.id) || req.params.id <=0))
        {
            res.status(404).send('Not Found');
        }
        else if (req.params.id) {
            skip = (req.params.id-1)*5;
            page = req.params.id;
        }
        else {
            skip = 0;
            page = 1;
        }
        function done () {
            if (countData && tourneysData) {
                res.render('tourneys', {
                    'tourneys': tourneysData, 
                    'page' : page,
                    'count' : countData
                });
            }       
        }

        db.tourney.counttourneys(function (err, count)
        {
            countData = count;
            done();
        });
        
        db.tourney.findtourneyspage((skip),5,function (err, tourneys){
            if (tourneys[0]) {
                tourneysData = tourneys;
                done();
            }
            else {
                res.status(404).send('Not Found');
            }
        });
    };
};

exports.teamresults = function(db) {
    return function (req, res) {

        var teamUrl = req.params.id.toLowerCase();
        db.team.find({$and: [{

                    urlLower: teamUrl
                
        }, {fake: {$ne : true}}]}, function (err, teams) {


            if (teams.length === 0) {
                res.status(404).send('Not found');
            }

            //flags
            var doneResults = false;
            var doneRankings = false;
            //rendered data
            var teamData = teams[0]
            var resultData = {}
            var namesRender = []; 
            var graphx = []; 
            var graphy = [];
            var graphx2 = [];
            var graphy2 = [];
            //alias storing
            var names = [];

            function done() {
                if (doneRankings === true && doneResults === true) {
                    res.render('teampage', {
                        'results': resultData.slice(0),
                        'teamNames' : namesRender,
                        'team' : teamData,
                        'graphx' : graphx.reverse(),
                        'graphy' : graphy.reverse(),
                    });
                }
            }

            if (teams[0]) {

                teams[0].aliases.forEach(function (team) {
                    names.push(team.name.toLowerCase());
                    namesRender.push(team.name);
                });
                names.push(teams[0].name.toLowerCase());
                namesRender.push(teams[0].name);
                db.result.findbydate({
                    teamsLower: {
                        $in: names
                    }
                }, function (err, results) {

                    for (var i = 0; i < results.length; i++) {
                        //SWAPPING the team positions in arrays so queried team is first
                        if (names.indexOf(results[i].teamsLower[0]) === -1) {
                                var tempTeam = results[i].teams[0],
                                    tempTeamMed = results[i].teamsMed[0],
                                    tempTeamLower = results[i].teamsLower[0],
                                    tempEloBefore = results[i].eloBefore[0],
                                    tempEloAfter = results[i].eloAfter[0],
                                    tempLogos = results[i].logos.team1,
                                    tempResult = results[i].result[0];
                                    tempUrl = results[i].url[0];

                                    results[i].teams[0] = results[i].teams[1];
                                    results[i].teamsMed[0] = results[i].teamsMed[1];
                                    results[i].teamsLower[0] = results[i].teamsLower[1];
                                    results[i].eloBefore[0] = results[i].eloBefore[1];
                                    results[i].eloAfter[0] = results[i].eloAfter[1];
                                    results[i].logos.team1 = results[i].logos.team2;
                                    results[i].result[0] = results[i].result[1];
                                    results[i].url[0] = results[i].url[1];

                                    results[i].teams[1] = tempTeam;
                                    results[i].teamsMed[1] = tempTeamMed;
                                    results[i].teamsLower[1] = tempTeamLower;
                                    results[i].eloBefore[1] = tempEloBefore;
                                    results[i].eloAfter[1] = tempEloAfter;
                                    results[i].logos.team2 = tempLogos;
                                    results[i].result[1] = tempResult;
                                    results[i].url[1] = tempUrl;
                                
                            }


                        if ( (!results[i-1] || results[i].date.getDate()!== results[i-1].date.getDate() || results[i].date.getMonth()!== results[i-1].date.getMonth())
                                && (results[i].date < new Date())
                            ) {
                            graphx.push (results[i].date);
                            graphy.push (Math.round(results[i].eloAfter[0]));
                        }   
                    }
                    resultData = results;

                    graphx.push(results[results.length-1].date);
                    graphy.push(1200);
                    doneResults = true;
                    done();

                /*db.ranking.find({name : teams[0].name}, function (err, rankings) {

                    rankings.forEach (function (ranking) {
                        graphx2.push(ranking.date.toDateString())
                        graphy2.push(ranking.ranking)
                    });*/
                    
                    doneRankings = true;
                    done();
                });
            }
        });
    };
};

exports.vod = function(db) {

    return function (req, res) {

        var doneResults = false;
        var doneTourney = false;
        var doneVod = false;
        var teams = [];
        var eventResults = [];
        var tourneyData = {};

        function done(){
            if (doneResults && doneTourney && doneVod) { 
                res.render('vodpage', {
                    'teams' : teams,
                    'eventResults': eventResults,
                    'tourneyData' : tourneyData,
                    'vodPath' : vodName
                });

            }
        }

        function inObject(arr, search) {
            var len = arr.length;
            while( len-- ) {
                if(arr[len].name === search)
                   return true;
            }
        }

        var vodName = req.params.vodName;
        var vodId = req.params.vodId;
        var eventId = req.params.eventId;

        db.result.find ({vodId: vodId.toLowerCase()}, function (err, results) {
            var foundVod = false;

            if (results[0]) {
                vodData = results[0]
                doneVod = true;
                results[0].vods.forEach(function(vod) {
                    if (vod.pathLower === vodName.toLowerCase()) {
                        foundVod = true;
                    }
                });

                if (foundVod === false) {
                    res.status(404).send('Not found');
                }
                else {
                done();
                }
            }
            else{
                res.status(404).send('Not found');
            }

        });
        
        db.tourney.find({urlLower : eventId.toLowerCase()}, function (err, tourneys) {
            if (tourneys[0]) {
                tourneyData = tourneys[0];
                doneTourney = true;
                done();
            }
            else {
                res.status(404).send('Not found');
            }

            db.result.findbydate(
                {eventName : tourneys[0].name},
                function (err, results) {
                    var types = {},
                    newItem, i, j, cur;
                        for (i = 0, j = results.length; i < j; i++) {

                            var ri = results.length-i-1;

                            if (!inObject(teams, results[ri].teamsMed[0])) {
                                var newTeam = {};
                                newTeam.name = results[ri].teamsMed[0];
                                newTeam.url = results[ri].url[0];
                                newTeam.elo = results[ri].eloBefore[0];
                                newTeam.logos = results[ri].logos.team1;

                                teams.push(newTeam);
                            }

                            if (!inObject(teams, results[ri].teamsMed[1])) {
                                var newTeam = {};
                                newTeam.name = results[ri].teamsMed[1];
                                newTeam.url = results[ri].url[1];
                                newTeam.elo = results[ri].eloBefore[1];
                                newTeam.logos = results[ri].logos.team2;

                                teams.push(newTeam);
                            }

                            cur = results[i];

                            if (cur.result[0]+cur.result[1] > 0 && types[cur.eventSub] && types[cur.eventSub].progress !== "Completed") { 

                               types[cur.eventSub].progress = "In Progress"

                            }

                            if (!(cur.eventSub in types)) {
                                types[cur.eventSub] = {sub: cur.eventSub, stage: cur.eventStage, endDate: cur.date, results: []};
                                
                                if (cur.result[0]+cur.result[1] > 0) {
                                    types[cur.eventSub].progress = "Completed"
                                }
                                if (!types[cur.eventSub].progress)
                                {
                                    types[cur.eventSub].progress = "Upcoming"

                                }
                                eventResults.push(types[cur.eventSub]);
                            }

                            
                            types[cur.eventSub].startDate = cur.date;
                            types[cur.eventSub].results.push(cur);
                        }

                    teams.sort(function(a, b) { 
                            if(a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                            if(a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                            return 0;
                    });
                doneResults = true;
                done();
            });

        });
    };
};

exports.eventresults = function(db) {

    return function (req, res) {

        var doneResults = false;
        var doneTourney = false;
        var teams = [];
        var eventResults = [];
        var tourneyData = {};

        function done(){
            if (doneResults && doneTourney) { 
                res.render('eventpage', {
                    'teams' : teams,
                    'eventResults': eventResults,
                    'tourneyData' : tourneyData
                });

            }
        }

        function inObject(arr, search) {
            var len = arr.length;
            while( len-- ) {
                if(arr[len].name === search)
                   return true;
            }
        }

        

        var eventId = req.params.id.toLowerCase();

        db.tourney.find({urlLower : eventId}, function (err, tourneys) {
            if (!tourneys || tourneys.length < 1) {
                res.status(404).send('Not found');
            }

            tourneyData = tourneys[0];
            doneTourney = true;

            db.result.findbydate(
            {$and: [ {eventName : tourneys[0].name}, {result: {$gt:-1}} ]},
            function (err, results) {
                var types = {},
                newItem, i, j, cur;
                    for (i = 0, j = results.length; i < j; i++) {

                        var ri = results.length-i-1;

                        if (!inObject(teams, results[ri].teamsMed[0])) {
                            var newTeam = {};
                            newTeam.name = results[ri].teamsMed[0];
                            newTeam.url = results[ri].url[0];
                            newTeam.fake = results[ri].fake[0];
                            newTeam.elo = results[ri].eloBefore[0];
                            newTeam.logos = results[ri].logos.team1;

                            teams.push(newTeam);
                        }

                        if (!inObject(teams, results[ri].teamsMed[1])) {
                            var newTeam = {};
                            newTeam.name = results[ri].teamsMed[1];
                            newTeam.url = results[ri].url[1];
                            newTeam.fake = results[ri].fake[1];
                            newTeam.elo = results[ri].eloBefore[1];
                            newTeam.logos = results[ri].logos.team2;

                            teams.push(newTeam);
                        }

                        cur = results[i];

                        if (cur.result[0]+cur.result[1] > 0 && types[cur.eventSub] && types[cur.eventSub].progress !== "Completed") { 

                           types[cur.eventSub].progress = "In Progress"

                        }

                        if (!(cur.eventSub in types)) {
                            types[cur.eventSub] = {sub: cur.eventSub, stage: cur.eventStage, endDate: cur.date, results: []};
                            
                            if (cur.result[0]+cur.result[1] > 0) {
                                types[cur.eventSub].progress = "Completed"
                            }
                            if (!types[cur.eventSub].progress)
                            {
                                types[cur.eventSub].progress = "Upcoming"

                            }
                            eventResults.push(types[cur.eventSub]);
                        }

                        
                        types[cur.eventSub].startDate = cur.date;
                        types[cur.eventSub].results.push(cur);
                    }

                teams.sort(function(a, b) { 
                        if(a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                        if(a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                        return 0;
                });
            doneResults = true;
            done();
            });
        });

        
    };
};