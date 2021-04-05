var canvas;
var ctx;
var pendingFrameRequest = false;

var canvasWidth, canvasHeight;
var shipImage = new Image();
var shipGhostImage = new Image();
var stationImage = new Image();
var gateImage = new Image();
var fileObject;
var isFont0Loaded = false;
var isFont1Loaded = false;

var shipList, gateList, stationList, boundaryList;
var starList = undefined;
var currentLevel, level1, level2;

var gatesCompleted;
var gameTime;
var isDrag, dragX, dragY;

var zoomScale, zoomGoal, zoomOrg, zoomTime;
var tractorBeams = Array (100)
tractorBeams.fill(true)
const ZOOM_MAX = 1.0;
const ZOOM_MIN = 0.1;

var offsetX, offsetY;

var canvasImage, canvasData, canvasBuf;
//var game_font = new FontFace('RobotoMono', 'url(data/RobotoMono-Regular.woff)');  fix this
var gameFont0 = new FontFace('SourceSansPro-Light', 'url(data/SourceSansPro-Light.woff)');
var gameFont1 = new FontFace('SourceSansPro-Regular', 'url(data/SourceSansPro-Regular.woff)');

var minX, maxX, minY, maxY;
const LERP_TIME = 0.75;

const PI2 = 2.0 * Math.PI;
const KEY_0 = 48;
const KEY_1 = 49;
const KEY_2 = 50;
const KEY_W = 87;
const KEY_A = 65;
const KEY_C = 67;
const KEY_D = 68;
const KEY_H = 72;
const KEY_SPACE = 32;
const KEY_LEFT_ARROW = 37;
const KEY_UP_ARROW = 38;
const KEY_RIGHT_ARROW = 39;
const KEY_DOWN_ARROW = 40;
const KEY_PLUS_FIREFOX = 61;
const KEY_PLUS_CHROME = 187; //and Edge
const KEY_MINUS_FIREFOX = 173;
const KEY_MINUS_CHROME = 189; //and Edge
const KEY_ESC = 27;

//ShipStateEnum are powers of 2 so bitwise or can turn on multiple at once.
const GateStateEnum = {"OFF":0, "ON":1, "START_BREAKING":2, "BREAKING":3};
const GameStateEnum = {"PLAYING":0, "WIN":1, "TRACTOR_BEAM":2};
const OffScreenArrowEnum = {"TOP":0, "BOTTOM":1, "LEFT":2, "RIGHT":3};
const DEGREES_TO_RAD = Math.PI/180.0;
const DEG_15 = 15*DEGREES_TO_RAD

var gameState;
var movePending;
var clockSec;
var tractorBeamNodes = [];
var tractorBeamHeadingGoal;
var isShipOffScreen;
var isShipFullHistory;
var shipHistoryAnimationIdx;
var shipAnimationSec = 0;
var animationShip;

var arrowLength = 100
var arrowWidth = [7,3,5];
var arrowOffset = [20,40,75];
var gradientArrowBot, gradientArrowTop, gradientArrowLeft, gradientArrowRight;

var colorAzure = "#00A0F0";
var colorNearWhite = "#FAFAFA";
var colorGray = "#757575";

var isFontLoaded = false;
var isDisplayTitle = true;

window.onload = function () {init();};

function init()
{
    console.info("VectorJockey: by Joel Castellanos, Ervan Darnell, VolatileDawn (Armin).");
    console.info("Copyright 2021");
    document.documentElement.style.overflow = 'hidden';  // firefox, chrome
    canvas = document.getElementById("mainCanvas");
    ctx = canvas.getContext("2d");
    ctx.drawLine = function (fromLoc, toLoc, zoom=1) {
       this.moveTo(zoom * fromLoc.x, zoom * fromLoc.y); 
       this.lineTo(zoom * toLoc.x,zoom * toLoc.y) 
    }
    ctx.renderSprite = function (anchor, sprite, rotationInc = 0)
    {
       this.setTransform(1, 0, 0, 1, 0, 0);
       this.scale(zoomScale, zoomScale); // zoomScale is global
       this.translate(offsetX+anchor.x, offsetY+anchor.y); //offset is global
       this.rotate(mod(anchor.heading + rotationInc, 2 * Math.PI)) 
       this.drawImage(sprite,-sprite.width/2, -sprite.height/2);
    }
    canvasData = undefined;

    shipImage.src = document.getElementById("shipImage").src;
    shipGhostImage.src = document.getElementById("shipGhostImage").src;
    stationImage.src = document.getElementById("stationImage").src;
    gateImage.src = document.getElementById("gateImage").src;

    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    ctx.canvas.width = canvasWidth;
    ctx.canvas.height = canvasHeight;
    canvasImage = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

    thrusts = new ThrustSystems()
    animationShip = new Ship()

    let y = canvasHeight;
    gradientArrowBot = ctx.createLinearGradient(0,y - arrowLength, 0, y-arrowOffset[0]);
    gradientArrowBot.addColorStop("0", "#47a8cc00");
    gradientArrowBot.addColorStop("0.5", "#085a79");
    gradientArrowBot.addColorStop("1.0", colorAzure);
    //gradientArrowBot.addColorStop("1.0", "#10c5ebff");

    gradientArrowTop = ctx.createLinearGradient(0,arrowOffset[0], 0, arrowLength);
    gradientArrowTop.addColorStop("0", colorAzure);
    gradientArrowTop.addColorStop("0.5", "#085a79");
    gradientArrowTop.addColorStop("1.0", "#47a8cc00");

    gradientArrowLeft = ctx.createLinearGradient(arrowOffset[0], 0, arrowLength, 0);
    gradientArrowLeft.addColorStop("0", colorAzure);
    gradientArrowLeft.addColorStop("0.5", "#085a79");
    gradientArrowLeft.addColorStop("1.0", "#47a8cc00");

    let x = canvasWidth;
    gradientArrowRight = ctx.createLinearGradient(x - arrowLength, 0, x-arrowOffset[0], 0);
    gradientArrowRight.addColorStop("0", "#47a8cc00");
    gradientArrowRight.addColorStop("0.5", "#085a79");
    gradientArrowRight.addColorStop("1.0", colorAzure);

    level1 = new Level_1();
    level2 = new Level_2();
    initLevel(level1);

    gameFont0.load().then(function(loaded_face)
    {
        document.fonts.add(loaded_face);
        initHelp();
        isFont0Loaded = true;
        if (isFont1Loaded) isFontLoaded = true;
    }).catch(function(error) {});

    gameFont1.load().then(function(loaded_face)
    {
        document.fonts.add(loaded_face);
        initHelp();
        isFont1Loaded = true;
        if (isFont0Loaded) isFontLoaded = true;
    }).catch(function(error) {});

    fileObject = new XMLHttpRequest();

    fileObject.onreadystatechange = function() {readStars();};
    fileObject.open("GET", "data/PPM-Ursa.csv", true);
    fileObject.setRequestHeader("Content-Type",  "application/x-www-form-urlencoded");
    fileObject.send();

    window.addEventListener('keydown', keyDown);
    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', mouseUp);
    window.addEventListener('wheel', mouseWheel);
    canvas.addEventListener('touchstart', function(e)
    {
        isDrag = true
        dragX = e.changedTouches[0].pageX;
        dragY = e.changedTouches[0].pageY;
        //alert(e.changedTouches[0].pageX) // alert pageX coordinate of touch point
    }, false)
    canvas.addEventListener('touchmove', function(e)
    {
        if (isDrag)
        {
            let dx = e.changedTouches[0].pageX - dragX;
            let dy = e.changedTouches[0].pageY - dragY;
            dragX = e.changedTouches[0].pageX;
            dragY = e.changedTouches[0].pageY;
            dragWorld(dx, dy);
        }
    }, false)
}


function initLevel(level)
{
    currentLevel = level;

    shipSpeedX = 0;
    shipSpeedY = 0;
    shipAngularSpeed = 0;
    gatesCompleted = 0;
    gameTime = 0;
    isDrag = false;
    dragX=0
    dragY=0;
    helpCounter = 0;

    tractorBeamNodes = [];
    isCommandVisible = true;
    isShipFullHistory = true;
    shipHistoryAnimationIdx = 0;

    zoomScale = 0.64;
    zoomGoal = zoomScale;
    zoomOrg = zoomScale;
    zoomTime = 0;

    offsetX = canvasWidth/2;
    offsetY = canvasHeight/2;
    isShipOffScreen = false;

    //Adjust offset for the stating sim at zoom != 1
    let shiftFactor = 1.0 / zoomScale - 1.0;
    offsetX = (canvasWidth / 2.0) * shiftFactor + offsetX;
    offsetY = (canvasHeight / 2.0) * shiftFactor + offsetY;

    gameState = GameStateEnum.PLAYING;
    movePending = false;
    renderStarsOffCanvas();

    for (let i = 0; i < statusLineList[0].length; i++)
    {
        statusLineList[0][i] = randomChar(msgNoise);
        statusLineList[1][i] = randomChar(msgNoise);
        statusLineList[2][i] = randomChar(msgNoise);
        statusLineList[3][i] = randomChar(msgNoise);
    }

    shipList=[];
    gateList=[];
    stationList = [];
    boundaryList = [];
    currentLevel.init();

    infoMsg = currentLevel.getNextHelpMsg(null)
    infoSec = 0;
}

//********************************** render loop *********************************************************************
//  This is a callback function called every frame by javascript.
//
//This function calls itself through a callback system set up with requestAnimationFrame(render);
//    however, this is not recursion (it is like **tail** recursion, but not quite).
//Since requestAnimationFrame(render) is only registering a callback, it returns immediately (it does not block until
//    render() is called and returns as is the case with normal recursion).
//The next render() will not be called until this current render() exits and all its stack variables are freed.
//DO NOT return early from this function: the final statement,  requestAnimationFrameProtected(), must be reached
//   or animation will stop.
//********************************************************************************************************************
function render()
{
    pendingFrameRequest = false;
    let gameDate = new Date();
    clockSec = gameDate.getTime() / 1000.0;
    zoom();

    let ship = shipList[shipList.length - 1];
    if (gameState == GameStateEnum.TRACTOR_BEAM)
    {
        movePending = true;

        if (ship.tractor()) 
        {
           gameState = GameStateEnum.PLAYING;
           infoMsg = "Tractor Beam Off.    You may resume control of ship.";
           infoSec = 0;
           isCommandVisible = true;
        }
    }

    if (movePending)
    {
        movePending = false;
        gameTime++;
        if (gameTime === 1000) isShipFullHistory = false;
        let ship0 = ship
        ship = ship.clone()
        ship.computeNewPos()
        shipList.push(ship);
        updateGates(ship0, ship);
        checkBoundary(ship);
    }

    ctx.putImageData(canvasImage, 0, 0);

    if (isShipFullHistory)
    {
        let startIdx = ((gameState === GameStateEnum.PLAYING) &&(shipList.length > 2500)) ?
           shipList.length - 1000 : 0;
        shipList.slice(startIdx).forEach(ship=>ship.render(shipGhostImage))
        ship.render(shipImage)
    }
    else
    {
        if(shipList.length > 25)
        {
            let deltaSec = clockSec - shipAnimationSec;

            if (deltaSec > 0.1)
            {
                shipHistoryAnimationIdx++;
                if (shipHistoryAnimationIdx >= shipList.length - 1) shipHistoryAnimationIdx = 0;
                shipAnimationSec = clockSec;
                deltaSec = 0;
            }

            let tmpShip1 = shipList[shipHistoryAnimationIdx];
            let tmpShip2 = shipList[shipHistoryAnimationIdx + 1];

            animationShip.state = tmpShip1.state;
            animationShip.loc.x = (tmpShip1.loc.x * (0.1 - deltaSec) + tmpShip2.loc.x * deltaSec) / 0.1;
            animationShip.loc.y = (tmpShip1.loc.y * (0.1 - deltaSec) + tmpShip2.loc.y * deltaSec) / 0.1;
            if (mod(Math.abs(tmpShip1.loc.heading - tmpShip2.loc.heading), 360) > 90) animationShip.loc.heading = tmpShip1.loc.heading;
            else
            {
                animationShip.loc.heading = (tmpShip1.loc.heading * (0.1 - deltaSec) + tmpShip2.loc.heading * deltaSec) / 0.1;
            }
            animationShip.render(shipGhostImage);
            animationShip.renderThrust(true);
        }
        ship.render(shipImage);
    }
    ship.renderThrust(false);

    gateList.forEach(gate => renderGate(gate))
    renderBoundary(ship);
    ship.renderMotionVector();

    isShipOffScreen = false;
    if ((ship.loc.x+offsetX)*zoomScale < 0)  renderOffScreenArrow(OffScreenArrowEnum.LEFT);
    else if ((ship.loc.x+offsetX)*zoomScale > canvasWidth)  renderOffScreenArrow(OffScreenArrowEnum.RIGHT);
    if ((ship.loc.y+offsetY)*zoomScale < 0) renderOffScreenArrow(OffScreenArrowEnum.TOP);
    else if ((ship.loc.y+offsetY)*zoomScale > canvasHeight)  renderOffScreenArrow(OffScreenArrowEnum.BOTTOM);

    if (isFontLoaded) //Cannot display until font is loaded
    {
        displayStatus(ship);
        if (isCommandVisible) displayCommands(ship);
        displayMessage(ship);
        if (isDisplayTitle) displayTitle();
    }

    requestAnimationFrameProtected();
}

function renderGate(gate)
{
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(offsetX*zoomScale, offsetY*zoomScale);
    if (gate.state !== GateStateEnum.OFF)
    {
        if (zoomScale >0.3)
        {
            ctx.scale(zoomScale, zoomScale);
            gate.render(gate.state);
        }
        else if (gate.state == GateStateEnum.ON)
        {
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.drawLine(gate.left, gate.right, zoomScale)
            ctx.strokeStyle = gate.color;
            ctx.stroke();
        }
    }
    ctx.renderSprite(gate.left, gateImage)
    ctx.renderSprite(gate.right, gateImage)
}

function renderBoundary(ship)
{
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(offsetX * zoomScale, offsetY * zoomScale);
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (gameState === GameStateEnum.TRACTOR_BEAM)
    {
        ctx.strokeStyle = "#6309c650";
        for (const station of tractorBeamNodes)
        {
            tractorBeams.forEach(beam => 
                ctx.drawLine (station.loc, 
                     ship.loc.add(new Coord(Math.random() * 2 * Math.PI).scale(85)),
                     zoomScale)
            )
        }
        ctx.stroke();
    }
    else
    {
        ctx.strokeStyle = "#6309c6A0";
        for (let thickness = 1; thickness <= 3; thickness += 2)
        {
            ctx.lineWidth = thickness;
            boundaryList.forEach(
               stations=>ctx.drawLine (
                  stations[0].loc,
                  stations[1].loc,
                  zoomScale
               ) )
            ctx.stroke();
        }
    }
    stationList.forEach(station => 
      ctx.renderSprite(station.loc, stationImage, station.speed * clockSec))
}


const zip = (a,b,c) => a.map ((k,i) => [k, b[i], c[i]]);

function renderOffScreenArrow(direction)
{
    function makeArrowStroke(arrows, x, y)
    {
        let p0 = arrows.shift()
        let p1 = arrows[1]
        let p2 = arrows[2]
        ctx.globalAlpha = Math.abs(Math.sin(clockSec));
        ctx.beginPath();
        ctx.lineWidth = arrowWidth;
        ctx.moveTo(x + p0[0],y + p0[1])
        for (const point of arrows)
        {
           ctx.lineTo(x + point[0],y + point[1])
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    isShipOffScreen = true;
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (direction === OffScreenArrowEnum.BOTTOM)
    {
        let x = canvasWidth/2;
        let y = canvasHeight;
        ctx.strokeStyle = gradientArrowBot;

        zip(
           arrowOffset.map(w => [arrowLength, -w - arrowLength]),
           arrowOffset.map(w => [0, -w ]),
           arrowOffset.map(w => [-arrowLength, -w - arrowLength])).
        map(arrows => makeArrowStroke(arrows,x,y))
    }
    else if (direction === OffScreenArrowEnum.TOP)
    {
        let x = canvasWidth/2;
        let y = 0
        ctx.strokeStyle = gradientArrowTop;

        zip(
           arrowOffset.map(w => [arrowLength, w + arrowLength]),
           arrowOffset.map(w => [0, w ]),
           arrowOffset.map(w => [-arrowLength, w + arrowLength])).
        map(arrows => makeArrowStroke(arrows,x,y))

    }
    else if (direction === OffScreenArrowEnum.LEFT)
    {
        let x = 0
        let y = canvasHeight/2;
        ctx.strokeStyle = gradientArrowLeft;

        zip(
           arrowOffset.map(w => [w + arrowLength, arrowLength]),
           arrowOffset.map(w => [w, 0]),
           arrowOffset.map(w => [w + arrowLength, -arrowLength])).
        map(arrows => makeArrowStroke(arrows,x,y))
    }
    else if (direction === OffScreenArrowEnum.RIGHT)
    {
        let x = canvasWidth;
        let y = canvasHeight/2;
        ctx.strokeStyle = gradientArrowRight

        zip(
           arrowOffset.map(w => [-w - arrowLength, arrowLength]),
           arrowOffset.map(w => [-w, 0]),
           arrowOffset.map(w => [-w - arrowLength, -arrowLength])).
        map(arrows => makeArrowStroke(arrows,x,y))
    }
}

function keyDown(event)
{
    if (isDisplayTitle) isDisplayTitle = false;
    if (movePending) return;
    let ship0 = shipList[shipList.length - 1];

    if ((event.keyCode == KEY_W) && (gameState == GameStateEnum.PLAYING))
    {
       ship0.toggleForwardThrusters()
    }
    else if ((event.keyCode == KEY_A) && (gameState == GameStateEnum.PLAYING))
    {
        if (!(ship0.toggleSideThrusters(Spin.COUNTERCLOCKWISE)) )
        {
            infoMsg = "Counterclockwise thrusters disabled. Maximum safe angular speed: 15°/timestep.";
            infoSec = 0;
        }
    }
    else if ((event.keyCode == KEY_D) && (gameState == GameStateEnum.PLAYING))
    {
        if (!(ship0.toggleSideThrusters(Spin.CLOCKWISE)) )
        {
            infoMsg = "Clockwise thrusters disabled. Maximum safe angular speed: 15°/timestep.";
            infoSec = 0;
        }
    }
    else if ((event.keyCode == KEY_SPACE) && (gameState == GameStateEnum.PLAYING))
    {
        if (!(ship0.isMoving()) )
        {
            isCommandVisible = true;
            infoMsg = "Ship is at Rest. Activate a Thruster.";
            infoSec = 0;
        }
        else
        {
            ship0.computeNewSpeed()
            movePending = true;
        }
    }

    else if (event.keyCode == KEY_LEFT_ARROW) dragWorld(50,0);
    else if (event.keyCode == KEY_RIGHT_ARROW) dragWorld(-50,0);
    else if (event.keyCode == KEY_UP_ARROW) dragWorld(0,50);
    else if (event.keyCode == KEY_DOWN_ARROW) dragWorld(0,-50);
    else if ((event.keyCode == KEY_PLUS_FIREFOX) || (event.keyCode == KEY_PLUS_CHROME)) zoom('+');
    else if ((event.keyCode == KEY_MINUS_FIREFOX) || (event.keyCode == KEY_MINUS_CHROME)) zoom('-');
    else if (event.keyCode == KEY_C) isCommandVisible = !isCommandVisible;
    else if (event.keyCode == KEY_ESC) isCommandVisible = false;
    else if (event.keyCode == KEY_1) initLevel(level1)
    else if (event.keyCode == KEY_2) initLevel(level2)
    else if (event.keyCode == KEY_H) isShipFullHistory = !isShipFullHistory;
}


function mouseDown(event)
{
    isDrag = true
    dragX = event.offsetX
    dragY = event.offsetY;

    //for (const star of starList)
    //{
    //     dx = dragX - star.x;
    //    dy = dragY - star.y;
    //    if (dx * dx + dy * dy < 100)
    //    {
    //        console.info("star: " + String(star.catalog) + "  (" + String(star.x) + ", " + String(star.y) + ")");
    //    }
    //}
}

function mouseUp(event)
{  isDrag=false
}

function mouseMove(event)
{
    if (isDrag)
    {
        let dx = event.offsetX - dragX;
        let dy = event.offsetY - dragY;
        dragX = event.offsetX;
        dragY = event.offsetY;
        dragWorld(dx,dy);
    }
}

function dragWorld(dx,dy)
{
    offsetX += dx / zoomScale;
    offsetY += dy / zoomScale;
    //console.info("dragWorld : offsetX=" + offsetX + "    maxX + canvasWidth/2*zoomScale=" + (maxX + canvasWidth/4*zoomScale));
    //console.info("dragWorld : offsetX=" + offsetX + "    minX + canvasWidth/2/zoomScale=" + (minX + canvasWidth/2/zoomScale));
    //console.info("         : offset=  (" + offsetX + ", " + offsetY + ")");
}

function mouseWheel(event)
{
    if (event.deltaY < 0) zoom('+');
    else if (event.deltaY > 0) zoom('-');
}


function zoom(code)
{
    //console.info("zoom(" + event.deltaY+"): offsetX=" + offsetX + ",   zoomScale="+zoomScale);

    if (code === '+' || code === '-')
    {
        zoomTime = clockSec;
        zoomOrg = zoomScale;
        if (code === '+') zoomGoal = Math.min(ZOOM_MAX, zoomGoal * 1.25);
        else if (code === '-') zoomGoal = Math.max(ZOOM_MIN, zoomGoal * 0.8);
    }

    if (zoomScale === zoomGoal) return;

    let scale0 = zoomScale;
    if (clockSec - zoomTime >= LERP_TIME) zoomScale = zoomGoal;
    else zoomScale = zoomOrg + (clockSec - zoomTime) * (zoomGoal - zoomOrg) / LERP_TIME;

    let shiftFactor = 1.0 / zoomScale - 1.0 / scale0;
    offsetX = (canvasWidth / 2.0) * shiftFactor + offsetX;
    offsetY = (canvasHeight / 2.0) * shiftFactor + offsetY;
    renderStarsOffCanvas();

    //console.info("offset=" + offsetX + ", "+ offsetY+"),   zoomScale="+zoomScale + "goal="+zoomGoal + "deltaTime="+(clockSec - zoomTime));
    //console.info("zoomGoal=" + zoomGoal)
}

function isConvex(xs) {
   return xs
         .map( (pt, i, xs) => pt.cross(xs[(i+2) % xs.length],xs[(i+1) % xs.length]))
         .every((x, i, xs) => Math.sign(x)===Math.sign(xs[0]))
}

function updateGates(ship0, ship)
{
    gateList
      .filter(gate => gate.state == GateStateEnum.ON 
                   && isConvex([gate.left,ship.loc,gate.right,ship0.loc]))
      .forEach(gate =>  {
            gatesCompleted++;
            gate.state = GateStateEnum.START_BREAKING;
            currentLevel.clearedGate() } )
}

function checkBoundary(ship)
{
    if (gameState !== GameStateEnum.PLAYING) return;

    stations = boundaryList.filter(stations => ship.isOutside(stations))
    if (stations.length) 
    {
         gameState = GameStateEnum.TRACTOR_BEAM;
         infoMsg = "Tractor Beam Engaged. Thrusters temporarily disabled. Enjoy the ride.";
         infoSec = 0;
         tractorBeamNodes = stations[0]
         tractorBeamHeadingGoal = Math.atan2(-ship.loc.y, -ship.loc.x)
         return;
    }
}


function requestAnimationFrameProtected()
{
    if (!pendingFrameRequest)
    {
        pendingFrameRequest = true;
        requestAnimationFrame(render);
    }
}
