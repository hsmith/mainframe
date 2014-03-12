var CharacterSelectScene = function(game,music){
    this.game = game;
    this.time = 0;
    this.music = music;
    this.character = 0;
};

CharacterSelectScene.prototype = Object.create(Scene.prototype);

CharacterSelectScene.prototype.update = function(delta){
    this.time += delta;

    var bg = Resources.getImage("terminal_background");
    this.ctx.drawImage(bg,0,0,window.innerWidth,window.innerHeight);

    var cx = (window.innerWidth-480)/2;
    var cy = 30;

    this.ctx.font = "11px 'Press Start 2P'";
    this.ctx.fillStyle = "white"
    this.drawBox(cx,cy,480,400);
    this.drawBox(cx+20,cy+20,120,120);
    this.drawBox(cx+180,cy+20,120,120);
    this.drawBox(cx+340,cy+20,120,120);

    this.ctx.fillStyle = "white";
    this.ctx.globalAlpha = .2;

    var text = ""

    if(this.character == 0){
        this.ctx.fillRect(cx+20,cy+20,120,120);
        text = "Street Samurai - A mysterious warrior experienced in martial combat.  Highest strength, passive health regeneration, and can deliver multiple counter attacks to nearby enemies.  Recommended for first time players."
    }
    else if(this.character == 1){
        this.ctx.fillRect(cx+180,cy+20,120,120);
        text = "Hacker - Eyes forever in the net, he moves through wires like man moves through the wind.  Makes up for low combat abilities with an active camo system and starts with hack programs to access locked gear quicker.  Recommended for experienced players."
    }
    else if(this.character == 2){
        this.ctx.fillRect(cx+340,cy+20,120,120);
        text = "Scientist - Ready to unravel the mysteries of the world.  Pitiful health and initially lacks any way to deal direct damage.  Relies completely on a powerful companion droid SOP13 for offense and defense.  Recommended for hardcore players."
    }
    this.ctx.globalAlpha = 1;

    this.ctx.drawImage(Resources.getImage("street_samurai_1"),cx+20+10,cy+20+10,100,100);
    this.ctx.drawImage(Resources.getImage("hacker_1"),cx+180+10,cy+20+10,100,100);
    this.ctx.drawImage(Resources.getImage("sop13_1"),cx+340+10,cy+50+10,64,64);
    this.ctx.drawImage(Resources.getImage("scientist_1"),cx+350+10,cy+20+10,100,100);

    function wrapText(context, text, x, y, maxWidth, lineHeight) {
        var words = text.split(' ');
        var line = '';

        for(var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }
        context.fillText(line, x, y);
    }

    wrapText(this.ctx,text,cx+20,cy+180,440,30)


    this.drawBox(cx,cy+410,220,60)
    this.ctx.fillText("Start",cx+20+60,cy+410+40);
    this.drawBox(cx+260,cy+410,220,60)
    this.ctx.fillText("Help",cx+260+20+60,cy+410+40);
    this.drawBox(cx,cy+480,480,60)
    this.ctx.fillText("Credits",cx+20+160,cy+480+40);
};


CharacterSelectScene.prototype.drawBox = function(x,y,width,height){
    x = Math.floor(x);
    y = Math.floor(y);
    width = Math.floor(width);
    height = Math.floor(height);
    dialog_bg = Resources.getImage("dialog_bg");
    dialog_frame_bottom = Resources.getImage("dialog_frame_bottom");
    dialog_frame_bottomleft = Resources.getImage("dialog_frame_bottomleft");
    dialog_frame_bottomright = Resources.getImage("dialog_frame_bottomright");
    dialog_frame_left = Resources.getImage("dialog_frame_left");
    dialog_frame_right = Resources.getImage("dialog_frame_right");
    dialog_frame_top = Resources.getImage("dialog_frame_top");
    dialog_frame_topleft = Resources.getImage("dialog_frame_topleft");
    dialog_frame_topright = Resources.getImage("dialog_frame_topright");

    var context = this.ctx;

    context.save();
    // Draw the path that is going to be clipped
    context.beginPath();
    context.rect(x+4,y+4,width-8,height-8);
    context.clip();

    context.beginPath();
    for(var xx=0;xx<width/32;xx++){
        for(var yy=0;yy<height/32;yy++){
            this.ctx.drawImage(dialog_bg,x+xx*32,y+yy*32,32,32);
        }
    }


    context.restore();


    this.ctx.drawImage(dialog_frame_topleft,x,y,8,8);
    this.ctx.drawImage(dialog_frame_top,x+8,y,width-16,8);
    this.ctx.drawImage(dialog_frame_bottomleft,x,y+height-8,8,8);
    this.ctx.drawImage(dialog_frame_left,x,y+8,8,height-16);
    this.ctx.drawImage(dialog_frame_right,x+width-8,y+8,8,height-16);
    this.ctx.drawImage(dialog_frame_topright,x+width-8,y,8,8);
    this.ctx.drawImage(dialog_frame_bottomright,x+width-8,y+height-8,8,8);
    this.ctx.drawImage(dialog_frame_bottom,x+8,y+height-8,width-16,8);
}

CharacterSelectScene.prototype.onKeyDown = function(k){
    if(k == 32){
        this.music.fade(1,0,1000);
        var p = new Player();
        if(this.character == 0){
            p.setupSamurai();
        }
        if(this.character == 1){
            p.setupHacker();
        }
        if(this.character == 2){
            p.setupScientist( this );
        }
        new Howl({
            urls: ["sounds/sfx_ui/sfx_ui_popup.mp3"],
            volume:.5
        }).play();
        this.game.changeScene(new TestScene(this.game,p));
    }
}

CharacterSelectScene.prototype.onTap = function(x,y){
    var cx = (window.innerWidth-480)/2;
    var cy = 30;
    if(Utilities.isPointInRectangle(x,y,cx+20+10,cy+20+10,100,100)){
        this.character = 0;
    }
    if(Utilities.isPointInRectangle(x,y,cx+180+10,cy+20+10,100,100)){
        this.character = 1;
    }
    if(Utilities.isPointInRectangle(x,y,cx+340+10,cy+20+10,100,100)){
        this.character = 2;
    }
    if(Utilities.isPointInRectangle(x,y,cx,cy+410,220,60)){
        this.music.fade(1,0,1000);
        var p = new Player();
        if(this.character == 0){
            p.setupSamurai();
            ga('send', 'samurai');
        }
        if(this.character == 1){
            p.setupHacker();
            ga('send', 'hacker');
        }
        if(this.character == 2){
            p.setupScientist();
            ga('send', 'scientist');
        }
        new Howl({
            urls: ["sounds/sfx_ui/sfx_ui_popup.mp3"],
            volume:.5
        }).play();
        this.game.changeScene(new TestScene(this.game,p));
    }
    if(Utilities.isPointInRectangle(x,y,cx,cy+480,480,60)){
        this.music.fade(1,0,1000);
        new Howl({
            urls: ["sounds/sfx_ui/sfx_ui_popup.mp3"],
            volume:.5
        }).play();
        this.game.changeScene(new CreditsScene(this.game));
    }
    if(Utilities.isPointInRectangle(x,y,cx+260,cy+410,220,60)){
        new Howl({
            urls: ["sounds/sfx_ui/sfx_ui_popup.mp3"],
            volume:.5
        }).play();
        this.game.changeScene(new HelpScene(this.game,this.music));
    }
};