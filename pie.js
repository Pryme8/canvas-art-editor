// mmmm Pie.... Andrew V Butt Sr.
pie = function(target, args){
	this.target = document.getElementById(target) || document.body;
	this.args = args || {};
	this.nodes = [];
	this.hotspots = [];
	this._hot = null;
	this._mousePosition = null;
	this._mouselock = false;
	this.graphicBank = {};
	this._ioCount = 0;
	this.update = 0;
	this._mState = 'idle';
	this.fps = this.args.fps || 60;
	this.ioActive = this.args.ioActive || true;
	this.lastTick = (new Date()).getTime();
	this._layerCount = this.args.layerCount || 4;
	this._zOffset = this.args.zOffset || 0;
	this.layers = [];
	for(var i=0; i< this._layerCount; i++){
		this.layers.push(document.createElement('canvas'));
	}
		
	this._init();
	
	return this;
};

pie.prototype._init = function(){
	for(var i=0; i<this.layers.length; i++){
		var canvas = this.layers[i];
		this.target.appendChild(canvas);
		canvas.style.width = '100%';
		canvas.style.height = '100%';
		canvas.style.left = '0';
		canvas.style.top = '0';		
		canvas.width  = canvas.offsetWidth;
 		canvas.height = canvas.offsetHeight;
		canvas.style.zIndex = i+this._zOffset;	
		canvas.style.position = 'absolute';
		canvas.style.display = 'block';
		canvas.setAttribute('class', 'piePeice');
	};

	var self = this;
	window.addEventListener("resize", function () {
         self.resize();
		 self.redraw();
     });
	 
	 this.target.addEventListener("mousemove", function (e) {
	 	self.io(e);
	 });
	 
	 this.target.addEventListener("mousedown", function (e) {
	 		var spot = self.checkspots(e, true);
			if((spot) && typeof spot.events != 'undefined'){
				var EVENT = spot.events['spinner'] || spot.events['drag'];
			
				if(EVENT){
					//console.log(EVENT);
					var cb = EVENT.callback;
					if(cb){
						this._mouselock = true;
							function clearmouseup(){
								self.target.removeEventListener("mouseup", mouseup ,false);
								document.body.removeEventListener("mousemove", runevent, false);
								self._mouselock = false;
								EVENT._mousedata = null;
							}			
							function mouseup(e) {
								console.log('MOUSE UP');
	 							clearmouseup();
	 						};
							function runevent(e){
								cb(e, EVENT);
							};
						document.body.addEventListener("mouseup", mouseup,false);
						document.body.addEventListener("mousemove", runevent, false);
					}
	 			}else{
					
					if(typeof spot.events != 'undefined'){
						//console.log(spot);
						//No Spin or Drag Events, check for just a click!
						EVENT = spot.events['click'] || spot.events['mousedown'];
							if(EVENT){
								var cb = EVENT.callback;
								if(cb){
									cb(e, EVENT);
								}
							}
					}					
				}//END EVENT CHECK!
   			}//END SPOT CHECK				
	 });//END MOUSE CLICK	 
};//END BINDINGS

pie.prototype.io = function(e){
	if(this.ioActive){
	var self = this;
	var now = (new Date()).getTime();
	var tick = now - this.lastTick;	
		if(tick >= 1000/this.fps){			
			setTimeout(function(){self._io(tick, e);},0);
			this.lastTick = now;
		}
	}	
};

pie.prototype._io = function(tick,e){
	//var self = this;
	if(this.update){this.update = 0;this.redraw();};
	if(this.hotspots.length && this._mouselock != true){
		var spot = this.checkspots(e);
			if(spot){
				if(!this._hot){ this._hot = spot.name}
					if(this._hot != spot.name){
						var self = this;
						setTimeout(function(){self.clearHovers()},0);
				
						}else{
						if((typeof spot.events['hover'] != 'undefined') && typeof spot.events['hover'].callback != 'undefined'){
						spot.events['hover'].callback(e);	
						document.body.style.cursor = 'pointer';
						}
						
				
					}
				this._hot = spot.name;
			}else{
				var self = this;
				this._hot = false;
				setTimeout(function(){self.clearHovers(true)},0);	
				
		}
	}
};

pie.prototype.clearHovers = function(force){
	force = force || false;
	var stamp = this.lastTime;
		for(var i = 0; i< this.hotspots.length; i++){
			if(this.lastTime != stamp && !force){console.log("checking HOTS Refreshed...");return}
			var spot = this.hotspots[i];
			if(this._hot != spot._uID){
			if((typeof spot.events['hover'] != 'undefined') && typeof spot.events['hover'].callback != 'undefined'){
				spot.events['hover'].callback();	
				}
			}
		}
	document.body.style.cursor = 'initial';
};

pie.prototype.checkspots = function(e, force){	
//console.log("Checking Hotspots");
force = force || false;
	var stamp = this.lastTime;
		for(var i = 0; i< this.hotspots.length; i++){
			if(this.lastTime != stamp && !force){console.log("checking HOTS Refreshed...");return}
				var spot = this.hotspots[i];
				if(!spot.enabled){continue};
				var el = spot.parent;
				var node = el.parent;
				var posX = node.transform.x + el.transform.x + spot.transform.x;
				var posY = node.transform.y + el.transform.y +spot.transform.y;
				if( posX+spot.box.tl.x < e.clientX ){
					if( posX+spot.box.br.x > e.clientX ){
						if( posY+spot.box.tl.y < e.clientY ){
							if( posY+spot.box.br.y > e.clientY ){
								return spot;
							}else{
								continue;
							}
						}else{
							continue;
						}				
					}else{
						continue;
					}
				}else{
					continue;
				}
		}
		return false;
};

pie.prototype.resize = function(){
	for(var i=0; i<this.layers.length; i++){
		var canvas = this.layers[i];
		canvas.width  = canvas.offsetWidth;
 		canvas.height = canvas.offsetHeight;	
	}
};

pie.prototype.redraw = function(){
	var self = this;
	setTimeout(function(){self._draw()},0);	
};

pie.prototype._draw = function(){
	this._ioCount++;
	var canvas, ctx;
	var node, el;
	this.clearLayers();
	for(var i = 0; i < this.nodes.length; i++){
		node = this.nodes[i];
		if(!node.enabled){continue};
		for(var j = 0; j < node.elements.length; j++){
			
			el = node.elements[j];
			if(!el.enabled){continue};
				if(el.graphic._ready){
					if(typeof el.graphic.build == 'function'){

						if(canvas != this.layers[el.layer || el.parent.layer]){
						    canvas = this.layers[el.layer || el.parent.layer];
							ctx = canvas.getContext('2d');
						}
					 var build = el.graphic.build(el, ctx, canvas);	
					 continue;
					}
					//console.log(el);
					if(el.graphic.img){
						if(canvas != this.layers[el.layer || el.parent.layer]){
						    canvas = this.layers[el.layer || el.parent.layer];
							ctx = canvas.getContext('2d');
						}
						if(el.transform.r!=0){
							//console.log(el.graphic);
							ctx.save(); 
							var sX = node.transform.x + el.transform.x + (el.graphic.width*0.5),
							    sY = node.transform.y + el.transform.y + (el.graphic.height*0.5);
							
							ctx.translate(sX, sY);
							ctx.rotate(el.transform.r);	
							ctx.drawImage( el.graphic.img,
							el.graphic.width*-0.5,
							el.graphic.width*-0.5,
							el.graphic.width*el.transform.w,
							el.graphic.width*el.transform.h);
							ctx.restore();
							continue	
						}
						
						
						ctx.drawImage( el.graphic.img,
						 node.transform.x +el.transform.x,
						 node.transform.y + el.transform.y,
							el.graphic.width*el.transform.w,
							el.graphic.width*el.transform.h);
						 
					}
					
				}
		}		
	}
	this._ioCount--;
};

pie.prototype.clearLayers = function(){
	for(var i=0; i<this.layers.length; i++){
		var canvas = this.layers[i];
		var ctx = canvas.getContext('2d');
 		ctx.clearRect(0,0,canvas.width, canvas.height);	
	}
};
//SEARCHES
pie.prototype.getElementByName = function(name){
	for(var i = 0; i< this.nodes.length; i++){
		var node = this.nodes[i];
		var el = node.getElementByName(name);
		if(el){return el}
	};
	return null;
};

pie.prototype.getSpotByName = function(name){
	for(var i = 0; i< this.hotspots.length; i++){
		var spot = this.hotspots[i];
		if(spot.name == name){return spot};
	};
	return null;
};

pie.prototype.getNodeByName = function(name){
	for(var i = 0; i< this.nodes.length; i++){
		var node = this.nodes[i];
		if(node.name == name){return node};
	};
	return null;
};

//CREATION SCRIPTS
pie.prototype.createGraphic = function(name, src, args ){
	var graphic = new pie.graphic(name, src, args || {}, this);	
	
	return graphic;
};

pie.prototype.createNode = function(name, args){
	var node = new pie.node(name, args || {}, this);
	this.nodes.push(node);
	
	return node;	
};

pie.prototype.createPGraphic = function(name, build, vars, args){
	var pGraphic = new pie.pGraphic(name, build, vars || {}, args || {}, this);
	
	return pGraphic;	
};

pie.prototype.createHotspot = function(name, args, parent){
	var oName = parent;
	parent = this.getElementByName(parent);
	if(parent){
		var hotspot = parent._createHotspot(name, args || {}, parent);
		return hotspot;
		}else{
		var self = this;
		setTimeout(function(){self.createHotspot(name, args, oName)},30);	
		}
};

//EVENT ATTACH
pie.prototype.createEvent = function(type, callback, vars){
	return new pie.event(type, callback, vars || {});
};

pie.prototype.attach = function(target, e){

		var oName = target;
			target = this.getSpotByName(target);
		if(target){
			if(e.parent){e = new pie.event(e.type, e.callback, JSON.parse(JSON.stringify(e.vars)))}
			e.attach(target);		
			return true;
		}else{
		var self = this;
		setTimeout(function(){self.attach(oName, e)},100);	
		}
	
};

//PADDED CLONE FUNCTIONS
pie.prototype.clone = function(target, args){
	var oName = target;
	target = this.getElementByName(target);
	console.log("Trying to Clone!");
	if(target){		
		var clone = target.clone(args);
		//console.log(clone);
		return clone;		
	}else{
		var self = this;
		setTimeout(function(){self.clone(oName, args)},30);	
	}
};

//KILL FUNCTIONS
pie.prototype.kill = function(type, target, args){
	switch (type){
		case 'node':
			for(var i = 0; i< this.nodes.length; i++){
				var node = this.nodes[i];
				if(node.name == target){
					console.log('node Found!');
					this.nodes.splice(i,1);
					i=this.nodes.length;
				};
				};
		break;	
	}
	this.redraw();
};

//BASIC GRAPHIC
pie.graphic = function(name, src, args, parent){
	this.name = name;
	this.src = src;
	this.args = args || {};
	this.parent = parent;
	this.parent.graphicBank[name] = this;
	this._ready = false;
	this._init();

	return this;
};

pie.graphic.prototype._init = function(){
	parent._ioCount++;
	var img = new Image();
	var self = this;
	img.onload = function(){
		self.width = img.width, self.height = img.height;
		self.img = img;		
		self._ready = true;
		parent._ioCount--;
	};
	img.src = this.src;	
};
//PROCCESS GRAPHIC

pie.pGraphic = function(name, build, vars, args, parent){
	this.name = name;
	this.build = build || null;
	this.vars = vars || {};
	this.args = args || {};
	this.parent = parent;
	this.parent.graphicBank[name] = this;
	this._ready = true;
	
	return this;
};

//NODE IS A CONTAINER FOR ALL ELEMENTS.
pie.node = function(name, args, parent){
	this.name = name;	
	this.args = args || {};
	this.layer = args.layer || 0;
	this.transform = new pie.transform( pie._cleanArgPositions(this.args.transform));
	this.enabled = this.args.enabled || true;
	this.elements = [];
	this._eTick = 0;
	
	this.parent = parent;	
};

pie.node.prototype.createElement = function(name, graphic, args, update){
	if(graphic._ready){
	var element =  new pie.element(name, graphic, args || {}, this);
	
	if(update){this.parent.redraw()}//Refresh Pie
	return element;
	
	}else{
		var self = this;
		setTimeout(function(){self.createElement(name, graphic, args,  update || false)},30);	
	}
};

pie.node.prototype.getElementByName = function(name){
	for(var i = 0; i< this.elements.length; i++){
		var el = this.elements[i];
		if(el.name == name){return el}
	};
	return null;
};

pie.node.prototype.kill = function(){
	this.parent.kill('node', this.name, {});
};

//ELEMENT

pie.element = function(name, graphic, args, parent){
	this.name = name;
	this.graphic = graphic;
	this.args = args || {};
	this.layer = args.layer || parent.layer;
	this.transform = new pie.transform( pie._cleanArgPositions(this.args.transform));
	this.parent = parent;
	this._uid = parent._eTick;
	this.enabled = this.args.enabled || true;
	parent._eTick++;
	parent.elements.push(this);
	this.hotspots = [];
	this._hTick = 0;

	return this;	
};

pie.element.prototype.kill = function(){
	
};

pie.element.prototype._createHotspot = function(name, args){
	if(this.graphic._ready){
		var hotspot = new pie.hotspot(name, args || {}, this);
		return hotspot;
		}else{
		var self = this;
		setTimeout(function(){self._createHotspot(name, args)},30);	
		}
};

pie.element.prototype.clone = function(args){
	args = args || {};	
	var element = new pie.element(args.name || this.name, args.graphic || this.graphic, args.args || JSON.parse(JSON.stringify(this.args)), this.parent);
	
	return element;
};

//HOTSPOT

pie.hotspot = function(name, args, parent){
	this.name = name;
	this.args = args || {};
	this.transform = new pie.transform( pie._cleanArgPositions(this.args.transform));
	this.box = new pie.boundingBox({tl:{x:args.box.tl.x || 1,y:args.box.tl.y || 1}, br:{x:args.box.br.x || -1,y:args.box.br.y || -1}});
	this.parent = parent;
	this._uid = parent._hTick;
	this.enabled = this.args.enabled || true;
	this.events = {};
	parent._hTick++;
	parent.hotspots.push(this);
	parent.parent.parent.hotspots.push(this);
	
	return this;
};

/*pie.hotspot.prototype.disable = function(state){
	var pp = this.parent.parent.parent;
	if(!state){		
		this.enabled = true;
		for(var i=0; i<pp.hotspots; i++){
			var spot = pp.hotspots[i];
			if(spot.name == this.name){
				spot.enabled = true;
			}
		}
	}else{
	this.enabled = false;
		for(var i=0; i<pp.hotspots; i++){
			var spot = pp.hotspots[i];
			if(spot.name == this.name){
				spot.enabled = false;
			}
		}
	
	}
};*/

//TRANSFROM OBJECT
pie.transform = function(x,y,z,r,w,h){
	if(typeof x == "object"){
	this.x = x.x || 0;
	this.y = x.y || 0;
	this.z = x.z || 0;
	this.r = x.r || 0;
	this.w = x.w || 0;
	this.h = x.h || 0;	
	}else{
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
	this.r = r || 0;
	this.w = w || 0;
	this.h = h || 0;
	}
	return this;
};

pie._cleanArgPositions = function(transform){
	transform = transform || {};
	transform.x = transform.x || 0;
	transform.y = transform.y || 0;
	transform.z = transform.z || 0;
	transform.r = transform.r || 0;
	transform.w = transform.w || 1;
	transform.h = transform.h || 1;
	return transform;	
}

pie.boundingBox = function(box){
	box = box || {};
	box.tl = box.tl || {};
	box.br = box.br || {};
	this.tl = box.tl || {};
	this.br = box.br || {};
	
	this.tl.x = this.tl.x || -1;this.tl.y = this.tl.y || -1;
	this.br.x = this.br.x || 1;this.br.y = this.br.y || 1;
	return this;
};

pie.event = function(type, parent, callback){
	this.type = type;
	this.parent = parent;
	this.callback = callback;
	return this;
};

pie.event = function(type, callback, vars){
	this.type = type;
	this.callback = callback;
	this.responses = [];
	this.vars = vars || {};
};

pie.event.prototype.attach = function(target){
	this.parent = target;
	this.parent.events[this.type] = this;
};

pie.event.prototype.addResponse = function(response, vars){
	var response = new pie.response(response, vars || {}, this);
	this.responses.push(response);
};

pie.response = function(response, vars, parent){
	this.response = response;
	this.vars = vars;
	this.parent = parent;
	return this;
};

pie.response.prototype.getSpot = function(){
	return this.parent.parent;
}
pie.response.prototype.getElement = function(){
	return this.parent.parent.parent;
}
pie.response.prototype.getNode = function(){
	return this.parent.parent.parent.parent;
}