// Canvas Art - Author: Andrew V Butt Sr. 12/8/2016
// Screw all these lame canvas art apps... yall better recognize.

CART = function(t){
	this._tID = t;
	this._target = document.getElementById(t) || document.body;	
	this.options = {};
	this.stack = [];
	
	this.currentTool = null;
	this.drawMouse = false;
	this.activeLayer = null;	
	
	this._init();
	this._bindings();
	
	
	this._startIO();
	
	return this;
};


CART.prototype._init = function(){
	this.interface = new CART.UI({layerCount:2, zOffset:1000001}, this);
	this.activeLayer = this.CreateLayer('Background', {});
	
	
};

CART.prototype.io = function(){
	if(this.drawMouse){
	this._drawMouse();
	}
	
};

CART.prototype._startIO = function(){
		var io =  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame;
			var self = this;
	var rIO = function() {
        self.io();
        io( rIO );
    };
    io( rIO );
};

//Might not need this!
CART.prototype._mouseControl = function(state){
	if(state){
	if(this.currentTool){
		this._target.style.cursor = 'none';
		this.drawMouse = true;
			
	}else{
		this._target.style.cursor = 'initial';	
		this.drawMouse = false;
	}
	}else{
		this._target.style.cursor = 'initial';
		this.drawMouse = false;
	}
};

CART.prototype._drawMouse = function(){
		this.interface.cursor.transform.x = this._mX;
		this.interface.cursor.transform.y = this._mY;
		this.interface.core.update = 1;
};

CART.prototype._bindings = function(){
	var self = this;
	this._target.addEventListener('click', function(e){
		var t = e.target;
		var act = t.getAttribute('act');
		if(act){			
			console.log(act);
			switch(act){
			case 'change-tool':
				e.preventDefault();
				self.changeTool(t.getAttribute('id'));			
			break;
			case 'toggle-tool-setting':
				self.currentTool[t.getAttribute('id')] = e.target.checked;						
			break;	
			case 'undo':
				var l = self.activeLayer;
				var step = l._step;
				if(l._step < 49 && l._step < (l.history.length - 1)){
				step++;
				}
				l._changeStep(step);
			break;	
			case 'redo':
				var l = self.activeLayer;
				var step = l._step;
				if(l._step > 0){
				step--;
				}
				l._changeStep(step);
			break;
			case 'change-step':
				var l = self.activeLayer;
				var step = t.getAttribute('vID');
			
				if(l._step < 0){
				step = 0;
				}else if(step > 49){step=49;}
				l._changeStep(step);
			break;	
			}
		}
		}, false);
	this._target.addEventListener('change', function(e){
		var t = e.target;
		var act = t.getAttribute('act');
		if(act){
			console.log(act);
			switch(act){
			case 'update-tool-setting':
			var val = parseFloat(t.value);	
				self.currentTool[t.getAttribute('id')] = val;
				
			break;	
			}
		}
		}, false);
	var mouseLayer = this.interface.core.layers[1];
	mouseLayer.addEventListener('mouseover', function(e){self._mouseControl(true)}, false);
	mouseLayer.addEventListener('mouseout', function(e){self._mouseControl(false)}, false);
	mouseLayer.addEventListener('mousemove', function(e){self._mX = e.clientX; self._mY = e.clientY;}, false);
};

CART.prototype.changeTool = function(tool){
	document.getElementById('tool-name').innerHTML = tool;
	this.currentTool = new CART.TOOLS[tool](this);	
	console.log(this.currentTool);
};


CART.prototype.CreateLayer = function(name, args){
	var layer = new CART.LAYER(name, args, this);
	this._target.appendChild(layer._canvas);
	this.stack.push(layer);
	layer._createPreview();
	return layer;	
};




CART.LAYER = function(name, args, parent){
	this.name = name || 'New Layer';
	this.parent = parent;
	this.cWidth = args.width || parent._target.offsetWidth || 0;
	this.cHeight = args.height || parent._target.offsetHeight || 0;
	this.nWidth = 512; this.nHeight = 512;
	this.history = [];
	this.options = {
		clearColor : args.clearColor || 'rgba(255,255,255,1)',	
	};
	this.transforms = new CART.TRANSFORMS({}, this);
	this._canvas = document.createElement('canvas');
	this._resetCanvas();
	this._startingContext();
	this._createAct();

	this._step = 0;
	this._preview = new CART.LAYER.PREVIEW(this);
	
		
	return this;		
};


CART.LAYER.prototype._resetCanvas = function(){
	this._canvas.style['z-index'] = this.transforms.zIndex;
	this._canvas.width = this.cWidth;
	this._canvas.height = this.cHeight;
};

CART.LAYER.prototype._startingContext = function(){
	this.ctx = this._canvas.getContext('2d');
	if(this.options.clearColor){
		this.ctx.clearRect(0,0, this._canvas.width, this._canvas.height);
		this.ctx.fillStyle = this.options.clearColor;
		this.ctx.fillRect(0,0, this._canvas.width, this._canvas.height);
	};
	
};

CART.LAYER.prototype._createAct = function(){
	var hw = this._canvas.width*0.5;
	var hh = this._canvas.height*0.5;
	var data = this.ctx.getImageData(0,0,this._canvas.width, this._canvas.height);
	var idat = this.ctx.getImageData(hw-256,hh-256, 512, 512);
	var act = new CART.ACT(data, idat, this);
	this.history.unshift(act);
	if(this.history.length > 50){this.history.pop();}
};

CART.LAYER.prototype._updateInfo = function(){
	this._updateHistory();
	this._updatePreview();

};

CART.LAYER.prototype._updateHistory = function(){
	var hb = document.getElementById('historyBar');
	hb.innerHTML = '';
	for(var i =0; i<this.history.length; i++){
		var htick = this._createTick(i);
		if(i!=this._step){
		(document.getElementById('tick'+i)).setAttribute('class', 'htick');
		}else{
		(document.getElementById('tick'+i)).setAttribute('class', 'active htick');	
		}
	}
};

CART.LAYER.prototype._createTick = function(id){
	var hb = document.getElementById('historyBar');
	var htick = document.createElement('span');
		htick.setAttribute('id', 'tick'+id); 
		htick.setAttribute('class', 'active htick');
		htick.setAttribute('act', 'change-step');
		htick.setAttribute('vID', id);
		hb.appendChild(htick);

		return htick;
};

CART.LAYER.prototype._changeStep = function(step){
	this._step = step;
	var stepData = this.history[step].data;
	this.ctx.putImageData(stepData, 0,0);
	this._updateInfo();
};

CART.LAYER.prototype._createPreview = function(){
	document.getElementById('layer-block').appendChild(this._preview.dom);
	
};

CART.scaleImageData = function(imageData, scale) {
var tempCanvas = document.createElement('canvas');
tempCanvas.width = 512; tempCanvas.height=512;


var ctx = tempCanvas.getContext("2d");
ctx.putImageData(imageData, 0, 0);

ctx.scale(scale, scale);
ctx.drawImage(tempCanvas, 0, 0);
return ctx.getImageData(0,0, 60, 60);
}

CART.LAYER.prototype._updatePreview = function(){
	var hw = this._canvas.width*0.5;
	var hh = this._canvas.height*0.5;
	var fs = this.history[this._step].idat;
	console.log(fs);
	fs = CART.scaleImageData(fs, 60/512);
	var ctx = this._preview.ctx;
	//ctx.clearRect(0,0,60,60);
	ctx.putImageData(fs, 0, 0);
};

CART.LAYER.PREVIEW = function(parent){
	this.parent = parent;
	this.dom = document.createElement('div');
	this.dom.setAttribute('class', 'layer-item');
	this.canvas = document.createElement('canvas');
	this.canvas.width = 60;
	this.canvas.height = 60;
	this.ctx = this.canvas.getContext('2d');
	this.dom.appendChild(this.canvas);
	this.controls = document.createElement('div');
	this.controls.setAttribute('class', 'layer-options');
	this.controls.setAttribute('id', 'layer-options');
	this.controls.innerHTML =
`
<div style='position:absolute; width:calc(100% - 34px); height:100%;'>
<div><span>Name:</span><span><input id='layer-name' value='`+this.parent.name+`' act='update-layer-name' class='small'></input></span></div>
</div>
<div style='position:absolute; width:34px; right:34px; border-left:1px solid black;'>
<a class='button stacked' id='move-up' act='move-layer-up'></a>
<a class='button stacked' id='move-down' act='move-layer-down'></a>
</div>
`;
this.dom.appendChild(this.controls);
	return this;
};


CART.TRANSFORMS = function(args, parent){
	this.zIndex = args.zIndex || 0;
	this.x = args.x || 0;
	this.y = args.y || 0;
	this.width = args.width || parent.cWidth || 0;
	this.height = args.height || parent.cHeight || 0;
	this.scale = args.scale || [1,1];
	return this;	
};

//ACTS
CART.ACT = function(data, idat, parent){
	this.data = data;
	this.idat = idat;
	this.parent = parent;
	this.stamp = new Date();
};




CART.UI = function(args, parent){
	this.parent = parent;
	this.core = new pie(parent._tID, args || {});
	this._init();
};

CART.UI.prototype._init = function(){
	this.graphics = {};
	var ui = this.core;
	var self = this;
	this.graphics['Paper-Box'] = this.core.createPGraphic('Paper-Box', function(el, ctx, canvas){
		ctx.strokeStyle = 'rgba(128,128,128,1)';
		var hw = canvas.width*0.5;
		var hh = canvas.height*0.5;
		ctx.strokeRect(hw-(this.vars.width*0.5),hh-(this.vars.height*0.5),this.vars.width, this.vars.height);
			
	},
	{width:512, height:512},{});
	
	this.graphics['cursors'] = this.graphics.cursors = this.core.createPGraphic('cursors', function(el, ctx, canvas){
		var tool = self.parent.currentTool;
		if(tool){
			var pos = el.transform;
		if(this.vars.type == 'crosshair'){
			var size = tool['size'];
			ctx.strokeStyle = 'rgba(80,255,80,1.0)';
			//ctx.fillRect(pos.x-25,pos.y-25,50, 50);
			ctx.beginPath();
			ctx.moveTo(pos.x, pos.y-(size*0.5));
			ctx.lineTo(pos.x, pos.y+(size*0.5));
			ctx.moveTo(pos.x-(size*0.5), pos.y);
			ctx.lineTo(pos.x+(size*0.5), pos.y);
			ctx.stroke();		
		}
		}
		ui.update = 1;
			
	},
	{type:'crosshair'},{});
	
	
	this.baseUI = ui.createNode('Base_UI', {enabled:true, layer:0});
	this.mouseUI = ui.createNode('Mouse_UI', {enabled:true, layer:1});

	this.pBox = this.baseUI.createElement('Paper-Box-El', this.graphics['Paper-Box'], {}, true);
	this.cursor = this.baseUI.createElement('cursors-El', this.graphics['cursors'], {}, true);
	ui.update = 1;
	
	this.toolbar = new CART.DOM['Tool-Bar']();
	this.parent._target.appendChild(this.toolbar.dom);
	
	this.toolinfo = new CART.DOM['Tool-Info']();
	this.parent._target.appendChild(this.toolinfo.dom);
		
	this.controls = new CART.DOM['Controls']();
	this.parent._target.appendChild(this.controls.dom);
	
	this.historyBar = new CART.DOM['History-Bar']();
	this.parent._target.appendChild(this.historyBar.dom);
	
	this.layerBlock = new CART.DOM['Layer-Stack']();
	this.parent._target.appendChild(this.layerBlock.dom);
};


CART.DOM = {
	"Tool-Bar" : function(){
		this.dom = document.createElement('div');
		this.dom.setAttribute('class', 'pane');
		this.dom.setAttribute('id', 'tool-bar');
		this.dom.innerHTML = 
`
<span class='tool' id='draw-tool' act='change-tool'></span> 
`
	},
	"Tool-Info" : function(){
		this.dom = document.createElement('div');
		this.dom.setAttribute('class', 'pane');
		this.dom.setAttribute('id', 'tool-info');
		this.dom.innerHTML = 
`
<div class='pane-head'>Current-Tool</div>
<div class='item'><span>Name:</span><span  id='tool-name'> None</span></div>
<div class='sub-pane' id='tool-settings'>
</div>
`
	},
	"Controls" : function(){
		this.dom = document.createElement('div');
		this.dom.setAttribute('class', 'pane');
		this.dom.setAttribute('id', 'controls');
		this.dom.innerHTML = 
`
<span class='tool' id='redo' act='redo'></span> 
<span class='tool' id='undo' act='undo'></span>
`
	},
		"History-Bar" : function(){
		this.dom = document.createElement('div');
		this.dom.setAttribute('class', 'pane');
		this.dom.setAttribute('id', 'historyBar');
	},
		"Layer-Stack" : function(){
		this.dom = document.createElement('div');
		this.dom.setAttribute('class', 'pane');
		this.dom.setAttribute('id', 'layer-stack');
		this.dom.innerHTML = 
`
<div class='pane-head'>Layer-Stack</div>
<div class='sub-pane' id='layer-block'>
</div>
<div class='sub-pane' id='layer-controls'>
<a href='#'>New Layer</a>| <a href='#'>Clone Layer</a> | <a href='#'>Delete Layer</a> 
</div>
`;
	},
};

CART.TOOLS = {
	"draw-tool" : function(parent){		
		this.lastPos = null;
		this['size'] = this.size = 1;
		this['shape'] = this.shape = 0;
		this['lastTick'] = this.lastTick = null;
		this['flow'] = this.flow = 0.2;
		this['opacity'] = this.opacity = 1.0;
		this['lazyOn'] = this.lazyOn = true;
		this['lazyStep'] = this.lazyStep = 8;
		
		
		
		this.parent = parent;
		
		var self = this;
		var layer = parent.activeLayer;
		var ctx = layer.ctx;
					
		this.clear = function(){
			layer._createAct();
			layer._updateInfo();
			parent._target.removeEventListener('mouseup', self.stop, false);
			parent._target.removeEventListener('mouseout', self.stop, false);
			parent._target.removeEventListener('mousemove', self.move, false);			
		};
		this.stop = function(e){
			self.clear();
		};
		this.move = function(e){
			self.run(e);
		};
		this.start = function(e){
			if(layer._step>=1){
			
				layer.history.splice(0, layer._step);
				layer._step = 0;
				layer._updateInfo();	
			}
			self.run(e);
			parent._target.addEventListener('mouseup', self.stop, false);
			parent._target.addEventListener('mouseout', self.stop, false);
			parent._target.addEventListener('mousemove', self.move, false);
		};
		this.run = function(e){
			var x = e.clientX;
			var y = e.clientY;
			if(!self.lastPos){				
				self.draw(e);
			}else{
				var cp = new vec2(x,y);
				var dist = self.lastPos.clone().subtract(cp).len();
				var flowSize = self['size']*self['flow'];
				if(dist>flowSize){
					self.draw(e);
				}
			
			
			}						
			
		};
		
		this.draw = function(e){
			var x = e.clientX;
			var y = e.clientY;
				ctx.fillStyle = 'rgba(0,0,0,'+self['opacity']+')';
				var hs = Math.floor(self['size']*0.5);
				ctx.fillRect(e.clientX-hs, e.clientY-hs, self['size'] , self['size']);
				self.lastPos = new vec2(x,y);
				self.lastTick = (new Date()).getTime();
		};
		
		
		
	
		var mouseLayer = parent.interface.core.layers[1];
		
		this.active = function(){
			mouseLayer.addEventListener('mousedown', self.start, false);
			document.getElementById('tool-settings').innerHTML = 
`
<div class='item'><span>Size:</span><span><input id='size' value='1' act='update-tool-setting' class='small'></input></span></div>
<div class='item'><span>Shape:</span><span><select id='shape' value='0' act='update-tool-setting' class='small'>
<option value='0' selected>Square</option>
<option value='1'>Circle</option>
</select></span></div>
<div class='item'><span>Flow:</span><span><input id='flow' value='0.2' act='update-tool-setting' class='small'></input></span></div>
<div class='item'><span>Opacity:</span><span><input id='opacity' value='1' act='update-tool-setting' max='1' min='0' step='0.01' type='number' class='small'></input></span></div>
<div class='item'><span>Lazy:</span><span><input id='lazyOn' checked type='checkbox' act='toggle-tool-setting' class='small'></input></span></div>
<div class='item'><span><LazyStep:</span><span><input id='lazyStep' value='8' act='update-tool-setting' class='small'></input></span></div>
`;
			
			};
		this.active();
		this.deactive = function(){console.log("Draw De-Active");};
		return this;
	}
};




