(function($mix, $router) {
	'use strict';
	
	const HISTORY = new History();
	$mix.__proto__.__defineGetter__('history', function() { return HISTORY; });
	
	function History() {
		let $historyThis = this;
		const CAPSULE = {
			currentRoute: null, 
			observer: null, 
			mainHash: '#/login'
		};
		$historyThis.__defineGetter__('back', function() { return back; });
		$historyThis.__defineGetter__('go', function() { return go; });
		$historyThis.__defineGetter__('mainHash', function() { return CAPSULE.mainHash; });
		$historyThis.__defineSetter__('mainHash', function(mainHash) { CAPSULE.mainHash=mainHash; });
		$historyThis = null;
		
		window.onhashchange = onHashChange;
		onHashChange();
		
		function back() {
			window.history.back();
		}
		function go(routeName) {
			let route = $router.getRoute({ name: routeName });
			if(!route)	throw 'CannotFoundRouteException: Check the routeName.';
			window.location.hash = route.hash;
		}
		function onHashChange(evt) {
			if(CAPSULE.currentRoute && window.location.hash===CAPSULE.currentRoute.hash)	return;
			let route = $router.getRoute({ hash: window.location.hash });
			if(!route)	return window.location.hash = CAPSULE.currentRoute ? CAPSULE.currentRoute.hash : $router.getRoute({ hash: CAPSULE.mainHash });
			if(CAPSULE.currentRoute)	CAPSULE.currentRoute.stop();
			(CAPSULE.currentRoute = route).init();
			route = null;
		}
	}
})(mix, mix.router);