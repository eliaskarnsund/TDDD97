window.onload = function(){
	displayview("welcomeview");
};

displayview = function(view){
	if(localStorage.getItem("token")){
		document.getElementById("view").innerHTML = document.getElementById("profileview").innerHTML;
		changeView(document.getElementById("home"));
		// connectSocket();
	} else {
		document.getElementById("view").innerHTML = document.getElementById(view).innerHTML;
	}
}

validatesignup = function(){
	document.getElementById("labelAlertSignup").innerHTML = "";
	var pass1 = document.getElementById("password1").value;
	var pass2 = document.getElementById("password2").value;
	if (pass1 != pass2){
		document.getElementById("labelAlertSignup").innerHTML = "Passwords do not match";
	}
	else{
		var params = "";

		params += "email="+document.getElementById("email").value+"&";
		params += "password="+document.getElementById("password1").value+"&";
		params += "firstname="+document.getElementById("fname").value+"&";
		params += "familyname="+document.getElementById("lname").value+"&";
		params += "gender="+document.getElementById("gender").value+"&";
		params += "city="+document.getElementById("city").value+"&";
		params += "country="+document.getElementById("country").value;

		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange=function(){
	  		if (xmlhttp.readyState==4 && xmlhttp.status==200){
		    	var response = JSON.parse(xmlhttp.responseText);
				document.getElementById("labelAlertSignup").innerHTML = response.message;

				// WEBSOCKET MUTHAFUCKA
	    	}
		};
		sendPOSTrequest(xmlhttp, "/signup", params);
	}
	return false;

}

validatelogin = function(){
	var xmlhttp=new XMLHttpRequest();
	var email = document.getElementById("email2").value;
	xmlhttp.onreadystatechange=function(){
	  if (xmlhttp.readyState==4 && xmlhttp.status==200){
		    var response = JSON.parse(xmlhttp.responseText);
			if(response.success == true){
				var token = response.data;
				localStorage.setItem("token", token);
				localStorage.setItem("email", email);
				displayview("profileview");
				// reestablish websocket
				connectSocket();
			}else{
				document.getElementById("labelAlertLogin").innerHTML = response.message;
			}
	    }
	}
	sendPOSTrequest(xmlhttp,"/signin", "email=" + email + "&password=" + document.getElementById("password").value );
	return false;
}

changePassword = function(){
	var pass1 = document.getElementById("changePass1").value;
	var pass2 = document.getElementById("changePass2").value;
	if (pass1 != pass2){
		document.getElementById("labelAlertChangePw").innerHTML = "Passwords do not match";
	} else{
		var xmlhttp=new XMLHttpRequest();
		xmlhttp.onreadystatechange=function(){
		 	if (xmlhttp.readyState==4 && xmlhttp.status==200){
			    var response = JSON.parse(xmlhttp.responseText);
				document.getElementById("labelAlertChangePw").innerHTML = response.message;
				document.getElementById("changePass1").value = "";
				document.getElementById("changePass2").value = "";
				document.getElementById("currentPass").value = "";
		    }
		}
		sendPOSTrequest(xmlhttp,"/changepassword", "token=" + localStorage.getItem("token") + "&old_password=" + document.getElementById("currentPass").value + "&new_password="+ pass1 );
	}
	return false;
}

signOut = function(){
	var xmlhttp = new XMLHttpRequest();
	// Onödigt?
	// xmlhttp.onreadystatechange=function(){
 	//  		if (xmlhttp.readyState==4 && xmlhttp.status==200){
	//     	var response = JSON.parse(xmlhttp.responseText);
	//     	if (response.success) {	    		
	//     	};
 	//    	};
	// };
	sendPOSTrequest(xmlhttp,"/signout", "token="+localStorage.getItem("token"));

	localStorage.removeItem("token");
	localStorage.removeItem("email");
	displayview("welcomeview");
	return false;
}

changeView = function(a){
	var menuButtons = document.getElementsByClassName("menuButton");
	var contentPages = document.getElementsByClassName("content");


	for (var i = contentPages.length - 1; i >= 0; i--) {
        contentPages[i].classList.add("hide");
        menuButtons[i].classList.remove("selected");
    };

    var selected = document.getElementById(a.id + "Content");
    if(a.id=="home"){
    	setupUserInfo("home");
    }
    selected.classList.remove("hide");
    selected.classList.add("show");
    a.classList.add("selected");

    clearAlerts();

}


setupUserInfo = function(view){
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange=function(){
	  		if (xmlhttp.readyState==4 && xmlhttp.status==200){
		    	var response = JSON.parse(xmlhttp.responseText);
		    	console.log("setupUserinfo response.succes="+response.success)
		    	if (response.success) {
		    		if(view=="home"){
		    			setUserInfo("home",response.data)
		    		} else {
		    			setUserInfo("browse",response.data)
		    		}
		    	} else {
		    		signOut();
		    	};
	    	};
		};

		var token = localStorage.getItem("token");
		if (view=="home") {
			sendGETrequest(xmlhttp, "/getuserdatabytoken/"+token);
		} else {
			var email = document.getElementById("userId").value;
			sendGETrequest(xmlhttp, "/getuserdatabyemail/"+email+"/"+token);
		}
}

setUserInfo = function(view, data){
	document.getElementById("showEmail"+view).innerHTML=data[0];
	document.getElementById("showFName"+view).innerHTML=data[1];
	document.getElementById("showLName"+view).innerHTML=data[2];
	document.getElementById("showGender"+view).innerHTML=data[3];
	document.getElementById("showCity"+view).innerHTML=data[4];
	document.getElementById("showCountry"+view).innerHTML=data[5];
	updateWall();
}

postMessageHome = function(){
	postMessage("home");
}

postMessageBrowse = function(){
	postMessage("browse");
}

postMessage = function(view){
	var message = ""
	var email = ""
	if (view=="home") {
		message = document.getElementById("message").value;
		email = document.getElementById("showEmailhome").innerHTML;
	}else{
		message = document.getElementById("messageBrowse").value;
		email = document.getElementById("showEmailbrowse").innerHTML;
	}
	
	if (message=="") {
		return;
	};

	var token = localStorage.getItem("token");
	params = "token="+token+"&email="+email+"&message="+message;

	var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange=function(){
	  		if (xmlhttp.readyState==4 && xmlhttp.status==200){
		    	var response = JSON.parse(xmlhttp.responseText);
		    	if (response.success) {
		    		if (view=="home") {
		    			updateWall();
						document.getElementById("message").value = "";
		    		} else{
		    			updateWallBrowse();
						document.getElementById("messageBrowse").value = "";
					}
		    	};
	    	};
		};

	sendPOSTrequest(xmlhttp, "/postmessage", params);

}

updateWall =function(){
	document.getElementById("messageWallHome").innerHTML ="";
	getUserMessagesByToken(localStorage.getItem("token"));
	
}

updateWallBrowse =function(){
	document.getElementById("messageWallBrowse").innerHTML ="";
	getUserMessagesByEmail(localStorage.getItem("token"),document.getElementById("userId").value);
}



writeWall = function(page, response){
	for (var i = response.data.length - 1;  i >= 0; i--) {
		data = response.data[i]
		// var h = response.data[i].split(",")
		var message = data[2];
		var user = data[1];
		document.getElementById("messageWall"+page).innerHTML += "<label class=\"labelWall\">" + message + " By:" + user + "</label> <br>";
	};
}

findUser = function(){
	document.getElementById("labelAlertFindUser").innerHTML = "";
	var userId = document.getElementById("userId").value;

	setupUserInfo("browse");
	updateWallBrowse();

	return false;
};

getUserMessagesByToken = function(token){
	var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange=function(){
	  		if (xmlhttp.readyState==4 && xmlhttp.status==200){
		    	var response = JSON.parse(xmlhttp.responseText);
		    	if(response.success){
					if(response.success){
						writeWall("Home", response);
					}
				}    
			};
		};
		sendGETrequest(xmlhttp, "/getusermessagesbytoken/"+token);
}

getUserMessagesByEmail = function(token, email){

		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange=function(){
			if (xmlhttp.readyState==4 && xmlhttp.status==200){
				var response = JSON.parse(xmlhttp.responseText);
				if(response.success){
					document.getElementById("userInfo2").classList.remove("hide");
					document.getElementById("userInfo2").classList.add("show");
					document.getElementById("userWall2").classList.remove("hide");
					document.getElementById("userWall2").classList.add("show");
					if(response.success){
						writeWall("Browse", response);
					}
				} else {
					document.getElementById("labelAlertFindUser").innerHTML = "Could not find user";
				}
			};
		};
		sendGETrequest(xmlhttp, "/getusermessagesbyemail/"+email+"/"+token);

}

// kors vid validatesignin
connectSocket = function(){
	ws = new WebSocket("ws://" + document.domain + ":5000/connectsocket");
	ws.onopen = function() {
		console.log("ws opened");
		var data = {"email":localStorage.getItem("email"),"token":localStorage.getItem("token")};
		ws.send(JSON.stringify(data));
		console.log(JSON.stringify(data));
	};

	ws.onmessage = function(msg) {
		console.log(msg.data);
		message = JSON.parse(msg.data);
		if (message.success == false) {
			console.log(message.message);
			signOut();
		}
	};

	ws.onclose = function() {
		console.log("WebSocket closed");
	};

	ws.onerror = function() {
		console.log("ERROR!");
	};
}

clearAlerts = function(){
	var alerts = document.getElementsByClassName("alert");
	for (var i = alerts.length - 1; i >= 0; i--) {
		document.getElementById(alerts[i].id).innerHTML = "";
	};
}

sendPOSTrequest = function(xmlhttp, address, data){
	xmlhttp.open("POST",address,true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.send(data);
}


sendGETrequest = function(xmlhttp, address){
	xmlhttp.open("GET",address,true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.send();
}

