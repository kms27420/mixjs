(function($, $Promise) {
	'use strict';
	
	const AJAX = new Ajax();
	$.__proto__.__defineGetter__('ajax', function() { return AJAX; });
	
	function Ajax() {
		let $this = this;
		$this.__defineGetter__('req', function() { return req; });
		
		function req(properties) {
			return new $Promise(function(resolve, reject) {
				let xmlHttpReq = new XMLHttpRequest();
				xmlHttpReq.open(properties.method, properties.url, properties.async, properties.username, properties.password);
				if(typeof properties.headers==='object') {
					Object.keys(properties.headers).forEach(function(headerKey) {
						try {
							xmlHttpReq.setRequestHeader(headerKey, properties.headers[headerKey]);
						} catch(e) {
							console.error(e);
						}
					});
				}
				if(typeof properties.param==='object')	properties.param = JSON.stringify(properties.param);
				xmlHttpReq.onload = function() {
					if(xmlHttpReq.status<200 || xmlHttpReq.status>=300)	reject(xmlHttpReq);
					else	resolve(xmlHttpReq);
				};
				xmlHttpReq.onerror = function() { reject(xmlHttpReq); };
				xmlHttpReq.send(properties.param);
			});
		}
	}
})(window[LIB_NAME], window[LIB_NAME].Promise);