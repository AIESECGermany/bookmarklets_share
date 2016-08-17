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

		/*Deklarierung einer asynchronen Methode, welche die Person mir der übergebenen ID zurück gibt*/
		Utils.getPerson=function (id,successFunction) {
			var call = $.ajax({type: "GET", url: "https://gis-api.aiesec.org/v2//people/"+id+".json?access_token="+Utils.getSecurityToken(), async: false}).responseText;
			return call;
		}

		//########################################################

		function main() {
			$('.programme').remove();
			$('.programme-outer').css("display","block");
			var user = angular.element($('ul.list')).scope().vm.people;
			for(var i=0;i<user.length;i++){
				id = user[i].id;
				call = Utils.getPerson(id);
				person = JSON.parse(call);
				console.log(person);
				if(person.profile != null){
					selected_programs = person.profile.selected_programmes_info;
					for(var k=0;k<selected_programs.length;k++){
						short_name = selected_programs[k].short_name;
						short_name_small = short_name.toLowerCase();
						$('ul.list li.person div.programme-outer').eq(i).prepend($("<span class='programme "+short_name_small+"'>"+short_name+"</span>"));
					}
				}

			}
		}


		main();

	}
)();