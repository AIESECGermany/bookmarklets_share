javascript: (function(){
	//########################################################
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
	
	
	/*Deklarierung einer asynchronen Methode, welche alle Bewerbungen zurück gibt*/
	Utils.getApplication=function (applicationId,successFunction) {
		return $.get("https://gis-api.aiesec.org/v2/applications/"+applicationId+".json?access_token="+Utils.getSecurityToken(), successFunction);
	}
	

	/*Deklarierung einer asynchronen Methode, welche alle Bewerbungen zurück gibt*/
	Utils.getApplicationsOfPerson=function (personId,elementCount,pageNumber,successFunction) {
		return $.get("https://gis-api.aiesec.org/v2/people/"+personId+"/applications.json?access_token="+Utils.getSecurityToken()+"&page="+pageNumber+"&per_page="+elementCount,  successFunction);
	}
	Utils.getApplicationInformation=function (ep_id,successFunction) {
		var call = $.ajax({type: "GET", url: "https://noob.aiesec.de/people/"+ep_id+"/applicationInformation?access_token=ke6Reikore3fei6O", async: false}).responseText;
		json = JSON.parse(call);
		return json;
	}

	//########################################################
	
	function main(){
				
		//remove all comments
		$('*').contents().each(function() {
			if(this.nodeType === Node.COMMENT_NODE) {
				$(this).remove();
			}
		});		
		
		//globale Variablenm, welche funktionsübergreifend gebraucht werden
		var applicationCount=100;
		var pageNumber=1;
		
		//Funktionen
		var user = angular.element(jQuery('ul.list')).scope().vm.people;
		removeTable();
		addEmptyTable();
		addTableHeadlines();
		
		//vm.person.profile.selected_programmes_info

		
		for(var i=0;i<user.length;i++){
			var ep_id = user[i].id;
			//var personCall= Utils.getPerson(ep_id);

			/*var leadSource = Utils.getLeadSource(ep_id);
			if (typeof leadSource.type != "undefined"){
				leadSource = "aiesec.de";
			}
			else{
				leadSource = "OP";
			}*/


			//console.log(leadSource);
			fillTable(user[i]);


			//console.log(user[i]);
			//console.log(opsOnline);
			//console.log(ops);
			//console.log(agbs);


		}
		
		
	}
		
	
	function addEmptyTable(){
		//adds empty table below the list on expa
		$("div.crm-list").append("<table style='color:#777;' class='bookmarklet'><tbody class='bookmarklet'></tbody></table>");
		$("ul.list").empty();
	}
	
	function addTableHeadlines() {
		//adds Header of table
		
		var html=$("tbody.bookmarklet").html();
		
		html+='<tr style="font-weight:bold;font-size:9pt!important;"> <th>';
		html+="LC</th><th>";
		html+="Full Name</th><th>";
		//html+="Last Name</th><th>";
		html+="Application Date</th><th>";
		html+="Email</th><th>";
		html+="Phone</th><th>";
		html+="Field of Study</th><th>";
		html+="Lead Source</th>";
		//html+="Lead Source</th><th>";
		//html+="AGB Info</th><th>";
		html+="</tr>";

		$("tbody.bookmarklet").html(html);
	}
	
	
	function fillTable(user) {
		//fills all EP Data into the table, creates one row for every EP
		var id = user.id;
		//console.log(user);
		lc = user.home_lc.name;
		var json = Utils.getApplicationInformation(id);
		console.log(json);
		fieldOfStudy = json.fieldOfStudy;
		type = json.type;
		if(type == "globalTalentApplicationInformation"){
			source = "oGT";
		}
		else if(type == "globalCitizenApplicationInformation"){
			source = "oGC";
		}
		else if(type == "youthTalentApplicationInformation"){
			source = "YT";
		}
		else{
			source = "EXPA";
		}
		var date = user.created_at.split("T")[0];
		phone = user.phone;
		if(phone == null){
			phone = "-";
		}

		var html=$("tbody.bookmarklet").html();
			
		html+='<tr class="application bookmarklet" style="font-size:9pt;">';
		//html+=" <td><a href=EP_link>" + user.first_name + "</a></td>";
		html+=" <td>" + lc + "</td>";
		html+=" <td><a href=https://experience.aiesec.org/#/people/"+id+">" + user.full_name + "</a></td>";
		//html+=" <td>" + user.last_name + "</td>";
		html+=" <td>" + date + "</td>";
		html+=" <td>" + user.email + "</td>";
		html+=" <td>" + phone + "</td>";
		html+=" <td>" + fieldOfStudy + "</td>";
		//html+=" <td>" + leadSource + "</td>";
		//html+=" <td>" + agbs + "</td>";
		html+=" <td>" + source +	"</td>";
		html+="</tr>";
				
		$("tbody.bookmarklet").html(html);

		
	}
	
	
	function removeTable() {
		
		$('table.bookmarklet').remove();
	}

	main();
	
}
)();