
			var delta = [ 0, 0 ];
			var stage = [ window.screenX, window.screenY, window.innerWidth, window.innerHeight ];
			getBrowserDimensions();

			var isMouseDown = false;

			var worldAABB;
			var world;
			var iterations = 1;
			var timeStep = 1 / 25; 

			var walls = [];
			var wall_thickness = 200;
			var wallsSetted = false;

			var mouseJoint;
			var mouse = { x: 0, y: 0 };

			var mouseOnClick = [];

			var elements = [];
			var bodies = [];
			var properties = [];

			var query, page = 0;

			var gWebSearch, gImageSearch;
			var imFeelingLuckyMode = false;
			var resultBodies = [];

			var gravity = { x: 0, y: 0 };

			init();
			setInterval( loop, 25 );

			if ( location.search != "" ) {

				var params = location.search.substr(1).split("&")

				for (var i = 0; i < params.length; i++) {

					var param = params[i].split("=");

					if (param[0] == "q") {

						document.getElementById('q').value = param[1];
						break;
					}
				}
			}

			//

			function init() {

				/*
				gWebSearch = new google.search.WebSearch();
				gWebSearch.setResultSetSize( google.search.Search.SMALL_RESULTSET );
				gWebSearch.setSearchCompleteCallback( null, onWebSearch );

				gImageSearch = new google.search.ImageSearch();
				gImageSearch.setResultSetSize( google.search.Search.SMALL_RESULTSET );
				gImageSearch.setSearchCompleteCallback( null, onImageSearch );
				*/

				document.addEventListener( 'mousedown', onDocumentMouseDown, false );
				document.addEventListener( 'mouseup', onDocumentMouseUp, false );
				document.addEventListener( 'mousemove', onDocumentMouseMove, false );

				document.addEventListener( 'keyup', onDocumentKeyUp, false );

				document.addEventListener( 'touchstart', onDocumentTouchStart, false );
				document.addEventListener( 'touchmove', onDocumentTouchMove, false );
				document.addEventListener( 'touchend', onDocumentTouchEnd, false );

				// init box2d

				worldAABB = new b2AABB();
				worldAABB.minVertex.Set( - 200, - 200 );
				worldAABB.maxVertex.Set( window.innerWidth + 200, window.innerHeight + 200 );

				world = new b2World( worldAABB, new b2Vec2( 0, 0 ), true );

				// walls
				setWalls();

				// Get box2d elements

				elements = getElementsByClass("box2d");

				for ( var i = 0; i < elements.length; i ++ ) {

					properties[i] = getElementProperties( elements[i] );

				}

				for ( var i = 0; i < elements.length; i ++ ) {

					var element = elements[ i ];
					element.style.position = 'absolute';
					element.style.left = properties[i][0] + 'px';
					element.style.top = properties[i][1] + 'px';
					element.style.width = properties[i][2] + 'px';
					element.addEventListener( 'mousedown', onElementMouseDown, false );
					element.addEventListener( 'mouseup', onElementMouseUp, false );
					element.addEventListener( 'click', onElementClick, false );

					bodies[i] = createBox( world, properties[i][0] + (properties[i][2] >> 1), properties[i][1] + (properties[i][3] >> 1), properties[i][2] / 2, properties[i][3] / 2, false );

					// Clean position dependencies

					while ( element.offsetParent ) {

						element = element.offsetParent;
						element.style.position = 'static';

					}

				}

			}

			//

			function onDocumentMouseDown( event ) {

				isMouseDown = true;

			}

			function onDocumentMouseUp( event ) {

				isMouseDown = false;

			}

			function onDocumentMouseMove( event ) {

				mouse.x = event.clientX;
				mouse.y = event.clientY;

			}

			function onDocumentKeyUp( event ) {

				// if ( event.keyCode == 13 ) search();

			}

			function onDocumentTouchStart( event ) {

				if ( event.touches.length == 1 ) {

					mouse.x = event.touches[0].pageX;
					mouse.y = event.touches[0].pageY;
					isMouseDown = true;
				}
			}

			function onDocumentTouchMove( event ) {

				if ( event.touches.length == 1 ) {

					event.preventDefault();

					mouse.x = event.touches[0].pageX;
					mouse.y = event.touches[0].pageY;

				}

			}

			function onDocumentTouchEnd( event ) {

				if ( event.touches.length == 0 ) {

					isMouseDown = false;
				}

			}

			//

			function onElementMouseDown( event ) {

				event.preventDefault();

				mouseOnClick[0] = event.clientX;
				mouseOnClick[1] = event.clientY;

			}

			function onElementMouseUp( event ) {

				event.preventDefault();

			}

			function onElementClick( event ) {

				var range = 5;

				if ( mouseOnClick[0] > event.clientX + range || mouseOnClick[0] < event.clientX - range &&
				     mouseOnClick[1] > event.clientY + range || mouseOnClick[1] < event.clientY - range ) {

					event.preventDefault();

				}

				// if ( event.target == document.getElementById( 'btnG' ) ) search();
				// if ( event.target == document.getElementById( 'btnI' ) ) imFeelingLucky();
				if ( event.target == document.getElementById( 'q' ) ) document.getElementById('q').focus();

			}

			// API STUFF

			/*
			function search() {

				if ( query == document.getElementById('q').value ) {

					page ++;

					gWebSearch.gotoPage( page );
					gImageSearch.gotoPage( page );

				} else {

					page = 0;

					query = document.getElementById('q').value;

					gWebSearch.execute( query );
					gImageSearch.execute( query );

				}

				return false;

			}
			*/

			function imFeelingLucky() {

				imFeelingLuckyMode = true;
				gWebSearch.execute( document.getElementById('q').value );

				return false;

			}

			function onWebSearch() {

				if ( imFeelingLuckyMode ) {

					location.href = gWebSearch.results[0].unescapedUrl;
					return;

				}

				for ( var i = 0; i < gWebSearch.results.length; i ++ ) {

					addWeb( gWebSearch.results[i] );

				}

			}

			function onImageSearch() {

				for ( var i = 0; i < gImageSearch.results.length; i ++ ) {

					addImage( gImageSearch.results[i] );

				}

			}

			function addWeb( data ) {

				var element = document.createElement('div');
				element.innerHTML = '<div class="result animate"><div class="title"><a href="' + data.unescapedUrl + '" target="_blank">' + data.title + '</a></div><div class="url">' + data.visibleUrl + '</div><div class="content">' + data.content + '</div>';

				document.body.appendChild( element );

				properties.push( [
					Math.random() * ( window.innerWidth - 546 ),
					Math.random() * ( window.innerHeight - element.offsetHeight ),
					546,
					element.offsetHeight
				] );

				var i = properties.length - 1;

				element.style.position = 'absolute';
				element.style.left = 0 + 'px';
				element.style.top = - 100 + 'px';
				element.style.backgroundColor = '#ffffff';
				element.addEventListener( 'mousedown', onElementMouseDown, false );
				element.addEventListener( 'mouseup', onElementMouseUp, false );
				element.addEventListener( 'click', onElementClick, false );

				elements[i] = element;

				resultBodies.push( bodies[i] = createBox( world, properties[i][0] + ( properties[i][2] >> 1 ), properties[i][1] + ( properties[i][3] >> 1 ), properties[i][2] / 2, properties[i][3] / 2, false, element ) );

			}

			function addImage( data ) {

				var element = document.createElement( 'img' );
				element.style.display = 'none';
				element.style.cursor = 'pointer';
				element.style.cssName = 'animate';
				element.addEventListener( 'load', function () {

					properties.push( [
						Math.random() * ( window.innerWidth - element.width ),
						Math.random() * ( window.innerHeight - element.height ),
						element.width,
						element.height
					] );

					var i = properties.length - 1;

					element.style.display = 'block';
					element.style.position = 'absolute';
					element.style.left = 0 + 'px';
					element.style.top = - 200 + 'px';
					element.style.backgroundColor = '#ffffff';
					element.addEventListener( 'mousedown', onElementMouseDown, false );
					element.addEventListener( 'mouseup', onElementMouseUp, false );
					element.addEventListener( 'click', onElementClick, false );
					element.addEventListener( 'click', function ( event ) {

						var range = 5;

						if ( mouseOnClick[0] < event.clientX + range && mouseOnClick[0] > event.clientX - range &&
						     mouseOnClick[1] < event.clientY + range && mouseOnClick[1] > event.clientY - range ) {

							window.open( data.unescapedUrl );

						}

					}, false );

					elements[i] = element;

					resultBodies.push( bodies[i] = createBox( world, properties[i][0] + ( properties[i][2] >> 1 ), properties[i][1] + ( properties[i][3] >> 1 ), properties[i][2] / 2, properties[i][3] / 2, false, element ) );

				}, false );
				element.src = data.tbUrl;
				document.body.appendChild( element );

			}

			//

			function loop() {

				if (getBrowserDimensions())
					setWalls();

				delta[0] += (0 - delta[0]) * .5;
				delta[1] += (0 - delta[1]) * .5;

				world.m_gravity.x = gravity.x * 350 + delta[0];
				world.m_gravity.y = gravity.y * 350 + delta[1];

				mouseDrag();
				world.Step(timeStep, iterations);

				for ( i = 0; i < elements.length; i++ ) {

					var body = bodies[i];
					var element = elements[i];

					element.style.left = (body.m_position0.x - (properties[i][2] >> 1)) + 'px';
					element.style.top = (body.m_position0.y - (properties[i][3] >> 1)) + 'px';

					var style = 'rotate(' + (body.m_rotation0 * 57.2957795) + 'deg)';

					element.style.transform = style;
					element.style.WebkitTransform = style + ' translateZ(0)'; // Force HW Acceleration
					element.style.MozTransform = style;
					element.style.OTransform = style;
					element.style.msTransform = style;
				}
			}


			// .. BOX2D UTILS

			function createBox(world, x, y, width, height, fixed, element) {

				var boxSd = new b2BoxDef();

				if ( fixed === undefined ) fixed = true;
				if ( fixed === false  ) boxSd.density = 1.0;

				boxSd.extents.Set(width, height);

				var boxBd = new b2BodyDef();
				boxBd.AddShape(boxSd);
				boxBd.position.Set(x,y);
				boxBd.linearVelocity.Set( Math.random() * 20 - 10, Math.random() * 20 - 10 );
				boxBd.angularVelocity = Math.random() * 0.1 - 0.05;
				boxBd.userData = {element: element};

				return world.CreateBody(boxBd)
			}

			function mouseDrag() {

				// mouse press
				if (isMouseDown && !mouseJoint) {

					var body = getBodyAtMouse();

					if (body) {
						var md = new b2MouseJointDef();
						md.body1 = world.m_groundBody;
						md.body2 = body;
						md.target.Set(mouse.x, mouse.y);
						md.maxForce = 30000.0 * body.m_mass;
						md.timeStep = timeStep;
						mouseJoint = world.CreateJoint(md);
						body.WakeUp();
					}
				}

				// mouse release
				if (!isMouseDown) {

					if (mouseJoint) {

						world.DestroyJoint(mouseJoint);
						mouseJoint = null;
					}
				}

				// mouse move
				if (mouseJoint) {

					var p2 = new b2Vec2(mouse.x, mouse.y);
					mouseJoint.SetTarget(p2);
				}
			}

			function getBodyAtMouse() {

				// Make a small box.
				var mousePVec = new b2Vec2();
				mousePVec.Set(mouse.x, mouse.y);

				var aabb = new b2AABB();
				aabb.minVertex.Set(mouse.x - 1, mouse.y - 1);
				aabb.maxVertex.Set(mouse.x + 1, mouse.y + 1);

				// Query the world for overlapping shapes.
				var k_maxCount = 10;
				var shapes = [];
				var count = world.Query(aabb, shapes, k_maxCount);
				var body = null;

				for ( var i = 0; i < count; i ++ ) {

					if (shapes[i].m_body.IsStatic() == false) {

						if ( shapes[i].TestPoint(mousePVec) ) {

							body = shapes[i].m_body;
							break;
						}
					}
				}

				return body;
			}

			function setWalls() {

				if (wallsSetted) {

					world.DestroyBody(walls[0]);
					world.DestroyBody(walls[1]);
					world.DestroyBody(walls[2]);
					world.DestroyBody(walls[3]);

					walls[0] = null; 
					walls[1] = null;
					walls[2] = null;
					walls[3] = null;
				}

				walls[0] = createBox(world, stage[2] / 2, - wall_thickness, stage[2], wall_thickness);
				walls[1] = createBox(world, stage[2] / 2, stage[3] + wall_thickness, stage[2], wall_thickness);
				walls[2] = createBox(world, - wall_thickness, stage[3] / 2, wall_thickness, stage[3]);
				walls[3] = createBox(world, stage[2] + wall_thickness, stage[3] / 2, wall_thickness, stage[3]);	

				wallsSetted = true;

			}

			// .. UTILS

			function getElementsByClass( searchClass ) {

				var classElements = [];
				var els = document.getElementsByTagName('*');
				var elsLen = els.length

				for (i = 0, j = 0; i < elsLen; i++) {

					var classes = els[i].className.split(' ');
					for (k = 0; k < classes.length; k++)
						if ( classes[k] == searchClass )
							classElements[j++] = els[i];
				}

				return classElements;
			}

			function getElementProperties( element ) {

				var x = 0;
				var y = 0;
				var width = element.offsetWidth;
				var height = element.offsetHeight;

				do {

					x += element.offsetLeft;
					y += element.offsetTop;

				} while ( element = element.offsetParent );

				return [ x, y, width, height ];
			}

			function getBrowserDimensions() {

				var changed = false;

				if ( stage[0] != window.screenX ) {

					delta[0] = (window.screenX - stage[0]) * 50;
					stage[0] = window.screenX;
					changed = true;
				}

				if ( stage[1] != window.screenY ) {

					delta[1] = (window.screenY - stage[1]) * 50;
					stage[1] = window.screenY;
					changed = true;
				}

				if ( stage[2] != window.innerWidth ) {

					stage[2] = window.innerWidth;
					changed = true;
				}

				if ( stage[3] != window.innerHeight ) {

					stage[3] = window.innerHeight;
					changed = true;
				}

				return changed;
			}
