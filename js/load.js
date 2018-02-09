

	

	requirejs.config({
		baseUrl: '/js/lib',
		waitSeconds : 30,
		paths: {			
			jquery: 'jquery/js/jquery-3.2.1.min',
			bootstrap:'bootstrap/js/bootstrap.min',
			i18n:'jquery18i/js/jquery18i.min',
			handlebars:'handlebars/js/handlebars-v4.0.11',
		
			
		},
		 shim : {
				jquery : {
					exports : 'jQuery'
				},
				i18n:{
					deps : ['jquery'],
					exports: 'i18n'
				},
				bootstrap:{
					deps : ['jquery']
				}
				
		 }
	});
	
	
	define ('app',["jquery","i18n","handlebars"],function(jQuery,i18n,handlebars){		
		 var app={};		 
		  app.initPage = function (page,callback){
			   app.loadTemplate ('/templates/menu.hbs',function(template) {				    
					$('#menu').prepend(template);				   	
						if (page == 'filmmaker'){					
								app.loadTemplate ('/templates/porfolio.hbs',function(template) {								
									app.processData('filmmaker',template,function (data,temp){					
										$('#bodyContainer').prepend(temp(data)).each(function() {
											app.loadTemplate ('/templates/footer.hbs',function(template) {	
												$('#footer').prepend(template);								
												callback();	
											}); 													
										});							
									});								
								});								  
						  } else if (page=='software'){							
							app.loadTemplate ('/templates/footer.hbs',function(template) {	
								$('#footer').prepend(template);								
								callback();	
							}); 	
						  } else if (page=='photographer'){								
							app.loadTemplate ('/templates/footer.hbs',function(template) {	
								$('#footer').prepend(template);								
								callback();	
							}); 
						  } else if (page=='home'){
							// load footer
							app.loadTemplate ('/templates/footer.hbs',function(template) {	
								$('#footer').prepend(template);								
								callback();	
							}); 
									  						  
						  }																								
				});
			  
		  }
		  
		  app.processData = function (file,template,callback){
			  $.getJSON("/json/"+file+".json"+'?_hc='+new Date().getTime(), function( data ) {										
					callback(data,template);				  
			  });			  
		  }
		  
		  app.translate = function (callback){			  
			  $.getJSON( "/resources/language.json"+'?_hc='+new Date().getTime(), function( data ) {					
					callback(data,$('html').attr('lang'));				  
			  });			  			  
		  }		
		  app.processTranslate = function (callback){

		  }

		   app.loadTemplate = function (path, callback) {
				var source, template;
				$.ajax({
					url: path+'?_hc='+new Date().getTime(),
					dataType: "html",
					success: function (data) {
						source = data;						
						template = handlebars.compile(source);						
						if (callback) callback(template);
					}
				});				
		   }
		  
		 return app;											
	});
	
	
		
	
require(['app','jquery','bootstrap'], function (App,jQuery) {
// Execute App
	$(document).ready(function(){

		var userLang = navigator.language || navigator.userLanguage; 
		
		$('html').attr('lang',userLang.split('-')[0]);
		
		
		App.initPage($('html').attr('page'),function(){

			App.translate( function (data,lang) {
				
				if ( lang ==='es'){
					$.i18n.load(data.es);	
				} else {
					$.i18n.load(data.en);	
				}								  
		  
				$('.i18n').each(function (i,e){					
					$(e)._t($(e).attr('data-i18n'));
				});				
			});	

			$('#langChange').on('click',function(){
				if ("es" === $('html').attr('lang')){
					$('html').attr('lang','en');
				} else {
					$('html').attr('lang','es');
				}
				App.translate( function (data,lang) {
				
					if ( lang ==='es'){
						$.i18n.load(data.es);	
					} else {
						$.i18n.load(data.en);	
					}								  
			  
					$('.i18n').each(function (i,e){					
						$(e)._t($(e).attr('data-i18n'));
					});				
				});	


			});
		});
	
		
		
	});
});						
			
		
	
	
	
	