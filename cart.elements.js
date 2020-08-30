//cart.elements

CART.ELEMENTS = {};

CART.ELEMENTS.POPUP = function(t, parent){
		this.dom = this.createDom(t);
		this.parent = parent;
		document.body.appendChild(this.dom);
		var self = this;
		this.dom.addEventListener("click", function(e) {
   			var tt = e.target;
			var act = tt.getAttribute('act');
			switch(act){
				case 'confirm-popup':
					var nO = self.confirm(t);
					document.body.removeChild(self.dom);
					if(typeof nO._build == 'function'){
					 nO._build();	
					}
				
				break;
				case 'cancel-popup':
					document.body.removeChild(self.dom);
				
				break;					
			}
 		});
		
		return this;
	};
	
CART.ELEMENTS.POPUP.prototype.confirm = function(t){
	var args = {};
	var dt = document.querySelectorAll('.arg-in');
	for(var i = 0; i<dt.length; i++){
		var tt = dt[i];
		 if (tt.getAttribute('type')!='number'){args[tt.getAttribute('id')] = tt.getAttribute('value')}else{args[tt.getAttribute('id')] = parseFloat(tt.getAttribute('value'))};		
	};
	var nO = new t(args, this.parent);
	return nO;	
};
	
CART.ELEMENTS.POPUP.prototype.createDom = function(t){
	var tO = new t();
	
	var dom = document.createElement('div');
	dom.setAttribute('class', 'popup');
	dom.innerHTML = "<div class='pop-head'>"+t.popName+"</div>";
	
	
	var keys = Object.keys(tO.args);
	for(var i=0; i<keys.length; i++){
		if(typeof tO.args[keys[i]] != 'object'){
			var type = typeof tO.args[keys[i]];
			switch(type){
			case 'string':
			dom.innerHTML += "<div class='arg-item'><span>"+keys[i]+"</span><input class='arg-in text' id='"+keys[i]+"' value='"+tO.args[keys[i]]+"'></input></div>";
			break;
			case 'number':
			dom.innerHTML += "<div class='arg-item'><span>"+keys[i]+"</span><input class='arg-in text' id='"+keys[i]+"' value='"+tO.args[keys[i]]+"' type='number'></input></div>";
			break;		
			}
		}
	}
	
	dom.innerHTML +=
	"<a href='#' class='button-text' id='cancel-pop' act='cancel-popup'>Cancel</a>"+
	"<a href='#' class='button-text' id='confirm-pop' act='confirm-popup'>Confirm</a>";
	
	return dom;
};

CART.ELEMENTS.ZONE = function(args, parent){
	this.args = args || {};
	this.parent = parent || null;
	
	
		this.args.name = this.args.name || 'New-Zone';		
		this.args.posX = this.args.posX || 0;//km
		this.args.posY = this.args.posY || 0;//km
		this.args.width = this.args.width || 1; //km
		this.args.height = this.args.height || 1; //km
		this.args.detail = this.args.detail || 10; //Subdivs
		
		this._uid = (new Date).getTime();		
		
		return this;
};

CART.ELEMENTS.ZONE.prototype._build = function(){
	console.log('Building New Zone');
	this.parent._zones.push(this);
	this._lDom();

	var self = this;
		changeZone = function(e){
			self.parent._currentZone = self;
			var ta = document.querySelectorAll('.zone-item');
				for(var i=0; i<ta.length; i++){
				var t = ta[i];
				t.setAttribute('class', 'zone-item');
			};
				self.dom.setAttribute('class', 'zone-item selected');		
				self._sDom();
		};
		changeZone();
	
	this.dom.addEventListener('click', changeZone ,false);
};


CART.ELEMENTS.ZONE.prototype._sDom = function(){
	document.getElementById('current-zone-info').innerHTML = 	
`
<div class='item'><span>uID:</span>`+this._uid+`</div>
<div class='item'><span>Name:</span><span><input id='name' value='`+this.args.name+`' act='update-zone-arg' class='small'></input></span></div>
<div class='item'><span>posX:</span><span><input id='posX' value='`+this.args.posX+`' act='update-zone-arg' class='small' type='number'></input></span></div>
<div class='item'><span>posY:</span><span><input id='posY' value='`+this.args.posY+`' act='update-zone-arg' class='small' type='number'></input></span></div>
<div class='item'><span>width:</span><span><input id='width' value='`+this.args.width+`' act='update-zone-arg' class='small' type='number'></input></span></div>
<div class='item'><span>height:</span><span><input id='height' value='`+this.args.height+`' act='update-zone-arg' class='small' type='number'></input></span></div>
<div class='item'><span>detail:</span><span><input id='detail' value='`+this.args.detail+`' act='update-zone-arg' class='small' type='number'></input></span></div>
`;
};

CART.ELEMENTS.ZONE.prototype._lDom = function(){	
    if(!this.dom){
	this.dom = document.createElement('div');
	this.dom.setAttribute('class', 'zone-item');
	this.dom.setAttribute('id', this._uid);
		document.getElementById('zone-list').appendChild(this.dom);	
	}
	
	this.dom.innerHTML = '<a href="#" id="'+this._uid+'"><span>'+this.args.name+'</span>:<span>'+this._uid+'</span></a>';
	
};

CART.ELEMENTS.ZONE.name = "Zone";
CART.ELEMENTS.ZONE.popName = "Zone Create";



