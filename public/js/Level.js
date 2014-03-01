var Level = function() {
    this.tiles = [];
    this.width = 30;
    this.height = 30;
    for(var x = 0; x < this.width; x++){
        for(var y = 0; y < this.height; y++){
            this.tiles[y*this.width+x] = {type: Level.Types.Floor, image: Resources.images.grass, objects:[]};
        }
    }
}

Level.Types = {
    Floor : 0
};

Level.prototype.getTileAt = function(x,y) {
    return this.tiles[y*this.width+x];
};

Level.prototype.addObjectTo = function(x,y,o) {
    this.getTileAt(x,y).objects.push(o);
    o.level = this;
    o.x = x;
    o.y = y;
};

Level.prototype.isPointWithin = function(x,y) {
    return (x>=0&&x<this.width&&y>=0&&y<this.height);
};

Level.prototype.moveTo = function(x,y,o) {
    this.removeFrom(o.x, o.y, o);
    this.addObjectTo(x,y,o);
};

Level.prototype.removeFrom = function(x,y,o) {
    var t = this.getTileAt(x,y);
    var i = t.objects.indexOf(o);
    o.x = -1;
    o.y = -1;

    if (i > -1) {
        t.objects.splice(i, 1);
    }
    else {
        console.log("trying to remove object that doesn't exist");
    }
};