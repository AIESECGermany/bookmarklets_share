(function($){
	var config = {
		noob_base: "https://noob.aiesec.de",
		noob_token: "YourToken"
	};
	//get expa token
	// $.get("https://finance.aiesec.de/includes/php/get_token.php", function(token){
	// 	config.expa_token = token;
	// });

	var persons = {};

	//make sure the button is shown on correct pages
	// jQuery(window).on('hashchange', function() {
 //    	fin_bookmark1();
 //    });
    fin_bookmark1();

    function fin_bookmark1() {
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
			var person = $(el).scope().application.person;
			persons[person.id] = person;
			ids.push(person.id);
		}).remove();
		if(!ids.length) return;
		$("ul.list").empty();
		getData(ids);

		$('<table id="unbooked_op"><tr><th>EP ID</th><th>Name</th><th>AGB Version</th><th>OPS Info</th><th>OP Fee</th></tr></table>')
		.insertBefore('[infinite-scroll="vm.getMoreData()"]');
		$(".no-results").hide();
		$("ul.list").empty();
		$("body").height($(window).height()+150);
	}

	function getData(ids) {
		$.get(config.noob_base + "/reports/unbookedOps", {
				access_token: config.noob_token,
				ids: ids
			}, function(data){
				// console.log(data);
				for(var i in data){
					var id = data[i].personId;
					persons[id].details = data[i];
					insertTableRow(id);
				}
			});
	}

	function insertTableRow(id){
		var person = persons[id];
		// console.log(person);
		var $row = $(
			"<tr>" +
			"<td>" + id +"</td>" +
			"<td><a href='" + person.url + "' target='_blank'>" + person.full_name +"</a></td>" +
			"<td><a href='" + person.details.agbUrl + "' target='_blank'>" + person.details.agbImplementationDate +"</a></td>" +
			"<td><table class='ops'><tr><th>OP</th><th>Datum</th></tr></table></td>" +
			"<td><table class='fee'><tr><th>OP Fee</th><th>Booked</th></tr></table></td>" +
			"</tr>"
		).appendTo("#unbooked_op");
		var opDate = person.details.opStartDate || person.details.opsOnlineBookingDate;
		var opType = person.details.opType + " " + person.details.opLc;
		$row.find(".ops").append("<tr><td>" + opType + "</td><td>" + opDate + "</td></tr>");
		$row.find(".fee").append("<tr><td>" + person.details.amountOfIccFee + "</td><td>" + (JSON.parse(person.details.iccFeeBooked)?"yep":"nope") + "</td></tr>");
	}
	
})(jQuery);