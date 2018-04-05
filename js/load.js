

	requirejs.config({
		baseUrl: '/js/lib',
		waitSeconds : 30,
		paths: {			
			jquery: 'jquery/js/jquery-3.2.1.min',
			bootstrap:'bootstrap/js/bootstrap.min',
			i18n:'jquery18i/js/jquery18i.min',
			simplemodal:'jquery/js/jquery.simplemodal.1.4.4.min',
			handlebars:'handlebars/js/handlebars-v4.0.11',
			cookie:'cookie/jquery.cookiebar',
			chart:'chart/Chart.min',
			timeline:'timeline/main'					
		
			
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
				},
				cookie:{
					deps : ['jquery']
				}
				
		 }
	});
	
	
	define ('app',["jquery","i18n","handlebars","simplemodal",'chart'],function(jQuery,i18n,handlebars,simplemodal,chart){		
		 
		var app={};		 
		  app.initPage = function (page,callback){
			   app.loadTemplate ('/templates/menu.hbs',function(template) {				    
					$('#menu').prepend(template);				   	
						if (page == 'filmmaker'){					
							app.loadTemplate ('/templates/film.hbs',function(template) {
								app.processData('filmmaker',template,function (data){
									$('#bodyContainer').prepend(template(data)).each(function() {
										app.loadTemplate ('/templates/footer.hbs',function(template) {	
											$('#footer').prepend(template);								
											callback();	
										}); 													
									});	
								});	
							});
															  
						  } else if (page=='software'){					
							app.loadTemplate ('/templates/timeline.hbs',function(template) {								
								app.processData('software',template,function (data) {																			
									var tmp = data.sort(function(a, b){											
										return a.order - b.order}
									);										
									
									$('#timeline').replaceWith(template(tmp)).each(function() {
										
										/*app.createTimeLine();
										
										$('canvas').each(function (c,v){
											//app.createGraph($(v));
										});*/
										$('.cd-timeline').hide();

										app.loadTemplate ('/templates/footer.hbs',function(template) {	
											$('#footer').prepend(template);								
											callback();	
										}); 
									});	
								} );
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
																											
										$('#bodyContainer').prepend (templateProject(dataProject)).each(function(){
										
											app.loadTemplate ('/templates/footer.hbs',function(template) {	
												$('#footer').prepend(template);																				
												$('#listCrew > div ').each(function (t,v){																									
													app.getRecordAirtableSync($(v).attr('id'),function(dataCrew){																																			;														
														$(v).append(':<a target="_blank" href="'+ dataCrew.fields.url+'"> '+dataCrew.fields.name+'</a>');														
													});												
												});	
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
				var txtCookie='We use cookies to track usage and preferences:';
				var txtAccept=' Accept';
				if ("es" === $('html').attr('lang')){
					txtCookie='Esta web utiliza cookies para seguimiento y preferencias:';
					txtAccept=' Aceptar';
				} 

				$.cookieBar({
					message:txtCookie,
					acceptText: txtAccept,
					acceptButton: true,
					fixed: false
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
					async: true,
					success: function (data) {
						callback(data)
											
					}
				});		
			}	
			app.getRecordAirtableSync = function (id,callback) {				
				$.ajax({
					url: 'https://api.airtable.com/v0/appsYO7qZ88De1ddY/categorias/'+id+'?api_key=keyG5AhVcdlRu4UfU',									
					async: false,
					success: function (data) {
						callback(data)
											
					}
				});						
			}
			
			app.createTimeLine = function () {
				require(['timeline'], function(timelinefoo) {

				});
			}

			app.createGraph = function (destino) {

				var datos = $(destino).attr('data-values').split(',');
				var labels = $(destino).attr('data-labels').split(',');;

				console.log(datos);
				console.log(labels);

				window.chartColors = {
					red: 'rgb(255, 99, 132)',
					orange: 'rgb(255, 159, 64)',
					yellow: 'rgb(255, 205, 86)',
					green: 'rgb(75, 192, 192)',
					blue: 'rgb(54, 162, 235)',
					purple: 'rgb(153, 102, 255)',
					grey: 'rgb(201, 203, 207)'
				  };
			  
				  var chartColors = window.chartColors;
				  var color = Chart.helpers.color;
				 
				  var config = {
					data: {
					  datasets: [{
						data:datos,
						backgroundColor: [
						  color(chartColors.red).alpha(0.5).rgbString(),
						  color(chartColors.orange).alpha(0.5).rgbString(),
						  color(chartColors.yellow).alpha(0.5).rgbString(),
						  color(chartColors.blue).alpha(0.5).rgbString(),
						  color(chartColors.green).alpha(0.5).rgbString(),
						  color(chartColors.purple).alpha(0.5).rgbString(),
						  color(chartColors.grey).alpha(0.5).rgbString()			 
						],
						label: '' // for legend
					  }],
					  labels: labels
					},
					options: {
					  responsive: true,
					  legend: {
						position: 'bottom',
						labels: {
							fontColor: 'white'
						}
					  },
					  title: {
						display: true,
						text: 'Tech knowledge',
						fontColor: 'white'						
					  },
					  scale: {
						ticks: {
						  beginAtZero: true,
						  suggestedMax: 100						 
						},
						reverse: false
					  },
					  animation: {
						animateRotate: false,
						animateScale: true
					  }
					}
				  };
			  
				  var ctx = destino[0];
			  	
				  window.myPolarArea = Chart.PolarArea(ctx, config);
				
			
			}
			app.initFire = function (callback) {
			
					var config = {
						apiKey: "AIzaSyDdWwdVYJkRFg2e8qICAaHZ5oNInbHGbqs",
						authDomain: "amfbbdd.firebaseapp.com",
						databaseURL: "https://amfbbdd.firebaseio.com",
						projectId: "amfbbdd",
						storageBucket: "amfbbdd.appspot.com",
						messagingSenderId: "188993003080"
					};
					firebase.initializeApp(config);
					var defaultAuth = firebase.auth();
					
					defaultAuth.signInAnonymously().catch(function(error) {
						callback(null);
					});
					defaultAuth.onAuthStateChanged(function(user) {				
						if (user) {
							window.user = user;
							// User is signed in.
							var isAnonymous = user.isAnonymous;						
							if (isAnonymous) {
								callback(user.uid);
							}	
						} 
					});				  				   
			}
	  	  
		 return app;											
	});
	
	
		
	
require(['app','jquery','bootstrap',"cookie"], function (App,jQuery) {



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
			
		
	
	
	
	