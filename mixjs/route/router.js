(function($, $viewStorage, $ctrlStorage) {
	'use strict';
	
	const ROUTER = new Router();
	$.__proto__.__defineGetter__('router', function() { return ROUTER; });
	
	function Router() {
		let $this = this;
		const CAPSULE = {
			routes: []
		};
		$this.__defineGetter__('addRoute', function() { return addRoute; });
		$this.__defineGetter__('removeRoute', function() { return removeRoute; });
		$this.__defineGetter__('getRoute', function() { return getRoute; });
		
		function addRoute(route) {
			CAPSULE.routes.push(new Route(route));
		}
		function removeRoute(routeName) {
			if(!routeName)	return null;
			let idx = CAPSULE.routes.indexOf(getRoute({ name: routeName }));
			if(idx===-1)	return null;
			return CAPSULE.routes.splice(idx, 1);
		}
		function getRoute(params) {
			if(!params || !params.name && !params.hash || params.name && params.hash)	return null;
			let i = 0;
			for(; i<CAPSULE.routes.length; i++) 
				if(params.name && CAPSULE.routes[i].name===params.name
					|| params.hash && CAPSULE.routes[i].hash===params.hash)	break;
			if(i<=CAPSULE.routes.length)	return CAPSULE.routes[i];
			return null;
		}
		function Route(route) {
			if(!route || !route.name || !route.hash || !route.view || !route.ctrl) throw 'IllegalArgumentException: Check the argument.';
			route = JSON.parse(JSON.stringify(route));
			route.init = init;
			route.stop = stop;
			
			let $routeThis = this;
			Object.keys(route).forEach(function(key) {
				switch(key) {
				case 'view': 
					$routeThis.__defineGetter__(key, function() { return $viewStorage[route[key]]; });
					break;
				case 'ctrl': 
					$routeThis.__defineGetter__(key, function() { return $ctrlStorage[route[key]]; });
					break;
				default: 
					$routeThis.__defineGetter__(key, function() { return route[key]; });
					break;
				}
			});
			let model = null;
			let modelBinder = null;	// interval ID
			let diffCkModel = null;	// The kind of cache for checking the difference between original model.
			let modelBind = null;	// The function executed in the interval.
			let ckEles = null;
			
			function init() {
				let appDiv = document.getElementById('APP');
				for(var i=appDiv.children.length-1; i>=0; i++)	appDiv.removeChild(appDiv.children[i]);
				appDiv.appendChild($routeThis.view.element);
				if(!$routeThis.view.$ctrl) 
					$routeThis.view.__defineGetter__('$ctrl', function() { return $routeThis.ctrl; });
				if(!$routeThis.ctrl.$view) 
					$routeThis.ctrl.__defineGetter__('$view', function() { return $routeThis.view; });
				if(!$routeThis.view.$model) {
					ckEles = findCkEles($routeThis.view.element);
					model = new Model();
					$routeThis.view.__defineGetter__('$model', function() { return model; });
					function Model() {
						let $modelThis = this;
						ckEles.forEach(function(ele) {
							$modelThis.__defineGetter__(ele.getAttribute('model'), function() { 
								if(ele.tagName.toLowerCase()==='input' && ['checkbox', 'radio'].indexOf(ele.type.toLowerCase())!==-1)
									return ele.checked;
								return ele.value || ele.getAttribute('value') || ele.innerText; 
							});
							$modelThis.__defineSetter__(ele.getAttribute('model'), function(value) {
								if(ele.tagName.toLowerCase()==='input' && ['checkbox', 'radio'].indexOf(ele.type.toLowerCase())!==-1)	ele.checked = !!value;
								else if(typeof ele.value!=='undefined')	ele.value = value;
								else	ele.setAttribute('value', ele.innerText=value); 
							});
						});
					}
					function findCkEles(ele) {
						let result = [];
						for(var i=0; i<ele.children.length; i++)	result = result.concat(findCkEles(ele.children[i]));
						if(ele.getAttribute('model'))	result.push(ele);
						return result;
					}
				}
				if(typeof modelBind!=='function') {
					modelBind = bind;
					function bind() {
						let modelToString = JSON.stringify($routeThis.view.$model);
						if(diffCkModel!==modelToString) {
							diffCkModel = modelToString;
							ckEles.forEach(function(ele) {
								let modelKey = ele.getAttribute('model');
								if(typeof ele.value==='undefined')	ele.innerText = $routeThis.view.$model[modelKey];
								else	ele.value = $routeThis.view.$model[modelKey];
							});
						}
					}
				}
				diffCkModel = JSON.stringify($routeThis.view.$model);
				console.log('diffCkModel: ', diffCkModel);
				$routeThis.ctrl.init();
				modelBinder = setInterval(modelBind, 50);
				appDiv = null;
			}
			function stop() {
				if(!modelBinder)	return;
				clearInterval(modelBinder);
			}
		}
	}
})(window[LIB_NAME], window[LIB_NAME].viewStorage, window[LIB_NAME].ctrlStorage);