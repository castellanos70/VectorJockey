var helpMsg = "Welcome to Vector Jockey! Your Spaceflight Training Simulator.";
var isFontLoaded = false;
var isCommandVisible;
var msgNoise = "!<>-____[]{}—=+*^?.#";
var helpCharList = undefined;
var characterPixelWidth;
var textBot;
var textLeft = 50;
var helpSec = 0;
var helpCounter = 0;
var helpFontSize = "30px"

function randomInt(n)
{
    return Math.floor(Math.random()*n);
}

function randomChar(str)
{
    return str[randomInt(str.length)];
}

function getMatchCountFromStart(myStr, myList)
{
    let matchCount = 0;
    for (let i=0; i<myStr.length; i++)
    {
        if (i >= myList.length) return matchCount;
        if (myStr[i] !== myList[i]) return matchCount;
        matchCount++;
    }
    return matchCount;
}

function initHelp()
{
    if (canvasWidth < 1000)
    {
        helpFontSize = "16px";
        textLeft = 5;
        textBot = canvasHeight - 10;
    }
    else if (canvasWidth < 1500)
    {
        helpFontSize = "24px";
        textLeft = 5;
        textBot = canvasHeight - 10;
    }
    else textBot = canvasHeight - 50;
    ctx.font = helpFontSize + " RobotoMono";
    characterPixelWidth = ctx.measureText('A').width; //Assuming mono font

    //Fill with random characters longer than any help text message.
    //Once filled, this same list is changed form line to line.
    helpCharList = new Array(100)
    for (let i = 0; i < helpCharList.length; i++)
    {
        helpCharList[i] = randomChar(msgNoise);
    }
    isFontLoaded = true;
}

function displayMessage()
{
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = helpFontSize + " RobotoMono";

    let matchCount = getMatchCountFromStart(helpMsg, helpCharList);
    if (matchCount >= helpMsg.length)
    {
        ctx.fillStyle = "#FAFAFA";
        ctx.fillText(helpMsg, textLeft, textBot);
        if (helpSec == 0) helpSec = clockSec;
        else
        {
            if (clockSec - helpSec > 4)
            {
                helpMsg = currentLevel.getNextHelpMsg();
                helpSec = 0;
            }
        }
    }

    if (Math.random() < 0.2) //Set a character to target
    {
        let i = randomInt(helpMsg.length - matchCount) + matchCount;
        if (helpCharList[i] !== helpMsg[i]) helpCharList[i] = helpMsg[i];
        else
        {
            //If random index is already a match, match first mismatched character
            for (i=matchCount; i<helpMsg.length; i++)
            {
                if (helpCharList[i] !== helpMsg[i])
                {
                    helpCharList[i] = helpMsg[i];
                    break;
                }
            }
        }
    }
    else // Scramble a character, if it does not match
    {
        for (let k=0; k<10; k++)
        {
            let i = randomInt(helpMsg.length - matchCount) + matchCount;
            if (helpCharList[i] !== helpMsg[i]) helpCharList[i] = randomChar(msgNoise);
        }
    }

    let x = textLeft;
    for (let i=0; i<helpMsg.length; i++)
    {
        if (helpCharList[i] == helpMsg[i]) ctx.fillStyle = colorNearWhite;
        else ctx.fillStyle = colorGray;
        ctx.fillText(helpCharList[i], x, textBot);
        x += characterPixelWidth;
    }
}




function displayStatus(ship)
{
    ctx.font = "18px RobotoMono";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "white";
    ctx.fillText("Gates: " + gatesCompleted, 10, 30);
    ctx.fillText("Time: " + gameTime, 10, 50);
    let speed = Math.sqrt(shipSpeedX * shipSpeedX + shipSpeedY * shipSpeedY) * 10.0;
    ctx.fillText("Linear Speed: " + speed.toFixed(1) + " m/s", 10, 70);
    ctx.fillText("Forward: " + ship.heading.toFixed(1) + "°", 10, 90);
}





function displayCommands(ship)
{
    ctx.font = "18px RobotoMono";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // var colorAzure = "#00A0F0";
    // var colorNearWhite = "#FAFAFA";
    // var colorGray = "#757575";

    let top = 130;
    let left = 10;
    let height = 25;
    let color = colorNearWhite;
    let atRest = false;
    let highlightThrustCommands = false;
    if ((shipSpeedX === 0) && (shipSpeedY === 0) && (shipAngularSpeed === 0)) atRest = true;
    if (gameState != GameStateEnum.PLAYING) color = colorGray;
    else if ((shipState === ShipStateEnum.OFF) && atRest && !isShipOffScreen) highlightThrustCommands = true;
    ctx.fillStyle = color;

    if (highlightThrustCommands)
    {
        ctx.fillStyle = colorAzure;
        ctx.globalAlpha = Math.abs(Math.sin(clockSec));
    }
    ctx.fillText("W: Toggle Main Thruster", left, top);

    if (shipAngularSpeed === 15) ctx.fillStyle = colorGray;
    else if (highlightThrustCommands)
    {
        ctx.fillStyle = colorAzure;
        ctx.globalAlpha = Math.abs(Math.sin(clockSec+Math.PI/4));
    }
    ctx.fillText("D: Toggle Clockwise Thruster", left, top+1*height);

    ctx.fillStyle = color;
    if (shipAngularSpeed === -15) ctx.fillStyle = colorGray;
    else if (highlightThrustCommands)
    {
        ctx.fillStyle = colorAzure;
        ctx.globalAlpha = Math.abs(Math.sin(clockSec+Math.PI/2));
    }
    ctx.fillText("A: Toggle Counterclockwise Thruster", left, top+2*height);

    if (highlightThrustCommands) ctx.globalAlpha = 1;

    color = colorNearWhite;
    if ((gameState != GameStateEnum.PLAYING) || (atRest && (shipState === ShipStateEnum.OFF))) color = colorGray;
    else if (!isShipOffScreen && gameTime < 25)
    {
        color = colorAzure;
        ctx.globalAlpha = Math.abs(Math.sin(clockSec));
    }
    ctx.fillStyle = color;
    ctx.fillText("*spacebar*: Advance Time 10 seconds.", left, top+3*height);
    ctx.globalAlpha = 1;

    ctx.fillStyle = colorNearWhite;
    if (isShipOffScreen)
    {
        ctx.fillStyle = colorAzure;
        ctx.globalAlpha = Math.abs(Math.sin(clockSec));
    }
    ctx.fillText("To zoom: Mousewheel or -/+ keys.", left, top+4*height);
    ctx.fillText("To scroll: Click-n-drag or Arrow keys", left, top+5*height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = colorNearWhite;
    ctx.fillText("C: Hide/Show Commands", left, top+6*height);
}
