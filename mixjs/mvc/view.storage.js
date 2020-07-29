(function($mix) {
	'use strict';
	
	$mix.viewStorage = new ViewStorage();
	
	function ViewStorage() {
		let $this = this;
		$this.__defineGetter__('push', function() { return push; });
		
		function push(params) {
			if(!params || !params.name || !isValid(params.view))	throw 'IllegalArgumentException: params.name and params.view must be not null and params.view must be valid.';
			if($this[params.name])	throw 'DuplicatedNameException: params.name already exists.';
			$this.__defineGetter__(params.name, function() { return params.view; });
		}
		function isValid(view) {
			return !(!view || !view.element);
		}
	}
})(mix);