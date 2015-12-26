var dropZone = $("#drop-cover, #drop-it");
var cancelAnimateOut = false;
var processLock = false;
var correctDirectory = false;
var progressInterval;

$(document).bind('dragover', function (e) {
    if (!processLock) {
        cancelAnimateOut = false;
        $("#progress-cover").width("0%");
        timeout = window.dropZoneTimeout;
        if (!timeout) {
            $("#drop-it").text("Drop it!");
            dropZone.addClass('show');
        } else {
            clearTimeout(timeout);
        }
        var found = false,
        node = e.target;
        do {
            if (node === dropZone[0]) {
                found = true;
                break;
            }
            node = node.parentNode;
        } while (node != null);

        window.dropZoneTimeout = setTimeout(function () {
            window.dropZoneTimeout = null;
            if (!cancelAnimateOut) dropZone.removeClass('show');
        }, 100);
    }
	e.preventDefault();
});

var processFailure = function(message) {
    dropZone.removeClass("show");
    $("#drop-it, #drop-sub").removeClass("show");
    $("#step-number").show();
    $("#step-number").text(message);
    $("#step-number").css("font-size", "40px");
    $("#step-number").css("color", "#bc3a3a");
    processLock = false;
}

document.ondrop = function(e) {
    e.preventDefault();
    if (processLock) return;
    processLock = true;

	dropZone.addClass("show");
    cancelAnimateOut = true;

    changeTextTimeout = function() {
        if (processLock) {
            $("#drop-it").text("Processing...");
            $("#drop-it, #drop-sub").addClass("show");
        }
    }

    $("#drop-it").removeClass("show");

    setTimeout(changeTextTimeout, 250);
    correctDirectory = false;
    try {
        processStartPoint(e.dataTransfer.items);
    } catch(err) {
        console.log(err);
        if (e.dataTransfer) {
            var alternativeFiles = e.dataTransfer.files;
            if (alternativeFiles) {
                console.log("Using alternative file reading")
                if (alternativeFiles[0].size > 0) {
                    if (fileNameRegex.exec(alternativeFiles[0].name)) {
                        numOfFiles = alternativeFiles.length;
                        displayProgress();
                        if (!progressInterval) {
                            progressInterval = setInterval(displayProgress, 200);
                        }
                        setTimeout(function(alternativeFiles) {
                            return function() {
                                for (i = 0; i < alternativeFiles.length; i++) {
                                    if (alternativeFiles[i].size > 0) {
                                        processFileObject(alternativeFiles[i], alternativeFiles[i].name);
                                    }
                                }
                            }
                        }(alternativeFiles), 500);
                    } else {
                        processFailure("Could not find logs - Try again");
                    }
                } else {
                    processFailure("You need to drop the Game - R3d Logs files instead!")
                    $("#instructions").text("This is because you're using a browser that doesn't support folder uploads. You can try using Google Chrome instead, which supports folder uploads.");
                }
            } else {
                processFailure("It seems like you're using an unsupported browser");
                $("#instructions").text("Try using a different browser (Google Chrome) instead");
                console.log(err)
            }
        } else {
            processFailure("It seems like you're using an unsupported browser");
            $("#instructions").text("Try using a different browser (Google Chrome) instead");
            console.log(err)
        }
    }
    e.dataTransfer = null;
}
