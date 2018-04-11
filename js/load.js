

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
			timeline:'timeline/main',					
			featherlight:'featherlight/featherlight.min'
		
			
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
				},
				featherlight:{
					deps : ['jquery']
				}
				
		 }
	});
	
	
	define ('app',["jquery","i18n","handlebars","simplemodal",'chart',"featherlight"],function(jQuery,i18n,handlebars,simplemodal,chart,featherlight){		
		 
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
							
							R.pipe ( 
								R.filter((c,v)=>app.createGraph($(v)))
							)($('canvas')); 
							
							app.loadTemplate2('/templates/footer.hbs').then(
								(template)=>{
									$('#footer').prepend(template);								
									callback();	
							});
						
							
							/*app.loadTemplate ('/templates/timeline.hbs',function(template) {																
								app.processData('software',template,function (data) {																			
									var tmp = data.sort(function(a, b){											
										return a.order - b.order}
									);										
									
									$('#timeline').replaceWith(template(tmp)).each(function() {
										
										/*app.createTimeLine();
										$('.cd-timeline').hide();
										
									});	
								} );
							});*/
							

								
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
											app.loadTemplate2('/templates/footer.hbs').then(
												(template)=>{
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
											
											$('img').featherlight (
														{type: 'html',
														 afterOpen:function(event) {															 														 
															 $('.featherlight-content').append($('<div  id="3d"/>'));
															
															 app.renderer=null;
															 app.camera=null;
															 app.scene=null;				
														

															 if (app.animateFrame != null){
																window.cancelAnimationFrame(app.animateFrame);
															 }
															
															 if (event.target.width /  event.target.height >= 1){																
																app.fovDefault=30;
																app.fovMax=10;
															 } else {
																app.fovDefault=40;
																app.fovMax=20;
															 }
															 app.create3DView (event.target,$('#3d')).then(()=>{
																

															 }).catch((ex)=>{
																 console.log(ex);
															 });
														 }
														}
												);

											app.loadTemplate2('/templates/footer.hbs').then(
												(template)=>{
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
											$('#bqImg').on('click',function(v){
											
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
										app.loadTemplate2('/templates/footer.hbs').then(
											(template)=>{
												$('#footer').prepend(template);								
												callback();	
										});
									} );								
								}); 								
							}

						  } else if (page=='home'){
							// load footer
							app.loadTemplate2('/templates/footer.hbs').then(
								(template)=>{
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
			
		  
		  app.translate = new Promise ( (resolve,reject) => {
				$.getJSON( "/resources/language.json"+'?_hc='+new Date().getTime(), function( data ) {													
					resolve(data);					
				});	
		  });

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
		app.loadTemplate2= function (path) {
			return new Promise ( (resolve,reject) => {
				var source, template;
				$.ajax({
					url: path+'?_hc='+new Date().getTime(),
					dataType: "html",
					success: function (data) {
						source = data;						
						resolve(handlebars.compile(source));
					}
				});		


			});
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
						fullWidth:false,
						labels: {
							fontColor: 'white',
							fontSize:10
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
						animateRotate: true,
						animateScale: true
					  }
					}
				  };
			  
				  var ctx = destino[0];
				  ctx.height = 250;
				  window.myPolarArea = Chart.PolarArea(ctx, config);
				
			
			}
		
			app.renderer=null;
			app.camera=null;
			app.scene=null;							
			app.animateFrame=null;		
			app.steps=0;
			app.fovDefault=40;
			app.fovMax=20;
			app.create3DView = function (img,target) {
				return new Promise ( (resolve,reject) => {
					
					app.steps = 1;
					app.zoom = 0.1;
					
				

					app.camera = new THREE.PerspectiveCamera(app.fovDefault, img.width / img.height, 0.1, 1000);
				    app.camera.position.set( 0, 0, 7 );
					app.camera.lookAt( new THREE.Vector3(0, 0, 0) );
				

					// create the Scene
					app.scene= new THREE.Scene();
				
					var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
					app.scene.add( ambientLight );

					// create the Cube
				
					app.createCube(img).then((cube)=>{
						
						app.scene.add(cube)
					
						app.scene.background = new THREE.Color( 0x000000 );
	
						var container = target[ 0 ];
	
						app.renderer = new THREE.WebGLRenderer( { antialias: true });
						
						app.renderer.setSize(img.width, img.height);
						
						app.renderer.setPixelRatio( window.devicePixelRatio );
						
						container.appendChild( app.renderer.domElement );
					
						app.animate();

					}).catch((ex)=>{
						console.log(ex);
					});

					resolve(this);
				})
			}

			app.animate= function () {			

				   app.animateFrame = requestAnimationFrame( app.animate );
				
					if (app.camera.fov <= app.fovDefault && app.camera.fov >=app.fovMax ){					
						app.camera.fov += -0.1;	
						app.scene.traverse( function( object ) {
							if ( object.isMesh === true && 
								typeof undefined !=object.name && 
								object.name=='imageCanvas') {
								
									object.rotation.x = app.steps++ * Math.PI/100;								
							}
						} );
					} else {
						window.cancelAnimationFrame(app.animateFrame);
					}
					app.camera.updateProjectionMatrix();
				
				   app.renderer.render( app.scene, app.camera );
				
			}
			
		

			app.createCube = function (target){
				return new Promise ((resolve,reject) => {
				
					var x = 1;
					var y = 1;
					if (target.width < target.height){
						y= y * (target.height/target.width); 
					} else {
						x = x * (target.width/target.height);
					}
					var geometry = new THREE.BoxBufferGeometry( x,y,1);
					new THREE.ImageLoader()
					.setCrossOrigin( '*' )
					.load( target.src + "? api_key=keyG5AhVcdlRu4UfU", function ( image ) {
							var texture = new THREE.CanvasTexture( image );
							var material = new THREE.MeshBasicMaterial( {  map: texture } );
							var cube = new THREE.Mesh( geometry, material );
							cube.name='imageCanvas';
							cube.position.set(0,0, 0);							
							resolve(cube);
					});
	
					 
				})
			};
				
			
				
			


		 return app;											
	});
	
	
		
	
require(['app','jquery','bootstrap',"cookie"], function (App,jQuery) {



// Execute App
	$(document).ready(function(){

		var userLang = navigator.language || navigator.userLanguage; 
		
		$('html').attr('lang',userLang.split('-')[0]);
	
		App.initPage($('html').attr('page'),function(){

			App.translate.then( (data)  => {				
						
					if (  $('html').attr('lang') ==='es'){
						$.i18n.load(data.es);	
					} else {
						$.i18n.load(data.en);	
					}	
					$('.i18n').filter((i,e)=> $(e)._t($(e).attr('data-i18n')) )					
				}
			);

		});
		
	
		
	});
});						
			
		
	
	
	
	