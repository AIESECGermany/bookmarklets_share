javascript: (function () {

	var server = "LinkToYourServer";
	var server = "https://bookmarks.aiesec.de/bookmarklets/minified/";

	var autoScriptExecution=false;
	var autoScriptExecutionSleep=3000;

	var scriptLocations = new Array();
	scriptLocations.push({regEx:'https:\/\/experience\.aiesec\.org\/\#\/people\/[0-9]+\/applications',scripts:[{url:server+'v2_EXPA_ep_dates.min.js',name:'show EP dates'}]});
	scriptLocations.push({regEx:'https:\/\/experience-v1\.aiesec\.org\/#\/people\/[0-9]+', scripts:[{url:server+'v1_EXPA_ep_dates.min.js',name:'show EP dates'}]});
	scriptLocations.push({regEx:'https:\/\/experience\.aiesec\.org\/\#\/opportunities\/[0-9]+',scripts:[{url:server+'v2_EXPA_tn_manager_bookmarklet.min.js',name:'show TN manager e-mail'}]});
	scriptLocations.push({regEx:'https:\/\/experience-v1\.aiesec\.org\/#\/opportunities\/[0-9]+', scripts:[{url:server+'v1_EXPA_tn_manager_bookmarklet.min.js',name:'show TN manager e-mail'}]});
	scriptLocations.push({regEx:'https:\/\/experience-v1\.aiesec\.org\/#\/people[^\/]*', scripts:[{url:server+'v1_EXPA_preferred_locations.min.js',name:'show preferred locations'}]});
	scriptLocations.push({regEx:'https:\/\/experience\.aiesec\.org\/#\/people[^\/]*', scripts:[{url:server+'v2_EXPA_preferred_locations.min.js',name:'show preferred locations'}]});
	scriptLocations.push({regEx:'https:\/\/experience\.aiesec\.org\/#\/people\/[0-9]+\/applications', scripts:[{url:server+'v2_EXPA_TN_manager_follow_up.min.js',name:'TN manager follow up table'}]});
	scriptLocations.push({regEx:'https:\/\/experience\.aiesec\.org\/#\/people\/[0-9]+\/applications', scripts:[{url:server+'v2_EXPA_show_program.min.js',name:'show program of applications'}]});
	scriptLocations.push({regEx:'https:\/\/experience\.aiesec\.org\/#\/.*', scripts:[{url:server+'v2_show_access_token.min.js',name:'show access token'}]});
	scriptLocations.push({regEx:'https:\/\/internships-v1\.aiesec\.org\/#\/.*', scripts:[{url:server+'v2_op_show_access_token.min.js',name:'show access token'}]});
	scriptLocations.push({regEx:'https:\/\/internships-v1\.aiesec\.org\/#\/applications', scripts:[{url:server+'v1_show_favorites.min.js',name:'show your favorites!'}]});
	scriptLocations.push({regEx:'https:\/\/experience\.aiesec\.org\/#\/people[^\/]*', scripts:[{url:server+'v2_EXPA_application_number.min.js',name:'show number of applications per EP'}]});
	scriptLocations.push({regEx:'https:\/\/experience\.aiesec\.org\/#\/people\/[0-9]+\/applications', scripts:[{url:server+'v2_EXPA_create_exchange.min.js',name:'create exchange object'}]});
	scriptLocations.push({regEx:'https:\/\/experience\.aiesec\.org\/#\/people\/[0-9]+', scripts:[{url:server+'v2_EXPA_applicationInformation.min.js',name:'show application info'}]});
	scriptLocations.push({regEx:'https:\/\/experience\.aiesec\.org\/#\/people\/[0-9]+\/applications', scripts:[{url:server+'v2_EXPA_showAGBOPS.min.js',name:'show AGB & OPS info'}]});
	scriptLocations.push({regEx:'https:\/\/experience\.aiesec\.org\/#\/analytics\/applications', scripts:[{url:server+'v2_EXPA_analytics_signups.min.js',name:'show Sign-Ups'}]});
	scriptLocations.push({regEx:'https:\/\/experience\.aiesec\.org\/#\/analytics\/applications', scripts:[{url:server+'v2_EXPA_analytics_raises.min.js',name:'show Raises'}]});
	scriptLocations.push({regEx:'https:\/\/experience\.aiesec\.org\/#\/people[^\/]*', scripts:[{url:server+'v2_EXPA_showProgram.min.js',name:'show Program'}]});
	scriptLocations.push({regEx:'https:\/\/experience\.aiesec\.org\/#\/people[^\/]*', scripts:[{url:server+'v2_EXPA_followUpTable.min.js',name:'Follow Up Info'}]});
	scriptLocations.push({regEx:'https:\/\/experience\.aiesec\.org\/#\/.*', scripts:[{url:server+'v2_EXPA_add_finance.min.js',name:'show Fin-Inn'}]});
	scriptLocations.push({regEx:'https:\/\/experience\.aiesec\.org\/#\/people\/applications.*', scripts:[{url:server+'v2_EXPA_managementReport.min.js',name:'Management Report View'}]});
	scriptLocations.push({regEx:'https:\/\/experience\.aiesec\.org\/#\/people\/applications.*', scripts:[{url:server+'v2_EXPA_filterUnbookedOPS.js',name:'Unbooked OPS'}]});
	scriptLocations.push({regEx:'https:\/\/experience\.aiesec\.org\/#\/people\/applications.*', scripts:[{url:server+'v2_EXPA_filterUnbookedMatch.js',name:'Unbooked Match'}]});
	scriptLocations.push({regEx:'https:\/\/experience\.aiesec\.org\/#\/people\/applications.*', scripts:[{url:server+'v2_EXPA_filterDeposit.js',name:'Deposit open'}]});
	scriptLocations.push({regEx:'https:\/\/experience\.aiesec\.org\/#\/people\/applications.*', scripts:[{url:server+'v2_EXPA_filterUnbookedReintegration.js',name:'Unbooked Reintegration'}]});

	
	//remove stupid window that pops up in the beginning
	$(".modal").remove();
	//Google Charts
	url = "https://www.gstatic.com/charts/loader.js";
	addScriptIntoPage(url);
	setTimeout(function (){
		google.charts.load('current', {packages: ['corechart', 'bar', 'line']});
	}, 1000);

	function main(){
		removeSitebar();
		addSitebarIntoPage();

		$(window).on('hashchange', function() {
			removeSitebarContent();

			var scripts=getScripts(window.location.href);
			addContentIntoSitebar(scripts);
		});
	}


	function removeSitebar(){
		if($('.sidebar')!==null){
			//$('.sidebar').remove();
		}
	}

	function removeSitebarContent(){
		if($('#sidebarOpener')!==null){
			$('#bookmarkletSelector').remove();
		}

		if($('.sidebarOpener')!==null){
			$('.sidebarOpener').remove();
		}
	}

	function addScriptIntoPage(url){
		var jsCode = document.createElement('script');
		jsCode.setAttribute('src',url);
		document.body.appendChild(jsCode);
	}

	function addCSSIntoPage(url){
		var jsCode = document.createElement('link');
		jsCode.setAttribute('rel','stylesheet');
		jsCode.setAttribute('type','text/css');
		jsCode.setAttribute('href',url);
		document.head.appendChild(jsCode);
	}


	function addSingleScriptContentIntoSitebar(script){
		var html='<table id="bookmarkletSelector">';
		html+='<tbody>';

		var repeatButtonHtml='<button type="button" id="bookmarkletSelectorButton" style="width: 100px;height: 30px;margin-left: 10px;">activate</button>';
		var textHtml='<div class="style-swticher-body bookmarkletSelector ellipsis" style="font-size:13px;">'+script.scripts[0].name+'</div>';
		html+='<tr><td>'+textHtml+'</td><td>'+repeatButtonHtml+'</td></tr>';

		html+='</tbody>';
		html+='</table>';
		$( "div.style-switcher-heading" ).after(html);

		$('#bookmarkletSelectorButton').click(script,function(event) {
			console.log(event.data.scripts[0].url);
			addScriptIntoPage(event.data.scripts[0].url);
		});

	}

	function addMultipleScriptContentIntoSitebar(scripts){
		var html='<table id="bookmarkletSelector">';
		html+='<tbody>';
		for(var i=0;i<scripts.length;i++){
			var repeatButtonHtml='<button type="button" id="bookmarkletSelectorButton'+i+'" style="width: 100px;height: 30px;margin-left: 10px;">activate</button>';
			var textHtml='<div class="style-swticher-body bookmarkletSelector ellipsis" style="font-size:13px;">'+scripts[i].scripts[0].name+'</div>';
			html+='<tr><td>'+textHtml+'</td><td>'+repeatButtonHtml+'</td></tr>';
		}
		html+='</tbody>';
		html+='</table>';
		$( "div.style-switcher-heading" ).after(html);

		for(var i=0;i<scripts.length;i++){
			$('#bookmarkletSelectorButton'+i).click(scripts[i],function(event) {
				console.log(event.data.scripts[0].url);
				addScriptIntoPage(event.data.scripts[0].url);
			});
		}

	}

	function addNoScriptContentIntoSitebar(){
		var html='<div id="bookmarkletSelector" class="style-swticher-body bookmarkletSelector" style="font-size:13px;"> '+"No Scripts available"+'</div>';
		$( "div.style-switcher-heading" ).after(html);
	}

	function addContentIntoSitebar(scripts){
		if(scripts.length==0){
			addNoScriptContentIntoSitebar();
		} else if(scripts.length==1){
			addSingleScriptContentIntoSitebar(scripts[0]);
		}else if(scripts.length>1){
			addMultipleScriptContentIntoSitebar(scripts);

		}
	}

	function getScripts(url){
		var scripts=[];

		for (var i=0;i<scriptLocations.length;i++) {
			var result=url.match(scriptLocations[i].regEx);
			if(result==url){
				scripts.push(scriptLocations[i]);
			}
		}

		return scripts;
	}



	function addSitebarIntoPage(){
		addCSSIntoPage('https://bookmarks.aiesec.de/bookmarklets/css/animated.css');
		addCSSIntoPage('https://bookmarks.aiesec.de/bookmarklets/css/style-switcher.css');
		addCSSIntoPage('https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css');

		var sitebarHtml='<i id="sidebarOpener" class="style-switcher-btn fa fa-cogs hidden-xs"></i>'+
			'<div id="sidebar" class="style-switcher animated fadeInRight" style="display: none;">'+
			'<div class="style-swticher-header" style="margin: 10px;">'+
			'<div class="style-switcher-heading" style="font-weight:bold;">Bookmarklets</div>'       +
			'<div class="theme-close"><i class="fa fa-times"></i></div>'+
			'</div>';

		if(window.location.href.indexOf("experience-v1")>-1){
			sitebarHtml+='<div class="warning" style="color:red;font-size:12px;">warning: this is the old page!</div>';
		}
		sitebarHtml+='</div>';



		setTimeout(
			function()
			{
				$('body').prepend(sitebarHtml);
				var scripts=getScripts(window.location.href);
				addContentIntoSitebar(scripts);

				jQuery('.style-switcher-btn').click(function () {
					jQuery('.style-switcher').show();
				});

				jQuery('.theme-close').click(function () {
					jQuery('.style-switcher').hide();
				});
			}, 500);

	}


	main();


}());