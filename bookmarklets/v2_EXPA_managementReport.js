javascript: (function(){
	var db_token = "yourToken";
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
	
	/*Deklarierung einer asynchronen Methode, welche die Person mir der übergebenen ID zurück gibt*/
	Utils.getPerson=function (id,successFunction) {
		var call = $.ajax({type: "GET", url: "https://gis-api.aiesec.org/v2//people/"+id+".json?access_token="+Utils.getSecurityToken(), async: false}).responseText;
		return call;
	}
	Utils.getOutgoerPreparation=function(ep_id){
		var call = $.ajax({type: "GET", url: "https://noob.aiesec.de/outgoerPreparationParticipations?person="+ep_id+"&access_token="+db_token+"&page=1&limit=10", async: false}).responseText;
		json = JSON.parse(call);
		return json;
	}
	Utils.getPersonNOOB=function(ep_id){
		var call = $.ajax({type: "GET", url: "https://noob.aiesec.de/people/"+ep_id+"?access_token="+db_token, async: false}).responseText;
		json = JSON.parse(call);
		return json;
	}
	Utils.getExchange=function (ep_id,app_id,successFunction) {
		var call = $.ajax({type: "GET", url: "https://noob.aiesec.de/people/"+ep_id+"/exchanges?access_token="+db_token+"&applicationID="+app_id+"&page=1&limit=1", async: false}).responseText;
		//parses for total items, if > 0, exchange Object exists
		return call;
	}
	Utils.getExchangeByID=function (ep_id,exchangeID,successFunction) {
		var call = $.ajax({type: "GET", url: "https://noob.aiesec.de/people/"+ep_id+"/exchanges/"+exchangeID+"?access_token="+db_token, async: false}).responseText;
		//parses for total items, if > 0, exchange Object exists
		return call;
	}
	Utils.getExchanges=function (ep_id,app_id,successFunction) {
		var call = $.ajax({type: "GET", url: "https://noob.aiesec.de/people/"+ep_id+"/exchanges?access_token="+db_token+"&page=1&limit=1000", async: false}).responseText;
		//parses for total items, if > 0, exchange Object exists
		return call;
	}
	Utils.getApplication=function (applicationId,successFunction) {
		var call = $.ajax({type: "GET", url: "https://gis-api.aiesec.org/v2/applications/"+applicationId+".json?access_token="+Utils.getSecurityToken(), async: false}).responseText;
		json = JSON.parse(call);
		return json;
	}
	Utils.getLink=function (link,successFunction) {
		var call = $.ajax({type: "GET", url: "https://noob.aiesec.de"+link+"?access_token="+db_token, async: false}).responseText;
		json = JSON.parse(call);
		return json;
	}
	Utils.getReintegration=function (exchangeID,successFunction) {
		var call = $.ajax({type: "GET", url: "https://noob.aiesec.de/reintegrationActivityParticipations?exchange="+exchangeID+"&access_token="+db_token, async: false}).responseText;
		json = JSON.parse(call);
		return json;
	}

	//########################################################
	
	function main() {
		removeTable();
		addEmptyTable();
		addTableHeadlines();
		var applications = angular.element($('ul.list')).scope().vm.applications;
		for(var i=0;i<applications.length;i++){
			fillTable(applications[i],i);
			
		}
		//add function to dynamically created buttons
		var element= document.getElementsByClassName('status open connect');
 		for(var i=0;i<element.length;i++){
      		element[i].addEventListener("click", function(){
      			exchangeID = $(this).attr('id');
      			count = $(this).attr('class').split(" ")[3];
				ep_id = $('.epID').eq(count).prevObject[count].innerText;
				ep = $('.epID').eq(count);
				app_id = $('.app_id').eq(count).prevObject[count].innerText;
				call = Utils.getExchangeByID(ep_id,exchangeID);
				json = JSON.parse(call);
				//console.log(exchangeID, count, json,user.id);
				$('.internshipNumber').eq(count).empty();
				$('.feeAmount').eq(count).empty();
				$('.whs').eq(count).empty();
				$('.agb').eq(count).empty();
				$('.ops').eq(count).empty();
				fillExchange(exchangeID, count, json,ep_id);
				$('.status.accepted.connect').remove();
				var button = document.createElement('div');
				button.className = 'status accepted connect';
  				button.innerHTML = 'Connect to #'+exchangeID;
  				$(button).appendTo($('.exchange').eq(count));
  				button.onclick = function() {
  					saveAppID(exchangeID,app_id,ep_id,count,ep);
  				}
      		}, false);   
 		}
	}
	function removeTable() {
		$('table.bookmarklet').remove();
	}
	function addEmptyTable(){
		//adds empty table below the list on expa
		$("div.crm-list").append("<table style='color:#777;' class='bookmarklet'><tbody class='bookmarklet'></tbody></table>");
		$("ul.list").empty();
	}
	function saveAppID(exchangeID,app_id,ep_id,count,ep){
		console.log(exchangeID,app_id,ep_id,count,ep);
		var data = {
			'applicationID': app_id,
		};
		var xhr = new XMLHttpRequest();
		xhr.withCredentials = false;

		xhr.addEventListener("readystatechange", function () {
			if (this.readyState === 4) {
				main();
			}
		});
		xhr.open("PATCH", "https://noob.aiesec.de/people/" + ep_id + "/exchanges/" + exchangeID + "?access_token="+db_token);
		xhr.setRequestHeader("content-type", "application/json");
		xhr.send(JSON.stringify(data));
	}

	function fillExchange(exchangeID, i, json,epID){
		if(exchangeID == 0){
			internshipNumber = "unset";
			feeAmount = "unset";
			whs = "unset";
			ops = "unset";
			agb = "unset";
		}
		else{
			internshipNumber = json.internshipNumber;
			if(internshipNumber == 0 || typeof(internshipNumber) == "undefined" || internshipNumber === null){
				internshipNumber = "unset";
			}
			feeAmount = json.feeAmount;
			if(feeAmount == 0 || typeof(feeAmount) == "undefined"){
				feeAmount = "unset";
			}
			//getAGB
			agb = json._links.agbAgreement;
			if(typeof(agb) == "undefined"){
				agb = "unset";
			}
			else{
				agb = Utils.getLink(agb.href);
				agb = agb.dateSigned.split("T")[0];
			}
			//getOPS
			//getPerson on NOOB
			person = Utils.getPersonNOOB(epID);
			links = person._links;
			ops = links.outgoerPreparationParticipation;
			opso = links.onlineOutgoerPreparationParticipation;
				//console.log("OPS", ops);
				//console.log("OPSo", opso);
			if(typeof ops != "undefined"){
				confirmed = Utils.getLink(ops.href);
				//console.log(ops);
				//console.log(confirmed);
				type = Utils.getLink(confirmed._links.outgoerPreparation.href);
				//console.log(type);
				ops_text = type.type+" "+type.lc+" "+type.startDate.split("T")[0];
			}
			else if(typeof opso != "undefined"){
				confirmed = Utils.getLink(opso.href);
				opsOnlineBookingDate = person.opsOnlineBookingDate;
				if(opsOnlineBookingDate !== null){
					opsOnlineBookingDate = opsOnlineBookingDate.split("T")[0];
				}
				else{
					opsOnlineBookingDate = "";
				}
				type = "OPS Online";
				confirmed = confirmed.confirmed;
				if(confirmed == true){
					ops_text = "OPS Online Confirmed "+opsOnlineBookingDate;
				}
				else{
					ops_text = "OPS Online unconfirmed";
				}
			}
			if(typeof confirmed == "undefined"){
				var ops_text = "No OPS Confirmed";
			}
			
			//getWHS
			whs = Utils.getReintegration(exchangeID);
			if(typeof(whs) == "undefined" || whs.totalItems == 0){
				whs = "unset";
			}
			else{
				whs = Utils.getLink(whs.payload[0]._links.reintegrationActivity.href);
				if(typeof whs.name != "undefined"){
					whs = whs.name;
				}
				else{
					whs = whs.type+" "+whs.startDate.split("T")[0];
				} 
			}
		}
		if(i == 0 ){
			console.log(i, typeof i);
			if(typeof i == "number"){ //i is only a number if it gets loaded in the beginning when there is no eq() set for it yet
				$("<p>"+internshipNumber+"</p>").appendTo($('.internshipNumber'));
				$("<p>"+feeAmount+"€</p>").appendTo($('.feeAmount'));
				$("<p>"+whs+"</p>").appendTo($('.whs'));
				$("<p>"+agb+"</p>").appendTo($('.agb'));
				$("<p>"+ops_text+"</p>").appendTo($('.ops'));
			} 
			else{
				/*$("<p>"+internshipNumber+"</p>").appendTo($('.internshipNumber'));
				$("<p>"+feeAmount+"€</p>").appendTo($('.feeAmount'));
				$("<p>"+whs+"</p>").appendTo($('.whs'));
				$("<p>"+agb+"</p>").appendTo($('.agb'));
				$("<p>"+ops_text+"</p>").appendTo($('.ops'));*/
			}

		}
		$("<p>"+internshipNumber+"</p>").appendTo($('.internshipNumber').eq(i));
		$("<p>"+feeAmount+"€</p>").appendTo($('.feeAmount').eq(i));
		$("<p>"+whs+"</p>").appendTo($('.whs').eq(i));
		$("<p>"+agb+"</p>").appendTo($('.agb').eq(i));
		$("<p>"+ops_text+"</p>").appendTo($('.ops').eq(i));
		
	}
	function addTableHeadlines() {
		//adds Header of table
		
		var html=$("tbody.bookmarklet").html();
		
		html+='<tr style="font-weight:bold;font-size:9pt!important;"> <th>';
		html+="Full Name</th><th>";
		html+="EP ID</th><th>";
		html+="Exchanges</th><th>";
		html+="Match Date</th><th>";
		html+="AGB</th><th>";
		html+="OPS</th><th>";
		html+="WHS</th><th>";
		html+="Internship<br>Number</th><th>";
		html+="EP Fee</th><th>";
		html+="Program</th><th>";
		html+="Status</th>";
		html+="</tr>";

		$("tbody.bookmarklet").html(html);
	}
	
	function fillTable(application,i) {
		app_id = application.id;
		user = application.person;
		//get MatchDate
		json = Utils.getApplication(app_id);
		meta = json.meta;
		if(meta.date_ep_approved != undefined){
			matchDate = meta.date_ep_approved.split("T")[0];
		}
		else{
			matchDate = "unset";
		}
		ma = new Date(json.an_signed_at);
		if(ma < new Date(meta.date_approved)){
			ma = new Date(meta.date_approved);
		}
		if(ma < new Date(json.matched_or_rejected_at)){
			ma = new Date(json.matched_or_rejected_at);
		}
		ma = new Date(ma);
		ma = ma.getDate() + "." + (ma.getMonth() + 1) + "." + ma.getFullYear();
		matchDate = ma;
		ops = "OPS unset";
		agb = "AGB unset";
		whs = "WHS unset";
		internshipNumber = "unset";
		feeAmount = "unset";
		program = application.opportunity.programmes[0].short_name.toLowerCase();
		status = application.status;
		var html=$("tbody.bookmarklet").html();
			
		html+='<tr class="application bookmarklet" style="font-size:9pt;">';
		//html+=" <td><a href=EP_link>" + user.first_name + "</a></td>";
		html+=" <td><a href=https://experience.aiesec.org/#/people/"+user.id+">" + user.full_name + "</a></td>";
		//html+=" <td>" + user.last_name + "</td>";
		html+=" <td class='epID'>" + user.id + "</td>";
		html+=" <td class='app_id' hidden>" + app_id + "</td>";
		html+=" <td class='exchange'></td>";
		html+=" <td>" + matchDate + "</td>";
		html+=" <td class='agb'></td>";
		html+=" <td class='ops'></td>";
		html+=" <td class='whs'></td>";
		html+=" <td class='internshipNumber'></td>";
		html+=" <td class='feeAmount'></td>";
		html+=" <td><span class='programme " + program + "'>" + program + "</span></td>";
		html+=" <td><span class='status " + status + "'>" + status + "</span></td>";
		html+="</tr>";
		
		$("tbody.bookmarklet").html(html);

		//get exchanges
		//check if fitting exchange exists
		call = Utils.getExchange(user.id,app_id);
		json = JSON.parse(call);
		exchanges = "";
		//console.log(user.id);
		if(typeof json.error != "undefined"){
			exchange = "<span class='status rejected'>No Person Object</span>";
			if(i == 0){
				$(exchange).appendTo($('.exchange'));
			}
			$(exchange).appendTo($('.exchange').eq(i));
			fillExchange(0,i,0);

		}
		else if(json.totalItems == 1){
			//console.log(json);
			exchange = "<span class='status accepted'>Exchange Object Connected</span>";
			if(i == 0){
				$(exchange).appendTo($('.exchange'));
			}
			$(exchange).appendTo($('.exchange').eq(i));
			exchangeID = json.payload[0].id;
			//console.log(exchangeID, i, json.payload[0],user.id);
			fillExchange(exchangeID, i, json.payload[0],user.id);
		}
		else{
			call = Utils.getExchanges(user.id);
			json = JSON.parse(call);
			exchange = "<span class='status'>"+json.totalItems+" Exchange Object(s)</span><br>";
			$('<div class="exchanges">'+exchange+'</div>').appendTo($('.exchange').eq(i));
			if(i == 0){
				$('<div class="exchanges">'+exchange+'</div>').appendTo($('.exchange'));
			}
			
			for (var k in json.payload) {
				exchangeID = json.payload[k].id;
				var button = document.createElement('div');
				button.className = 'status open connect '+i;
				button.id = exchangeID;
  				button.innerHTML = '#'+exchangeID;
				$(button).appendTo($('.exchange').eq(i));
				if(i == 0){
					$(button).appendTo($('.exchange'));
				}
			}
			
		}
		$('#loadingIcon').remove();
		$('.crm-list').show();
	}		
		
	
	$('.crm-list').hide();
	$('<div class="crm-list" id="loadingIcon"><br><br><center><img src="assets/images/icons/loading.svg"></center></div>').insertBefore($('.crm-list'));		
	setTimeout(function (){

		main();

	}, 1000);
}
)();