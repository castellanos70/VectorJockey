var helpMsg = "Welcome to Vector Jockey! Your Spaceflight Training Simulator.";
var isHelpVisible = false; //do not make visible until font has loaded.
var msgNoise = "!<>-____[]{}—=+*^?.#";
var helpCharList = undefined;
var characterPixelWidth;
var textBot;
var textLeft = 50;
var helpSec = -1;
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

function displayHelp()
{
    if (helpCharList == undefined)
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
        else textBot = canvasHeight-50;
        ctx.font = helpFontSize + " RobotoMono";
        characterPixelWidth = ctx.measureText('A').width; //Assuming mono font

        //Fill with random characters longer than any help text message.
        //Once filled, this same list is changed form line to line.
        helpCharList = new Array(100)
        for (let i = 0; i < helpCharList.length; i++)
        {
            helpCharList[i] = randomChar(msgNoise);
        }
    }
    ctx.font = helpFontSize + " RobotoMono";

    let matchCount = getMatchCountFromStart(helpMsg, helpCharList);
    if (matchCount >= helpMsg.length)
    {
        ctx.fillStyle = "#FAFAFA";
        ctx.fillText(helpMsg, textLeft, textBot);
        if (helpSec < 0) helpSec = clockSec;
        else
        {
            if (clockSec - helpSec > 3)
            {
                helpMsg = getNextHelpMsg();
                helpSec = -1;
            }
        }
        return;
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
        if (helpCharList[i] == helpMsg[i]) ctx.fillStyle = "#FAFAFA";
        else ctx.fillStyle = "#757575";
        ctx.fillText(helpCharList[i], x, textBot);
        x += characterPixelWidth;
    }
}


function getNextHelpMsg()
{
    if (helpCounter >= 34) return "";
    if (gameState === GameStateEnum.LOST) return "GAME OVER";
    if (shipSpeedX == 0 && shipSpeedY == 0)
    {
        if (shipState == ShipStateEnum.OFF) return "Press W to toggle Main Thruster.";
        return "Press *spacebar* to advance time by 1 time-step.";
    }

    if (shipSpeedX == 1 && gameTime == 1 && helpCounter == 0)
    {
        helpCounter = 1;
        return "Great! Notice \"Time\"=1 and \"Linear Speed\"=10 m/s. You are moving!";
    }

    if (shipSpeedX > 0 && gameTime < 3)
    {
        if ((!(shipState & ShipStateEnum.CLOCKWISE)) && helpCounter == 1)
        {
            helpCounter = 2;
            return "Press D to toggle Clockwise Thruster.";

        }
        if (!(shipState & ShipStateEnum.COUNTERCLOCKWISE) && (shipAngularSpeed == 0))
        {
            return "Press A to toggle Counterclockwise Thruster.";
        }
        if (helpCounter < 3)
        {
            helpCounter = 3;
            return "Toggling a Thruster does nothing until time is advanced.";
        }
        if (shipAngularSpeed == 0)
        {
            return "Press *spacebar* to advance time by 1 time-step.";
        }
    }

    let ship = shipList[shipList.length-1];
    if (helpCounter < 8)
    {
        if ((shipAngularSpeed !== 0 || Math.abs(ship.heading) > 15) && (shipSpeedX !== 0))
        {
            if (helpCounter < 4)
            {
                helpCounter = 4;
                return "Press *spacebar* multiple times to continue rotating the ship.";
            }
            if (helpCounter < 5)
            {
                helpCounter = 5;
                return "Ship will continue to spin in direction of azure arc.";
            }
            if (helpCounter < 6)
            {
                helpCounter = 6;
                if (shipAngularSpeed < 0) return "To stop spin, clockwise thrust (D) and press *spacebar*.";
                return "To stop spin, counterclockwise thrust (A) and press *spacebar*.";
            }
            if (helpCounter < 7 && (shipState & ShipStateEnum.BACK))
            {
                return "Your Main Thruster is on. Turn it off (W) and press *spacebar*.";
            }
            if (helpCounter < 7)
            {
                helpCounter = 7;
                return "With main thrust off, ship will \'coast\' along the thin azure line.";
            }
            if (helpCounter < 8)
            {
                helpCounter = 8;
                return "When the azure line crosses a gate, you\'re golden: just coast!";
            }
        }
        let r = Math.random()
        if (r < 0.33)
        {
            if (shipState & ShipStateEnum.COUNTERCLOCKWISE)
            {
                return "Press *spacebar* (time-step).";
            }
            return "Press A (Counterclockwise Thrust) and *spacebar* (time-step).";
        }
        if (r < 0.66)
        {
            if (shipState & ShipStateEnum.CLOCKWISE)
            {
                return "Press *spacebar* (time-step).";
            }
            return "Press D (Clockwise Thrust) and *spacebar* (time-step).";
        }
        if (shipState & ShipStateEnum.BACK)
        {
            return "Press *spacebar* (time-step).";
        }
        return "Press W (Main Thruster) and *spacebar* (time-step).";
    }

    if (helpCounter < 9)
    {
        helpCounter = 9;
        return "Pilot your ship through any 5 of the 6 gates to complete the course.";
    }
    if (helpCounter < 10)
    {
        helpCounter = 10;
        return "Goal: Complete the course in less time-steps than any competitor.";
    }
    if (helpCounter < 11)
    {
        helpCounter = 11;
        return "Crossing the purple pentagon boundary is GAME OVER.";
    }
    if (helpCounter < 12)
    {
        helpCounter = 12;
        return "Scroll by using Click-n-drag or arrow keys";
    }
    if (helpCounter < 13)
    {
        helpCounter = 13;
        return "Zoom by using Scrollwheel or +/- keys";
    }

    if (helpCounter < 14)
    {
        helpCounter = 14;
        return "Newton's first law of motion is often stated as:";
    }
    if (helpCounter < 15)
    {
        helpCounter = 15;
        return "An object at rest stays at rest & an object in motion stays in motion...";
    }
    if (helpCounter < 16)
    {
        helpCounter = 16;
        return "... with the same speed and in the same direction ...";
    }
    if (helpCounter < 17)
    {
        helpCounter = 17;
        return "... unless acted upon by an unbalanced force.";
    }
    if (helpCounter < 18)
    {
        helpCounter = 18;
        return "On Earth, there are lots of forces available:";
    }
    if (helpCounter < 19)
    {
        helpCounter = 19;
        return "Cars turn and stop using Friction between tires & road.";
    }
    if (helpCounter < 20)
    {
        helpCounter = 20;
        return "Airplanes turn & break using ailerons & rudders to push on the air.";
    }
    if (helpCounter < 21)
    {
        helpCounter = 21;
        return "A basketball player jumps by pushing off the floor.";
    }
    if (helpCounter < 22)
    {
        helpCounter = 22;
        return "In empty space, there is nothing to push on.";
    }
    if (helpCounter < 23)
    {
        helpCounter = 23;
        return "Your ship uses Newton's third Law:";
    }
    if (helpCounter < 24)
    {
        helpCounter = 24;
        return "Every action produces an equal and opposite reaction.";
    }
    if (helpCounter < 25)
    {
        helpCounter = 25;
        return "A rocket shoots out low mass particles at super high velocity.";
    }
    if (helpCounter < 26)
    {
        helpCounter = 26;
        return "The fast little particles accelerate the rocket in the opposite direction.";
    }
    if (helpCounter < 27)
    {
        helpCounter = 27;
        return "Your rocket has an acceleration of 10 meters/second/second.";
    }
    if (helpCounter < 28)
    {
        helpCounter = 28;
        return "One time-step in the simulator represents 10 seconds.";
    }
    if (helpCounter < 29)
    {
        helpCounter = 29;
        return "Thus, if your ship has a linear speed of 250 m/s,";
    }
    if (helpCounter < 30)
    {
        helpCounter = 30;
        return "stopping needs 25 time-steps of thrust in the opposite direction.";
    }
    if (helpCounter < 31)
    {
        helpCounter = 31;
        return "Press H to repeat instructions.";
    }
    if (helpCounter < 32)
    {
        helpCounter = 32;
        return "Press *ESC* to silence instructions.";
    }
    if (helpCounter < 33)
    {
        helpCounter = 33;
        return "To restart the game, reload the webpage.";
    }
    if (helpCounter < 34)
    {
        helpCounter = 34;
        return "Have fun! I am rooting for you!";
    }
    return "";
}

var hitSpeed400 = false;
var hitSpeed500 = false;
function displayStatus()
{
    ctx.font = "18px RobotoMono";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "white";
    ctx.fillText("Gates: " + gatesCompleted, 10, 30);
    ctx.fillText("Time: " + gameTime, 10, 50);
    let speed = Math.sqrt(shipSpeedX * shipSpeedX + shipSpeedY * shipSpeedY) * 10.0;
    if ((speed > 400) && !hitSpeed400)
    {
        hitSpeed400 = true;
        helpMsg = "WARNING: Ship's speed exceeds 400 m/s. The foul line is near."
        helpSec = -1;
    }
    else if ((speed > 500) && !hitSpeed500)
    {
        hitSpeed500 = true;
        helpMsg = "!!!WARNING!!! At over 500 m/s, not crossing the foul line is tricky."
        helpSec = -1;
    }
    ctx.fillText("Linear Speed: " + speed.toFixed(1) + " m/s", 10, 70);
}
