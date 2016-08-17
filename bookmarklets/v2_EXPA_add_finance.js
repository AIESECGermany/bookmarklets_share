var link = "Link To Your Page Here";
application = angular.element($('ul')).scope().vm.items;
for(var i=0;i<application.length;i++){
	var zeile = $("<li ng-repeat='item in vm.items' class='nav-analytics' style></li>").insertAfter($('ul li.nav-analytics').eq(i));
	console.log(i);

}
$("#fin-inn").remove();
zeile.append("<a id='fin-inn' class='ng-scope' onclick='ajaxRequest()'>Fin-Inn</a><form id='form_lc_id' method='post' action='"+link+"'><input type='text' id='lc_id' name='lc_id' hidden='hidden'></form>");
//get lc id
var person = angular.element($('div.account')).scope().vm;
var lc_id = person.user.home_lc.id;
document.getElementById('lc_id').value = lc_id;
function ajaxRequest(){
	//submit the post
	document.getElementById('form_lc_id').submit();
}