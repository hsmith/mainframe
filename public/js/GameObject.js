var GameObject = function() {
    this.thinks = false;
    this.name = "";
    this.actions = [];
    this.tags = [];
};

GameObject.prototype.onObjectEnter = function(){

}

GameObject.prototype.onPickup = function(){

}

GameObject.prototype.update = function(delta){

}

GameObject.prototype.onAction = function(action){
}

GameObject.prototype.hasTag = function(t){
    return this.tags.indexOf(t)!=-1;
}

