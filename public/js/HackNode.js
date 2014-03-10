var HackNodeType = {
	Mainframe : "mainframe",
	Neutral: "neutral",
	Player: "player",
	Goal: "goal"
}

var HackNode = function(gridXPos, gridYPos, type, scene)
{
	this.gridXPos = gridXPos;
	this.gridYPos = gridYPos;
	this.type = type;
	this.hostile = false;
	this.hacked = false;
	this.activelyBeingHacked = false;
	this.hackingProgress = 0.0;
	this.hackingDifficultyInSec = 4.0;
	this.mainframeDetectionChancePerc = 25.0;
	this.enmityGainIfDetected = 10.0;
	this.connectedTo = [];
	this.hackingScene = scene;
	this.localBacktraceComplete = false;
	this.backtracePercentProgress = 0.0;

	if (this.type == "mainframe")
	{
		this.hostile = true;
		this.backtracePercentProgress = 100.0;
		this.hackingDifficultyInSec = 120.00;
		this.mainframeDetectionChancePerc = 100.0;
		this.enmityGainIfDetected = 100.00;
	}

	else if (this.type == "player")
	{
		this.hacked = true;
	}

	else if (this.type == "goal")
	{
		this.hackingDifficultyInSec = 10.0;
		this.mainframeDetectionChancePerc = 80.0;
		this.enmityGainIfDetected = 25.00;
	}

};

HackNode.prototype.getGridPos = function() {
	return { x: this.gridXPos, y: this.gridYPos };
}

HackNode.prototype.hackingSimulationUpdate = function(delta)
{
	if (!this.hackingScene.hackingFullyBacktraced)
	{
		if (this.activelyBeingHacked == true)
		{
			if (this.hackingProgress == 0.0)
			{	
				/*
				var date = new Date();
				console.log("Hack start time: " +date.getMinutes() + " min, " + date.getSeconds() + 
									"sec, " + date.getMilliseconds() + " milliSec");
				*/

				var randomNumber = Math.ceil(Math.random()*100)
				if (randomNumber < this.mainframeDetectionChancePerc)
					this.hackingScene.mainframeEnmity = Math.min((this.hackingScene.mainframeEnmity + this.enmityGainIfDetected),
																 100.0);
			}

			this.hackingProgress += delta;

			if (this.hackingProgress >= this.hackingDifficultyInSec)
			{
				this.hacked = true;
				this.activelyBeingHacked = false;
				this.hackingScene.playerActivelyHacking = false;

				/*
				var date = new Date();
				console.log("Hack end time: " +date.getMinutes() + " min, " + date.getSeconds() + 
									"sec, " + date.getMilliseconds() + " milliSec");
				*/
			}
		}

		if (((this.hackingScene.mainframeEnmity > 0) && (this.type == "mainframe")) ||
			((this.hackingScene.mainframeEnmity > 0) && (this.hostile == true)))
		{
			for (var i = 0; i < this.connectedTo.length; i++)
			{
		
				if (this.connectedTo[i].hostile == false)
				{
					//at 100% mainframe enmity it will take 2.5 seconds per node. at 50%, 5.0 seconds.
					this.connectedTo[i].backtracePercentProgress += delta * 40 * (this.hackingScene.mainframeEnmity/100) ;

					if (this.connectedTo[i].backtracePercentProgress >= 100.0)
					{
						this.connectedTo[i].hostile = true;
						if (this.connectedTo[i].type == "player")
							this.hackingScene.hackingFullyBacktraced = true;
						
						/*
						//coded for debug purposes
						var date = new Date();
						console.log("Node " + this.connectedTo[i].gridXPos + ":" + this.connectedTo[i].gridYPos + 
									" was backtraced at " + date.getMinutes() + " min, " + date.getSeconds() + 
									"sec, " + date.getMilliseconds() + " milliSec");
						*/
						
					}
				}
			}
		}
	}
};

HackNode.prototype.update = function(delta)
{
	var color = "purple";

    if(this.type == "player")
        color = "green";
    else if ((this.type == "neutral") && (this.hacked == true))
        color = "green";
    else if ((this.type == "neutral") && (this.activelyBeingHacked == true))
        color = "lightgreen";
    else if (this.type == "neutral")
        color = "white";
    else if ((this.type == "goal") && (this.hacked == true))
        color = "purple";
    else if ((this.type == "goal") && (this.activelyBeingHacked == true))
        color = "blue";
    else if (this.type == "goal")
        color = "yellow";
    else if (this.type == "mainframe")
        color = "red";

	this.hackingScene.drawCircleAtGridPos(this.gridXPos, this.gridYPos, color);
};

HackNode.prototype.drawBacktraceHighlights = function(delta)
{
	if ((this.type == "mainframe") || (this.hostile == true))
	{
		this.hackingScene.drawBacktraceCircleAtGridPos(this.gridXPos, this.gridYPos);
	}

	if (((this.hackingScene.mainframeEnmity > 0) && (this.type == "mainframe")) ||
		((this.hackingScene.mainframeEnmity > 0) && (this.hostile == true)))
	{
		for (var i = 0; i < this.connectedTo.length; i++)
		{
			var fullyBacktraced = false;

			if (this.connectedTo[i].hostile == true)
				fullyBacktraced = true;

			this.hackingScene.drawBacktraceLines(this.gridXPos,
												 this.gridYPos,
												 this.connectedTo[i].gridXPos,
												 this.connectedTo[i].gridYPos,
												 fullyBacktraced);
			
		}
	}

};


HackNode.prototype.drawConnectorLines = function(delta)
{
	for (var i = 0; i < this.connectedTo.length; i++)
	{
		this.hackingScene.lineConnectTwoGridObjects(this.gridXPos,
													this.gridYPos,
													this.connectedTo[i].gridXPos,
													this.connectedTo[i].gridYPos);
	}

};

HackNode.prototype.addConnection = function(connection)
{
	if( this.connectedTo.indexOf( connection ) < 0 )
	{
		this.connectedTo.push(connection);

		if( connection.connectedTo.indexOf( this ) < 0 )
		{
			connection.connectedTo.push(this);
		}
	}
};

HackNode.prototype.isHackable = function()
{
	var canBeHacked = false;

	if (this.hacked != true)
	{
		for (var i = 0; i < this.connectedTo.length; i++)
		{
			if (this.connectedTo[i].hacked == true)
				canBeHacked = true;
		}
	}

	return canBeHacked;
};