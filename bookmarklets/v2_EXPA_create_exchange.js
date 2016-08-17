javascript: (function(){
	//########################################################
	var db_token = "Token For Your Own Rest API Database";

	function Utils(){}
	Utils.securityToken=null;
	Utils.tokenName='expa_token';
	
	/*Deklarierung einer Methode, welche das SecurityToken aus den Cookies liest*/
	Utils.readSecurityToken=function () {
		var cookieContent;
		var search_for = Utils.tokenName+"=";
		var cookies = document.cookie.split(';');
		for(var i = 0; i < cookies.length; i++) {
			var c = cookies[i];
			while (c.charAt(0) == ' '){
				c = c.substring(1, c.length);
			}
			if (c.indexOf(search_for) == 0) {
				cookieContent = decodeURIComponent(c.substring(search_for.length,c.length));
			}
		}
		return cookieContent;
	}
	
	Utils.getSecurityToken=function () {
		if(Utils.securityToken===null){
			Utils.securityToken=Utils.readSecurityToken();
		}
		return Utils.securityToken;
	}
	
	/*Deklarierung einer asynchronen Methode, welche die Person mir der übergebenen ID zurück gibt*/
	Utils.getExchange=function (ep_id,app_id,successFunction) {
		var call = $.ajax({type: "GET", url: "https://noob.aiesec.de/people/"+ep_id+"/exchanges?access_token="+db_token+"&applicationID="+app_id+"&page=1&limit=1", async: false}).responseText;
		//parses for total items, if > 0, exchange object exists
		json = JSON.parse(call);
		return json;
	}
	Utils.personExists=function (ep_id,app_id,successFunction) {
		var call = $.ajax({type: "GET", url: "https://noob.aiesec.de/people/"+ep_id+"?access_token="+db_token, async: false}).responseText;
		console.log("https://noob.aiesec.de/people/"+ep_id+"?access_token=ke6Reikore3fei6O");
		//parses for total items, if > 0, exchange object exists
		json = JSON.parse(call);
		return json;
	}


	//########################################################
	
	function main() {
		var url = window.location.href;
		var id = url.split("/");
		id = id[5];
		var ep_id=angular.element($('div.ng-scope')).scope().vm.id;
		var email=angular.element($('div.ng-scope')).scope().vm.comparisonCopy.email;
		var application = angular.element(jQuery('ul.list')).scope().vm.applications;
		for(var i=0;i<application.length;i++){
				//define app and ep id
				var app = application[i];
				var app_id  = app.id;
				$("#"+app_id).remove();
				$("#delete_"+app_id).remove();
				$("#exists_"+app_id).remove();
				$("#create_"+app_id).remove();
				//check if internship is TMP/GCDP/GIP
				var opp = app.opportunity;
				if(!opp){	//counteracting an EXPA bug
					continue;
				}
				var programm = opp.programmes;
				programm = programm[0].short_name;
				if(programm == "TMP" || programm == "TLP"){
					var zeile = $("<div class='status' id='"+app_id+"'></div>").insertAfter($('ul.list li.application div.general-top').eq(i));
					zeile.append("<strong class='exchange' style='font-weight: bold;'>Team Experience</strong><br>");
				}
				else{
					//check application status
					var status = app.current_status;
					if(status == "rejected" || status == "open"){
						var zeile = $("<div class='status' id='"+app_id+"'></div>").insertAfter($('ul.list li.application div.general-top').eq(i));
						zeile.append("<strong class='exchange' style='font-weight: bold;'>Unmatched</strong><br>");
					}
					else{
						console.log(app_id);
						//check if EP exists
						var call = Utils.personExists(ep_id);
						error = call.error;
						if(typeof error != "undefined"){
							//ep doesnt exist, create person
							var body = {
								'id': ep_id,
								'email':email,
								'leadSource':"ops",
							};
							var xhr = new XMLHttpRequest();
							xhr.withCredentials = false;
							
							xhr.addEventListener("readystatechange", function () {
							  if (this.readyState === 4) {
							  }
							});
							
							xhr.open("POST", "https://noob.aiesec.de/people?access_token="+db_token);
							xhr.setRequestHeader('Content-Type', 'application/json');
							
							xhr.send(JSON.stringify(body));
						}
						//check if exchange object exists
						var call=Utils.getExchange(ep_id,app_id);
						var exists = call.totalItems;
						//if exchange object exists, you cannot create a new one
						if(exists > 0){
							//Create Delete Button
							if(app.current_status != "realized"){

							
							var zeile = $("<div class='status' style='color:#f66;border-color:#f66;' id='delete_"+app_id+"'></div>").insertAfter($('ul.list li.application div.general-top').eq(i));
							zeile.append("<strong class='exchange' style='font-weight: bold;'>Delete</strong><br>");
							//clicking the button
							$('#delete_'+app_id).on( "click", function() {
								app_id = this.id;
								app_id = app_id.split("_");
								app_id = app_id[1];
								//Getting Exchange ID
								var exchangeID = call.payload;
								exchangeID = exchangeID[0];
								exchangeID = exchangeID.id;
								//sending the request
								var body = {};
								var xhr = new XMLHttpRequest();
								xhr.withCredentials = false;
								
								xhr.addEventListener("readystatechange", function () {
								  if (this.readyState === 4) {
								  }
								});
								
								xhr.open("DELETE", "https://noob.aiesec.de/people/"+ep_id+"/exchanges/"+exchangeID+"?access_token="+db_token);
								xhr.setRequestHeader('Content-Type', 'application/json');
								
								xhr.send(JSON.stringify(body));
								$('div.status').remove();
								setTimeout(main, 300);
							});

							//Create Exchange Object already exists button
							var zeile = $("<div class='status' id='exists_"+app_id+"'></div>").insertAfter($('ul.list li.application div.general-top').eq(i));
							zeile.append("<strong class='exchange' style='font-weight: bold;'>Exchange Object exists</strong><br>");
							}
							else{
								//Create Can't delete exists button
								var zeile = $("<div class='status' id='exists_"+app_id+"'></div>").insertAfter($('ul.list li.application div.general-top').eq(i));
								zeile.append("<strong class='exchange' style='font-weight: bold;'>Realized - cannot delete</strong><br>");
							}

						}
						else if(status != "withdrawn"){
							//create button
							var zeile = $("<div class='status' id='create_"+app_id+"'></div>").insertAfter($('ul.list li.application div.general-top').eq(i));
							zeile.append("<strong class='exchange' style='font-weight: bold;'><a>Create Exchange Object</a></strong><br>");
							//execute function on click, create exchange object
							//execute send mail script
								var person = angular.element(jQuery('div.basic-details')).scope().vm.person;
								var ep_mail = person.email;
							 	var ep_mail = "laurin.stahl@aiesec.de"
								var ep_id = person.id;
								var ep_name = person.first_name;
								//create exchange object
								$('#create_'+app_id).on( "click", function(){
									app_id = this.id;
									app_id = app_id.split("_");
									app_id = app_id[1];
									
									var body = {
										'applicationID': app_id,
									};
									var xhr = new XMLHttpRequest();
									xhr.withCredentials = false;
									
									xhr.addEventListener("readystatechange", function () {
									  if (this.readyState === 4) {
									  }
									});
									
									xhr.open("POST", "https://noob.aiesec.de/people/"+ep_id+"/exchanges?access_token="+db_token);
									xhr.setRequestHeader('Content-Type', 'application/json');
									
									xhr.send(JSON.stringify(body));
									$('div.status').remove();
									setTimeout(main, 300);
								});

						}


					}
				}
			}
		
	}
	
	main();

	

		
		//create CREATE EXCHANGE Buttons
		//var zeile = 
			
		
		
	
}
)();