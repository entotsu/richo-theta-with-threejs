(function(){



	window.onload = function() {
		initPanoBrowser()

		// SmartPhone Scroll Off
		if (ua.isiOS || ua.isAndroid) $(window).on('touchmove.noScroll', function(e) {e.preventDefault();});
	}





	// ------------------ init pano-browser ------------------

	var websocketAPI = null;
	var panoAPI = null;

	function initPanoBrowser() {
		websocketAPI = initWebSocket( onRecieveMessageViaWebSocket );//websocket.js
		panoAPI = initPanoRender( onRotateCamera )//render.js
	}




	//=========================== ↓ MAIN FUNCTION ↓ ================================

	var pitch = 0;
	var yaw = 0;
	var lastMessage;

	// When Browser recieved message from WebSocketServer of CVE-Client
	function onRecieveMessageViaWebSocket(message) {

		if (message != lastMessage) {
		    var firstWord = message.substr(0, message.indexOf( ":" ));

		    if (firstWord == "Orientation") {
		        var orientation = parseOrientationMessage(message);
		        pitch = orientation.pitch;
		        yaw = orientation.yaw;

		        panoAPI.rotateCamera(yaw, pitch);
		    }

		    //Volume (Extra case)
		    else if (firstWord == "Volume") {
		        pitch = getPitchFromVolumeMessage(message);

		        panoAPI.rotateCamera(yaw, pitch);
		    }

		    //when catch message from other pano-browser
		    else {
				var beforeEqual = message.substr(0, message.indexOf( "=" ));
				if (beforeEqual == "o") {
					//perce
				}
		    }
		}
	}


	// When rotate Camera by moving mouse
	function onRotateCamera(phi, theta) {

	    var message = "o=0," + phi + "," + theta;

	    websocketAPI.send(message);

	    lastMessage = message;
	}
	//=========================== ↑ MAIN FUNCTION ↑ ================================











	// ----------- message parser --------------------

	function getPitchFromVolumeMessage(message) {
        var volume = message.split(":")[1];
        var pitch = (volume - 0.5) * 180; //  0~1 => -90~90
        pitch = parseFloat(pitch);
		return pitch;
	}


	function parseOrientationMessage(message) {
	    var splited = message.split([":",","]);
	    var orientation = {};

	    var roll = splited[2];
	    var pitch = splited[4];
	    var yaw = splited[6];

        pitch = parseFloat(pitch);
        roll = parseFloat(roll);
        yaw = parseFloat(yaw);

        //pitch -180 ~ 180 -> -90 ~ 90 へ
        if (pitch > 90) pitch = 90
        if (pitch < -90) pitch = -90

	    var orientation = {};
		orientation.roll = roll;
		orientation.pitch = pitch;
		orientation.yaw = yaw;
	    console.log(orientation);

	    return orientation;
	}






})();