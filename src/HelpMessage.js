var msgNoise = "!<>-____[]{}—=+*^?.#";
var infoMsg, infoCharList = undefined;
var infoSec = 0;
var helpCounter = 0;
var infoFontSize, infoLeft, infoBot;
var statusLineList =
[ new Array(40), new Array(40), new Array(40),new Array(40)
]

var isCommandVisible;


function randomInt(n)
{
    return Math.floor(Math.random()*n);
}

function randomChar(str)
{
    return str[randomInt(str.length)];
}

function getLeftMatchCount(myStr, myList)
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
        infoFontSize = "16px";
        infoLeft = 5;
        infoBot = canvasHeight - 10;
    }
    else if (canvasWidth < 1500)
    {
        infoFontSize = "24px";
        infoLeft = 5;
        infoBot = canvasHeight - 10;
    }
    else
    {
        infoFontSize = "30px";
        infoLeft = 50;
        infoBot = canvasHeight - 50;
    }

    //Fill with random characters longer than any help text message.
    //Once filled, this same list is changed form line to line.
    infoCharList = new Array(100)
    for (let i = 0; i < infoCharList.length; i++)
    {
        infoCharList[i] = randomChar(msgNoise);
    }
    isFontLoaded = true;
}


function displayMessage()
{
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    //ctx.font = infoFontSize + " RobotoMono";
    ctx.font = infoFontSize + " SourceSansPro-Light";
    let done = scrambleText(infoMsg, infoCharList, infoFontSize, infoLeft, infoBot)
    if (done)
    {
        if (infoSec === 0) infoSec = clockSec;
        else if (clockSec - infoSec > 5)
        {
            infoMsg = currentLevel.getNextHelpMsg();
            infoSec = 0;
        }
    }
}


function scrambleText(msg, goalCharList, fontSize, msgLeft, msgBot)
{
    if (msg.length < 1) return;
    let matchCount = getLeftMatchCount(msg, goalCharList);
    if (matchCount >= msg.length)
    {
        ctx.fillStyle = colorNearWhite;
        ctx.fillText(msg, msgLeft, msgBot);
        return true;
    }
    if (matchCount > 0)
    {
        ctx.fillStyle = colorNearWhite;
        let msg0 = msg.substring(0, matchCount);
        ctx.fillText(msg0, msgLeft, msgBot);
        msgLeft += ctx.measureText(msg0).width;
    }

    if (Math.random() < 0.1) //Set a character to target
    {
        let i = randomInt(msg.length - matchCount) + matchCount;
        if (goalCharList[i] !== msg[i]) goalCharList[i] = msg[i];
        else
        {
            //If random index is already a match, match first mismatched character
            for (i=matchCount; i<msg.length; i++)
            {
                if (goalCharList[i] !== msg[i])
                {
                    goalCharList[i] = msg[i];
                    break;
                }
            }
        }
    }
    else // Scramble some characters, if they do not match
    {
        let nonMachCount = msg.length - matchCount;
        for (let k=0; k<(nonMachCount/2)+1; k++)
        {
            let i = randomInt(msg.length + 5 - matchCount) + matchCount;
            if ((i >= msg.length) || (goalCharList[i] !== msg[i])) goalCharList[i] = randomChar(msgNoise);
        }
    }

    //render
    let characterPixelWidth = ctx.measureText('_').width;
    let x = msgLeft;
    for (let i=matchCount; i<msg.length+5; i++)
    {
        if ((i < msg.length) && (goalCharList[i] == msg[i])) ctx.fillStyle = colorNearWhite;
        else ctx.fillStyle = colorGray;
        ctx.fillText(goalCharList[i], x, msgBot);
        x += characterPixelWidth;
    }
    return false;
}


function displayStatus(ship)
{
    //ctx.font = "18px RobotoMono";
    ctx.fillStyle = colorNearWhite;
    ctx.font = "18px SourceSansPro-Light";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    let speed = Math.sqrt(shipSpeedX * shipSpeedX + shipSpeedY * shipSpeedY) * 10.0;
    let tmpStatus =
        [
            "Gates: " + String(gatesCompleted),
            "Time: " + String(gameTime),
            "Linear Speed: " + speed.toFixed(1) + " m/s",
            "Forward: " + ship.heading.toFixed(1) + "°"
        ];

    for (let i = 0; i < tmpStatus.length; i++)
    {
        scrambleText(tmpStatus[i], statusLineList[i], "18px", 10, 30+i*20)
    }
}



function displayCommands(ship)
{
    //ctx.font = "18px RobotoMono";
    ctx.font = "18px SourceSansPro-Regular";
    ctx.setTransform(1, 0, 0, 1, 0, 0);

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

var title1 = "V E C T O R  J O C K E Y";
var title2 = "Spaceflight Training Simulator.";
function displayTitle()
{
    ctx.fillStyle = colorNearWhite;

    ctx.font = "45px SourceSansPro-Light";
    let textWidth = ctx.measureText(title1).width;
    ctx.fillText(title1, (canvasWidth-textWidth)/2, canvasHeight/2 + 100);

    ctx.font = "24px SourceSansPro-Light";
    textWidth = ctx.measureText(title2).width;
    ctx.fillText(title2, (canvasWidth-textWidth)/2, canvasHeight/2 + 150);
}
