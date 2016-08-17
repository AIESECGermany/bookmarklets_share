(function($){
	var config = {
		noob_base: "https://noob.aiesec.de",
		noob_token: "YourToken"
	};
	//########################################################
	// function Utils(){}
	// Utils.securityToken=null;
	// Utils.tokenName='expa_token';

	// /*Deklarierung einer Methode, welche das SecurityToken aus den Cookies liest*/
	// Utils.readSecurityToken=function () {
	// 	var cookieContent;
	// 	var search_for = Utils.tokenName+"=";
	// 	var cookies = document.cookie.split(';');
	// 	for(var i = 0; i < cookies.length; i++) {
	// 		var c = cookies[i];
	// 		while (c.charAt(0) == ' '){
	// 			c = c.substring(1, c.length);
	// 		}
	// 		if (c.indexOf(search_for) === 0) {
	// 			cookieContent = decodeURIComponent(c.substring(search_for.length,c.length));
	// 		}
	// 	}
	// 	return cookieContent;
	// };

	// Utils.getSecurityToken=function () {
	// 	if(Utils.securityToken===null){
	// 		Utils.securityToken=Utils.readSecurityToken();
	// 	}
	// 	return Utils.securityToken;
	// };

	//get MC expa token
	// $.get("https://finance.aiesec.de/includes/php/get_token.php", function(token){
	// 	config.expa_token = token;
	// });

	var persons = {};

	//make sure the button is shown on correct pages
	// jQuery(window).on('hashchange', function() {
 //    	fin_bookmark1();
 //    });
    fin_bookmark4();

    function fin_bookmark4() {
    	// TODO: sorting der Tabelle
		// only on some expa pages
		if(window.location.hash.indexOf("#/people/applications") < 0) return;


		$("<style>table.fee td,table.fee th,table.ops td,table.ops th{padding:2px 4px}</style>").appendTo("head");

		// Overriding XMLHttpRequest so we can extend the list on scrolling
	    var oldXHR = window.XMLHttpRequest;
	    function newXHR() {
	        var realXHR = new oldXHR();
	 
	        realXHR.addEventListener("readystatechange", function() { 
	            if(realXHR.readyState == 4 && realXHR.status == 200) {
	            	// console.log(realXHR);
	            	if(realXHR.responseURL.indexOf("https://gis-api.aiesec.org/v2/applications.json") > -1) {
	            		var applications = JSON.parse(realXHR.response).data;
	            		var ids = [];
	            		for(var i in applications) {
	            			var person = applications[i].person;
	            			persons[person.id] = person;
	            			persons[person.id].application = applications[i];
	            			ids.push(person.id);
	            		}
	            		getData(ids);
	            	}
	        	}
	        }, false);
	 
	        return realXHR;
	    }
	 	window.XMLHttpRequest = newXHR;
		
		
		// if(!config.expa_token) return;

		//loop over people
		var ids = [];
		$("li[ng-repeat].application").each(function(i,el) {
			var application = $(el).scope().application;
			var person = application.person;
			persons[person.id] = person;
			persons[person.id].application = application;
	
			ids.push(person.id);
		}).remove();
		if(ids.length === 0) return;
		$("ul.list").empty();
		console.log(ids.length);
		getData(ids);

		$('<table id="unbooked_deposits"><tr><th>EP ID</th><th>Name</th><th>AGB Version</th><th>Bankdaten</th><th>Account Balance</th></tr></table>')
		.insertBefore('[infinite-scroll="vm.getMoreData()"]');
		$(".no-results").hide();
		$("ul.list").empty();
		$("body").height($(window).height()+150);
	}

	function getData(ids) {
		$.get(config.noob_base + "/reports/unbookedDeposits", {
				access_token: config.noob_token,
				ids: ids
			}, function(data){
				console.log(data);
				for(var i in data){
					var id = data[i].personId;
					console.log(id);
					persons[id].details = data[i];
					insertTableRow(id);
				}
			});
	}

	function insertTableRow(id){
		var person = persons[id];
		console.log(person);
		var $row = $(
			"<tr>" +
			"<td>" + id +"</td>" +
			"<td><a href='" + person.url + "' target='_blank'>" + person.full_name +"</a></td>" +
			"<td><a href='" + person.details.agbUrl + "' target='_blank'>" + person.details.agbImplementationDate +"</a></td>" +
			"<td><table class='fee'><tr><th colspan='2'>Bankdaten</th></tr></table></td>" +
			"<td>" + person.details.bankBalance + "</td>" +
			"</tr>"
		).appendTo("#unbooked_deposits");
		$row.find(".fee")
		.append("<tr><td>Account Owner</td><td>" + person.details.bankAccountOwner + "</td></tr>")
		.append("<tr><td>IBAN</td><td>" + person.details.bankIban + "</td></tr>")
		.append("<tr><td>BIC</td><td>" + person.details.bankBic + "</td></tr>")
		.append("<tr><td>Bank</td><td>" + person.details.bankName + "</td></tr>");
	}
	
})(jQuery);