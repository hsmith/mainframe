var Move = function(x,y,obj){
    this.obj = obj;
    this.x = x;
    this.y = y;
};

Move.prototype = Object.create(Action.prototype);

Move.prototype.process = function(complete){
    if(!this.isObjectStillInPlay(this.obj)){ complete();return; }
    if(this.obj.level.getObjectsByTypeOnTile(this.x,this.y,"solid").length>0){complete();return;}
    this.obj.level.moveTo(this.x,this.y,this.obj);
    var objs = this.obj.level.getObjectsAt(this.x,this.y);
    for(var i = 0 ; i < objs.length; i++){
        objs[i].onObjectEnter(this.obj);
    }
    complete();
};