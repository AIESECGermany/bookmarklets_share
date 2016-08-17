javascript: (function(){
		//########################################################
		var db_token = "Token For Your Own Rest API Database";


		function Utils(){}

		/*Deklarierung einer asynchronen Methode, welche die Person mir der übergebenen ID zurück gibt*/
		Utils.getExchange=function (ep_id,app_id,successFunction) {
			var call = $.ajax({type: "GET", url: "https://noob.aiesec.de/people/"+ep_id+"/exchanges?access_token="+db_token+"&applicationID="+app_id+"&page=1&limit=1", async: false}).responseText;
			//parses for total items, if > 0, exchange object exists
			json = JSON.parse(call);
			return json;
		}
		Utils.getapplicationInformation=function (ep_id,successFunction) {
			var call = $.ajax({type: "GET", url: "https://noob.aiesec.de/people/"+ep_id+"/applicationInformation?access_token="+db_token, async: false}).responseText;
			//parses for total items, if > 0, exchange object exists
			return call;
		}


		//########################################################
		function camelCase(text){
			if (text === parseInt(text, 10)){
				finalResult = text;
			}
			else{
				var text = text;
				var result = text.replace( /([A-Z])/g, " $1" );
				var finalResult = result.charAt(0).toUpperCase() + result.slice(1); // capitalize the first letter - as an example.
				return finalResult;
			}
		}
		function main() {
			//emptying everything - notworking
			if(document.getElementById('applicationInformation')){
				$('#applicationInformation').empty();
				$('#preferencesInformation').empty();
			}
			//getting the ID
			var person = angular.element(jQuery('ul.details-list')).scope().vm.person;
			console.log(person);

			var id = person.id;
			if(person.contact_info == null){
				var phone = "";
			}
			else{
				var phone = person.contact_info.phone;
			}
			var email = person.email;
			//getting applicationInformation
			var call = Utils.getapplicationInformation(id);
			json = JSON.parse(call);
			if(json.error){
				var zeile = $("<div id='applicationInformation' class='profile-block ng-scope'><span>Application Details </span>&nbsp;<span></span><div class='profile-block-content'><div id='applicationInformationContent'></div></div></div>").insertAfter($('div.profile-block').eq(0));
				var zeile = $("<div class='detail' id='applicationInformation_" + 1 + "'><span class='key'>No additional application info found</span><span class='value ng-binding'></span></div>").insertAfter($('#applicationInformation_'+j));
				var zeile = $("<ul class='details-list'><li><div id='applicationInformationDetails'></div></li></ul>").insertAfter($('#applicationInformationContent'));
				var zeile = $("<div id='applicationInformation_1' class='detail'><span class='key'>Email</span><span class='value ng-binding'>" + email + "</span></div>").insertAfter($('#applicationInformationDetails'));
				var zeile = $("<div id='applicationInformation_2' class='detail'><span class='key'>Phone</span><span class='value ng-binding'>" + phone + "</span></div>").insertAfter($('#applicationInformation_1'));

			}
			else{
				//checking application type
				var type = json.type;
				if(type == "youthTalentApplicationInformation"){
					var zeile = $("<div id='applicationInformation' class='profile-block ng-scope'><span>Application Details </span>&nbsp;<span class='programme tmp'>TMP</span><div class='profile-block-content'><div id='applicationInformationContent'></div></div></div>").insertAfter($('div.profile-block').eq(0));
				}
				else if(type == "globalCitizenApplicationInformation"){
					var zeile = $("<div id='applicationInformation' class='profile-block ng-scope'><span>Application Details </span>&nbsp;<span class='programme gcdp'>GCDP</span><div class='profile-block-content'><div id='applicationInformationContent'></div></div></div>").insertAfter($('div.profile-block').eq(0));
				}
				else if(type == "globalTalentApplicationInformation"){
					var zeile = $("<div id='applicationInformation' class='profile-block ng-scope'><span>Application Details </span>&nbsp;<span class='programme gip'>GIP</span><div class='profile-block-content'><div id='applicationInformationContent'></div></div></div>").insertAfter($('div.profile-block').eq(0));
				}
				var zeile = $("<ul class='details-list'><li><div id='applicationInformationDetails'></div></li></ul>").insertAfter($('#applicationInformationContent'));
				var zeile = $("<div id='applicationInformation_1' class='detail'><span class='key'>Email</span><span class='value ng-binding'>" + email + "</span></div>").insertAfter($('#applicationInformationDetails'));
				var zeile = $("<div id='applicationInformation_2' class='detail'><span class='key'>Phone</span><span class='value ng-binding'>" + phone + "</span></div>").insertAfter($('#applicationInformation_1'));

				var i = 2;
				for (var k in json) {
					if(k == "id" || k == "type"){}
					else{
						var j = i;
						i = i + 1;
						var value = camelCase(k);
						var text = json[k];
						if(text == true){
							text = "Yes";
						}
						if(text == false){
							text = "No";
						}
						if(text == null){
							text = "";
						}
						var zeile = $("<div class='detail' id='applicationInformation_" + i + "'><span class='key'>" + value + "</span><span class='value ng-binding'>" + text + "</span></div>").insertAfter($('#applicationInformation_'+j));
					}
				}

				//show preferences

				var zeile = $("<div id='preferencesInformation' class='profile-block ng-scope'><span>Preference Details </span>&nbsp;<div class='profile-block-content'><div id='preferencesInformationContent'></div></div></div>").insertAfter($('div.profile-block').eq(1));
				var zeile = $("<ul class='details-list'><li><div id='preferencesInformationDetails'></div></li></ul>").insertAfter($('#preferencesInformationContent'));
				var zeile = $("<div class='detail' id='preferencesInformation_" + 1 + "'></div>").insertAfter($('#preferencesInformationDetails'));
				i = 1;
				json = person.profile;
				for (var k in json) {
					if(k == "id" || k == "type" || k == "skills" || k == "languages" || k == "backgrounds" || k == "visible_profile" || k == "additional_info" || k == "nationalities" || k == "selected_programmes_info"){}
					else{
						var j = i;
						i = i + 1;
						//alert(value);


						var value = camelCase(k);
						value = value.replace("_"," ");
						value = value.replace("_"," ");


						var text = json[k];

						if(text == true){
							text = "Yes";
						}
						if(text == false){
							text = "No";
						}
						if(text == null){
							text = "";
						}
						if(k == "preferred_locations_info"){
							new_text = "";
							for(var q in text){
								new_text = new_text+" "+text[q]["name"];
							}
							text = new_text;
						}
						else if(typeof text === "object"){
							var new_text = "";
							for(var q in text){
								new_text = new_text+camelCase(text[q]["name"]);
							}
							text = new_text;
						}
						else if(k != "interested_in" && typeof text == "string"){
							new_text = text.split("T");
							new_text = new_text[0];
							text = new_text;
						}
						var zeile = $("<div class='detail' id='preferencesInformation_" + i + "'><span class='key'>" + value + "</span><span class='value ng-binding'>" + text + "</span></div>").insertAfter($('#preferencesInformation_'+j));
					}
				}
			}




			//creating the new field
			/*
			 var zeile = $("<div class='profile-block ng-scope'><span>Application Details</span><div class='profile-block-content'></div></div>").insertAfter($('div.profile-block'));

			 var zeile = $("<div>Hello</div>").insertAfter($('div.profile-block-content new'));
			 //var zeile = $("<div class='profile-block-content'><ul class='details-list'><li><div class='detail'><span class='key'>Motivation</span><span class='value ng-binding'>Life</span></div></li></ul></div>").insertAfter($('div.profile-block'));
			 */


			//var zeile = $("<div>"+json+"</div>").insertAfter($('div.profile-block'));

		}

		main();
	}
)();
