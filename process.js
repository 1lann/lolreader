//jscs:disable

// Everything from here down is for core development
// This will then be moved into a WebWorker in the future supposedly...

var gameDatabase = {}; // Will store game data
var summonerDatabase = {}; // Will be used to see who you most play with
var summonerMetaDatabase = {};
var summonerFrequencyDatabase = {};
var processedFiles = {}; // To prevent file processing duplication
var summonerNames;

var showNormals = true;
var showBots = true;
var showCustoms = true;
var showOther = true;

var gameStats = {
	"loading": 0
};


var toArray = function(list) {
	return Array.prototype.slice.call(list || [], 0);
}

var processProgress = 0;
var numOfFiles = 0;

var getRegion = function(summoner) {
	if (summonerMetaDatabase[summoner] && summonerMetaDatabase[summoner]["region"]) {
		return summonerMetaDatabase[summoner]["region"];
	}

	var regionFrequency = {};
	for (var champion in summonerDatabase[summoner]) {
		for (var key in summonerDatabase[summoner][champion]) {
			var region = gameDatabase[summonerDatabase[summoner][champion][key]]["region"];
			if (!regionFrequency[region]) {
				regionFrequency[region] = 0;
			}
			regionFrequency[region]++;
		}
	}
	var mostOccur = 0;
	var mostRegion = "";
	for (var region in regionFrequency) {
		if (regionFrequency[region] > mostOccur && region != "unknown") {
			mostOccur = regionFrequency[region];
			mostRegion = region;
		}
	}

	if (mostRegion == "unknown" && !isSummonerName(summoner)) {
		mostRegion = getRegion(summonerNames[0]);
	}

	if (!summonerMetaDatabase[summoner]) {
		summonerMetaDatabase[summoner] = {}
	}

	summonerMetaDatabase[summoner]["region"] = mostRegion

	return mostRegion;
}

var ratesCache = {};

var isSummonerName = function(name) {
	for (var i = 0; i < summonerNames.length; i++) {
		if (summonerNames[i] == name) {
			return true;
		}
	}
	return false;
}

var existsAsKey = function(array, names) {
	for (var key in array) {
		for (var i = 0; i < names.length; i++) {
			if (key == names[i]) {
				return array[key];
			}
		}
	}
	return false;
}

var ratesState = [true, true, true, true]
var getRates = function(summoner, champion) {
	if ((ratesState[0] != showNormals) ||
		(ratesState[1] != showBots) ||
		(ratesState[2] != showCustoms) ||
		(ratesState[3] != showOther)) {
			ratesState = [showNormals, showBots, showCustoms, showOther];
			ratesCache = {};
	}

	if (champion && ratesCache[summoner+":"+champion]) {
		return ratesCache[summoner+":"+champion];
	} else if (!champion && ratesCache[summoner]) {
		return ratesCache[summoner];
	}

	var blueWins = 0;
	var blueLoses = 0;
	var purpleWins = 0;
	var purpleLoses = 0;
	var blueGames = 0;
	var purpleGames = 0;
	if (!champion) {
		for (var champion in summonerDatabase[summoner]) {
			for (var key in summonerDatabase[summoner][champion]) {
				var gameObject = gameDatabase[summonerDatabase[summoner][champion][key]];
				if ((gameObject.custom && showCustoms) || (!gameObject.custom)) {
					if ((gameObject.type == "classic" && showNormals) ||
						(gameObject.type == "bot" && showBots) ||
						(gameObject.type != "classic" && gameObject.type != "bot" && showOther) ||
						(!showNormals && !showBots && !showOther && showCustoms && gameObject.custom)) {
						if (existsAsKey(gameObject["blue"], summonerNames) && existsAsKey(gameObject["blue"], [summoner])) {
							blueGames++;
							if (gameObject["result"] == "win") {
								blueWins++;
							} else if (gameObject["result"] == "lose") {
								blueLoses++;
							}
						} else if (existsAsKey(gameObject["purple"], summonerNames) && existsAsKey(gameObject["purple"], [summoner])) {
							purpleGames++;
							if (gameObject["result"] == "win") {
								purpleWins++;
							} else if (gameObject["result"] == "lose") {
								purpleLoses++;
							}
						}
					}
				}
			}
			ratesCache[summoner] = [blueGames+purpleGames, blueWins+purpleWins, blueLoses+purpleLoses, blueGames, purpleGames, blueWins, blueLoses, purpleWins, purpleLoses];
		}
	} else {
		for (var key in summonerDatabase[summoner][champion]) {
			var gameObject = gameDatabase[summonerDatabase[summoner][champion][key]];
			if ((gameObject.custom && showCustoms) || (!gameObject.custom)) {
				if ((gameObject.type == "classic" && showNormals) ||
					(gameObject.type == "bot" && showBots) ||
					(gameObject.type != "classic" && gameObject.type != "bot" && showOther) ||
					(!showNormals && !showBots && !showOther && showCustoms && gameObject.custom)) {
					if (existsAsKey(gameObject["blue"], summonerNames) && existsAsKey(gameObject["blue"], [summoner])) {
						blueGames++;
						if (gameObject["result"] == "win") {
							blueWins++;
						} else if (gameObject["result"] == "lose") {
							blueLoses++;
						}
					} else if (existsAsKey(gameObject["purple"], summonerNames) && existsAsKey(gameObject["purple"], [summoner])) {
						purpleGames++;
						if (gameObject["result"] == "win") {
							purpleWins++;
						} else if (gameObject["result"] == "lose") {
							purpleLoses++;
						}
					}
				}
			}
		}
		ratesCache[summoner+":"+champion] = [blueGames+purpleGames, blueWins+purpleWins, blueLoses+purpleLoses, blueGames, purpleGames, blueWins, blueLoses, purpleWins, purpleLoses];
	}
	return [blueGames+purpleGames, blueWins+purpleWins, blueLoses+purpleLoses, blueGames, purpleGames, blueWins, blueLoses, purpleWins, purpleLoses];
}




var timeSpentPlaying = function(summoner, champion) {
	var totalTime = 0;

	if (champion) {
		for (var key in summonerDatabase[summoner][champion]) {
			var gameObject = gameDatabase[summonerDatabase[summoner][champion][key]];
			if ((gameObject.type == "classic" && showNormals) ||
				(gameObject.type == "bot" && showBots) ||
				(gameObject.type != "classic" && gameObject.type != "bot" && showOther) ||
				(!showNormals && !showBots && !showOther && showCustoms && gameObject.custom)) {
				if (gameObject["time"] && (existsAsKey(gameObject["blue"], summonerNames) || existsAsKey(gameObject["purple"], summonerNames))) {
					totalTime = totalTime+gameDatabase[summonerDatabase[summoner][champion][key]]["time"];
				}
			}
		}
	} else {
		for (var champ in summonerDatabase[summoner]) {
			for (var key in summonerDatabase[summoner][champ]) {
				var gameObject = gameDatabase[summonerDatabase[summoner][champ][key]];
				if ((gameObject.custom && showCustoms) || (!gameObject.custom)) {
					if ((gameObject.type == "classic" && showNormals) ||
						(gameObject.type == "bot" && showBots) ||
						(gameObject.type != "classic" && gameObject.type != "bot" && showOther) ||
						(!showNormals && !showBots && !showOther && showCustoms && gameObject.custom)) {
						if (gameObject["time"] && (existsAsKey(gameObject["blue"], summonerNames) || existsAsKey(gameObject["purple"], summonerNames))) {
							totalTime = totalTime+gameDatabase[summonerDatabase[summoner][champ][key]]["time"];
						}
					}
				}
			}
		}
	}
	return totalTime;
}

var getSummonerName = function() {
	var summonerFrequency = {};
	for (var summoner in summonerDatabase) {
		for (var championName in summonerDatabase[summoner]) {
			for (var key in summonerDatabase[summoner][championName]) {
				if (!summonerFrequency[summoner]) summonerFrequency[summoner] = 0;
				summonerFrequency[summoner]++;
			}
		}
	}
	var frequencyInOrder = []
	for (var key in summonerFrequency) frequencyInOrder.push([key, summonerFrequency[key]]);
	frequencyInOrder.sort(function(a, b) {
		a = a[1];
		b = b[1];

		return a < b ? 1 : (a > b ? -1:0);
	});
	summonerNames = [frequencyInOrder.shift()[0]];
	summonersPlayedWith();
}

var summonersPlayedWith = function(summoner) {
	var summonerFrequency = {};
	for (var summoner in summonerDatabase) {
		var rates = getRates(summoner);
		summonerFrequency[summoner] = rates[0];
	}
	var frequencyInOrder = []
	for (var key in summonerFrequency) frequencyInOrder.push([key, summonerFrequency[key]]);
	frequencyInOrder.sort(function(a, b) {
		a = a[1];
		b = b[1];

		return a < b ? 1 : (a > b ? -1:0);
	});
	frequencyInOrder.shift();
	summonerFrequencyDatabase = frequencyInOrder;
}

var championsPlayedWith = function(summoners) {
	if (typeof(summoners) == "string") {
		summoners = [summoners];
	}

	var championFrequency = {};
	var total = 0;
	for (var sI = 0; sI < summoners.length; sI++) {
		var summoner = summoners[sI];
		for (var champion in summonerDatabase[summoner]) {
			for (var index in summonerDatabase[summoner][champion]) {
				var gameObject = gameDatabase[summonerDatabase[summoner][champion][index]];
				if ((gameObject.custom && showCustoms) || (!gameObject.custom)) {
					if ((gameObject.type == "classic" && showNormals) ||
						(gameObject.type == "bot" && showBots) ||
						(gameObject.type != "classic" && gameObject.type != "bot" &&  showOther) ||
						(!showNormals && !showBots && !showOther && showCustoms && gameObject.custom)) {
						if (!championFrequency[champion]) championFrequency[champion] = 0;
						championFrequency[champion]++;
						total++;
					}
				}
			}
		}
	}
	var frequencyInOrder = []
	for (var key in championFrequency) frequencyInOrder.push([key, championFrequency[key]]);
	frequencyInOrder.sort(function(a, b) {
		a = a[1];
		b = b[1];

		return a < b ? 1 : (a > b ? -1:0);
	});
	return frequencyInOrder;
}

var fileNameRegex = /(\d{4}).(\d{2}).(\d{2}).(\d{2}).(\d{2}).(\d{2}).r3dlog\.txt$/
var playersRegex = /Spawning champion \(([^\)]+)\) with skinID \d+ on team (\d)00 for clientID -*\d and summonername \(([^\)]+)\) \(is [^\)]+\)/g
var altPlayerRegex = /Hero ([^(]+).+ created for (.+)/g
var botRegex = /^(.+) Bot$/
var gameEndTimeRegex = /^(\d+\.\d+).+{"messageType":"riot__game_client__connection_info","message_body":"Game exited","exit_code":"EXITCODE_([^"]+)"}$/m
var altGameEndRegex = /^(\d+\.\d+).+Game exited$/m
var gameStartTimeRegex= /^(\d+\.\d+).+GAMESTATE_GAMELOOP Begin$/m
var gameTypeRegex = /Initializing GameModeComponents for mode=(\w+)\./
var gameIDRegex = /Receiving PKT_World_SendGameNumber, GameID: ([^,|\s]+)/
var gamePlatformRegex = /Receiving PKT_World_SendGameNumber, GameID: [^,]+, PlatformID: ([A-Z]+)/


var pushIfNotPresent = function(arr, data) {
	for (var key in arr) {
		if (arr[key] == data) {
			return false
		}
	}
	arr.push(data);
	return true;
}

var processFileObject = function(file, fileName) {
	var reader = new FileReader();

	reader.onloadend = function(e) {
		var gameDataConstruct = {};
		var logData = this.result;

		var gameID = gameIDRegex.exec(logData);
		var dateTime = fileNameRegex.exec(fileName);
		gameDataConstruct["date"] = dateTime[1]+"/"+dateTime[2]+"/"+dateTime[3]+" "+
			dateTime[4]+":"+dateTime[5]+":"+dateTime[6];
		if (!gameID) {
			gameID = [null, gameDataConstruct["date"], "unknown"];
		}

		var gameEnd = gameEndTimeRegex.exec(logData);
		var gameEndTime;
		if (gameEnd) {
			gameEndTime = parseFloat(gameEnd[1]);
			gameDataConstruct["result"] = gameEnd[2].toLowerCase();
		} else {
			gameDataConstruct["result"] = "unknown";
			var altEndGame = altGameEndRegex.exec(logData);
			if (altEndGame) {
				gameEndTime = parseFloat(altEndGame[1]);
			}
		}

		var gameStart = gameStartTimeRegex.exec(logData);
		if (gameStart) {
			var gameStartTime = parseFloat(gameStart[1]);
			gameDataConstruct["loading-time"] = gameStartTime;
			gameStats["loading"] = gameStats["loading"]+gameDataConstruct["loading-time"]
			if (gameEndTime) {
				gameDataConstruct["time"] = gameEndTime-gameStartTime;
			} else {
				gameDataConstruct["time"] = 0;
			}
		} else {
			gameDataConstruct["time"] = 0;
			gameDataConstruct["loading-time"] = 0;
		}

		gameDataConstruct["custom"] = false

		var gameType = gameTypeRegex.exec(logData);
		if (gameType) {
			gameDataConstruct["type"] = gameType[1].toLowerCase();
		} else {
			gameDataConstruct["type"] = "unknown";
		}

		var numberOfBots = 0
		var numberOfPlayers = 0

		if (logData.indexOf("Creating Hero") > 0) {
			gameDataConstruct["blue"] = {};
			gameDataConstruct["purple"] = {};
			while (player = playersRegex.exec(logData)) {
				if (botRegex.exec(player[3])) {
					numberOfBots++;
				}
				numberOfPlayers++;
				if (player[2] == "1") {
					gameDataConstruct["blue"][player[3]] = player[1];
				} else {
					gameDataConstruct["purple"][player[3]] = player[1];
				}
				if (!summonerDatabase[player[3]]) summonerDatabase[player[3]] = {};
				if (!summonerDatabase[player[3]][player[1]]) summonerDatabase[player[3]][player[1]] = [];
				pushIfNotPresent(summonerDatabase[player[3]][player[1]], gameID[1]);
			}
			if (Object.keys(gameDataConstruct["blue"]).length+Object.keys(gameDataConstruct["purple"]).length <= 0) {
				var teamIndex = 0;
				while (player = altPlayerRegex.exec(logData)) {
					teamIndex++;
					if (botRegex.exec(player[2])) {
						numberOfBots++;
					}
					numberOfPlayers++;
					if (teamIndex > 5) {
						// Purple
						gameDataConstruct["purple"][player[2]] = player[1];
					} else {
						// Blue
						gameDataConstruct["blue"][player[2]] = player[1];
					}
					if (!summonerDatabase[player[2]]) summonerDatabase[player[2]] = {};
					if (!summonerDatabase[player[2]][player[1]]) summonerDatabase[player[2]][player[1]] = [];
					pushIfNotPresent(summonerDatabase[player[2]][player[1]], gameID[1]);
				}
			}

			if (numberOfBots >= 3) {
				gameDataConstruct["type"] = "bot";
			}

			if (numberOfPlayers < 10) {
				gameDataConstruct["custom"] = true;
			}

			var gameRegion = gamePlatformRegex.exec(logData)

			if (gameRegion) {
				gameDataConstruct["region"] = gameRegion[1].toLowerCase();
				if (gameDataConstruct["region"] == "oc") {
					gameDataConstruct["region"] = "oce";
				}
			} else {
				gameDataConstruct["region"] = "unknown";
			}

			gameDatabase[gameID[1]] = gameDataConstruct;
		}
		processProgress++;
		logData = null;
		this.result = null;
	};

	reader.readAsText(file);
}

var processFile = function(fileEntry) {
	if (processedFiles[fileEntry.name]) {
		return false;
	} else if (fileNameRegex.exec(fileEntry.name)) {
		processedFiles[fileEntry.name] = true;

		fileEntry.getMetadata(
			(function(fileEntry) {
				return function(metadata) {
					if (metadata.size < 11000000) {
						fileEntry.file(function(file) {
							processFileObject(file, fileEntry.name);
						}, function(e){console.log(e)});
					} else {
						numOfFiles--
					}
				}
			})(fileEntry)
		)


		return true;
	} else {
		return false;
	}
};

var lastProgress = -1;
var lastCheck = Date.now()
var statsShown = false;

var displayProgress = function() {
	var percent = Math.ceil((processProgress/numOfFiles)*1000-0.5)/10;
	$("#progress-cover").width(percent.toString()+"%");
	$("#drop-sub").text("Progress: "+percent.toString()+"%" + " (" + numOfFiles.toString() + " files)");
	if (statsShown) {
		clearInterval(progressInterval);
	} else {
		if ((processProgress >= numOfFiles) || ((processProgress <= lastProgress) && (percent > 90) && (Date.now() - lastCheck > 5000))) {
			clearInterval(progressInterval);
			statsShown = true;
			if (Object.keys(gameDatabase).length <= 0) {
				processFailure("No usable logs available!")
				return;
			}
			getSummonerName();
			displayAllStats();
			$("#main, #title").hide();
			$("#drop-cover").removeClass("show")
			$("#stats").show();
		} else {
			if (processProgress > lastProgress) {
				lastCheck = Date.now()
			}
			lastProgress = processProgress;
		}
	}
}

var levels = 0;
var busy = false;
var folderProcessStack = [];
var folderProcessInterval;

var searchData;

var searchFolders = function() {
	if (!busy) {
		if (folderProcessStack.length > 0) {
			var folderEntry = folderProcessStack.shift()

			var dirReader = folderEntry.createReader();
			var entries = [];

			var readEntries = function() {
				dirReader.readEntries (function(results) {
					var numOfErrors = 0
					if (correctDirectory && results.length) {
						for (var i = 0; i < results.length; i++) {
							if (processFile(results[i])) {
								numOfFiles++;
							} else {
								numOfErrors++;
							}
						}

						if (numOfErrors >= results.length) {
							console.log("Quit search");
							return
						} else {
							readEntries();
						}
					} else if (results.length) {
						if (searchData(results)) {
							progressInterval = setInterval(displayProgress, 200);
							for (var i = 0; i < results.length; i++) {
								if (processFile(results[i])) {
									numOfFiles++;
								} else {
									numOfErrors++;
								}
							}
							if (numOfErrors >= results.length) {
								console.log("Quit search");
								return
							} else {
								readEntries();
							}
						}
					} else {
						console.log("End")
						return;
					}
				}, function(e){console.log("File listing error",e);});
			};

			readEntries();
		} else {
			clearInterval(folderProcessInterval);
			folderProcessInterval = null;
		}
	} else {

	}
}

var searchData = function(files) {
	if (correctDirectory) {
		return;
	}
	busy = true;
	levels++;
	if (levels > 100) {
		console.log("Reached max depth level")
		clearInterval(folderProcessInterval);
		folderProcessInterval = null;
		folderProcessStack = [];
		processFailure("Could not find logs - Try again");
		return;
	}
	var length = files.length;
	for (var i = 0; i < length; i++) {
		var entry;

		if (files[i].webkitGetAsEntry) {
			entry = files[i].webkitGetAsEntry();
		} else {
			entry = files[i];
		}

		if (!entry) {
			processFailure("You didn't drop a folder!");
			break;
		}

		if (entry.isFile && i == 0) {
			if (processFile(entry)) {
				processProgress = 0;
				clearInterval(folderProcessInterval);
				folderProcessInterval = null;
				folderProcessStack = [];
				numOfFiles = 1;
				if (length >= 1) {
					correctDirectory = true;
					console.log("Using log file location: " + entry.fullPath);
					return true;
				} else {
					files = null;
					processFailure("Not enough logs to generate useful information!");
					return;
				}
			}
		} else if (!entry.isFile && !correctDirectory) {
			folderProcessStack.push(entry);
			if (!folderProcessInterval) {
				folderProcessInterval = setInterval(searchFolders, 10);
			}
		}
	}
	busy = false;
	if (folderProcessStack.length <= 0 && !correctDirectory) {
		files = null;
		processFailure("Could not find logs - Try again");
	}
}

var processStartPoint = function(files) {
	var entry;
	if (files[0].webkitGetAsEntry) {
		entry = files[0].webkitGetAsEntry();
	} else {
		entry = files[0];
	}
	if (processFile(entry)) {
		progressInterval = setInterval(displayProgress, 200);
		numOfFiles = 0;
		for (var i = 0; i < files.length; i++) {
			if (files[i].webkitGetAsEntry) {
				entry = files[i].webkitGetAsEntry();
			} else {
				entry = files[i];
			}
			if (processFile(results[i])) {
				numOfFiles++;
			}
		}
	} else {
		searchData(files);
	}
}

var resetDatabase = function() {
	gameDatabase = {};
	summonerDatabase = {};
	summonerFrequencyDatabase = {};
	summonerNames = [];
	gameStats = {
		"time": 0,
		"loading": 0
	};
	processProgress = 0;
	numOfFiles = 0;
}
