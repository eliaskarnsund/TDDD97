window.onload = function(){
	displayview("welcomeview");
};

displayview = function(view){
	if(localStorage.getItem("token")){
		document.getElementById("view").innerHTML = document.getElementById("profileview").innerHTML;
		changeView(document.getElementById("home"));
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
	    	}
		};
		sendPOSTrequest(xmlhttp, "/signup", params);
	}
	return false;

}

validatelogin = function(){
	var xmlhttp=new XMLHttpRequest();
	xmlhttp.onreadystatechange=function(){
	  if (xmlhttp.readyState==4 && xmlhttp.status==200){
		    var response = JSON.parse(xmlhttp.responseText);
			if(response.success == true){
				var token = response.data;
				localStorage.setItem("token", token);
				displayview("profileview");
			}else{
				document.getElementById("labelAlertLogin").innerHTML = response.message;
			}
	    }
	}
	sendPOSTrequest(xmlhttp,"/signin", "email=" + document.getElementById("email2").value + "&password=" + document.getElementById("password").value );
	return false;
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
	var response = serverstub.signOut(localStorage.getItem("token"));
	localStorage.removeItem("token");
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
    	setupUser("home");
    }
    selected.classList.remove("hide");
    selected.classList.add("show");
    a.classList.add("selected");

    clearAlerts();

}

clearAlerts = function(){
	var alerts = document.getElementsByClassName("alert");
	for (var i = alerts.length - 1; i >= 0; i--) {
		document.getElementById(alerts[i].id).innerHTML = "";
	};
}

setupUser = function(view){
	if(view=="home"){
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange=function(){
	  		if (xmlhttp.readyState==4 && xmlhttp.status==200){
		    	var response = JSON.parse(xmlhttp.responseText);
		    	if (response.success) {
		    		setUserInfo("home",response.data)
		    	};
	    	};
		};
		sendGETrequest(xmlhttp, "/getuserdatabytoken/"+localStorage.getItem("token"));
	} else{
		// var response = serverstub.getUserDataByEmail(localStorage.getItem("token"), document.getElementById("userId").value);
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange=function(){
	  		if (xmlhttp.readyState==4 && xmlhttp.status==200){
		    	var response = JSON.parse(xmlhttp.responseText);
		    	if (response.success) {
		    		setUserInfo("browse",response.data)
		    	};
	    	};
		};
		var token = localStorage.getItem("token");
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

postMessage = function(){
	var message = document.getElementById("message").value;
	if (message=="") {
		return;
	};
	var response = serverstub.getUserDataByToken(localStorage.getItem("token"));
	if(response.success==true){
		var email = response.data.email;
		response2 = serverstub.postMessage(localStorage.getItem("token"), message, email);
		updateWall();
		document.getElementById("message").value = "";
	} 
}

postMessageBrowse = function(){
	var message = document.getElementById("messageBrowse").value;
	if (message=="") {
		return;
	};
	var email = document.getElementById("showEmailbrowse").innerHTML;
	response2 = serverstub.postMessage(localStorage.getItem("token"), message, email);
	updateWall2();
	document.getElementById("messageBrowse").value = "";
}

updateWall =function(){
	document.getElementById("messageWallHome").innerHTML ="";
	// var response = serverstub.getUserMessagesByToken(localStorage.getItem("token"));
	getUserMessagesByToken(localStorage.getItem("token"));
	
}

updateWall2 =function(response){
	document.getElementById("messageWallBrowse").innerHTML ="";
	// var response = serverstub.getUserMessagesByEmail(localStorage.getItem("token"), document.getElementById("showEmailbrowse").innerHTML);
	if(response.success){
		writeWall("Browse", response);
	}
}



writeWall = function(page, response){
	for (var i = 0; response.data.length - 1 >= i; i++) {
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
	// var response = serverstub.getUserMessagesByEmail(localStorage.getItem("token"), userId);

	getUserMessagesByEmail(localStorage.getItem("token"), userId);

	return false;
};

getUserMessagesByToken = function(token){
	var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange=function(){
	  		if (xmlhttp.readyState==4 && xmlhttp.status==200){
		    	var response = JSON.parse(xmlhttp.responseText);
		    	if(response.success){
					//setupUser("browse");
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
					setupUser("browse");
					updateWall2(response);
				} else {
					document.getElementById("labelAlertFindUser").innerHTML = "Could not find user";
				}	    
			};
		};
		sendGETrequest(xmlhttp, "/getusermessagesbyemail/"+email+"/"+token);

}
