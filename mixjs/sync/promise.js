(function($) {
	'use strict';
	
	$.__proto__.__defineGetter__('Promise', function() { return Promise; });
	
	function Promise(func) {
		if(typeof func!=='function')	throw 'IllegalArgumentException: func must be type of function.';
		
		let $this = this;
		const CAPSULE = {};
		const CNT = {
			resolve: 0, 
			reject: 0, 
			'catch': 0, 
			'finally': 0
		};
		const STORAGE = {};
		const RUNNING_CK = {};
		let ckTerm = 50;
		let maxInterval = 1 * 1000;
		let maxCnt = maxInterval / ckTerm;
		$this.__defineGetter__('then', function() { return then; });
		$this.__defineGetter__('catch', function() { return catchFunc; });
		$this.__defineGetter__('finally', function() { return finallyFunc; });
		
		try {
			func(resolve, reject);
		} catch(e) {
			console.error(e);
			exe('catch', e);
		}
		function resolve(resp) {
			exe('resolve', resp);
		}
		function reject(resp) {
			exe('reject', resp);
		}
		function then(resolve, reject) {
			if(typeof resolve!=='function')	throw 'IllegalArgumentException: resolve must be type of function.';
			if(reject && typeof reject!=='function')	throw 'IllegalArgumentException: reject must be type of function.';
			CAPSULE.resolve = resolve;
			if(reject)	CAPSULE.reject = reject;
			if(typeof STORAGE.resolve!=='undefined')	exe('resolve', STORAGE.resolve);
			else if(typeof STORAGE.reject!=='undefined')	exe('reject', STORAGE.reject);
			return $this;
		}
		function catchFunc(callback) {
			if(typeof callback!=='function')	throw 'IllegalArgumentException: callback must be type of function.';
			CAPSULE.catch = callback;
			if(typeof STORAGE.catch!=='undefined')	exe('catch', STORAGE.catch);
			return $this;
		}
		function finallyFunc(callback) {
			if(typeof callback!=='function')	throw 'IllegalArgumentException: callback must be type of function.';
			CAPSULE.finally = callback;
			if(typeof STORAGE.finally!=='undefined')	exe('finally', STORAGE.finally);
			return $this;
		}
		function exe(funcName, resp) {
			RUNNING_CK[funcName] = true;
			setTimeout(function() {
				CNT[funcName] = CNT[funcName]+1;
				if(typeof CAPSULE[funcName]==='function') {
					try {
						CAPSULE[funcName](resp);
					} catch(e) {
						console.error(e);
						if(['catch', 'finally'].indexOf(funcName)!==-1)	return;
						if(RUNNING_CK['catch'])	return;
						exe('catch', e);
					} finally {
						if(funcName==='finally')	return;
						if(RUNNING_CK['finally'])	return;
						exe('finally', resp);
					}
				} else if(CNT[funcName]<=maxCnt)	exe(funcName, resp);
				else	STORAGE[funcName] = resp;
			}, ckTerm);
		}
	}
})(window[LIB_NAME]);