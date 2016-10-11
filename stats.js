//jscs:disable

//var gameDatabase = {} // Will store game data
//var summonerDatabase = {} // Will be used to see who you most play with
//var frequencyDatabase = []
//var summonerName

var getHumanTime = function(seconds) {
    var numdays = Math.floor(seconds / 86400);
    var numhours = Math.floor((seconds % 86400) / 3600);
    var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
    var construct = "";

    if (numdays == 1) {
        construct = "1 day";
    } else if (numdays > 1) {
        construct = numdays + " days";
    }

    if (numhours == 1) {
        if (construct != "") {
            construct = construct + ", ";
        }
        construct = construct + "1 hour";
    } else if (numhours > 1) {
        if (construct != "") {
            construct = construct + ", ";
        }
        construct = construct + numhours + " hours";
    }

    if (construct != "") {
        construct = construct + ", and ";
    }
    if (numminutes == 1) {
        construct = construct + "1 minute";
    } else {
        construct = construct + numminutes + " minutes";
    }
    return construct;
}

var replaceChampionNames = {
    "Chogath": "Cho'Gath",
    "DrMundo": "Dr. Mundo",
    "MonkeyKing": "Wukong",
    "JarvanIV": "Jarvan IV",
    "Khazix": "Kha'Zix",
    "KogMaw": "Kog'Maw",
    "Kogmaw": "Kog'Maw",
    "Leblanc": "LeBlanc",
    "LeeSin": "Lee Sin",
    "MasterYi": "Master Yi",
    "MissFortune": "Miss Fortune",
    "TwistedFate": "Twisted Fate",
    "Velkoz": "Vel'Koz",
    "XinZhao": "Xin Zhao",
}

var getProperName = function(champion) {
    if (replaceChampionNames[champion]) return replaceChampionNames[champion];
    return champion;
}

var getPercentage = function(win, loss) {
    return Math.ceil((win/(win+loss))*100-0.5);
}

var drawGeneralStats = function() {
    $("#general-stats-left").html("");
    $("#general-stats-right").html("");
    var dataToDrawLeft = [];
    var dataToDrawRight = [];

    var timeSeconds = 0;
    var rates = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  	for (var i = 0; i < summonerNames.length; i++) {
  		timeSeconds = timeSeconds + timeSpentPlaying(summonerNames[i]);
  		rates = combineRates(rates, getRates(summonerNames[i]));
  	}

    // return [wins, loses, blueWins, blueLoses, purpleWins, purpleLoses];
    var gameHours = getHumanTime(timeSeconds);
    var averageMinutes = getHumanTime(timeSeconds/(rates[0]));
    var loadingHours = getHumanTime(gameStats["loading"]);

    dataToDrawLeft.push(["Number of games: ", (rates[0]).toString()]);
    dataToDrawLeft.push(["Time spent playing: ", gameHours]);
    dataToDrawLeft.push(["Time wasted on loading: ", loadingHours]);
    dataToDrawLeft.push(["Win rate: ", getPercentage(rates[1],rates[2]).toString() + "%"]);
    dataToDrawLeft.push(["Average game time: ", averageMinutes]);
    dataToDrawLeft.push(["Percentage of games on blue: ", getPercentage(rates[3],rates[4]).toString() + "%"]);
    dataToDrawRight.push(["Games on blue side: ", (rates[3]).toString()]);
    dataToDrawRight.push(["Games on purple side: ", (rates[4]).toString()]);
    dataToDrawRight.push(["Blue win rate: ", getPercentage(rates[5],rates[6]).toString() + "%"]);
    dataToDrawRight.push(["Purple win rate: ", getPercentage(rates[7], rates[8]).toString() + "%"]);
    dataToDrawRight.push(["Unique players encountered: ", Object.keys(summonerDatabase).length.toString()])

    for (key in dataToDrawLeft) {
        $("#general-stats-left").append(
            '<span class="stat-style">'+dataToDrawLeft[key][0]+
            '</span><span class="stat-data-style">'+dataToDrawLeft[key][1]+'</span><br>');
    }
    for (key in dataToDrawRight) {
        $("#general-stats-right").append(
            '<span class="stat-style">'+dataToDrawRight[key][0]+
            '</span><span class="stat-data-style">'+dataToDrawRight[key][1]+'</span><br>');
    }
}

var drawName = function() {
    $("#title-div>#summoner-name").text(summonerNames.join("/"));
}

var combineRates = function(ratesA, ratesB) {
	newRates = [];
	for (var i = 0; i < ratesA.length; i++) {
		newRates.push(ratesA[i] + ratesB[i]);
	}
	return newRates;
}

var expandChampion = function(champion) {
    var detailsContainer = $("#most-played-data .info-card[cardid='" + attributeString(champion) + "'] .details-container")
    var dataToDraw = [];

    detailsContainer.html("");

    var timePlayed = 0;
    var rates = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  	var totalRates = [0, 0, 0, 0, 0, 0, 0, 0, 0];

  	for (var i = 0; i < summonerNames.length; i++) {
  		timePlayed = timePlayed + timeSpentPlaying(summonerNames[i], champion);
  		rates = combineRates(rates, getRates(summonerNames[i], champion));
  		totalRates = combineRates(totalRates, getRates(summonerNames[i]));
  	}

    // var timePlayed = timeSpentPlaying(summonerName, champion);
    // var rates = getRates(summonerName, champion);
    // var totalRates = getRates(summonerName);
    var averageMinutes = getHumanTime(timePlayed/(rates[0]));
    dataToDraw.push(["Time played: ", getHumanTime(timePlayed)]);
    dataToDraw.push(["Average game time: ", averageMinutes]);
    dataToDraw.push(["Percentage of games played: ",
                     getPercentage(rates[0], totalRates[0]-rates[0]) + "%"]);
    dataToDraw.push(["Games known won: ", rates[1].toString()]);
    dataToDraw.push(["Games known lost: ", rates[2].toString()]);
    dataToDraw.push(["Games played on blue side: ", (rates[3]).toString()]);
    dataToDraw.push(["Games played on purple side: ", (rates[4]).toString()]);
    dataToDraw.push(["Blue win rate: ", getPercentage(rates[5],rates[6]).toString() + "%"]);
    dataToDraw.push(["Purple win rate: ", getPercentage(rates[7], rates[8]).toString() + "%"]);

    for (key in dataToDraw) {
        detailsContainer.append('<span class="stat-text">' + dataToDraw[key][0] + '</span><span class="actual-stat">' + dataToDraw[key][1] + '</span><br>');
    }

    detailsContainer.slideDown();

    $("#most-played-data .info-card[cardid='" + attributeString(champion) + "'] .expand-area .glyphicon").removeClass("glyphicon-chevron-down");
    $("#most-played-data .info-card[cardid='" + attributeString(champion) + "'] .expand-area .glyphicon").addClass("glyphicon-chevron-up");

}

var collapseChampion = function(champion) {
    $("#most-played-data .info-card[cardid='" + attributeString(champion) + "'] .details-container").slideUp();

    $("#most-played-data .info-card[cardid='" + attributeString(champion) + "'] .expand-area .glyphicon").removeClass("glyphicon-chevron-up");
    $("#most-played-data .info-card[cardid='" + attributeString(champion) + "'] .expand-area .glyphicon").addClass("glyphicon-chevron-down");
}

var drawChampionsList = function(searchTerm, expanded) {
    $("#most-played-data").html("");
    var resultDatabase = [];
    if (searchTerm) {
        var searchDatabase = championsPlayedWith(summonerNames);
        for (key in searchDatabase) {
            if (searchDatabase[key][0].toLowerCase().indexOf(searchTerm.toLowerCase().replace(/\W/g,"")) >= 0) {
                resultDatabase.push([searchDatabase[key][0], searchDatabase[key][1]]);
            }
        }
    } else {
        resultDatabase = championsPlayedWith(summonerNames);
    }

    for (key in resultDatabase) {
        if (key >= 50) break;

        var rates = [0, 0, 0, 0, 0, 0, 0, 0, 0]

       	for (var i = 0; i < summonerNames.length; i++) {
       		rates = combineRates(rates, getRates(summonerNames[i], resultDatabase[key][0]));
       	}

        var winrate = getPercentage(rates[1],rates[2])
        var card = '<div class="info-card" cardid=\'' + attributeString(resultDatabase[key][0]) + '\'><div class="main-area"><img src="//ddragon.leagueoflegends.com/cdn/6.20.1/img/champion/' + resultDatabase[key][0] + '.png" alt="'+ resultDatabase[key][0] + '"><div class="left-section"><span class="name">' + getProperName(resultDatabase[key][0]) + '</span><br><span class="games-played">' + resultDatabase[key][1] + ' games played</span></div><div class="win-rate"><span class="win-percent">' + winrate + '%</span><br><span class="win-rate-text">Winrate</span></div></div><div class="details-area"><div class="details-container" style="display:none;"></div></div><div class="expand-area"><span class="glyphicon glyphicon-chevron-down"></span></div></div>'
        $("#most-played-data").append(card);

        var clickFunction = new Function('if ($("#most-played-data .info-card[cardid=\'' + resultDatabase[key][0] + '\'] .expand-area .glyphicon.glyphicon-chevron-down").length) {expandChampion("' + resultDatabase[key][0] + '");} else {collapseChampion("' + resultDatabase[key][0] + '");}');

        $("#most-played-data .info-card[cardid='" + attributeString(resultDatabase[key][0]) + "'] .expand-area").click(clickFunction);
    }

    for (key in expanded) {
        expandChampion(expanded[key]);
    }
}

var getTopChampions = function(player) {

    var championsPlayed = [];
    for (var champion in summonerDatabase[player]) {
        var rates = getRates(player, champion);
        championsPlayed.push([champion, rates[0]]);
    }

    championsPlayed.sort(function(a, b) {
        a = a[1];
        b = b[1];

        return a < b ? 1 : (a > b ? -1:0);
    });

    var cleanedFrequency = [];
    for (var key in championsPlayed) {
        if (key >= 5) break;
        cleanedFrequency.push(championsPlayed[key][0]);
    }

    return cleanedFrequency;
}

var attributeString = function(text) {
    return text.replace(/\s/g, "_").replace("'", "^");
}

var expandPlayer = function(player) {
    var detailsContainer = $("#played-with-data .info-card[cardid='" + attributeString(player) + "'] .details-container")
    var dataToDraw = [];

    detailsContainer.html("");

    var region = getRegion(player);

    // detailsContainer.append('<a class="stat-text" href="http://www.lolking.net/search?name=' + player + '&region=' + region.toUpperCase() + '" target="_blank">LolKing</a><span> - </span><a class="stat-text" href="http://' + region + '.op.gg/summoner/userName=' + player + '" target="_blank">OP.GG</a><br>');

    var timePlayed = 0;
    var rates = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  	var totalRates = [0, 0, 0, 0, 0, 0, 0, 0, 0];

  	for (var i = 0; i < summonerNames.length; i++) {
  		timePlayed = timePlayed + timeSpentPlaying(summonerNames[i]);
  		rates = combineRates(rates, getRates([player]));
  		totalRates = combineRates(totalRates, getRates(summonerNames[i]));
  	}

    var averageMinutes = getHumanTime(timePlayed/(rates[0]));
    // dataToDraw.push(["Region: ", region.toUpperCase()]);
    dataToDraw.push(["Time played together: ", getHumanTime(timePlayed)]);
    dataToDraw.push(["Percentage of games played together: ",
                     getPercentage(rates[0], totalRates[0]-rates[0]) + "%"]);
    dataToDraw.push(["Games known won together: ", rates[1].toString()]);
    dataToDraw.push(["Games known lost together: ", rates[2].toString()]);

    for (key in dataToDraw) {
        detailsContainer.append('<span class="stat-text">' + dataToDraw[key][0] + '</span><span class="actual-stat">' + dataToDraw[key][1] + '</span><br>');
    }

    var topChampions = getTopChampions(player);
    detailsContainer.append('<span class="stat-text">Top played champions:</span><div class="summoner-top-champions"></div>')

    for (key in topChampions) {
        var rates = getRates(player, topChampions[key]);
        var winrate = getPercentage(rates[1], rates[2]);
        var enemy = "% Winrate"
        if (!(rates[0] > 0)) {
            winrate = "Enemy "
            enemy = "only"
        }
        $("#played-with-data .info-card[cardid='" + attributeString(player) + "'] .summoner-top-champions").append('<img src="//ddragon.leagueoflegends.com/cdn/6.20.1/img/champion/' + topChampions[key] + '.png" alt="' + topChampions[key] + '"><span class="champion-name">' + getProperName(topChampions[key]) + '</span><span class="champion-winrate">' + winrate.toString() + enemy+ '</span><br>')
    }

    detailsContainer.slideDown();

    $("#played-with-data .info-card[cardid='" + attributeString(player) + "'] .expand-area .glyphicon").removeClass("glyphicon-chevron-down");
    $("#played-with-data .info-card[cardid='" + attributeString(player) + "'] .expand-area .glyphicon").addClass("glyphicon-chevron-up");

}

var collapsePlayer = function(player) {
    $("#played-with-data .info-card[cardid='" + attributeString(player) + "'] .details-container").slideUp();

    $("#played-with-data .info-card[cardid='" + attributeString(player) + "'] .expand-area .glyphicon").removeClass("glyphicon-chevron-up");
    $("#played-with-data .info-card[cardid='" + attributeString(player) + "'] .expand-area .glyphicon").addClass("glyphicon-chevron-down");
}

var drawPlayersList = function(searchTerm, expanded) {
    $("#played-with-data").html("");
    var resultDatabase = [];
    if (searchTerm) {
        var searchDatabase = summonerFrequencyDatabase;
        for (key in searchDatabase) {
            if (searchDatabase[key][0].toLowerCase().replace(/\W/g,"").indexOf(searchTerm.toLowerCase().replace(/\W/g,"")) >= 0) {
                resultDatabase.push([searchDatabase[key][0], searchDatabase[key][1]]);
            }
        }
    } else {
        resultDatabase = summonerFrequencyDatabase;
    }

    for (key in resultDatabase) {
    	if (isSummonerName(resultDatabase[key][0])) {
    		continue;
    	}

        var rates = getRates(resultDatabase[key][0]);
        if (key >= 50 || rates[0] <= 0) break;
        var winrate = getPercentage(rates[1],rates[2]);
        var enemy = "Winrate"
        if (!(rates[0] > 0)) {
            winrate = "Enemy";
            enemy = "only";
        } else {
            winrate = winrate.toString() + "%"
        }
        var region = getRegion(resultDatabase[key][0]);
        var card;

        if (botRegex.exec(resultDatabase[key][0])) {
            var botChampion = botRegex.exec(resultDatabase[key][0])[1];
            if (botChampion == "Wukong") botChampion = "MonkeyKing"
            botChampion = botChampion.replace("'", "").replace(" ", "")
            card = '<div class="info-card" cardid=\'' + attributeString(resultDatabase[key][0]) + '\'><div class="main-area"><img src="//ddragon.leagueoflegends.com/cdn/6.20.1/img/champion/' + botChampion + '.png" alt="'+ resultDatabase[key][0] + '"><div class="left-section"><span class="name">' + resultDatabase[key][0] + '</span><br><span class="games-played">' + resultDatabase[key][1] + ' games played together</span></div><div class="win-rate"><span class="win-percent">' + winrate + '</span><br><span class="win-rate-text">' + enemy + '</span></div></div><div class="details-area"><div class="details-container" style="display:none;"></div></div><div class="expand-area"><span class="glyphicon glyphicon-chevron-down"></span></div></div>'
        } else {
            card = '<div class="info-card" cardid=\'' + attributeString(resultDatabase[key][0]) + '\'><div class="main-area"><div class="left-section" style="margin-top:35px;margin-left:30px;"><span class="name">'+
            resultDatabase[key][0] + '</span><br><span class="games-played">' + resultDatabase[key][1] + ' games played together</span></div><div class="win-rate"><span class="win-percent">' + winrate + '</span><br><span class="win-rate-text">' + enemy + '</span></div></div><div class="details-area"><div class="details-container" style="display:none;"></div></div><div class="expand-area"><span class="glyphicon glyphicon-chevron-down"></span></div></div>'
        }

        $("#played-with-data").append(card);

        var clickFunction = new Function('if ($("#played-with-data .info-card[cardid=\'' + attributeString(resultDatabase[key][0]) + '\'] .expand-area .glyphicon.glyphicon-chevron-down").length) {expandPlayer("' + resultDatabase[key][0] + '");} else {collapsePlayer("' + resultDatabase[key][0] + '");}');

        $("#played-with-data .info-card[cardid='" + attributeString(resultDatabase[key][0]) + "'] .expand-area").click(clickFunction);
    }

    for (key in expanded) {
        expandPlayer(expanded[key]);
    }
}


function bindButtons() {
    var clickBusy = false

    $("#normals-button").on("click", function() {
        if (!clickBusy) {
            clickBusy = true;
            showNormals = !showNormals;
            $(this).removeClass("active")
            if (showNormals) {
                $(this).addClass("active")
            }

            summonersPlayedWith();
            displayAllStats();
            setTimeout(function() {
                clickBusy = false;
            }, 200)
        }
    })

    $("#bots-button").on("click", function() {
        if (!clickBusy) {
            clickBusy = true;
            showBots = !showBots;
            $(this).removeClass("active")
            if (showBots) {
                $(this).addClass("active")
            }

            summonersPlayedWith();
            displayAllStats();
            setTimeout(function() {
                clickBusy = false;
            }, 200)
        }
    })

    $("#customs-button").on("click", function() {
        if (!clickBusy) {
            clickBusy = true;
            showCustoms = !showCustoms;
            $(this).removeClass("active")
            if (showCustoms) {
                $(this).addClass("active")
            }

            summonersPlayedWith();
            displayAllStats();
            setTimeout(function() {
                clickBusy = false;
            }, 200)
        }
    })

    $("#others-button").on("click", function() {
        if (!clickBusy) {
            clickBusy = true;
            showOther = !showOther;
            $(this).removeClass("active")
            if (showOther) {
                $(this).addClass("active")
            }

            summonersPlayedWith();
            displayAllStats();
            setTimeout(function() {
                clickBusy = false;
            }, 200)
        }
    })

    $("#not-you").click(function() {
        var newName = window.prompt("What's your summoner name?","");
        summonerNames = [newName];
        ratesCache = {};
        drawName();
        summonersPlayedWith();
        drawPlayersList();
        drawChampionsList();
        drawGeneralStats();
    });

    $("#another-id").click(function() {
        var newName = window.prompt("Add an alias summoner name","");
        summonerNames.push(newName);
        ratesCache = {};
        drawName();
        summonersPlayedWith();
        drawPlayersList();
        drawChampionsList();
        drawGeneralStats();
    });
}


var displayAllStats = function() {
    drawName();
    drawGeneralStats();
    drawChampionsList();
    drawPlayersList();

    $("input[placeholder='Champion name...']").on("input", function() {
       drawChampionsList($(this).val());
    });

    $("input[placeholder='Summoner name...']").on("input", function() {
       drawPlayersList($(this).val());
    });
}

bindButtons();
