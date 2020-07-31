(function($) {
	'use strict';
	
	const CTRL_STORAGE = new CtrlStorage();
	$.__proto__.__defineGetter__('ctrlStorage', function() { return CTRL_STORAGE; });
	
	function CtrlStorage() {
		let $this = this;
		$this.__defineGetter__('push', function() { return push; });
		
		function push(params) {
			if(!params || !params.name || !isValid(params.ctrl))	throw 'IllegalArgumentException: params.name and params.ctrl must be not null and params.ctrl must be valid.';
			if($this[params.name])	throw 'DuplicatedNameException: params.name already exists.';
			$this.__defineGetter__(params.name, function() { return params.ctrl; });
		}
		function isValid(ctrl) {
			return !(!ctrl || typeof ctrl.init!=='function');
		}
	}
})(window[LIB_NAME]);