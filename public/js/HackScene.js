var HackScene = function(game, returnScene, playerImage){
    this.game = game;
    this.returnScene = returnScene;
    this.playerImage = playerImage;
    this.mode = "play";
    this.time = 0;
    this.failTimer = 60.0;
    this.backgroundColor = "#9900FF";
    this.music = new Howl({
        urls: ['sounds/sfx_general/sfx_computer_on.mp3'],
        loop: false
        }).play();
    this.phasingIn = true;
    this.phaseInSpeed = 1.0;
    this.minimumSquareSize = 75;
    this.squareSize = 70;
    this.upLeftGridCornerX = 0;
    this.upLeftGridCornerY = 0;
    this.gridObjectSize = 0;
    this.gridObjectPadding = 5;

    this.playerGridPosX = 0,
    this.playerGridPosY = 0;

    this.goalGridPosX = 9;
    this.goalGridPosY = 7;

    this.minGridX = 0;
    this.minGridY = 0;
    this.maxGridX = 9;
    this.maxGridY = 7;

    this.whoseTurn = "player";

    this.playerActionThrottle = 0.1;
    this.timeSinceTurn = 0.0;

    this.difficulty = 1;

    this.enemies = [];
};

HackScene.prototype = Object.create(Scene.prototype);

HackScene.prototype.update = function(delta){
    this.time += delta;
    this.timeSinceTurn += delta;

    if (this.timeSinceTurn >= this.playerActionThrottle)
    {
        this.whoseTurn = "player";
    }
    
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0,0,this.width,this.height);

    /*
    this.ctx.font = "12px 'Press Start 2P'";
    this.ctx.fillStyle = "white";
    this.ctx.globalAlpha = 1;
    this.ctx.fillText("debug text", 10, 100);
    */

    
    if (this.width/20 < this.minimumSquareSize || this.height/10 < this.minimumSquareSize )
    {
        this.squareSize = this.minimumSquareSize;
    }
    else
    {
        this.squareSize = this.width/20;
    }

    this.gridObjectSize = this.squareSize - (this.gridObjectPadding * 2);

    this.upLeftGridCornerX = this.width/4;
    this.upLeftGridCornerY = this.height * .1;
    
    if (this.time >= this.phaseInSpeed)
    {
        this.phasingIn = false;
    }

    if (this.phasingIn)
    {
        this.ctx.strokeStyle = "#15dbc4";
        this.ctx.lineWidth = 1;
        for (i=0; i<11;i++)
        {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.squareSize + this.upLeftGridCornerX, 0);
            this.ctx.lineTo(i * this.squareSize + this.upLeftGridCornerX, 0 + (this.time/this.phaseInSpeed) * (this.height/2));
            this.ctx.stroke();
        }

        
        for (i=0; i<11;i++)
        {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.squareSize + this.upLeftGridCornerX, this.height);
            this.ctx.lineTo(i * this.squareSize + this.upLeftGridCornerX, this.height - ((this.time/this.phaseInSpeed) * (this.height/2)));
            this.ctx.stroke();
        }
        
    
        for (i=0; i<9;i++)
        {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.squareSize + this.upLeftGridCornerY);
            this.ctx.lineTo(0 + (this.time/this.phaseInSpeed) * (this.width/2), i * this.squareSize + this.height * .1);
            this.ctx.stroke();
        }

        for (i=0; i<9;i++)
        {
            this.ctx.beginPath();
            this.ctx.moveTo(this.width, i * this.squareSize + this.upLeftGridCornerY);
            this.ctx.lineTo(this.width - ((this.time/this.phaseInSpeed) * (this.width/2)), i * this.squareSize + this.height * .1);
            this.ctx.stroke();
        }
        
    }

    if (!this.phasingIn)
    {
        this.failTimer -= delta;

        this.ctx.font = "12px 'Press Start 2P'";
        this.ctx.fillStyle = "white";
        this.ctx.globalAlpha = 1;
        this.ctx.fillText("Intrusion detected in:", 10, 25);
        this.ctx.fillText(Math.ceil(this.failTimer).toString() + " seconds", 10, 50);

        this.ctx.strokeStyle = "#15dbc4";
        this.ctx.lineWidth = 1;
        for (i=0; i<11;i++)
        {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.squareSize + this.upLeftGridCornerX, this.upLeftGridCornerY);
            this.ctx.lineTo(i * this.squareSize + this.upLeftGridCornerX, this.upLeftGridCornerY + (this.squareSize * 8));
            this.ctx.stroke();
        }
    
        for (i=0; i<9;i++)
        {
            this.ctx.beginPath();
            this.ctx.moveTo(this.upLeftGridCornerX, i * this.squareSize + this.upLeftGridCornerY);
            this.ctx.lineTo(10 * this.squareSize + this.upLeftGridCornerX, i * this.squareSize + this.upLeftGridCornerY);
            this.ctx.stroke();
        }


        this.ctx.fillStyle = "yellow";
        this.ctx.fillRect(this.upLeftGridCornerX + (this.goalGridPosX * this.squareSize) + this.gridObjectPadding,
                                            this.upLeftGridCornerY + (this.goalGridPosY * this.squareSize) + this.gridObjectPadding,
                                            this.gridObjectSize,this.gridObjectSize);

        this.ctx.drawImage(this.playerImage,this.upLeftGridCornerX + (this.playerGridPosX * this.squareSize) + this.gridObjectPadding,
                                            this.upLeftGridCornerY + (this.playerGridPosY * this.squareSize) + this.gridObjectPadding,
                                            this.gridObjectSize,this.gridObjectSize);
    }
};


HackScene.prototype.onKeyDown = function(key){
    if (!this.phasingIn && this.whoseTurn == "player")
    {
        if((key == 37 && this.playerGridPosX > this.minGridX) || (key == 65 && this.playerGridPosX > this.minGridX))
        {
            this.playerGridPosX--;
            this.whoseTurn = "enemy";
            this.timeSinceTurn = 0.0;
        }
        else if((key == 38 && this.playerGridPosY > this.minGridY) || (key == 87 && this.playerGridPosY > this.minGridY))
        {
            this.playerGridPosY--;
            this.whoseTurn = "enemy";
            this.timeSinceTurn = 0.0;
        }
        else if((key == 39 && this.playerGridPosX < this.maxGridX) || (key == 68 && this.playerGridPosX < this.maxGridX))
        {
            this.playerGridPosX++;
            this.whoseTurn = "enemy";
            this.timeSinceTurn = 0.0;
        }
        else if((key == 40 && this.playerGridPosY < this.maxGridY) || (key == 83 && this.playerGridPosY < this.maxGridY)) 
        {
            this.playerGridPosY++;
            this.whoseTurn = "enemy";
            this.timeSinceTurn = 0.0;
        }
    }
};

HackScene.prototype.onTap = function(x,y){

};