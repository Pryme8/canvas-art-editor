// Canvas Cartography - Author: Andrew V Butt Sr. 12/16/2016
//UNIT SIZE: 10 BJS Units = 1 meter;


CART = function(){
	this.options = {baseScale:1024};
	this.stack = [];
	this.currentTool = null;
	this.activeLayer = null;	
	this.drawMouse = false;
	this.camera = new CART.CAMERA(this);

	this.output = new CART.CANVAS(document.getElementById('editor-block'), 'output', 'main-output');
	
	this._zones = [];
	this._currentZone = null;
	this._layers = [];
	this._maps = {height:[]};
	
	
	this._startUI();
	this._bindings();
	this._bjs = new CART.BJS();
	
	
	
	return this;
};




CART.prototype._startUI = function(){
	this.UI = new pie('editor-block', {layerCount:2, zOffset:10001});
	this.WIDGETS = {};
	var ui = this.UI;
	var self = this;
	
	this.WIDGETS['grid'] = ui.createPGraphic('grid', function(el, ctx, canvas){
		
		var hw = Math.floor(canvas.width*0.5);
		var hh = Math.floor(canvas.height*0.5);
		var cPos = self.camera.transform.position.clone();
		var zoom = self.camera.zoom;
		
		//console.log('Zoom',zoom);
		
		//CENTER LINES
		if(Math.abs(cPos.x)<hw || Math.abs(cPos.y)<hh ){
	    ctx.lineWidth = 2;
		ctx.strokeStyle = 'rgba(200,80,80,0.5)';
		ctx.beginPath();
		ctx.moveTo(hw-cPos.x, 0); ctx.lineTo(hw-cPos.x, canvas.height);
		ctx.moveTo(0, hh-cPos.y); ctx.lineTo(canvas.width, hh-cPos.y);
		ctx.stroke();
		}
		
		//North Lines
		var x=0, y=0;
		while(x<canvas.width || y<canvas.height){
			var rY = (-hh+cPos.y+y)*zoom;
			
			rY = Math.abs(rY/(self.options.baseScale));
			
			rY = rY - Math.floor(rY);
			
			if(rY == 0.5){
				//console.log(rY);
					ctx.strokeStyle = 'rgba(128,128,128,0.5)';
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.moveTo(0, y); ctx.lineTo(canvas.width,y);
					ctx.stroke();	
			}			
			if(rY == 0.25 || rY == 0.75 || (rY == 0 && rY!=hh)){
				//console.log(rY);
					ctx.strokeStyle = 'rgba(128,128,128,0.25)';
					ctx.lineWidth = 0.5;
					ctx.beginPath();
					ctx.moveTo(0, y); ctx.lineTo(canvas.width,y);
					ctx.stroke();	
			}
			
			var rX = (-hw+cPos.x+x)*zoom;
			rX = Math.abs(rX/(self.options.baseScale));
			rX = rX - Math.floor(rX);
			
			if(rX == 0.5){
					ctx.strokeStyle = 'rgba(128,128,128,0.5)';
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.moveTo(x, 0); ctx.lineTo(x,canvas.height);
					ctx.stroke();	
			}			
			if(rX == 0.25 || rX == 0.75 || (rX == 0 && rX!=hw)){
					ctx.strokeStyle = 'rgba(128,128,128,0.25)';
					ctx.lineWidth = 0.5;
					ctx.beginPath();
					ctx.moveTo(x, 0); ctx.lineTo(x,canvas.height);
					ctx.stroke();	
			}
			
			x++;
			y++;		

		};
		

		
		
		
		
		
	
		
		
		//ctx.strokeRect(hw-(this.vars.width*0.5),hh-(this.vars.height*0.5),this.vars.width, this.vars.height);
			
	},
	{},{});
		
	
	this.baseUI = ui.createNode('Base_UI', {enabled:true, layer:0});
	this.mouseUI = ui.createNode('Mouse_UI', {enabled:true, layer:1});

	this.grid = this.baseUI.createElement('Grid-El', this.WIDGETS['grid'], {}, true);
	//this.cursor = this.baseUI.createElement('cursors-El', this.graphics['cursors'], {}, true);	
};

CART.prototype._bindings = function(){
	
	var self = this;
	document.body.addEventListener('click', function(e){
		var t = e.target;
		var act = t.getAttribute('act');
		if(act){			
			console.log(act);
			switch(act){
			case 'move-cam':
				e.preventDefault();
				dir = t.getAttribute('id');
				switch(dir){
					case'NW':					
						self.camera.transform.position.x -=10;
						self.camera.transform.position.y -=10;					
					break;
					case'N':				
						self.camera.transform.position.y -=20;					
					break;
					case'NE':					
						self.camera.transform.position.x +=10;
						self.camera.transform.position.y -=10;					
					break;
					case'W':				
						self.camera.transform.position.x -=20;	
					break;
					case'O':				
						self.camera.transform.position.x =0;
						self.camera.transform.position.y =0;					
					break;
					case'E':				
						self.camera.transform.position.x +=20;										
					break;
					case'SW':
						self.camera.transform.position.y +=10;		
						self.camera.transform.position.x -=10;										
					break;
					case'S':				
						self.camera.transform.position.y +=20;										
					break;
					case'SE':				
						self.camera.transform.position.y +=10;		
						self.camera.transform.position.x +=10;										
					break;
				}
				self.UI.redraw();		
			break;
			case 'change-view':
				view = t.getAttribute('t');
				console.log(view);
				var cwin = document.querySelector('.window.full.active');
				var wina = document.getElementById('editor-block');
				var winb = document.getElementById('scene-block');
				if(!cwin){
				wina.setAttribute('class', 'window full');
				winb.setAttribute('class', 'window full');
				}else{			
				cwin.setAttribute('class', 'window full');
				}
				if(view != 'split-view'){
				cwin = document.getElementById(view);
				cwin.setAttribute('class', 'window full active');
				}else{
				wina.setAttribute('class', 'window half');
				winb.setAttribute('class', 'window half');
				}
				self.UI.redraw();
				self.UI.resize();
			break;
			case 'create-new-zone' : 
				var popup = new CART.ELEMENTS.POPUP(CART.ELEMENTS.ZONE, self);
			break;
			}
		}
		}, false);
		
		document.body.addEventListener('change', function(e){
		var t = e.target;
		var act = t.getAttribute('act');
		if(act){			
			console.log(act);
			switch(act){
			case 'update-zone-arg':
			var type = t.getAttribute('type');
			var val = t.value;
			if(type=='number'){parseFloat(val)};
			var key = t.getAttribute('id');
			self._currentZone.args[key] = val;
			self._currentZone._lDom();
			break;
			}
		}
		},false);
	
};

CART.BJS = function(){
	var canvas = document.getElementById('scene-canvas');
	this.canvas = canvas;
	var engine = new BABYLON.Engine(canvas, true);
    this.engine = engine;

    var scene = new BABYLON.Scene(engine);
	this.scene = scene
	
         scene.clearColor = new BABYLON.Color3(0, 0, 0);

         var camera = new BABYLON.FreeCamera("main_cam", new BABYLON.Vector3(0, 1000, 0), scene);
         camera.setTarget(BABYLON.Vector3.Zero());
         
         camera.attachControl(canvas, false);
		var lights = [new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0.5), scene),
					   new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, -0.2, -0.35), scene)]
      	
			        
         lights[0].intensity = .65;
		 lights[1].intensity = .35;
		 this.lights = lights;


      engine.runRenderLoop(function () {
         scene.render();
      });

      window.addEventListener("resize", function () {
         engine.resize();
      });
	
};

CART.CANVAS = function(t, CLASS, id){	
	var out = document.createElement('canvas');
	out.setAttribute('class', CLASS);
	out.setAttribute('id', id);
	t.appendChild(out);	
	out.width = out.offsetWidth;
	out.height = out.offsetHeight;
	
	return out;
};


CART.CAMERA = function(parent){
	this.parent = parent;
	this.transform = new CART.TRANSFORM({},this);
	this.zoom = 2; //km
	
	return this;
};

CART.TRANSFORM = function(args, parent){
	this.parent = parent;
	this.position = args.position || new vec2();
	this.scale = args.scale || new vec2(1,1);
	this.rotation = args.rotation || new vec2();
	this.origin = args.origin || new vec2();
	
	
	return this;
};

CART.ZONE = function(args, parent){
	this.parent = parent;
	this.transform = new CART.TRANSFORM(args.tranform || {}, this);
	
};


CART.DO = {
	
	Km2Units : function(km){
		return (km*100); //(input*1000)/10;
	}
};



