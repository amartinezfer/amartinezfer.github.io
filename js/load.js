

	

	requirejs.config({
		baseUrl: '/js/lib',
		waitSeconds : 30,
		paths: {			
			jquery: 'jquery/js/jquery-3.2.1.min',
			bootstrap:'bootstrap/js/bootstrap.min',
			i18n:'jquery18i/js/jquery18i.min',
			simplemodal:'jquery/js/jquery.simplemodal.1.4.4.min',
			handlebars:'handlebars/js/handlebars-v4.0.11'			
		
			
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
	
	
	define ('app',["jquery","i18n","handlebars","simplemodal"],function(jQuery,i18n,handlebars,simplemodal){		
		 var app={};		 
		  app.initPage = function (page,callback){
			   app.loadTemplate ('/templates/menu.hbs',function(template) {				    
					$('#menu').prepend(template);				   	
						if (page == 'filmmaker'){					
								app.loadTemplate ('/templates/film.hbs',function(template) {								
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
							if (app.getUrlParameter('category') !== undefined ){			
							
								app.loadTemplate ('/templates/categoryInfo.hbs',function(templateInfo) {
									app.getRecordAirtable(app.getUrlParameter('category'), function (dataCategory) {									
										$('#bodyContainer').prepend (templateInfo(dataCategory)).each(function() {																								
											$('.project').each(function(id,value){
										
												var idP = $(value).attr('data-projectId');												
												app.getRecordAirtable(idP,function(dataProject) {
													if (dataProject.fields.visible){
														$(value).find('a').attr('data-projectId',idP);																
														$(value).find('img').attr('src',dataProject.fields.defaultImg[0].thumbnails.large.url+'?_hc='+new Date().getTime() );
														$(value).find('img').attr('style','min-height:199.75px');
														$(value).find('.caption').attr('data-i18n',dataProject.fields.title);
														$(value).find('.caption').attr('data-id',dataProject.fields.id)
														$(value).find('.caption').each(function (i,e){					
															$(e)._t($(e).attr('data-i18n'));
														});	
														$(value).find('a').on('click',function(){											
															window.location = window.location.origin+window.location.pathname+"?project="+idP;		
														});	
													} else {
														$(idP).remove();
													}													
												});
											});
											app.loadTemplate ('/templates/footer.hbs',function(template) {	
												$('#footer').prepend(template);								
												callback();	
											}); 	
										});
									});											
								});

							} else if (app.getUrlParameter('project') !== undefined ){

								app.loadTemplate ('/templates/project.hbs',function(templateProject) {
									app.getRecordAirtable(app.getUrlParameter('project'), function (dataProject) {
																											
										$('#bodyContainer').prepend (templateProject(dataProject)).each(function() {													
											
											

											$('#listCrew > div').each(function (t,v){												
												app.getRecordAirtableSync($(v).attr('id'),function(dataCrew){	
													console.log(dataCrew);												;
													$(v).append('<a target="_blank" href="'+ dataCrew.fields.url+'">: '+dataCrew.fields.name+'</a>');
												});
											});

											app.loadTemplate ('/templates/footer.hbs',function(template) {	
												$('#footer').prepend(template);								
												callback();	
											}); 	
										});
									});											
								});

							} else {

								app.loadTemplate ('/templates/category.hbs',function(template) {								
									app.getCategoryAirtable( function (data) {
																
										$('#bodyContainer').prepend (template(data)).each(function() {																					
											$('img').on('click',function(v){
											
												$.modal('<img  src="/img/portada.jpg"/>',{
													opacity:50,
													close :true,
													overlayCss: {backgroundColor:"#fff"},
													overlayClose :true,
													minWidth: 600,
													width:600,
													minHeight:450, 												
													closeHTML: "<a style='color:white;background-color:black' href='#'> Close </a>"
												});
											});
											$('.category').on('click',function(){											
												window.location = window.location.origin+window.location.pathname+"?category="+$( this ).attr('data-id');
	
											});	
										});
										app.loadTemplate ('/templates/footer.hbs',function(template) {																						
											$('#footer').prepend(template);								
											callback();	
										}); 
									} );								
								}); 								
							}

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
		  
		  app.getUrlParameter = function getUrlParameter(sParam) {
			  
			var sPageURL = decodeURIComponent(window.location.search.substring(1)),
				sURLVariables = sPageURL.split('&'),
				sParameterName,
				i;
		
			for (i = 0; i < sURLVariables.length; i++) {
				sParameterName = sURLVariables[i].split('=');
		
				if (sParameterName[0] === sParam) {
					return sParameterName[1] === undefined ? true : sParameterName[1];
				}
			}
		};

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


		   app.getCategoryAirtable = function (callback) {				
				$.ajax({
					url: 'https://api.airtable.com/v0/appsYO7qZ88De1ddY/categorias?api_key=keyG5AhVcdlRu4UfU',					
					success: function (data) {
						callback(data)						
					}
				});						
		   }

		   app.getRecordAirtable = function (id,callback) {				
			$.ajax({
				url: 'https://api.airtable.com/v0/appsYO7qZ88De1ddY/categorias/'+id+'?api_key=keyG5AhVcdlRu4UfU',									
				success: function (data) {
					callback(data)
										
				}
			});		
			 app.getRecordAirtableSync = function (id,callback) {				
			$.ajax({
				url: 'https://api.airtable.com/v0/appsYO7qZ88De1ddY/categorias/'+id+'?api_key=keyG5AhVcdlRu4UfU',									
				async: false,
				success: function (data) {
					callback(data)
										
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
			
		
	
	
	
	