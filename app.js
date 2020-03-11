var validInput = new Array(6);
var inputSeconds;
var countSeconds;
var countClock = new Array(6);
var currentScene = "counter";
var countDirection;
var countingUp = 0;
var countingDown = 1;
var myTimer;
var remainingMS;
var startMS;

function arrayToText(arr) {
	return arr[5].toString() + arr[4] + ":" + arr[3] + arr[2] + ":" + arr[1] + arr[0];
}

function updateLabels() {
	var hint = document.getElementById("hint");
	var prefix;
	var suffix = "";
	var clockText;
	if (currentScene == "counting") {
		if (countDirection == countingUp) {
			prefix = "正在正计时";
		} else {
			prefix = "正在倒计时";
		}
	} else if (currentScene == "paused") {
		if (countDirection == countingUp) {
			prefix = "暂停正计时";
		} else {
			prefix = "暂停倒计时";
		}
	} else {
		if (countDirection == countingUp) {
			prefix = "正计时";
		} else {
			prefix = "倒计时";
		}
		suffix = " 已结束";
	}
	clockText = arrayToText(validInput);
	hint.innerText = prefix + ' ' + clockText + suffix;
	var bclear = document.getElementById("clear");
	if (countDirection == countingUp) {
		bclear.innerText = "清空正计时";
	} else {
		bclear.innerText = "清空倒计时";
	}
}

function updateClock() {
	var nsecond = countSeconds;
	var nhour = parseInt(nsecond / 3600);
	nsecond -= nhour * 3600;
	var nminute = parseInt(nsecond / 60);
	nsecond -= nminute * 60;
	countClock[0] = nsecond % 10;
	countClock[1] = parseInt(nsecond / 10);
	countClock[2] = nminute % 10;
	countClock[3] = parseInt(nminute / 10);
	countClock[4] = nhour % 10;
	countClock[5] = parseInt(nhour / 10);
	document.getElementById("time").innerText = arrayToText(countClock);
}

function processInput() {
	var ihour = Math.round(parseFloat(document.getElementById("hour").value));
	var iminute = Math.round(parseFloat(document.getElementById("minute").value));
	var isecond = Math.round(parseFloat(document.getElementById("second").value));
	if (isNaN(ihour)) ihour = 0;
	if (isNaN(iminute)) iminute = 0;
	if (isNaN(isecond)) isecond = 0;
	if (ihour < 0) ihour = 0;
	if (iminute < 0) iminute = 0;
	if (isecond < 0) isecond = 0;
	if (ihour > 99) ihour = 99;
	if (iminute > 59) iminute = 59;
	if (isecond > 59) isecond = 59;
	validInput[0] = isecond % 10;
	validInput[1] = parseInt(isecond / 10);
	validInput[2] = iminute % 10;
	validInput[3] = parseInt(iminute / 10);
	validInput[4] = ihour % 10;
	validInput[5] = parseInt(ihour / 10);
	inputSeconds = arrToSeconds(validInput);
}

function arrToSeconds(arr) {
	var secs = (arr[5] * 10 + arr[4]) * 3600;
	secs += (arr[3] * 10 + arr[2]) * 60;
	secs += arr[1] * 10 + arr[0];
	return secs;
}

function switchScene(nextScene) {

	if (currentScene == "counter") {
		document.getElementById("dcounter").style.visibility = 'hidden';
	} else {
		document.getElementById("dbuttons").style.visibility = 'hidden';
		if (currentScene == "counting") {
			document.getElementById("pause").style.visibility = 'hidden';
		} else if (currentScene == "paused") {
			document.getElementById("resume").style.visibility = 'hidden';
		} else {
			document.getElementById("pause").style.visibility = 'hidden';
			document.getElementById("resume").style.visibility = 'hidden';
		}
	}
	if (nextScene == "counter") {
		document.getElementById("dcounter").style.visibility = 'visible';
	} else {
		document.getElementById("dbuttons").style.visibility = 'visible';
		if (nextScene == "counting") {
			document.getElementById("pause").style.visibility = 'visible';
		} else if (nextScene == "paused") {
			document.getElementById("resume").style.visibility = 'visible';
		}
	}
	currentScene = nextScene;
	updateLabels();
}

function countup() {
	remainingMS = 1000;
	countDirection = countingUp;
	processInput();
	countSeconds = 0;
	updateClock();
	var currentDate = new Date();
	startMS = currentDate.getMilliseconds();
	var sum = 0;
	for (var i = 0; i < 6; ++i) {
		sum += validInput[i];
	}
	if (sum != 0) {
		myTimer = setInterval(addSecond, 1000);
		switchScene("counting");
	} else {
		switchScene("counted");
	}
	document.getElementById("countup").blur();
}

function countdown() {
	remainingMS = 1000;
	countDirection = countingDown;
	processInput();
	countSeconds = inputSeconds - 1;
	var currentDate = new Date();
	startMS = currentDate.getMilliseconds();
	var sum = 0;
	for (var i = 0; i < 6; ++i) {
		sum += validInput[i];
	}
	if (sum != 0) {
		switchScene("counting");
		myTimer = setInterval(minusSecond, 1000);
	} else {
		switchScene("counted");
		countSeconds = 0;
	}
	document.getElementById("countdown").blur();
	updateClock();
}

function addSecond() {
	++countSeconds;
	remainingMS = 1000;
	if (countSeconds >= inputSeconds) {
		clearInterval(myTimer);
		clearTimeout(myTimer);
		countSeconds = inputSeconds;
		switchScene("counted");
	}
	updateClock();
}

function minusSecond() {
	--countSeconds;
	remainingMS = 1000;
	if (countSeconds < 0) {
		clearInterval(myTimer);
		clearTimeout(myTimer);
		countSeconds = 0;
		switchScene("counted");
	}
	updateClock();
}

function pause() {
	switchScene("paused");
	clearInterval(myTimer);
	clearTimeout(myTimer);
	var nowDate = new Date();
	var nowMS = nowDate.getMilliseconds();
	remainingMS -= (1000 + nowMS - startMS) % 1000;
	document.getElementById("pause").blur();
}

function resume() {
	switchScene("counting");
	var currentDate = new Date();
	startMS = currentDate.getMilliseconds();
	if (countDirection == countingUp) {
		myTimer = setTimeout(continueUp, remainingMS);
	} else {
		myTimer = setTimeout(continueDown, remainingMS);
	}
	document.getElementById("resume").blur();
}

function continueUp() {
	myTimer = setInterval(addSecond, 1000);
	addSecond();
}

function continueDown() {
	myTimer = setInterval(minusSecond, 1000);
	minusSecond();
}

function clearcount() {
	switchScene("counter");
	clearInterval(myTimer);
	clearTimeout(myTimer);
	countSeconds = 0;
	updateClock();
	document.getElementById("clear").blur();
	document.getElementById("hour").value = "";
	document.getElementById("minute").value = "";
	document.getElementById("second").value = "";
}

function recount() {
	clearInterval(myTimer);
	clearTimeout(myTimer);
	updateClock();
	if (countDirection == countingUp) {
		countup();
	} else {
		countdown();
	}
	document.getElementById("restart").blur();
}

function handleKeyboardEvent() {
	var key = event.keyCode;
	if (key == 13 && currentScene == "counter") {
		countup();
	}
	if (key == 32) {
		if (currentScene == "paused") {
			resume();
		} else {
			pause();
		}
	}
}

function loseFocus(e) {
	if (e && e.preventDefault) {
		e.preventDefault();
	}
}