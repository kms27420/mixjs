(function($w) {
	'use strict';

	$w.__proto__.__defineGetter__('LIB_NAME', function() { return 'mix'; });
	$w.__proto__.__defineGetter__('PROPS_FILE_NAME', function() { return LIB_NAME+'.json'; });
	$w.__proto__.__defineGetter__('DEPS_FILE_NAME', function() { return 'dependencies.json'; });
	$w.__proto__.__defineGetter__('PROPS_KEY', function() { return 'PROPS'; });
	$w.__proto__.__defineGetter__('DEPS_KEY', function() { return 'DEPENDENCIES'; });
	
	jsonFileToJsonObj(PROPS_FILE_NAME, function(PROPS) {
		let propsValid = new PropsValidator().checkValid(PROPS);
		if(propsValid!=='valid')	throw propsValid;
		propsValid = null;
		
		let $ = $w[LIB_NAME] ? $w[LIB_NAME] : new Mix();
		$.__proto__.__defineGetter__(PROPS_KEY, function() { return JSON.parse(JSON.stringify(PROPS)); });
		$w[LIB_NAME] = $;
		
		jsonFileToJsonObj($.PROPS.rootPath+DEPS_FILE_NAME, function(deps) {
			let depsValid = new DependenciesValidator().checkValid(deps);
			if(depsValid!=='valid')	throw depsValid;
			depsValid = null;
			$.__proto__.__defineGetter__(DEPS_KEY, function() { return JSON.parse(JSON.stringify(deps)); });
			let loader = new DependenciesLoader();
			loader.loadAll(deps);
			loader.loadAll($.PROPS.includes);
			
			startApp();
			function startApp() {
				setTimeout(function() {
					if($.history)	$w.location.hash = $.history.mainHash;
					else	startApp();
				}, 100);
			}
		});
	});
	
	function Mix() {}
	
	function PropsValidator() {
		let $this = this;
		const KEYS = [
			new Key('rootPath', true, false, "".__proto__)
		];
		
		$this.__defineGetter__('checkValid', function() { return checkValid; });
		
		function checkValid(props) {
			return KEYS.reduce(function(result, key) {
				if(result!=='valid')	return result;
				let isValid = !(
					key.required && typeof props[key.name]==='undefined' 
					|| key.nullable && props[key.name]===null
				);
				if(!isValid)	return 'Required key: ' + key + '. Invlid props. Please check the "' + PROPS_FILE_NAME + '" file.';
				if(key==='includes')	return new DependenciesValidator().checkValid(props[key]);
				return 'valid';
			}, 'valid');
		}
		function Key(name, required, nullable, proto) {
			let $keyThis = this;
			$keyThis.__defineGetter__('name', function() { return name; });
			$keyThis.__defineGetter__('required', function() { return required; });
			$keyThis.__defineGetter__('nullable', function() { return nullable; });
			$keyThis.__defineGetter__('proto', function() { return proto; });
			$keyThis = null;
		}
	}
	
	function DependenciesValidator() {
		let $this = this;
		$this.__defineGetter__('checkValid', function() { return checkValid; });
		
		function checkValid(deps) {
			if(!Array.isArray(deps))	return 'The deps is must be type of array.';
			deps = JSON.parse(JSON.stringify(deps));
			let names = [];
			let files = [];
			for(var i=0; i<deps.length; i++) {
				if(typeof deps[i].name!=='string' || deps[i].name==='')	return 'The name field must be type of string and cannot be empty string. Please check the "dependencies.json" file.';
				if(!Array.isArray(deps[i].files))	return 'The files field must be type of string or array. Please check the "dependencies.json" file.';
				for(var j=0; j<deps[i].files.length; j++) 
					if(typeof deps[i].files[j]!=='string' && (typeof deps[i].files[j]!=='object' || !deps[i].files[j].path))
						return 'The files\' items are must be type of object and must have values matched with the "path" key.';
				if(typeof deps[i].dependencies==='string')	deps[i].dependencies = [deps[i].dependencies];
				if(!deps[i].dependencies)	deps[i].dependencies = [];
				if(!Array.isArray(deps[i].dependencies))	return 'The dependencies field must be type of string or array. Please check the "dependencies.json" file.';
				
				if(names.indexOf(deps[i].name)!==-1)	return 'The name(' + deps[i].name + ') is duplicated. Please check the "dependencies.json" file.';
				names.push(deps[i].name);
				for(var j=0; j<deps[i].files.length; j++) {
					if(typeof deps[i].files==='string' && files.indexOf(deps[i].files[j])!==-1
							|| typeof deps[i].files==='object' && files.indexOf(deps[i].files[j].path)!==-1)
						return 'The filePath(' + deps[i].files[j] + ') is duplicated. Please check the "dependencies.json" file.';
					files.push(typeof deps[i].files[j]==='string' ? deps[i].files[j] : deps[i].files[j].path);
				}
			}
			for(var i=0; i<deps.length; i++) 
				for(var j=0; j<deps[i].dependencies.length; j++) 
					if(names.indexOf(deps[i].dependencies[j])===-1)	
						return 'The name(' + deps[i].dependencies[j] + ') is not found. Please check the "dependencies.json" file.';
			names = files = null;
			
			return 'valid';
		}
	}
	
	function DependenciesLoader() {
		let $this = this;
		const PATH_KEYS = {
			script: 'src', 
			link: 'href'
		};
		$this.__defineGetter__('loadAll', function() { return loadAll; });
		
		function loadAll(deps) {
			let head = document.getElementsByTagName('head')[0];
			let loadedNames = [];
			for(var i=0; i<deps.length; i++)	load(i);
			head = loadedNames = deps = null;
			
			function load(idx) {
				if(loadedNames.indexOf(deps[idx].name)!==-1)	return;
				
				if(!deps[idx].dependencies)	deps[idx].dependencies = [];
				else if(typeof deps[idx].dependencies==='string')	deps[idx].dependencies = [deps[idx].dependencies];
				deps[idx].dependencies.forEach(function(depName) {
					load(deps.indexOf(deps.filter(function(toFind) { return toFind.name===depName; })[0]));
				});
				
				deps[idx].files.forEach(function(file) {
					let tag = document.createElement(file.tag ? file.tag : 'script');
					if(typeof file==='string') {
						tag.src = file.replace(/#{ROOT_PATH}/gi, $.PROPS.rootPath);
					} else {
						Object.keys(file).forEach(function(key) {
							switch(key) {
							case 'tag': return;
							case 'path':
								let pathKey = PATH_KEYS[tag.tagName.toLowerCase()];
								pathKey = pathKey ? pathKey : 'src';
								let path = file.path.replace(/#{ROOT_PATH}/gi, $.PROPS.rootPath);
								if(typeof tag[pathKey]!=='undefined')	tag[pathKey] = path;
								else	tag.setAttribute(pathKey, path);
								pathKey = path = null;
								break;
							default: 
								if(typeof tag[key]!=='undefined')	tag[key] = file[key];
								else	tag.setAttribute(key, file[key]);
								break;
							}
						});
					}
					if(tag.tagName.toLowerCase()==='script' && !file.type)	tag.type = 'text/javascript';
					head.appendChild(tag);
					tag = null;
				});
				loadedNames.push(deps[idx].name);
			}
		}
	}
	
	function jsonFileToJsonObj(filePath, resolve, reject) {
		sendGetFileReq(filePath, function(responseText) {
			resolve(JSON.parse(responseText));
		}, reject);
	}
	function sendGetFileReq(filePath, resolve, reject) {
		let req = new XMLHttpRequest();
		req.onload = function() {
			try {
				resolve(req.responseText);
			} catch(e) {
				console.error(e);
			}
			req = null;
		};
		if(typeof reject!=='function') {
			reject = function(status, statusText) {
				let error = 'status: ' + status + ', statusText: ' + statusText;
				console.error(error);
			};
		}
		req.onerror = function() {
			try {
				reject(req.status, req.statusText);
			} catch(e) {
				console.error(e);
			}
			req = null;
		};
		req.open('GET', filePath);
		req.send();
	}
})(window);