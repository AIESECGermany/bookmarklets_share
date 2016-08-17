javascript: (function(){
	//########################################################
	var token_link = "Link To File That Generates Your Token";

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
	
	Utils.getSecurityTokenEXPA=function () {
		if(Utils.securityToken===null){
			Utils.securityToken=Utils.readSecurityToken();
		}
		return Utils.securityToken;
	}
	

	/*Deklarierung einer asynchronen Methode, welche mir alle Personen zurück gibt*/
	Utils.getPersonsFromDateToDate=function (programm, dateFrom, dateTo, committeeID, pageNumber, elementCount, successFunction, token) {
		return $.get("https://gis-api.aiesec.org/v2/people.json?access_token="+token+"&filters%5Bselected_programmes%5D%5B%5D="+programm+"&filters%5Bregistered%5D%5Bfrom%5D="+dateFrom+"&filters%5Bregistered%5D%5Bto%5D="+dateTo+"&filters%5Bhome_committee%5D="+committeeID+"&page="+pageNumber+"&per_page="+elementCount, successFunction);
	}
	Utils.getApps=function (programm, dateFrom, dateTo, committeeID, pageNumber, elementCount, token) {
		var call = $.ajax({type: "GET", url: "https://gis-api.aiesec.org/v2/people.json?access_token="+token+"&filters%5Bselected_programmes%5D%5B%5D="+programm+"&filters%5Bregistered%5D%5Bfrom%5D="+dateFrom+"&filters%5Bregistered%5D%5Bto%5D="+dateTo+"&filters%5Bhome_committee%5D="+committeeID+"&page="+pageNumber+"&per_page="+elementCount, async: false}).responseText;
		return call;
	}
	Utils.getAnalytics=function (programm, dateFrom, dateTo, committeeID, successFunction, token) {
		var call = $.ajax({type: "GET", url: "https://gis-api.aiesec.org/v2/applications/analyze.json?access_token="+Utils.getSecurityTokenEXPA()+"&basic%5Bhome_office_id%5D="+committeeID+"&basic%5Btype%5D=person&programmes%5B%5D="+programm+"&start_date="+dateFrom+"&end_date="+dateTo+"&filters%5Bhome_committee%5D="+committeeID, async: false}).responseText;
		return call;
	}
	/*Deklarierung einer asynchronen Methode, welche mir alle Personen zurück gibt*/
	Utils.getPersonsFromDate=function (programm, dateFrom, committeeID, pageNumber, elementCount, successFunction, token) {
		return $.get("https://gis-api.aiesec.org/v2/people.json?access_token="+token+"&filters%5Bselected_programmes%5D%5B%5D="+programm+"&filters%5Bregistered%5D%5Bfrom%5D="+dateFrom+"&filters%5Bhome_committee%5D="+committeeID+"&page="+pageNumber+"&per_page="+elementCount, successFunction);
	}
	Utils.getSecurityToken=function () {
		return $.ajax({type: "GET", url: token_link, async: false}).responseText;
	}

	//########################################################
	
	
	function main() {
		if (requestLegal()) {
			cleanPage();
			var dateFrom=getDateFrom();
			var dateTo=getDateTo();
			var programm=getProgramm();
			var token = Utils.getSecurityToken();
			setUpTable();
			createReport();
			fillDataPerRow(dateFrom, dateTo, programm, token);
			setApplyToCleanPage();
		}
		
	}

	function cleanPage() {
		$('th.bookmark-row').remove();
		$('td.bookmark-row').remove();
		$(".change").remove()	
	}

	function requestLegal() {
		if ($('table.analytics-applications').hasClass('ng-hide') == true) {
			alert("Please hit the apply button before activating bookmarklet!");
			return false;
		} else if ($('input:radio:checked:eq(0)').val() == "opportunity") {
			alert("This bookmarklet is only for people, not opportunities");
			return false;
		} else {
			return true;
		}
	}

	function fillDataPerRow(dateFrom, dateTo, programm, token) {
		$('table.analytics-applications').find('tbody').find('tr').each(function(){
        	var rowIndex=$(this).index();   
        	var linkString=$(this).find('td').eq(0).find('a').attr('href');
        	var linkSplit=linkString.split('=');
        	var nextElement=linkSplit[1].split('&');
        	var committeeID=nextElement[0];
        	
        	if (programm == 3) {
					var call=Utils.getPersonsFromDateToDate(3, dateFrom, dateTo, committeeID, 1, 10, saveNumber(rowIndex, dateFrom, dateTo, committeeID, token), token);
			} else {
				if ($('select.third:eq(0)').val()== ("custom" || "customQuarter")) {
					var call=Utils.getPersonsFromDateToDate(programm, dateFrom, dateTo, committeeID, 1, 10, createOutput(rowIndex), token);
					
				} else {
					var call=Utils.getPersonsFromDate(programm, dateFrom, committeeID, 1, 10, createOutput(rowIndex), token);
		
				}
			}
        	
        	
   		});		
	}

	function setApplyToCleanPage() {
		$('a.confirm').eq(0).click(function(){
			$('th.bookmark-row').remove();
			$('td.bookmark-row').remove();
		})
	}


	function setUpTable() {
		$('table.analytics-applications').find('thead').find('tr').each(function(){
        	$(this).find('th').eq(1).before('<th class="bookmark-row">Sign&#8209;Ups</th>');
   		});
		$('table.analytics-applications').find('tbody').find('tr').each(function(){
        	$(this).find('td').eq(1).before('<td class="bookmark-row"></td>');
   		});
	//	$('table.analytics-applications').find('tbody').find('tr').eq(0).find('td').eq(1).append("testing");
	}

	function createOutput(rowIndex) {
		return function(data) {
			$('table.analytics-applications').find('tbody').find('tr').eq(rowIndex).find('td').eq(1).append('<span class="value" style="padding-left: 20px;">'+data.paging.total_items+'</span>');
		}
	}

	function saveNumber(rowIndex, dateFrom, dateTo, committeeID, token) {
		return function(data) {
			var items=data.paging.total_items;
			var itemsNumber=parseInt(items);
			var call=Utils.getPersonsFromDateToDate(4, dateFrom, dateTo, committeeID, 1, 10, addTlp(rowIndex, itemsNumber), token);
		}
	}

	function addTlp(rowIndex, itemsNumber) {
		return function(data) {
			var tlpItems = parseInt(data.paging.total_items);
			var fillNumber=itemsNumber+tlpItems;
			$('table.analytics-applications').find('tbody').find('tr').eq(rowIndex).find('td').eq(1).append('<span class="value" style="padding-left: 20px;">'+fillNumber+'</span>');
		}
	}

	function getProgramm() {
		var checkedButton = $('input:radio:checked:eq(1)').val();
		if (checkedButton=="3,4") {
			checkedButton = 3;
		}

		return checkedButton;
	}

	function getDateFrom() {
		var today = new Date();
		var returnDate = new Date();
		var input=$('select.third:eq(0)').val();
		if (input=="365") {
			returnDate.setFullYear(today.getFullYear()-1);
		} else if (input=="quarter") {
			var currentQuarter=Math.floor(today.getMonth() / 3);
			returnDate.setDate(1);
			returnDate.setMonth(currentQuarter * 3);
			//console.log(returnDate);
		} else if(input=="30") {
			returnDate.setDate(today.getDate()-30);
		} else if(input=="7") {
			returnDate.setDate(today.getDate()-7);
			//console.log(returnDate);
		} else if(input=="customQuarter") {
			var quarterString=$('select.third:eq(1)').val().split("Q");
			var quarter=parseInt(quarterString[1]-1);
			var yearString=$('select.third:eq(2)').val().split(":");
			var year=parseInt(yearString[1]);
			returnDate.setDate(1);
			returnDate.setMonth(quarter * 3);
			returnDate.setFullYear(year);
		} else if(input=="custom") {
			customDate = new Date($('input.i-datepicker:eq(0)').val());
			returnDate = customDate;
		}
		return returnDate;
	}
	function getPokemon(){
		var pokemon = ["Bulbasaur","Ivysaur","Venusaur","Charmander","Charmeleon","Charizard","Squirtle","Wartortle","Blastoise","Caterpie","Metapod","Butterfree","Weedle","Kakuna","Beedrill","Pidgey","Pidgeotto","Pidgeot","Rattata","Raticate","Spearow","Fearow","Ekans","Arbok","Pikachu","Raichu","Sandshrew","Sandslash","Nidoran♀","Nidorina","Nidoqueen","Nidoran♂","Nidorino","Nidoking","Clefairy","Clefable","Vulpix","Ninetales","Jigglypuff","Wigglytuff","Zubat","Golbat","Oddish","Gloom","Vileplume","Paras","Parasect","Venonat","Venomoth","Diglett","Dugtrio","Meowth","Persian","Psyduck","Golduck","Mankey","Primeape","Growlithe","Arcanine","Poliwag","Poliwhirl","Poliwrath","Abra","Kadabra","Alakazam","Machop","Machoke","Machamp","Bellsprout","Weepinbell","Victreebel","Tentacool","Tentacruel","Geodude","Graveler","Golem","Ponyta","Rapidash","Slowpoke","Slowbro","Magnemite","Magneton","Farfetch’d","Doduo","Dodrio","Seel","Dewgong","Grimer","Muk","Shellder","Cloyster","Gastly","Haunter","Gengar","Onix","Drowzee","Hypno","Krabby","Kingler","Voltorb","Electrode","Exeggcute","Exeggutor","Cubone","Marowak","Hitmonlee","Hitmonchan","Lickitung","Koffing","Weezing","Rhyhorn","Rhydon","Chansey","Tangela","Kangaskhan","Horsea","Seadra","Goldeen","Seaking","Staryu","Starmie","Mr. Mime","Scyther","Jynx","Electabuzz","Magmar","Pinsir","Tauros","Magikarp","Gyarados","Lapras","Ditto","Eevee","Vaporeon","Jolteon","Flareon","Porygon","Omanyte","Omastar","Kabuto","Kabutops","Aerodactyl","Snorlax","Articuno","Zapdos","Moltres","Dratini","Dragonair","Dragonite","Mewtwo","Mew"];
		var number = Math.floor((Math.random() * 151) + 1);
		return pokemon[number];
	}
	function getDateTo() {
		var today = new Date();
		var returnDate = new Date();
		var input=$('select.third:eq(0)').val();
		if(input=="customQuarter") {
			var quarterString=$('select.third:eq(1)').val().split("Q");
			var quarter=parseInt(quarterString[1]);
			var yearString=$('select.third:eq(2)').val().split(":");
			var year=parseInt(yearString[1]);
			returnDate.setDate(1);
			returnDate.setMonth(quarter * 3);
			returnDate.setFullYear(year);
			returnDate.setDate(returnDate.getDate()-1);
		} else if(input=="custom") {
			customDate = new Date($('input.i-datepicker:eq(1)').val());
			returnDate = customDate;
			//console.log(customDate);
			if(customDate == "Invalid Date"){
				var date = new Date();
				returnDate = date;
			}
		}
		return returnDate;
	}
	function createReport(){
		$('#report').remove();
		var zeile = $("<div class='analytics-explainer' style='width:100%;min-width:1250px!important;height: 700px; background-color:#f8fbfd;' id='report'><div id='spacer'><br><br></div></div>").insertAfter($('.analytics-explainer'));
		var zeile = $('<div id="graph"></div>').appendTo($('#report'));
		var lc = $('table.analytics-applications').find('tbody').find('tr').find('td').eq(0)[0].innerText;
		//create buttons
		var button = document.createElement('div');
  		button.className = 'btn';
  		buttonComplete = button;
  		buttonComplete.id = "buttonComplete";
  		buttonComplete.style['margin-right'] = "10px";
  		buttonComplete.innerHTML = 'Compare Completes';
		buttonComplete.onclick = function(){
			completeGraph();
		};
		var zeile = $(buttonComplete).prependTo($('#report'));
		
		var button = document.createElement('div');
  		button.className = 'btn';
  		buttonRealize = button;
  		buttonRealize.id = "buttonRealize";
  		buttonRealize.style['margin-right'] = "10px";
  		buttonRealize.style['margin-bottom'] = "10px";
  		buttonRealize.innerHTML = 'Compare Realizes';
		buttonRealize.onclick = function(){
			realizeGraph();
		};
		var zeile = $(buttonRealize).prependTo($('#report'));
		
		var button = document.createElement('div');
  		button.className = 'btn';
		buttonApprove = button;
  		buttonApprove.id = "buttonApprove";
  		buttonApprove.style['margin-right'] = "10px";
  		buttonApprove.style['margin-bottom'] = "10px";
  		buttonApprove.innerHTML = 'Compare Approves';
		buttonApprove.onclick = function(){
			approveGraph();
		};
		var zeile = $(buttonApprove).prependTo($('#report'));
		
		var button = document.createElement('div');
  		button.className = 'btn';
  		buttonInProgress = button;
  		buttonInProgress.id = "buttonProgress";
  		buttonInProgress.style['margin-right'] = "10px";
  		buttonInProgress.innerHTML = 'Compare In Progress';
		buttonInProgress.onclick = function(){
			progressGraph();
		};
		var zeile = $(buttonInProgress).prependTo($('#report'));
		
		var button = document.createElement('div');
  		button.className = 'btn';
  		buttonApplication = button;
  		buttonApplication.id = "buttonApplication";
  		buttonApplication.style['margin-right'] = "10px";
  		buttonApplication.style['margin-bottom'] = "10px";
  		buttonApplication.innerHTML = 'Compare Applications';
		buttonApplication.onclick = function(){
			applicationGraph();
		};
		var zeile = $(buttonApplication).prependTo($('#report'));
		
		var button = document.createElement('div');
  		button.className = 'btn';
		buttonTimeAnalysis = button;
  		buttonTimeAnalysis.id = "buttonTimeAnalysis";
  		buttonTimeAnalysis.style['margin-right'] = "10px";
  		buttonTimeAnalysis.style['margin-bottom'] = "10px";
  		buttonTimeAnalysis.innerHTML = 'Analysis over time '+lc;
		buttonTimeAnalysis.onclick = function(){
			timeAnalysisGraph();
		};
		var zeile = $(buttonTimeAnalysis).prependTo($('#report'));
		
		var button = document.createElement('div');
  		button.className = 'btn';
		buttonConversion = button;
  		buttonConversion.id = "buttonConversion";
  		buttonConversion.style['margin-right'] = "10px";
  		buttonConversion.style['margin-bottom'] = "10px";
  		buttonConversion.innerHTML = 'Conversion '+lc;
		buttonConversion.onclick = function(){
			conversionGraph();
		};
		var zeile = $(buttonConversion).prependTo($('#report'));
		var zeile = $("<span class='statement ng-binding'>Choose Report Type<br><br></span>").prependTo($('#report'));
  	}
  	
  	function timeAnalysisGraph(){
  		//get Program
  		programm = getProgramm();
  		//get LC
		linkString = $('table.analytics-applications').find('tbody').find('tr').eq(0).find('td').eq(0).find('a').attr('href');
        var linkSplit=linkString.split('=');
        var nextElement=linkSplit[1].split('&');
        var committeeID=nextElement[0];
		//set up data array
		var data = new google.visualization.DataTable();
      	data.addColumn('date', 'Month');
      	data.addColumn('number', "Applications");
      	data.addColumn('number', "In Progress");
      	data.addColumn('number', "Approves");
      	data.addColumn('number', "Realizes");
      	data.addColumn('number', "Completes");
      	//gettoken
      	var token = Utils.getSecurityToken();
      	//get Dates
  		dateFrom = getDateFrom();
  		dateTo = getDateTo();
  		var timeDiff = Math.abs(dateTo.getTime() - dateFrom.getTime());
		var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
		//get Month
		var month = dateFrom.getUTCMonth() + 1; //months from 1-12
		var day = dateFrom.getUTCDate();
		var year = dateFrom.getUTCFullYear();
		newDateTemp = dateFrom.getTime();
		if(diffDays > 90){
			//divide diffDays through 30 to get number of months		
			months = Math.ceil(diffDays / 30.5);
  			//now I loop through the number of months
			for(var i = 0; i <= months; i++) {
				newDateTemp = Math.abs(newDateTemp+1000*3600*24*30.5);
				dateTo = new Date(newDateTemp);
				
				numbers = Utils.getAnalytics(programm, dateFrom, dateTo, committeeID);
				numbers = JSON.parse(numbers);
				numbers = numbers.analytics;
				//do applications later
				apps = Utils.getApps(programm, dateFrom, dateTo, committeeID,1,10,token);
				apps = JSON.parse(apps);
				apps = apps.paging.total_items;
				//apps = JSON.parse(numbers);
				realized = numbers.total_realized.doc_count;
				in_progress = numbers.total_applications.doc_count;
				completes = numbers.total_completed.doc_count;
				matches = numbers.total_approvals.doc_count;
				console.log(dateFrom,dateTo, apps,in_progress, matches, realized, completes);
				data.addRows([
        			[dateFrom, apps, in_progress, matches, realized, completes]
        		]);
				dateFrom = dateTo;

			}
		}
		else if(diffDays > 10){
			weeks = Math.floor(diffDays / 7);
			//get week
			for(var i = 0; i <= weeks; i++) {
				newDateTemp = Math.abs(newDateTemp+1000*3600*24*7);
				dateTo = new Date(newDateTemp);
				
				numbers = Utils.getAnalytics(programm, dateFrom, dateTo, committeeID);
				numbers = JSON.parse(numbers);
				numbers = numbers.analytics;
				//do applications later
				apps = Utils.getApps(programm, dateFrom, dateTo, committeeID,1,10,token);
				apps = JSON.parse(apps);
				apps = apps.paging.total_items;
				//apps = JSON.parse(numbers);
				realized = numbers.total_realized.doc_count;
				in_progress = numbers.total_applications.doc_count;
				completes = numbers.total_completed.doc_count;
				matches = numbers.total_approvals.doc_count;
				console.log(dateFrom,dateTo, apps,in_progress, matches, realized, completes);
				data.addRows([
        			[dateFrom, apps, in_progress, matches, realized, completes]
        		]);
				dateFrom = dateTo;
			}
		}
		else{
			
			//get week
			for(var i = 0; i <= diffDays; i++) {
				//datefrom and dateto is always supposed to be the same day to have really the daily etc...
				
				dateTo = dateFrom;
				
				numbers = Utils.getAnalytics(programm, dateFrom, dateTo, committeeID);
				numbers = JSON.parse(numbers);
				numbers = numbers.analytics;
				//do applications later
				apps = Utils.getApps(programm, dateFrom, dateTo, committeeID,1,10,token);
				apps = JSON.parse(apps);
				apps = apps.paging.total_items;
				//apps = JSON.parse(numbers);
				realized = numbers.total_realized.doc_count;
				in_progress = numbers.total_applications.doc_count;
				completes = numbers.total_completed.doc_count;
				matches = numbers.total_approvals.doc_count;
				console.log(dateFrom,dateTo, apps,in_progress, matches, realized, completes);
				data.addRows([
        			[dateFrom, apps, in_progress, matches, realized, completes]
        		]);
				newDateTemp = Math.abs(newDateTemp+1000*3600*24);
				dateFrom = new Date(newDateTemp);
			}
		}
		 var options = {
   			    backgroundColor: '#f8fbfd',
   			    height: 500,
   			    width:1150,
   			    colors: ['#3692e0', '#3c3', '#393', '#c33', '#ff9834'],
   			    series: {
        		  // Gives each series an axis name that matches the Y-axis below.
        		  0: {targetAxisIndex: 0},
        		  1: {targetAxisIndex: 0},
          		  2: {targetAxisIndex: 1},
          		  3: {targetAxisIndex: 1},
          		  4: {targetAxisIndex: 1}
        		  
        		},
        		axes: {
        		  // Adds labels to each axis; they don't have to match the axis names.
        		  y: {
        		    0: {title: 'Applications, In Progress'},
          			1: {title: 'Matches, Realizes, Completes'}
        		  }
        		}
   			  };
     var chart = new google.visualization.LineChart(document.getElementById('graph'));
      chart.draw(data, options);
  	}
  	
  	function conversionGraph(){
  		//pokemon
		pokemon = getPokemon();  	
  	
  		$('#graph').empty();
		$('table.analytics-applications').find('tbody').find('tr').eq(0).each(function(){
			var lc = $(this).find('td').eq(1).prevObject[0].innerText;
			var applications = $(this).find('td').eq(1).prevObject[1].innerText;
			var in_progress = $(this).find('td').eq(1).prevObject[2].innerText;
			var approved = $(this).find('td').eq(1).prevObject[6].innerText;
			var realized = $(this).find('td').eq(1).prevObject[7].innerText;
			var completed = $(this).find('td').eq(1).prevObject[8].innerText;
			var lc_array = [lc, applications, in_progress, approved, realized, completed];
			chart_array = lc_array;
		});
		if(chart_array[1] == ""){
			alert("Wait until Sign-Ups column is complete");
			return;
		}
		applications = parseInt(chart_array[1]);
		in_progress = parseInt(chart_array[2]);
		approved = parseInt(chart_array[3]);
		realized = parseInt(chart_array[4]);
		completed = parseInt(chart_array[5]);
		console.log(chart_array);
		google.charts.setOnLoadCallback(drawChart);
		function drawChart() {
   			var data = new google.visualization.DataTable();
   			data.addColumn('string', 'Name');
   			data.addColumn('number', pokemon);
   			data.addColumn({type: 'string', role: 'style'});
   			data.addRows([
   			    ['Applications', applications, 'color: #3692e0'],
   			    ['In Progress', in_progress, 'color: #3c3'],
   			    ['Approves', approved, 'color: #393'],
   			    ['Realizes', realized, 'color: #c33'],
   			    ['Completes', completed, 'color: #ff9834']
			
   			]);
			
   			  var options = {
   			    backgroundColor: '#f8fbfd',
   			    height: 500,
   			    width:1150,
   			  };
			
   			  var chart = new google.visualization.ColumnChart(document.getElementById('graph'));
   			  chart.draw(data, options);
    	}
    

	google.load('visualization', '1', {packages:['corechart'], callback: drawChart});
		
	}
	function applicationGraph(){
		
		$('#graph').empty();
		array_lcs = [];
		var i = 0;
		$('table.analytics-applications').find('tbody').find('tr').each(function(){
			i++;
			var lc = $(this).find('td').eq(1).prevObject[0].innerText;
			if(i == 1){
				console.log("Hello");
			}
			else{
			var approved = $(this).find('td').eq(1).prevObject[1].innerText;
				//console.log(approved);
				approved = parseInt(approved);
				color = "#3692e0";
				var lc_array = [lc, approved];
				array_lcs.push([lc,approved,color]);	
				chart_array = lc_array;
			}
		});
		if(chart_array[0] == ""){
			alert("Wait until Sign-Ups column is complete");
			return;
		}
		console.log(array_lcs);
		google.charts.setOnLoadCallback(drawChart);
		function drawChart() {
   		   	var data = new google.visualization.DataTable();
   			data.addColumn('string', 'Name');
   			data.addColumn('number', 'Applications');
   			data.addColumn({type: 'string', role: 'style'});
   			data.addRows(array_lcs);
		
   			var options = {
   		    	backgroundColor: '#f8fbfd',
   		    	height:500,
   		    	width:1150,
   		  	};
		
   		  	var chart = new google.visualization.ColumnChart(document.getElementById('graph'));
   		  	chart.draw(data, options);
   		}
   		google.load('visualization', '1', {packages:['corechart'], callback: drawChart});
	}
	function realizeGraph(){
		$('#graph').empty();
		array_lcs = [];
		var i = 0;
		$('table.analytics-applications').find('tbody').find('tr').each(function(){
			i++;
			var lc = $(this).find('td').eq(1).prevObject[0].innerText;
			if(i == 1){
				console.log("Hello");
			}
			else{
			var approved = $(this).find('td').eq(1).prevObject[7].innerText;
				//console.log(approved);
				approved = parseInt(approved);
				color = "#c33";
				var lc_array = [lc, approved];
				array_lcs.push([lc,approved,color]);	
				chart_array = lc_array;
			}
		});
		if(chart_array[0] == ""){
			alert("Wait until Sign-Ups column is complete");
			return;
		}
		console.log(array_lcs);
		google.charts.setOnLoadCallback(drawChart);
		function drawChart() {
   		   	var data = new google.visualization.DataTable();
   			data.addColumn('string', 'Name');
   			data.addColumn('number', 'Realizes');
   			data.addColumn({type: 'string', role: 'style'});
   			data.addRows(array_lcs);
		
   			var options = {
   		    	backgroundColor: '#f8fbfd',
   		    	height:500,
   		    	width:1150,
   		  	};
		
   		  	var chart = new google.visualization.ColumnChart(document.getElementById('graph'));
   		  	chart.draw(data, options);
   		}
   		google.load('visualization', '1', {packages:['corechart'], callback: drawChart});
	}
	function progressGraph(){
		$('#graph').empty();
		array_lcs = [];
		var i = 0;
		$('table.analytics-applications').find('tbody').find('tr').each(function(){
			i++;
			var lc = $(this).find('td').eq(1).prevObject[0].innerText;
			if(i == 1){
				console.log("Hello");
			}
			else{
			var approved = $(this).find('td').eq(1).prevObject[7].innerText;
				//console.log(approved);
				approved = parseInt(approved);
				color = "#3c3";
				var lc_array = [lc, approved];
				array_lcs.push([lc,approved,color]);	
				chart_array = lc_array;
			}
		});
		if(chart_array[0] == ""){
			alert("Wait until Sign-Ups column is complete");
			return;
		}
		console.log(array_lcs);
		google.charts.setOnLoadCallback(drawChart);
		function drawChart() {
   		   	var data = new google.visualization.DataTable();
   			data.addColumn('string', 'Name');
   			data.addColumn('number', 'In Progress');
   			data.addColumn({type: 'string', role: 'style'});
   			data.addRows(array_lcs);
		
   			var options = {
   		    	backgroundColor: '#f8fbfd',
   		    	height:500,
   		    	width:1150,
   		  	};
		
   		  	var chart = new google.visualization.ColumnChart(document.getElementById('graph'));
   		  	chart.draw(data, options);
   		}
   		google.load('visualization', '1', {packages:['corechart'], callback: drawChart});
	}
	function completeGraph(){
		$('#graph').empty();
		array_lcs = [];
		var i = 0;
		$('table.analytics-applications').find('tbody').find('tr').each(function(){
			i++;
			var lc = $(this).find('td').eq(1).prevObject[0].innerText;
			if(i == 1){
				console.log("Hello");
			}
			else{
			var approved = $(this).find('td').eq(1).prevObject[8].innerText;
				//console.log(approved);
				approved = parseInt(approved);
				color = "#ff9834";
				var lc_array = [lc, approved];
				array_lcs.push([lc,approved,color]);	
				chart_array = lc_array;
			}
		});
		if(chart_array[0] == ""){
			alert("Wait until Sign-Ups column is complete");
			return;
		}
		console.log(array_lcs);
		google.charts.setOnLoadCallback(drawChart);
		function drawChart() {
   		   	var data = new google.visualization.DataTable();
   			data.addColumn('string', 'Name');
   			data.addColumn('number', 'Completes');
   			data.addColumn({type: 'string', role: 'style'});
   			data.addRows(array_lcs);
		
   			var options = {
   		    	backgroundColor: '#f8fbfd',
   		    	height:500,
   		    	width:1150,
   		  	};
		
   		  	var chart = new google.visualization.ColumnChart(document.getElementById('graph'));
   		  	chart.draw(data, options);
   		}
   		google.load('visualization', '1', {packages:['corechart'], callback: drawChart});
	}
	function approveGraph(){
		$('#graph').empty();
		array_lcs = [];
		var i = 0;
		$('table.analytics-applications').find('tbody').find('tr').each(function(){
			i++;
			var lc = $(this).find('td').eq(1).prevObject[0].innerText;
			if(i == 1){
				console.log("Hello");
			}
			else{
			var approved = $(this).find('td').eq(1).prevObject[6].innerText;
				//console.log(approved);
				approved = parseInt(approved);
				color = "#393";
				var lc_array = [lc, approved];
				array_lcs.push([lc,approved,color]);	
				chart_array = lc_array;
			}
		});
		if(chart_array[0] == ""){
			alert("Wait until Sign-Ups column is complete");
			return;
		}
		console.log(array_lcs);
		google.charts.setOnLoadCallback(drawChart);
		function drawChart() {
   		   	var data = new google.visualization.DataTable();
   			data.addColumn('string', 'Name');
   			data.addColumn('number', 'Approves');
   			data.addColumn({type: 'string', role: 'style'});
   			data.addRows(array_lcs);
		
   			var options = {
   		    	backgroundColor: '#f8fbfd',
   		    	height:500,
   		    	width:1150,
   		  	};
		
   		  	var chart = new google.visualization.ColumnChart(document.getElementById('graph'));
   		  	chart.draw(data, options);
   		}
   		google.load('visualization', '1', {packages:['corechart'], callback: drawChart});
	}
	

	

	main();
	
}
)();