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

		//Utils.getSecurityToken=function () {
		//	if(Utils.securityToken===null){
		//		Utils.securityToken=Utils.readSecurityToken();
		//	}
		//	return Utils.securityToken;
		// }


		/*Deklarierung einer asynchronen Methode, welche mir alle Personen zurück gibt*/
		Utils.getOpportunitiesFromDateToDate=function (programm, dateFrom, dateTo, committeeID, pageNumber, elementCount, successFunction, token) {
			return $.get("https://gis-api.aiesec.org/v2/opportunities.json?access_token="+token+"&filters%5Bprogrammes%5D%5B%5D="+programm+"&filters%5Bcreated%5D%5Bfrom%5D="+dateFrom+"&filters%5Bcreated%5D%5Bto%5D="+dateTo+"&filters%5Bcommittee%5D="+committeeID+"&page="+pageNumber+"&per_page="+elementCount, successFunction);
		}

		/*Deklarierung einer asynchronen Methode, welche mir alle Personen zurück gibt*/
		Utils.getOpportunitiesFromDate=function (programm, dateFrom, committeeID, pageNumber, elementCount, successFunction, token) {
			return $.get("https://gis-api.aiesec.org/v2/opportunities.json?access_token="+token+"&filters%5Bprogrammes%5D%5B%5D="+programm+"&filters%5Bcreated%5D%5Bfrom%5D="+dateFrom+"&filters%5Bcommittee%5D="+committeeID+"&page="+pageNumber+"&per_page="+elementCount, successFunction);
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
			} else if ($('input:radio:checked:eq(0)').val() == "person") {
				alert("This bookmarklet is only for opportunities, not people");
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
					var call=Utils.getOpportunitiesFromDateToDate(3, dateFrom, dateTo, committeeID, 1, 10, saveNumber(rowIndex, dateFrom, dateTo, committeeID, token), token);
				} else {
					if ($('select.third:eq(0)').val()== ("custom" || "customQuarter")) {
						var call=Utils.getOpportunitiesFromDateToDate(programm, dateFrom, dateTo, committeeID, 1, 10, createOutput(rowIndex), token);

					} else {
						var call=Utils.getOpportunitiesFromDate(programm, dateFrom, committeeID, 1, 10, createOutput(rowIndex), token);

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
				$(this).find('th').eq(1).before('<th class="bookmark-row">Raises</th>');
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
				var call=Utils.getOpportunitiesFromDateToDate(4, dateFrom, dateTo, committeeID, 1, 10, addTlp(rowIndex, itemsNumber), token);
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
				console.log(returnDate);
			} else if(input=="30") {
				returnDate.setDate(today.getDate()-30);
			} else if(input=="7") {
				returnDate.setDate(today.getDate()-7);
				console.log(returnDate);
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
				console.log(customDate);
				if(customDate == "Invalid Date"){
					var date = new Date();
					returnDate = date;
				}
			}
			return returnDate;
		}




		main();

	}
)();