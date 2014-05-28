var db,
    fs = require('fs'),
    async = require('async'),
    mongo = require('mongodb'),
    moment = require('moment'),
    mongoose = require('mongoose'),
    match = require('./match'),
    result = require('./result'),
    tourney = require('./tourney'),
    team = require('./team'),
    ranking = require('./ranking');

// Setup db connection and all that gay shit
exports.setup = function (callback) {
    mongoose.connect(process.env.MONGOLAB_URI);
    //mongoose.connect('mongodb://localhost/asdf');
    db = mongoose.connection;

    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        match.setup();
        team.setup();
        ranking.setup();
        result.setup();
        tourney.setup();
        if (callback && typeof callback === 'function') {
            callback();
        }
    });
};

exports.match = {
    find: match.find,
    findbydate : match.findbydate
}; 

exports.team = {
    find: team.find,
    findbyelo: team.findbyelo,
    findvalidteams: team.findvalidteams,
    findteamspage: team.findteamspage,
    countvalidteams: team.countvalidteams
};

exports.tourney = {
    find: tourney.find,
    findtourneyspage: tourney.findtourneyspage,
    counttourneys: tourney.counttourneys
};

exports.result = {
    find: result.find,
    findbydate: result.findbydate,
    findresultspage: result.findresultspage
};

exports.ranking = {
    find: ranking.find
}

exports.migrate = function () {

    function updateTeams () {
        fs.readFile('migrations/team.csv', 'utf8', function (err, data) {
            var regionDataArray = data.split('\r\n'),
                i = regionDataArray.length,
                j = 0;

            regionDataArray.forEach(function (regionData) {
                var data = regionData.split(',');
                if (data[5] && data[5].length !== 0) {
                    var nameMed = data[5]
                }
                else {
                    var nameMed = data[0]
                }

                if (data[6] && data[6].length !== 0) {
                    var nameLong = data[6]
                }
                else {

                    var nameLong = data[0]
                }

                if (data[4] && data[4].length !== 0) {
                    var nameShort = data[4]
                }
                else {

                    var nameShort = data[0]
                }

                var url = nameLong.replace(/[\. ,:-]+/g, "-");
                var urlLower = url.toLowerCase();

                var logos = [];
                logos[0] = "Invalid";
                for (var i=1;i<=5;i++) {
                    logos[i] = "Unknown.png"
                    if (logosDir[i].indexOf(nameLong.replace(/[\. ,:-]+/g, "-") + '.png') !== -1) {
                        logos[i] = (nameLong.replace(/[\. ,:-]+/g, "-") + '.png')
                    }
                    else if (logosDir[i].indexOf(nameMed.replace(/ /g, "-") + '.png') !== -1) {
                        logos[i] = (nameMed.replace(/[\. ,:-]+/g, "-") + '.png')
                    }
                    else if (logosDir[i].indexOf(nameShort.replace(/ /g, "-") + '.png') !== -1) {
                        logos[i] = (nameShort.replace(/[\. ,:-]+/g, "-") + '.png')
                    }
                    else if (logosDir[i].indexOf(data[0].replace(/ /g, "-") + '.png') !== -1) {
                        logos[i] = (data[0].replace(/[\. ,:-]+/g, "-") + '.png')
                    }
                }

                team.update({
                    name: data[0]
                },
                {
                    url: url,
                    urlLower: urlLower,
                    country: data[1],
                    logos : logos,
                    region: data[2],
                    active: data[3],
                    fake: !!data[7],
                    nameMed: nameMed,
                    nameLong: nameLong,
                    nameShort: nameShort
                }, function () {
                    j++;
                    if (j === i) {
                        updateTourneys();
                        console.log ("done teams...")
                    }
                });
            });
        });
    };

    function updateTourneys () {
        fs.readFile('migrations/tourney.csv', 'utf8', function (err, data) {
            var regionDataArray = data.split('\r\n'),
                i = regionDataArray.length,
                j = 0;

            regionDataArray.forEach(function (regionData) {
                var data = regionData.split('~');
                var related = [];


                var progress = data[1]
                var region = data[2]
                var website = data[3]
                
                var description = data[5]
               
                if (data[4]){
                    var score = data[4]
                }
                else {
                    var score = 0
                }

                for (var k = 6; k < data.length; k++) {
                    var rSplit = data[k].split('#');

                    if (rSplit[0] && rSplit[1]) {
                        var newRelated = {};
                        newRelated.name = rSplit[0]
                        newRelated.url = rSplit[1].replace(/[\. ,:-]+/g, "-")

                        related.push(newRelated); 
                    }                                        
                }

                tourney.update({
                    name: data[0]
                },
                {
                    website: website,
                    region: region,
                    progress : progress,
                    description : description,
                    score : score,
                    related : related

                }, function () {
                    console.log (j)
                    j++;
                    if (j === i) {
                        console.log("done tourneys...exit!")
                        process.exit();
                    }
                });
            });
        });
    };



    var aliases = {},
        teams = {};
    var logosDir = [];
    var eventLogosDir = [];
    var tourneys = [];

    for (var i=1;i<=5;i++) {
        logosDir[i] = fs.readdirSync('public/img/logo/'+ i + '/')
    }

    for (var i=1;i<=3;i++) {
        eventLogosDir[i] = fs.readdirSync('public/img/event-logo/'+ i + '/')
    }
        

    function createTeam(teamName, callback) {


        var teamData = {};
        if (teams[teamName]) {
            return;
        }
        teams[teamName] = aliases[teamName] || [];
        teamData.name = teamName;
        teamData.nameMed = teamName;
        teamData.nameLong = teamName;
        teamData.nameShort = teamName;
        teamData.url = teamName.replace(/[\. ,:-]+/g, "-");
        teamData.urlLower = teamData.url.toLowerCase();
        teamData.elo = 1200;
        teamData.aliases = [];
        teamData.logos = [];
        teams[teamName].forEach(function (name) {
                teamData.aliases.push({
                name: name,
                date: new Date(Date.now())
                });
            });

        teamData.logos[0] = "invalid"
        for (var i=1;i<=5;i++) {
            teamData.logos[i] = "Unknown.png"
            if (logosDir[i].indexOf(teamName.replace(/ /g, "-") + '.png') !== -1) {
                teamData.logos[i] = (teamName.replace(/ /g, "-") + '.png')
            }
        }
        

        team.insert(teamData, callback);
    }

    function createTourney(tourneyData, callback) {
        if (tourneys.indexOf(tourneyData.name) !== -1) {
            return;
        }

        tourneyData.logos = [];

            tourneyData.logos[0] = "invalid"
            for (var i=1;i<=3;i++) {
                tourneyData.logos[i] = "Unknown.png"
                if (eventLogosDir[i].indexOf(tourneyData.name.replace(/ /g, "-") + '.png') !== -1) {
                    tourneyData.logos[i] = (tourneyData.name.replace(/ /g, "-") + '.png')
                }
            }


        tourneys.push(tourneyData.name)
        tourney.insert(tourneyData, callback);
    }

    fs.readFile('migrations/alias.csv', 'utf8', function (err, data) {
        data.split('\r\n').forEach(function (line) {
            var arr = line.split(',');
            arr.forEach(function (alias, index) {
                if (index === 0) {
                    aliases[alias] = [];
                } else {
                    aliases[arr[0]].push(alias);
                }
            });
            for (alias in aliases) {
                createTeam(alias);
            }
        });
        fs.readFile('migrations/testdata.csv', 'utf8', function (err, data) {

            var matchesSaved = 0,
                numTourneys = 0,
                tourneysSaved = 0,
                numMatches = 0,
                numTeams = 0,
                teamsSaved = 0;

            function done (err, product) {
                if (product.elo) {
                    teamsSaved++;
                } else if (product.result) {
                    matchesSaved++;
                }
                else
                {
                    tourneysSaved++;
                }
                if (matchesSaved === numMatches && teamsSaved === numTeams && tourneysSaved === numTourneys) {
                    console.log("done matches...")
                    updateTeams();
                }
            }

            team.find(function (err, teamArr) {
                teamArr.forEach(function (t) {
                    teams[t.name] = aliases[t.name] || [];
                });
                data.split('\r\n').forEach(function (line) {
                        var arr = line.split(','),
                            matchData = {};

                        if (arr.length > 1) {
                            matchData.teams = [arr[0], arr[1]];
                            matchData.teamsLower = [arr[0].toLowerCase(), arr[1].toLowerCase()];


                            

                            //CONVERT TIME TO UTC HOLYSHIT DAYLIGHT
                            //I HARDCODE 4 HOURS FORWARD AND
                            //RUN EVERYTHING WITH A UTC COMPUTER BECAUSE
                            //JAVASCRIPT DATES ARE HELL ON EARTTH

                            var localDate = new Date(arr[2]);
                            if (arr[3]) {
                                localDate.setHours(arr[3].split(':')[0])
                                if (arr[3].split(':')[1]) {
                                    localDate.setMinutes(arr[3].split(':')[1])
                                }
                            }

                            //+4
                            localDate.setHours(localDate.getHours()+4)

                            matchData.date = new Date(localDate)





                            matchData.result = arr[4].split('#');
                            matchData.eventName = arr[5];
                            matchData.eventStage = arr[6];
                            matchData.eventSub = arr[7];
                            matchData.region = arr[8];
                            if (arr[9] && arr[9] === '1') {
                                matchData.unranked = true;
                            }
                            matchData.vodId = parseInt(arr[10],10).toString(16);
                            matchData.vods = [];
                            matchData.eventUrl = matchData.eventName.replace(/[\. ,:-]+/g, "-")

                            for (var i = 11; i < arr.length; i+=2){
                                if (arr[i+1] && arr[i+1].length > 0) {
                                    var newVod = {};
                                    newVod.url = arr[i+1]
                                    newVod.path = matchData.eventSub.replace(/[\. ,:-]+/g, "-")
                                                + '-'
                                                + matchData.teams[0].replace(/[\. ,:-]+/g, "-")
                                                + '-vs-'
                                                + matchData.teams[1].replace(/[\. ,:-]+/g, "-")
                                    if (arr[i]) {
                                        newVod.name = arr[i]
                                        newVod.path = newVod.path+arr[i].replace(/[\. ,:-]+/g, "-")
                                    }
                                    else if (arr[12] && arr[14]) {
                                        newVod.name = 'Game '
                                                        +((i-11)/2+1);
                                        newVod.path = newVod.path + '-Game-'
                                                        +((i-11)/2+1);
                                    }

                                    //OVERRIDE PATH IF NO LINK
                                    if (arr[i+1] === "#")
                                        {
                                            newVod.path = "#"
                                        }
                                    
                                    newVod.pathLower = newVod.path.toLowerCase();
                                    matchData.vods.push(newVod)
                                    
                                }

                            }                        
                            match.insert(matchData, done);

                            
                            if (tourneys.indexOf(matchData.eventName) === -1) {
                                var tourneyData = {};
                                tourneyData.name = matchData.eventName;
                                tourneyData.url = matchData.eventUrl;
                                tourneyData.urlLower = matchData.eventUrl.toLowerCase();
                                createTourney(tourneyData, done);
                                numTourneys++;    
                            }
                            

                            matchData.teams.forEach(function (teamName) {
                                var t,
                                    teamExists = false;

                                if (teams[teamName]) {
                                    teamExists = true;
                                } else {
                                    for (t in teams) {
                                        if (!teamExists) {
                                            teamExists = teams[t].indexOf(teamName) > -1;
                                        }
                                    }
                                }

                                if (!teamExists && teamName) {
                                    createTeam(teamName, done);
                                    numTeams++; 
                                }
                            });
                        numMatches++;
                    }
                });
            });
        });
    });
};

exports.calcresults = function (callback) {


    match.findbydate({}, function (err, data) {

        var predictGraph = []

        for (var i=0;i<=20;i++) {
            var newPlot = {};
            newPlot.predict = 5*i;
            newPlot.total = 0;
            newPlot.win = 0;
            newPlot.loss = 0;
            newPlot.percent = 0;
            console.log(i)
            predictGraph.push(newPlot)
        }


        var correctCount = 0;
        var wrongCount = 0;
        var tourneys = [];
        var resultsSaved = 0;
        var rankingsSaved = 0;
        var totalGames = 0;
        var totalResults = data.length;
        var lastDate;
        var rankingData = [];

        var logosDir = [];

        for (var i=1;i<=5;i++) {
            logosDir[i] = fs.readdirSync('public/img/logo/'+ i + '/')
        }

        async.forEachSeries(data, function (m, callback2) {

            var team1Elo,
            team2Elo,
            team1Wins = m.result[0],
            team2Wins = m.result[1],
            t1Wins = m.result[0],
            t2Wins = m.result[1],
            t1PlaceUpdate,
            t2PlaceUpdate,
            resultId,
            team1Gain = 0,
            dateUpdate = false,
            idCreated = false,
            team2Gain = 0;

            function exitProc() {

                    function reallyExit() {

                         console.log("...done, exit!")
                         console.log ("correct = " + correctCount + "  wrong= " + wrongCount + " %" +  correctCount/(correctCount+wrongCount))
                         console.log("Total games tracked - " + totalGames)
                                 for (var i=0;i<=20;i++) {
                                    var newPlot = {};
                                        predictGraph[i].percent = 
                                        predictGraph[i].win / predictGraph[i].total
                                }
                         console.log (predictGraph)
                         process.exit();
                    }


                    function compareRanks () {
                         console.log ("Comparing Rankings 30d ago...");
                        var i = 0;
                            ranking.findone({date: {$lte: today}}, function (err, rData) {
                                ranking.findone({date: {$lte: lastMonth}}, function (err, rData30) {
                                    var totalTeams = rData30[0].list.length;
                                    console.log("updating " + totalTeams + " deltas...");
                                    var kCount = 1;
                                    var naCount = 1;
                                    var chCount = 1; 
                                    var seaCount = 1;
                                    var euCount = 1;

                                    rData[0].list.forEach(function (pairNow) {
                                        var regionRank;
                                        if (pairNow.region === 'Korea'){
                                            regionRank = kCount
                                            kCount++
                                        }
                                        else if (pairNow.region === 'China'){
                                            regionRank = chCount
                                            chCount++
                                        }
                                        else if (pairNow.region === 'NA'){
                                            regionRank = naCount
                                            naCount++
                                        }
                                        else if (pairNow.region === 'EU'){
                                            regionRank = euCount
                                            euCount++
                                        }
                                        else if (pairNow.region === 'SEA'){
                                            regionRank = seaCount
                                            seaCount++
                                        }
                                        team.update({
                                                name: pairNow.name
                                            },
                                            {
                                                ranking: pairNow.ranking,
                                                regionRanking : regionRank
                                            },
                                            function () {
                                                rData30[0].list.forEach(function (pair30) {
                                                    if (pairNow.name === pair30.name) 
                                                    {
                                                        team.update({
                                                                name: pairNow.name
                                                            },
                                                            {
                                                                delta: (pair30.ranking - pairNow.ranking),
                                                                ranking: pairNow.ranking,
                                                                regionRanking : regionRank
                                                            },
                                                            function () {
                                                            i++;
                                                            if (i >= totalTeams) {
                                                                reallyExit();
                                                            }
                                                        });
                                                    }
                                                });
                                        });
                                    });
                                });
                             });
                    }


                 if (resultsSaved >= totalResults && rankingsSaved >= totalResults){

                    var j = 0;
                    var today = new Date()
                    var lastMonth = new Date()
                    lastMonth.setDate(today.getDate()-30);

                    console.log("Inserting Ranking Data...")

                    rankingData.forEach(function (rEntry) {
                        ranking.insert(rEntry, function () {
                            j++;
                            if (j >= rankingData.length) {
                                compareRanks();
                            }
                        });
                    });
                        

                }
            }

            function runmatch (callback3) {
                var t1k = 52,
                t2k = 52;


                totalGames++;

                if (team1Placements <= 15 && team2Games >= 15 && team1Wins+team2Wins !== 0) {
                        //t1k = t1k*Math.pow(60/(team1Games+3), 1/2)
                        t1k =t1k *(1.5 - (0.0/10)*team1Placements)
                        t1PlaceUpdate++;
                        
                }
                if (m.region[0] === "I" && m.date.getFullYear() === 2013) {
                     //t1k = t1k*1.5
                     t1k=t1k*2
                }

                if (team2Placements <= 15 && team1Games >= 15 && team1Wins+team2Wins !== 0) {
                        t2k=t2k* (1.5 - (0.0/10)*team2Placements)
                        
                        t2PlaceUpdate++;
                       //t2k = t2k*Math.pow(60/(team2Games+3), 1/2)
                }
                if (m.region[0] === "I" && m.date.getFullYear() === 2013) {
                   t2k = t2k*2
                }

                var r1 = Math.pow(10, (team1Elo/400))
                    r2 = Math.pow(10, (team2Elo/400)),
                    e1 = r1 / (r1 + r2),
                    e2 = r2 / (r1 + r2);


                if (team1Wins>0) {

                    team1Gain = team1Gain +t1k * (1 - e1)
                    team2Gain = team2Gain + t2k *(0 - e2);
                    team1Wins--;
                    runmatch(callback3)
                }

                else if (team2Wins>0) {

                    team1Gain = team1Gain + t1k * (0 - e1)
                    team2Gain = team2Gain + t2k *(1 - e2);
                    team2Wins--;
                    runmatch(callback3)
                }
                else {
                    callback3([team1Elo+team1Gain, team2Elo+team2Gain]);
                }
            };

            function done () {

                function saveRanking (date) {
                    var i = 0;                    
                    var rankDate = lastDate;
    
                    if (lastDate && m.date.getDate() !== lastDate.getDate()) {
                        team.findvalidteams(function (err, teamlist){
                            if (teamlist) {
                                    newRanking = {}
                                    newRanking.list = [];
                                    newRanking.date = rankDate;

                                    
                                teamlist.forEach(function (team){
                
                                    newList = {};
                                    newList.name = teamlist[i].name;
                                    newList.ranking = i+1;
                                    newList.region = teamlist[i].region;

                                    newRanking.list.push(newList);
                                    i++;
                                });
                                rankingData.push(newRanking)
                                rankingsSaved++;
                                lastDate = m.date;
                                callback2();
                                exitProc();
                            }
                            else {
                                rankingsSaved++;
                                lastDate = m.date;
                                callback2();
                                exitProc();

                            }
                            
                        });
                    }
                    else
                    {
                        rankingsSaved++;
                        lastDate = m.date;
                        callback2();
                        exitProc();
                    }

                };

                if (team1Elo && team2Elo && dateUpdate) {
                    
                    resultData = {};
                    resultData.teams = m.teams;
                    resultData.teamsLower = m.teamsLower;
                    resultData.date = m.date;
                    resultData.result = m.result;
                    resultData.games = m.games;
                    resultData.eventName = m.eventName;
                    resultData.eventSub = m.eventSub;
                    resultData.eventStage = m.eventStage;
                    resultData.region = m.region;
                    resultData.eloBefore = [team1Elo, team2Elo];
                    resultData.teamsMed = [team1Med, team2Med];
                    resultData.teamsShort = [team1Short, team2Short];
                    resultData.logos = ({ team1 : team1Logos, team2 : team2Logos})
                    resultData.hotness = 0;
                    resultData.vods = m.vods;
                    resultData.url = [];
                    resultData.vodId = m.vodId;
                    resultData.eventUrl = m.eventUrl
                    resultData.fake = [];
                    resultData.unranked = m.unranked

                    if (team1Fake) {
                        resultData.fake[0] = true;
                    }

                    if (team2Fake) {
                        resultData.fake[1] = true;
                    }

                    if (team1Url) {
                        resultData.url[0] = team1Url;
                    }

                    if (team2Url) {
                        resultData.url[1] = team2Url;
                    }

                    //if it is an alias the medium/long name/ logos will be different than the ID
                    if (m.teams[0] !== team1Name) {
                        resultData.teamsMed[0] = resultData.teams[0];

                        resultData.logos.team1 = [];
                        resultData.logos.team1[0] = "invalid"
                        for (var i=1;i<=5;i++) {
                            resultData.logos.team1[i] = "Unknown.png"
                            if (logosDir[i].indexOf(m.teams[0].replace(/ /g, "-") + '.png') !== -1) {
                                resultData.logos.team1[i] = (m.teams[0].replace(/ /g, "-") + '.png')
                            }
                        }
                    }

                    //if it is an alias the medium/long name/ logos will be different than the ID
                    if (m.teams[1] !== team2Name) {
                        resultData.teamsMed[1] = resultData.teams[1];

                        resultData.logos.team2 = [];
                        resultData.logos.team2[0] = "invalid"
                        for (var i=1;i<=5;i++) {
                            resultData.logos.team2[i] = "Unknown.png"
                            if (logosDir[i].indexOf(m.teams[1].replace(/ /g, "-") + '.png') !== -1) {
                                resultData.logos.team2[i] = (m.teams[1].replace(/ /g, "-") + '.png')
                            }
                        }
                    }

                    if (Math.round(((team1Elo+team2Elo)-1800)/160) >= 7.2) {
                        resultData.hotness = 1;
                    }



                    //ANALYTICS
                    var Er1 = Math.pow(10, ((team2Elo-team1Elo)/400));
                    var Er2 = Math.pow(10, ((team1Elo-team2Elo)/400));

                    var Er1= (1/(1+Er1))
                    var Er2= (1/(1+Er2))

                    
                    if (team1Games>=15 && team2Games >=15)
                    {
                    for (var i = 0; i < m.result[0]; i++) {
                        predictGraph[Math.round((Er1*100)/5)].win++;
                        predictGraph[Math.round((Er2*100)/5)].loss++;
                        predictGraph[Math.round((Er1*100)/5)].total++;
                        predictGraph[Math.round((Er2*100)/5)].total++;
                    }

                    for (var i = 0; i < m.result[1]; i++) {
                        predictGraph[Math.round((Er1*100)/5)].loss++;
                        predictGraph[Math.round((Er2*100)/5)].win++;
                        predictGraph[Math.round((Er1*100)/5)].total++;
                        predictGraph[Math.round((Er2*100)/5)].total++;
                    }
                }
                    


                    if (m.result[0] > m.result[1] && team1Elo > team2Elo && m.result[0] + m.result[1] > 0) {
                        correctCount++;

                    }
                    else if (m.result[1] > m.result[0] && team2Elo > team1Elo && m.result[0] + m.result[1] > 0) {
                        correctCount++;

                    }
                    else {
                        wrongCount++;
                    }
                    //

                    console.log("")
                    console.log (team1Wins + "\t" + team2Wins + "\t" + team1Games + "\t" + team2Games +"\t" + m.region[0]);
                    console.log(m.teams[0] + "\t" + team1Elo    + "\t" + m.teams[1] + "\t" +team2Elo)

                    if (m.unranked === true) {
                        resultData.eloAfter = [team1Elo, team2Elo];
                        result.insert(resultData);
                        saveRanking();
                        resultsSaved++;
                        
                    }

                    else
                    {
                        runmatch(function (newElos) {

                        resultData.eloAfter = [newElos[0], newElos[1]];
                        result.insert(resultData);

                        console.log(m.teams[0] + "\t" + newElos[0]  + "\t" + m.teams[1] + "\t" +newElos[1])
                        
                        team.updateelo(m.teams[0], newElos[0], t1Wins, t2Wins, t1PlaceUpdate,
                            function() {team.updateelo(m.teams[1], newElos[1], t2Wins, t1Wins, t2PlaceUpdate, saveRanking )} );
                            resultsSaved++;
                        });
                    }
                            
                }
            };
            
            if (tourneys.indexOf(m.eventName) === -1) {
                tourneys.push(m.eventName)
                tourney.update({
                    name: m.eventName
                },
                {
                    startDate: m.date,
                    endDate: m.date
                }, function(){
                    dateUpdate = true;
                    done();
                });
            }
            else
            {
                tourney.update({
                    name: m.eventName
                },
                {
                    endDate: m.date
                }, function(){
                    dateUpdate = true;
                    done();
                });
            }

            team.find({$or: [{name : m.teams[0]}, { aliases: { $elemMatch: { name: m.teams[0] } } }]}, function (err, team1){
                team1Name = (team1[0].name);
                team1Elo = (team1[0].elo);
                team1Med = (team1[0].nameMed);
                team1Short = (team1[0].nameShort)
                team1Games = (team1[0].games);
                team1Logos = (team1[0].logos)
                team1Fake = (team1[0].fake)
                team1Placements = (team1[0].placements);
                t1PlaceUpdate = team1Placements;
                team1Url = (team1[0].url);
                done(team1Wins, team2Wins);
            });

            team.find({$or: [{name : m.teams[1]}, { aliases: { $elemMatch: { name: m.teams[1] } } }]}, function (err, team2){
                team2Name = (team2[0].name);
                team2Elo = (team2[0].elo);
                team2Med = (team2[0].nameMed);
                team2Short = (team2[0].nameShort);
                team2Games = (team2[0].games);
                team2Logos = (team2[0].logos);
                team2Fake = (team2[0].fake)
                team2Placements = (team2[0].placements)
                t2PlaceUpdate = team2Placements;
                team2Url = (team2[0].url);
                done(team1Wins, team2Wins);
            });
        });
    });
};

exports.destroy = function () {
    ['matches', 'teams', 'results', 'rankings', 'tourneys'].forEach(function (collection) {
        mongoose.connection.collections[collection].drop();
    });
    process.exit();
};