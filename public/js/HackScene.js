var HackScene = function(game, returnScene, difficulty, programs, endHackCallBack){
    this.game = game;
    this.returnScene = returnScene;
    this.difficulty = difficulty;

    this.goalFound = false;

    //this.programs = ["Net Ninja", "Driver Corrupt", "Bit Shifter", "SUDO Inspect"]
    this.programs = programs


    this.endHackCallBack = endHackCallBack;

    this.selectedProgram = null;
    this.program1Consumed = false;
    this.program2Consumed = false;
    this.program3Consumed = false;
    this.program4Consumed = false;

    this.prog1Image = Resources.getImage("1");
    this.prog2Image = Resources.getImage("2");
    this.prog3Image = Resources.getImage("3");
    this.prog4Image = Resources.getImage("4");

    this.mode = "play";
    this.mainframeEnmity = 0.0;
    this.time = 0;
    this.playerActivelyHacking = false;
    this.lastHackAttemptNode = null;
    this.hackingFullyBacktraced = false;
    this.selectedNode = null;
    
    this.phasingIn = true;
    this.phaseInSpeed = 1.0;
    this.minimumSquareSize = 40;
    this.squareSize = 0;
    this.upLeftGridCornerX = 0;
    this.upLeftGridCornerY = 0;
    this.gridObjectSize = 0;
    this.gridObjectPadding = 1;
    
    this.sound = new Howl(
    {
        urls: ['sounds/sfx_general/sfx_computer_on.mp3'],
        autoplay: true,
        loop: false,
    });

    this.music = new Howl(
    {
            urls: ['sounds/Hacking.mp3'],
            autoplay: true,
            loop: true
    });

    this.programDetectionModifier = 0.0;
    this.programNodeHackSpeedModifier = 1.0;
    this.programEnmityModifier = 0.0;

    this.initializePassivePrograms();

    this.grid = HackGridGenerator.generate( 10, 10, this, this.difficulty );

    /*
    for (var i = 0; i < this.grid.nodes.length; i++)
    {
        console.log(this.grid.nodes[i].mainframeDetectionChancePerc);
    }
    */
    
    
};

HackScene.prototype = Object.create(Scene.prototype);

HackScene.prototype.update = function(delta){
    this.time += delta;

    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0,0,this.width,this.height);

    if (this.width/(this.grid.maxGridX +1) < this.minimumSquareSize || this.height/(this.grid.maxGridY + 2) < this.minimumSquareSize )
    {
        this.squareSize = this.minimumSquareSize;
    }
    else
    {
        this.squareSize = Math.min(this.width/(this.grid.maxGridX +1), this.height/(this.grid.maxGridY + 2));
    }


    this.gridObjectSize = this.squareSize - (this.gridObjectPadding * 2);

    if (this.width/4 > 400)
    {
        this.upLeftGridCornerX = this.width/4;
    }
    else
    {   
        this.upLeftGridCornerX = 400;
    }

    this.upLeftGridCornerY = this.height * .05;
    
    if (this.time >= this.phaseInSpeed)
    {
        this.phasingIn = false;
    }

    if (this.phasingIn)
    {
        this.ctx.strokeStyle = "#15dbc4";
        this.ctx.lineWidth = 1;
        //draw lines from top to bottom
        for (var i=0; i<this.grid.xGridLineCount; i++)
        {
            this.ctx.beginPath();
            this.ctx.moveTo(this.upLeftGridCornerX + (i * this.squareSize), 0);
            this.ctx.lineTo(this.upLeftGridCornerX + (i * this.squareSize), 0 + (this.time/this.phaseInSpeed) * (this.height/2));
            this.ctx.stroke();
        }

        //draw lines from bottom to top
        for (var i=0; i<this.grid.xGridLineCount; i++)
        {
            this.ctx.beginPath();
            this.ctx.moveTo(this.upLeftGridCornerX + (i * this.squareSize), this.height);
            this.ctx.lineTo(this.upLeftGridCornerX + (i * this.squareSize), this.height - ((this.time/this.phaseInSpeed) * (this.height/2)));
            this.ctx.stroke();
        }
        
        //draw lines from left to right
        for (var i=0; i<this.grid.yGridLineCount; i++)
        {
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.upLeftGridCornerY + (i * this.squareSize));
            this.ctx.lineTo(0 + (this.time/this.phaseInSpeed) * (this.width/2), this.upLeftGridCornerY + (i * this.squareSize));
            this.ctx.stroke();
        }

        //draw lines from right to left
        for (var i=0; i<this.grid.yGridLineCount; i++)
        {
            this.ctx.beginPath();
            this.ctx.moveTo(this.width, i * this.squareSize + this.upLeftGridCornerY);
            this.ctx.lineTo(this.width - ((this.time/this.phaseInSpeed) * (this.width/2)), i * this.squareSize + this.upLeftGridCornerY);
            this.ctx.stroke();
        }
        
    }

    if (!this.phasingIn)
    {
        /*
        this.ctx.font = "12px 'Press Start 2P'";
        this.ctx.fillStyle = "white";
        this.ctx.globalAlpha = 1;
        this.ctx.fillText("Intrusion detected in:", 10, 25);
        this.ctx.fillText(Math.ceil(this.failTimer).toString() + " seconds", 10, 50);
        */

        this.ctx.strokeStyle = "#15dbc4";
        this.ctx.lineWidth = 1;

        //draw lines from top to bottom
        for (var i=0; i<this.grid.xGridLineCount; i++)
        {
            
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.squareSize + this.upLeftGridCornerX, this.upLeftGridCornerY);
            this.ctx.lineTo(i * this.squareSize + this.upLeftGridCornerX, this.upLeftGridCornerY + (this.squareSize * (this.grid.maxGridY +1 )));
            this.ctx.stroke();
        }
    
        //draw lines from left to right
        for (var i=0; i<this.grid.yGridLineCount; i++)
        {
            this.ctx.beginPath();
            this.ctx.moveTo(this.upLeftGridCornerX, i * this.squareSize + this.upLeftGridCornerY);
            this.ctx.lineTo((this.grid.maxGridX + 1) * this.squareSize + this.upLeftGridCornerX, i * this.squareSize + this.upLeftGridCornerY);
            this.ctx.stroke();
        }

        this.grid.hackingSimulationUpdate(delta);
        this.grid.updateBacktraceHighlights(delta);
        this.grid.updateNodeConnectionLines(delta);
        this.grid.updateNodeHackedConnectionLines(delta);
        this.grid.update(delta);

        this.drawBox(10,10,this.upLeftGridCornerX - 20,this.height - 20);

        this.ctx.fillStyle = "red";
        this.ctx.fillRect(this.width - 40, 0 + 10,30,30);
        this.ctx.font = "16px 'Press Start 2P'";
        this.ctx.fillStyle = "black";
        this.ctx.fillText("X", this.width - 32, 0 + 35);

        if (this.hackingFullyBacktraced == true)
        {
            this.ctx.font = "14px 'Press Start 2P'";
            this.ctx.fillStyle = "red";
            this.ctx.globalAlpha = 1;
            this.ctx.fillText("HACKING FULLY BACKTRACED", 30, this.height/2 - 50);
            this.ctx.fillText("SESSION TERMINATED", 50, this.height/2 + 20 - 50);

            this.ctx.font = "12px 'Press Start 2P'";
            this.ctx.fillStyle = "white";
            this.ctx.globalAlpha = 1;
            this.ctx.fillText("Use the 'X' button in the", 30, this.height/2);
            this.ctx.fillText("upper-right corner to exit", 30, this.height/2 + 20);
            this.ctx.fillText("hacks at any time", 30, this.height/2 + 40);

        }
        else if (this.mainframeEnmity == 0)
        {
            this.ctx.font = "17px 'Press Start 2P'";
            this.ctx.fillStyle = "green";
            this.ctx.globalAlpha = 1;
            this.ctx.fillText("Currently Undetected", 30, 80);
        }
        else
        {
            this.ctx.font = "14px 'Press Start 2P'";
            this.ctx.fillStyle = "red";
            this.ctx.globalAlpha = 1;
            this.ctx.fillText("INTRUSTION DETECTED", 60, 40);
            this.ctx.fillText("Mainframe Enmity: " + this.mainframeEnmity + "%", 50, 60);

            this.ctx.font = "10px 'Press Start 2P'";
            this.ctx.fillStyle = "white";
            this.ctx.fillText("Hack primary Data Cache before the", 30, 90);
            this.ctx.fillText("Mainframe completes its backtrace!", 30, 110);
        }

        if (this.selectedNode != null && this.hackingFullyBacktraced == false)
        {
            this.ctx.font = "14px 'Press Start 2P'";
            this.ctx.fillStyle = "white";
            this.ctx.globalAlpha = 1;
            this.ctx.fillText("NODE SCAN RESULTS:", 30, 150);
            
            var nodeDescription = "";

            if (this.selectedNode.type == "player")
                nodeDescription = "System Entry Point";
            else if (this.selectedNode.type == "mainframe")
                nodeDescription = "Psychotic Mainframe";
            else if (this.selectedNode.type == "neutral")
            {   
                if (this.selectedNode.hacked == false)
                    nodeDescription = "Neutral";
                else
                    nodeDescription = "Hacked Neutral";
            }
            else if (this.selectedNode.type == "goal")
            {
                if (this.selectedNode.hacked == false)
                    nodeDescription = "Data Cache";
                else
                    nodeDescription = "Hacked Data Cache";
            }
            else
                nodeDescription = "Default";

            this.ctx.fillText("Type: " + nodeDescription, 30, 170);

            //this.ctx.fillText("Connections: " + this.selectedNode.connectedTo.length, 30, 190);

            var hackableDescription = "";
            var nodeIsHackable = this.selectedNode.isHackable();

            if (nodeIsHackable == true)
                hackableDescription = "Currently Hackable";
            else
                hackableDescription = "No Available Hack Route";

            if (this.selectedNode.type == "player")
                hackableDescription = " ";
            else if (this.selectedNode.hacked == true)
            {
                this.ctx.fillStyle = "green";
                hackableDescription = "Node Hacked!";
            }

            this.ctx.fillText(hackableDescription, 30, 190);

            this.ctx.fillStyle = "white";

            if ((nodeIsHackable == true) && (this.selectedNode.type != "mainframe"))
                this.ctx.fillText("Detection Chance: " + this.selectedNode.mainframeDetectionChancePerc + "%", 30, 210);
            else if ((nodeIsHackable == true) && (this.selectedNode.type == "mainframe"))
                this.ctx.fillText("Detection Chance: " + 100 + "%", 30, 210);


            if (this.playerActivelyHacking == true)
            {
                this.ctx.fillStyle = "lightgreen";
                this.ctx.fillRect(30,this.height - 370,340,70);

                var perc = (this.lastHackAttemptNode.hackingProgress/this.lastHackAttemptNode.hackingDifficultyInSec); 

                this.ctx.fillStyle = "green";
                this.ctx.fillRect(30,this.height - 370, perc* 340,70);

                this.ctx.fillStyle = "black";
                this.ctx.fillText("HACKING IN PROGRESS", 65, this.height - 325);
            }

            if ((this.playerActivelyHacking != true) && (this.selectedNode.isHackable()))
            {
                //if I ever change this position, I also need to change the hardcoded button in onTap()
                this.ctx.fillStyle = "lightgreen";
                this.ctx.fillRect(30,this.height - 370,340,70);

                this.ctx.fillStyle = "black";
                this.ctx.fillText("Click To Initiate Hack", 50, this.height - 325);
            }
        }

        if (this.hackingFullyBacktraced != true)
        {
            for (var i = 0; i < this.programs.length; i++)
            {
                if (i == 0)
                {
                    this.ctx.drawImage(this.prog1Image, 30, this.height - 100, 64, 64);
                }
                else if (i == 1)
                {
                    this.ctx.drawImage(this.prog2Image, 120, this.height - 100, 64, 64);
                }
                else if (i == 2)
                {
                    this.ctx.drawImage(this.prog3Image, 215, this.height - 100, 64, 64);
                }
                else if (i == 3)
                {
                    this.ctx.drawImage(this.prog4Image, 305, this.height - 100, 64, 64);
                }
            }

            if (this.selectedProgram != null)
            {
                this.ctx.fillStyle = "white";
                this.ctx.fillRect(30,this.height - 280,340,160);

                this.ctx.fillStyle = "black";
                this.ctx.font = "12px 'Press Start 2P'";
                this.ctx.fillText("Program " + this.selectedProgram + ":", 40, this.height - 260);

                var showRunButton = true;

                if (this.programs[this.selectedProgram - 1] == "Net Ninja")
                {
                    this.ctx.fillText("Net Ninja", 165, this.height - 260);
                    showRunButton = false;

                    this.ctx.fillText("A passive buff that reduces", 40, this.height - 240);
                    this.ctx.fillText("the chance to be detected", 40, this.height - 225);
                    this.ctx.fillText("while hacking by 10%", 40, this.height - 210);
                }
                else if (this.programs[this.selectedProgram - 1] == "Network Warrior")
                {
                    this.ctx.fillText("Network Warrior", 165, this.height - 260);

                    this.ctx.fillText("A once-per-hack skill that", 40, this.height - 240);
                    this.ctx.fillText("allows the hacker to tether", 40, this.height - 225);
                    this.ctx.fillText("any Node directly to their", 40, this.height - 210);
                    this.ctx.fillText("System Entry Point ", 40, this.height - 195);
                }
                else if (this.programs[this.selectedProgram - 1] == "Bit Shifter")
                {
                    this.ctx.fillText("Bit Shifter", 165, this.height - 260);

                    this.ctx.fillText("A once-per-hack skill that", 40, this.height - 240);
                    this.ctx.fillText("allows the hacker to auto-", 40, this.height - 225);
                    this.ctx.fillText("hack a random neutral Node", 40, this.height - 210);
                }
                else if (this.programs[this.selectedProgram - 1] == "SUDO Inspect")
                {
                    this.ctx.fillText("SUDO Inspect", 165, this.height - 260);
                    showRunButton = false;

                    this.ctx.fillText("A passive buff that", 40, this.height - 240);
                    this.ctx.fillText("increases Node hack speed", 40, this.height - 225);
                    this.ctx.fillText("by 25%", 40, this.height - 210);
                }
                else if (this.programs[this.selectedProgram - 1] == "Driver Corrupt")
                {
                    this.ctx.fillText("Driver Corrupt", 165, this.height - 260);
                    showRunButton = false;

                    this.ctx.fillText("A passive buff that", 40, this.height - 240);
                    this.ctx.fillText("decreases the ammount", 40, this.height - 225);
                    this.ctx.fillText("of enmity generated by", 40, this.height - 210);
                    this.ctx.fillText("detected node hacks by 5%", 40, this.height - 195);
                }

                if ((showRunButton == true) && (this.isProgramConsumed(this.selectedProgram) == false))
                {
                    this.ctx.fillStyle = "green";
                    this.ctx.fillRect(110,this.height - 175,175,50);

                    this.ctx.font = "10px 'Press Start 2P'";
                    this.ctx.fillStyle = "black";
                    this.ctx.fillText("RUN PROGRAM", 140, this.height - 145);
                }
                else if ((this.isProgramConsumed(this.selectedProgram)) == true && (showRunButton == true))
                {
                    this.ctx.fillStyle = "red";
                    this.ctx.fillRect(110,this.height - 175,175,50);

                    this.ctx.font = "8px 'Press Start 2P'";
                    this.ctx.fillStyle = "black";
                    this.ctx.fillText("PROGRAM ALREADY USED", 118, this.height - 145);
                }

            }
        }

        if (this.goalFound == true)
        {
            var victoryPromptXSize = 500;
            var victoryPromptYSize = 200;

            var victoryBorderXSize = 480;
            var victoryBorderYSize = 180;

            var victoryInnerPromptXSize = 460;
            var victoryInnerPromptYSize = 160;

            this.ctx.fillStyle = "green";
            this.ctx.fillRect(300,this.height/2 - (0.5 *  victoryPromptYSize),victoryPromptXSize, victoryPromptYSize);

            this.ctx.fillStyle = "white";
            this.ctx.fillRect(310,this.height/2 - (0.5 *  victoryBorderYSize),victoryBorderXSize, victoryBorderYSize);

            this.ctx.fillStyle = "green";
            this.ctx.fillRect(320,this.height/2 - (0.5 *  victoryInnerPromptYSize),victoryInnerPromptXSize, victoryInnerPromptYSize);

            this.ctx.font = "28px 'Press Start 2P'";
            this.ctx.fillStyle = "white";
            this.ctx.fillText("HACK SUCCESSFUL!", 330, this.height/2 + 20);
        }

    }
};


HackScene.prototype.onKeyDown = function(key)
{
    
    if ((key == 32) && (this.selectedNode != null) && (this.playerActivelyHacking == false))
    {
        if (this.selectedNode.isHackable())
            this.grid.hackNode(this.selectedNode);
    }
    
    /*
    //debug spacebar = auto-win
    if (key == 32)
        this.goalFound = true;
    */

};

HackScene.prototype.onTap = function(x,y)
{
    var xGridClick = -99;
    var yGridClick = -99;

    for (var i = 0; i < this.grid.xSize; i++)
    {
        if ((xGridClick == -99) &&
            (x > (i * this.squareSize + this.upLeftGridCornerX)) && 
            (x < ((i + 1) * this.squareSize + this.upLeftGridCornerX)))
        {
            xGridClick = i;
        }
    }

    for (var i = 0; i < this.grid.ySize; i++)
    {
        if ((yGridClick == -99) &&
            (y > (i * this.squareSize + this.upLeftGridCornerY)) && 
            (y < ((i + 1) * this.squareSize + this.upLeftGridCornerY)))
        {
            yGridClick = i;
        }
    }

    if(xGridClick != -99 && yGridClick != -99)
    {
        //console.log("Mouse position is X: " + x + " Y: " + y);
        //console.log("The player clicked on grid X: " + xGridClick + " Y: " + yGridClick);

        if (this.grid.grid[xGridClick][yGridClick] != 0)
        {
            this.selectedNode = this.grid.grid[xGridClick][yGridClick];
        }
        else
        {
            this.selectedNode = null;
        }
    }

    if(this.selectedNode != null)
    {

        if ((x > 30) && (x < 370) && (y > this.height - 370) && (y < this.height - 300))
        {
            if ((this.playerActivelyHacking != true) && (this.selectedNode.isHackable()))
            {
                this.grid.hackNode(this.selectedNode);
            }
        }
    }

    if ((this.hackingFullyBacktraced == false) && (this.programs.length > 0))
    {
        if ((x > 30) && (x < 95) && (y > this.height - 100) && (y < this.height - 35) && (this.programs.length > 0))
        {
            this.selectedProgram = 1;
        }
        else if ((x > 120) && (x < 185) && (y > this.height - 100) && (y < this.height - 35) && (this.programs.length > 1))
        {
            this.selectedProgram = 2;
        }
        else if ((x > 215) && (x < 280) && (y > this.height - 100) && (y < this.height - 35) && (this.programs.length > 2))
        {
            this.selectedProgram = 3;
        }
        else if ((x > 305) && (x < 370) && (y > this.height - 100) && (y < this.height - 35) && (this.programs.length > 3))
        {
            this.selectedProgram = 4;
        }

        if ((this.selectedProgram != null) && (x > 110) && (x < 285) && (y > this.height - 175) && 
            (y < this.height - 125) && (this.programs.length > 0))
        {
            //console.log("Program " + this.selectedProgram + " was run!");
            this.runRigProgram(this.selectedProgram, this.programs[this.selectedProgram - 1]);
        }    
    }

    //manual exiting with X button
    if ((x > this.width - 40) && (x < this.width - 10) && (y > 10) && (y < 40))
    {
        var _this = this;
        this.music.fade(1,0,3000,function(){
            _this.music.stop();
        });

        if (this.hackingFullyBacktraced == false)
        {
            var hackEnd = new HackEndStatus(false, false);
            this.endHackCallBack(hackEnd);
        }
        else if (this.hackingFullyBacktraced == true)
        {
            var hackEnd = new HackEndStatus(false, true);
            this.endHackCallBack(hackEnd);
        }
        else if (this.goalFound == true)
        {
            var hackEnd = new HackEndStatus(true, false);
            this.endHackCallBack(hackEnd);
        } 
    }

    
    //exiting with victory prompt
    if ((this.goalFound) && (x > 300) && (x < 800) && (y > (this.height/2 - 100)) && (y < (this.height/2 + 100)))
    {
        var _this = this;
        this.music.fade(1,0,3000,function(){
            _this.music.stop();
        });

        var hackEnd = new HackEndStatus(true, false);
        this.endHackCallBack(hackEnd);
    }

};

HackScene.prototype.drawCircleAtGridPos = function(x,y,color)
{   
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(this.upLeftGridCornerX + (x * this.squareSize) + (0.5 * this.squareSize), 
                 this.upLeftGridCornerY + (y * this.squareSize) + (0.5 * this.squareSize), 
                 this.squareSize * 0.4, 
                 0, 
                 2 * Math.PI, false);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = '#003300';
    this.ctx.stroke();
};

HackScene.prototype.drawImageAtGridPos = function(x,y,image)
{   
    this.ctx.drawImage(image, 
                       this.upLeftGridCornerX + (x * this.squareSize) + (0.5 * this.gridObjectPadding),
                       this.upLeftGridCornerY + (y * this.squareSize) + (0.5 * this.gridObjectPadding), 
                       this.squareSize - this.gridObjectPadding, 
                       this.squareSize - this.gridObjectPadding);
};

HackScene.prototype.drawBacktraceCircleAtGridPos = function(x,y)
{   
    var color = "red";

    this.ctx.globalAlpha = 0.4;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(this.upLeftGridCornerX + (x * this.squareSize) + (0.5 * this.squareSize), 
                 this.upLeftGridCornerY + (y * this.squareSize) + (0.5 * this.squareSize), 
                 this.squareSize * 0.7, 
                 0, 
                 2 * Math.PI, false);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = '#003300';
    this.ctx.stroke();
    this.ctx.globalAlpha = 1;
};

HackScene.prototype.lineConnectTwoActualGridObjectsPassiveAggresively = function( obj1, obj2 )
{
    this.lineConnectTwoGridObjects( obj1.gridXPos, obj1.gridYPos, obj2.gridXPos, obj2.gridYPos );
}

HackScene.prototype.lineConnectTwoGridObjects = function(x1,y1, x2, y2)
{
    this.ctx.globalAlpha = 0.25;
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 10;
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.upLeftGridCornerX + (x1 * this.squareSize) + (0.5 * this.squareSize), 
                            this.upLeftGridCornerY + (y1 * this.squareSize) + (0.5 * this.squareSize));
    this.ctx.lineTo(this.upLeftGridCornerX + (x2 * this.squareSize) + (0.5 * this.squareSize), 
                            this.upLeftGridCornerY + (y2 * this.squareSize) + (0.5 * this.squareSize));
    this.ctx.stroke();
    this.ctx.globalAlpha = 1;
};

HackScene.prototype.lineConnectTwoHackedGridObjects = function(x1,y1, x2, y2)
{
    this.ctx.globalAlpha = 1.0;
    this.ctx.strokeStyle = "green";
    this.ctx.lineWidth = 10;
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.upLeftGridCornerX + (x1 * this.squareSize) + (0.5 * this.squareSize), 
                            this.upLeftGridCornerY + (y1 * this.squareSize) + (0.5 * this.squareSize));
    this.ctx.lineTo(this.upLeftGridCornerX + (x2 * this.squareSize) + (0.5 * this.squareSize), 
                            this.upLeftGridCornerY + (y2 * this.squareSize) + (0.5 * this.squareSize));
    this.ctx.stroke();
    this.ctx.globalAlpha = 1;
};

HackScene.prototype.drawBacktraceLines = function( node1, node2, nodeFullyBacktraced)
{
    this.ctx.globalAlpha = 0.4;
    this.ctx.lineWidth = 25;
    
    var x1 = node1.gridXPos * this.squareSize;
    var y1 = node1.gridYPos * this.squareSize;
    var x2 = node2.gridXPos * this.squareSize;
    var y2 = node2.gridYPos * this.squareSize;

    if( node1.hostile && node2.hostile )
    {
        this.drawTraceLine( node1, node2, "red", 1 );
    }
    else
    {
        if( node1.hostile )
        {
            perc = Math.min( 1, node2.backtracePercentProgress/100 );       
            this.drawTraceLine( node1, node2, "red", perc );
        }
        else if( node2.hostile )
        {
            perc = Math.min(1, node1.backtracePercentProgress/100 );
            this.drawTraceLine( node2, node1, "red", perc );
        }
    }

    this.ctx.globalAlpha = 1;
};

HackScene.prototype.updateHackingLines = function() {
    if( this.lastHackAttemptNode == null || this.lastHackAttemptNode == undefined || this.lastHackAttemptNode.hacked == true ) return;

    var perc = (this.lastHackAttemptNode.hackingProgress/this.lastHackAttemptNode.hackingDifficultyInSec); 
    for( var i = 0; i < this.lastHackAttemptNode.connectedTo.length; ++i ) {
        var connode = this.lastHackAttemptNode.connectedTo[i];
        if( connode.hacked ) {
            this.drawHackTraceLine( connode, this.lastHackAttemptNode, "green", perc );
        }
    }
}

HackScene.prototype.drawHackTraceLine = function( node1, node2, color, perc ) {
    this.ctx.globalAlpha = 1.0;
    this.ctx.lineWidth = 10;
    
    var x1 = node1.gridXPos * this.squareSize;
    var y1 = node1.gridYPos * this.squareSize;
    var x2 = node2.gridXPos * this.squareSize;
    var y2 = node2.gridYPos * this.squareSize;

    x2 = Utilities.lerp( x1, x2, perc );
    y2 = Utilities.lerp( y1, y2, perc );        

    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(this.upLeftGridCornerX + (x1) + (0.5 * this.squareSize), 
                            this.upLeftGridCornerY + (y1) + (0.5 * this.squareSize));
    this.ctx.lineTo(this.upLeftGridCornerX + (x2) + (0.5 * this.squareSize), 
                            this.upLeftGridCornerY + (y2) + (0.5 * this.squareSize));
    this.ctx.stroke();
}

HackScene.prototype.drawTraceLine = function( node1, node2, color, perc ) {
    this.ctx.globalAlpha = 0.4;
    this.ctx.lineWidth = 25;
    
    var x1 = node1.gridXPos * this.squareSize;
    var y1 = node1.gridYPos * this.squareSize;
    var x2 = node2.gridXPos * this.squareSize;
    var y2 = node2.gridYPos * this.squareSize;

    x2 = Utilities.lerp( x1, x2, perc );
    y2 = Utilities.lerp( y1, y2, perc );        

    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(this.upLeftGridCornerX + (x1) + (0.5 * this.squareSize), 
                            this.upLeftGridCornerY + (y1) + (0.5 * this.squareSize));
    this.ctx.lineTo(this.upLeftGridCornerX + (x2) + (0.5 * this.squareSize), 
                            this.upLeftGridCornerY + (y2) + (0.5 * this.squareSize));
    this.ctx.stroke();
}

HackScene.prototype.drawBox = function(x,y,width,height)
{
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
};

HackScene.prototype.runRigProgram = function(programNumber, programName)
{
    var programRunnable = true;

    if (programNumber == 1)
    {
        if (this.program1Consumed == true)
            programRunnable = false;
    }
    else if (programNumber == 2)
    {
        if (this.program2Consumed == true)
            programRunnable = false;
    }
    else if (programNumber == 3)
    {
        if (this.program3Consumed == true)
            programRunnable = false;
    }
    else if (programNumber == 4)
    {
        if (this.program4Consumed == true)
            programRunnable = false; 
    }

    if (programRunnable == true)
    {
        if (programNumber == 1)
            this.program1Consumed = true;
        else if (programNumber == 2)
            this.program2Consumed = true;
        else if (programNumber == 3)
            this.program3Consumed = true;
        else if (programNumber == 4)
            this.program4Consumed = true;

        if (programName == "Network Warrior")
        {
            if (this.selectedNode == null)
            {
                this.unConsumeRigProgram(programNumber);
            }
            else if (this.grid.playerNode.connectedTo.indexOf(this.selectedNode) == -1)
            {
                this.grid.playerNode.addConnection(this.selectedNode);
            }
            else
                this.unConsumeRigProgram(programNumber);
        }
        else if (programName == "Bit Shifter")
        {
            var randomNode = this.grid.getRandomNeutralNode();

            while (randomNode.type != "neutral")
            {
                randomNode = this.grid.getRandomNeutralNode();
            }

            randomNode.hacked = true;
        }
    }
};

HackScene.prototype.unConsumeRigProgram = function(programNumber)
{
    if (programNumber == 1)
        this.program1Consumed = false;
    else if (programNumber == 2)
        this.program2Consumed = false;
    else if (programNumber == 3)
        this.program3Consumed = false;
    else if (programNumber == 4)
        this.program4Consumed = false;
};


HackScene.prototype.isProgramConsumed = function(programNumber)
{
    var programIsConsumed = false;

    if (programNumber == 1)
    {
        if (this.program1Consumed == true)
            programIsConsumed = true;
    }
    else if (programNumber == 2)
    {
        if (this.program2Consumed == true)
            programIsConsumed = true;
    }
    else if (programNumber == 3)
    {
        if (this.program3Consumed == true)
            programIsConsumed = true;
    }
    else if (programNumber == 4)
    {
        if (this.program4Consumed == true)
            programIsConsumed = true; 
    }

    return programIsConsumed;
};


HackScene.prototype.initializePassivePrograms = function()
{
    for (var i = 0; i < this.programs.length; i++)
    {
        if (this.programs[i] == "Net Ninja")
        {
            this.programDetectionModifier = -10.0;
        }
        else if (this.programs[i] == "SUDO Inspect")
        {
            //1.0 is base speed
            this.programNodeHackSpeedModifier = 1.25;
        }
        else if (this.programs[i] == "Driver Corrupt")
        {
            this.programEnmityModifier = -5.0;
        }
    }
}
