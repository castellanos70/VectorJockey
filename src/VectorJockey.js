var canvas;
var ctx;
var pendingFrameRequest = false;

var canvasWidth, canvasHeight;
var shipImage = new Image();
var stationImage = new Image();
var gateImage = new Image();
var arrowImage = new Image();
var fileObject;

var shipList, gateList, stationList;
var starList = [];
var currentLevel, level1, level2;

var shipSpeedX;
var shipSpeedY;
var shipAngularSpeed;
var gatesCompleted;
var gameTime;
var isDrag, dragX, dragY;

var zoomScale, zoomGoal, zoomOrg, zoomTime;

var offsetX, offsetY;

var canvasImage, canvasData, canvasBuf;
var game_font = new FontFace('RobotoMono', 'url(data/RobotoMono-Regular.woff)');

var minX, maxX, minY, maxY;
const LERP_TIME = 0.75;

const PI2 = 2.0 * Math.PI;
const KEY_0 = 48;
const KEY_1 = 49;
const KEY_2 = 50;
const KEY_W = 87;
const KEY_A = 65;
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
const ShipStateEnum = {"OFF":0, "BACK":1, "CLOCKWISE":2, "COUNTERCLOCKWISE":4};
const GateStateEnum = {"OFF":0, "ON":1, "START_BREAKING":2, "BREAKING":3};
const GameStateEnum = {"PLAYING":0, "WIN":1, "TRACTOR_BEAM":2};
const OffScreenArrowEnum = {"TOP":0, "BOTTOM":1, "LEFT":2, "RIGHT":3};
const DEGREES_TO_RAD = Math.PI/180.0;

var gameState;
var shipState;
var movePending;
var clockSec;
var tractorBeamNodes = [];
var tractorBeamHeadingGoal;

var arrowLength = 100
var arrowWidth = [7,3,5];
var arrowOffset = [20,40,75];
var gradientArrowBot, gradientArrowTop, gradientArrowLeft, gradientArrowRight;

window.onload = function () {init();};


class Ship
{
    constructor(x, y, heading, state)
    {
        this.x = x;
        this.y = y;
        this.heading = heading;
        this.state = state;
    }
}


function init()
{
    console.info("VectorJockey: by Joel Castellanos and VolatileDawn (Armin).");
    console.info("Copyright 2021");
    document.documentElement.style.overflow = 'hidden';  // firefox, chrome
    canvas = document.getElementById("mainCanvas");
    ctx = canvas.getContext("2d");

    shipImage.src = document.getElementById("shipImage").src;
    stationImage.src = document.getElementById("stationImage").src;
    gateImage.src = document.getElementById("gateImage").src;
    arrowImage.src = document.getElementById("arrowImage").src;

    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    ctx.canvas.width = canvasWidth;
    ctx.canvas.height = canvasHeight;
    canvasImage = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

    let y = canvasHeight;
    gradientArrowBot = ctx.createLinearGradient(0,y - arrowLength, 0, y-arrowOffset[0]);
    gradientArrowBot.addColorStop("0", "#47a8cc00");
    gradientArrowBot.addColorStop("0.5", "#085a79");
    gradientArrowBot.addColorStop("1.0", "#10c5ebff");

    gradientArrowTop = ctx.createLinearGradient(0,arrowOffset[0], 0, arrowLength);
    gradientArrowTop.addColorStop("0", "#10c5ebff");
    gradientArrowTop.addColorStop("0.5", "#085a79");
    gradientArrowTop.addColorStop("1.0", "#47a8cc00");

    gradientArrowLeft = ctx.createLinearGradient(arrowOffset[0], 0, arrowLength, 0);
    gradientArrowLeft.addColorStop("0", "#10c5ebff");
    gradientArrowLeft.addColorStop("0.5", "#085a79");
    gradientArrowLeft.addColorStop("1.0", "#47a8cc00");

    let x = canvasWidth;
    gradientArrowRight = ctx.createLinearGradient(x - arrowLength, 0, x-arrowOffset[0], 0);
    gradientArrowRight.addColorStop("0", "#47a8cc00");
    gradientArrowRight.addColorStop("0.5", "#085a79");
    gradientArrowRight.addColorStop("1.0", "#10c5ebff");


    thrustSystemMain = new ThrustSystem(900, 11, 10);
    thrustSystemCWB = new ThrustSystem(150, 2, 3);
    thrustSystemCWF = new ThrustSystem(150, 2, 3);
    thrustSystemCCB = new ThrustSystem(150, 2, 3);
    thrustSystemCCF = new ThrustSystem(150, 2, 3);

    level1 = new Level_1();
    level2 = new Level_2();
    initLevel(level1);

    game_font.load().then(function(loaded_face)
    {
        document.fonts.add(loaded_face);
        initHelp();
    }).catch(function(error) {
        // error occurred
    });

    fileObject = new XMLHttpRequest();

    fileObject.onreadystatechange = function() {readStars();};
    fileObject.open("GET", "data/BrightStarCatalog.csv", true);
    fileObject.setRequestHeader("Content-Type",  "application/x-www-form-urlencoded");
    fileObject.send();


    window.addEventListener('keydown', keyDown);
    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', mouseUp);
    window.addEventListener('wheel', mouseWheel);
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
    helpSec = -1;
    tractorBeamNodes = [];

    zoomScale = 0.625;
    zoomGoal = zoomScale;
    zoomOrg = zoomScale;
    zoomTime = 0;

    offsetX = canvasWidth/2;
    offsetY = canvasHeight/2;

    //Adjust offset for the stating sim at zoom != 1
    let shiftFactor = 1.0 / zoomScale - 1.0;
    offsetX = (canvasWidth / 2.0) * shiftFactor + offsetX;
    offsetY = (canvasHeight / 2.0) * shiftFactor + offsetY;

    shipList=[];
    gateList=[];
    stationList = [];

    gameState = GameStateEnum.PLAYING;
    gameOverFrame = -1
    shipState = ShipStateEnum.OFF;
    movePending = false;

    currentLevel.init();
}

//********************************** render loop *********************************************************************
//  This is a callback function called every frame by javascript.
//
//This function calls itself through a callback system set up with requestAnimationFrame(render);
//however, this is not recursion (it is like **tail** recursion, but not quite).
//Since requestAnimationFrame(render) is only registering a callback, it returns immediately (it does not block until
//the render() is called and returns as is the case with normal recursion).
//The next render() will not be called until this current render() exits and all its stack variables are freed.
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
        shipState = ShipStateEnum.OFF;

        shipSpeedX *= 0.95;
        shipSpeedY *= 0.95;
        shipAngularSpeed *= 0.9;

        if (ship.heading < tractorBeamHeadingGoal) ship.heading++;
        if (ship.heading > tractorBeamHeadingGoal) ship.heading--;
        ship.heading = Math.round(ship.heading);

        if (Math.abs(shipSpeedX) < 1) shipSpeedX = 0;
        if (Math.abs(shipSpeedY) < 1) shipSpeedY = 0;
        if (Math.abs(shipAngularSpeed) < 1) shipAngularSpeed = 0;

        if ((shipSpeedX === 0) && (shipSpeedY === 0) && (shipAngularSpeed === 0) && (ship.heading === tractorBeamHeadingGoal))
        {
            ship.x += 2.0 * Math.cos(ship.heading * DEGREES_TO_RAD);
            ship.y += 2.0 * Math.sin(ship.heading * DEGREES_TO_RAD);
            if (tractorBeamNodes[0].isInside(ship.x, ship.y))
            {
                gameState = GameStateEnum.PLAYING;
            }
        }
    }

    if (movePending)
    {
        movePending = false;
        gameTime++;
        let ship0 = ship;
        let shipX = ship0.x + shipSpeedX;
        let shipY = ship0.y + shipSpeedY;
        let heading = ship0.heading + shipAngularSpeed;
        if (heading <= -180) heading = 360 + heading;
        else if (heading > 180) heading = heading - 360;
        ship = new Ship(shipX, shipY, heading, shipState);
        shipList.push(ship);
        updateGates(ship0, ship);
        checkBoundary(ship);
        if (shipState & ShipStateEnum.COUNTERCLOCKWISE)
        {
            shipState = shipState - ShipStateEnum.COUNTERCLOCKWISE;
        }
        if (shipState & ShipStateEnum.CLOCKWISE)
        {
            shipState = shipState - ShipStateEnum.CLOCKWISE;
        }
    }

    ctx.putImageData(canvasImage, 0, 0);

    for (const ship of shipList)
    {
        renderShip(ship);
    }
    renderThrust(ship);
    for (const gate of gateList)
    {
        renderGate(gate);
    }
    renderBoundary(ship);
    renderShipOverlay(ship);

    if ((ship.x+offsetX)*zoomScale < 0)  renderOffScreenArrow(OffScreenArrowEnum.LEFT);
    else if ((ship.x+offsetX)*zoomScale > canvasWidth)  renderOffScreenArrow(OffScreenArrowEnum.RIGHT);
    if ((ship.y+offsetY)*zoomScale < 0) renderOffScreenArrow(OffScreenArrowEnum.TOP);
    else if ((ship.y+offsetY)*zoomScale > canvasHeight)  renderOffScreenArrow(OffScreenArrowEnum.BOTTOM);

    if (isHelpVisible) //Cannot display until font is loaded
    {
        displayHelp();
        displayStatus(ship);
    }

    requestAnimationFrameProtected();
}

function renderShip(ship)
{
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(zoomScale, zoomScale);
    ctx.translate(offsetX+ship.x, offsetY+ship.y);
    ctx.rotate(ship.heading*DEGREES_TO_RAD)
    ctx.drawImage(shipImage,-shipImage.width/2, -shipImage.height/2);
    ctx.fillStyle = "#A00000";
}

function renderShipOverlay(ship)
{
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.beginPath();
    ctx.lineWidth = 1;
    let x0 = (offsetX + ship.x) * zoomScale;
    let y0 = (offsetY + ship.y) * zoomScale;
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + (maxX - minX) * shipSpeedX * zoomScale, y0 + (maxY - minY) * shipSpeedY * zoomScale);
    ctx.strokeStyle = "#00A0F0";
    ctx.stroke();

    let counterclockwise = false;
    if (shipAngularSpeed < 0) counterclockwise = true;
    let radius = 150 * zoomScale;
    let startAngle = ship.heading * DEGREES_TO_RAD;
    let endAngle = (ship.heading + shipAngularSpeed * 15) * DEGREES_TO_RAD;
    ctx.beginPath();
    ctx.lineWidth = 3;
    let x1 = x0 + Math.cos(startAngle) * radius / 2;
    let y1 = y0 + Math.sin(startAngle) * radius / 2;
    let x2 = x0 + Math.cos(startAngle) * radius;
    let y2 = y0 + Math.sin(startAngle) * radius;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x0, y0, radius, startAngle, endAngle, counterclockwise);
    ctx.stroke();
}

function renderThrust(ship)
{
    if (shipState & ShipStateEnum.BACK)
    {
        thrustSystemMain.render(ship, -(shipImage.width-4)/2, 0);
    }

    if (shipState & ShipStateEnum.CLOCKWISE)
    {
        thrustSystemCWB.render(ship, -28, 30, -90); //ship, dx, dy, rotation
        thrustSystemCWF.render(ship, 39, -23, 90);
    }
    if (shipState & ShipStateEnum.COUNTERCLOCKWISE)
    {
        thrustSystemCWB.render(ship, -27, -30, 90);
        thrustSystemCWF.render(ship, 39, 23, -90);
    }
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
            ctx.moveTo(gate.x1 * zoomScale, gate.y1 * zoomScale);
            ctx.lineTo(gate.x2 * zoomScale, gate.y2 * zoomScale);
            ctx.strokeStyle = gate.color;
            ctx.stroke();
        }
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(offsetX*zoomScale, offsetY*zoomScale);
    ctx.translate(gate.x1*zoomScale, gate.y1*zoomScale);
    ctx.rotate((gate.heading-90)*DEGREES_TO_RAD);
    ctx.drawImage(gateImage,-gateImage.width/2, -gateImage.height/2);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.translate((offsetX+gate.x2)*zoomScale, (offsetY+gate.y2)*zoomScale);
    ctx.rotate((90.0+gate.heading)*DEGREES_TO_RAD);
    ctx.drawImage(gateImage,-gateImage.width/2, -gateImage.height/2);
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
            let x = station.x * zoomScale;
            let y = station.y * zoomScale;
            for (let i = 0; i < 100; i++)
            {
                let angle = Math.random() * 2 * Math.PI;
                let xx = (85 * Math.cos(angle) + ship.x) * zoomScale;
                let yy = (85 * Math.sin(angle) + ship.y) * zoomScale;
                ctx.moveTo(x, y);
                ctx.lineTo(xx, yy);
            }
        }
        ctx.stroke();
    }
    else
    {
        ctx.strokeStyle = "#6309c6A0";
        for (let thickness = 1; thickness <= 3; thickness += 2)
        {
            ctx.lineWidth = thickness;
            for (let k = 0; k < 6; k++)
            {
                let x = stationList[k % 5].x * zoomScale;
                let y = stationList[k % 5].y * zoomScale;
                //console.info("vertex["+String(k)+"]: (" + String(x)+ ", " + String(y) +")");
                if (k === 0) ctx.moveTo(x, y);
                else
                {
                    ctx.lineTo(x, y);
                }
                //ctx.fillStyle = "white";
                //ctx.fillText(String(k), x, y);
            }

            ctx.stroke();
        }
    }
    for (const station of stationList)
    {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        let x = station.x * zoomScale
        let y = station.y * zoomScale
        ctx.translate(offsetX * zoomScale + x, offsetY * zoomScale + y);
        ctx.rotate((3 * (clockSec % 360) + station.heading) * DEGREES_TO_RAD);
        ctx.drawImage(stationImage, -stationImage.width / 2, -stationImage.height / 2);
    }
}

function renderOffScreenArrow(direction)
{
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (direction === OffScreenArrowEnum.BOTTOM)
    {
        let x = canvasWidth/2;
        let y = canvasHeight;
        ctx.strokeStyle = gradientArrowBot;

        for (let i=0; i<arrowOffset.length; i++)
        {
            ctx.globalAlpha = Math.abs(Math.sin(clockSec));
            ctx.beginPath();
            ctx.lineWidth = arrowWidth[i];
            ctx.moveTo(x + arrowLength, y-arrowOffset[i] - arrowLength);
            ctx.lineTo(x, y-arrowOffset[i]);
            ctx.lineTo(x - arrowLength,y-arrowOffset[i] - arrowLength);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
    else if (direction === OffScreenArrowEnum.TOP)
    {
        let x = canvasWidth/2;
        ctx.strokeStyle = gradientArrowTop;

        for (let i=0; i<arrowOffset.length; i++)
        {
            ctx.globalAlpha = Math.abs(Math.sin(clockSec));
            ctx.beginPath();
            ctx.lineWidth = arrowWidth[i];
            ctx.moveTo(x + arrowLength, arrowOffset[i] + arrowLength);
            ctx.lineTo(x, arrowOffset[i]);
            ctx.lineTo(x - arrowLength, arrowOffset[i] + arrowLength);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
    else if (direction === OffScreenArrowEnum.LEFT)
    {
        let y = canvasHeight/2;
        ctx.strokeStyle = gradientArrowLeft;

        for (let i=0; i<arrowOffset.length; i++)
        {
            ctx.globalAlpha = Math.abs(Math.sin(clockSec));
            ctx.beginPath();
            ctx.lineWidth = arrowWidth[i];
            ctx.moveTo(arrowOffset[i] + arrowLength, y + arrowLength);
            ctx.lineTo(arrowOffset[i], y);
            ctx.lineTo(arrowOffset[i] + arrowLength, y - arrowLength);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
    else if (direction === OffScreenArrowEnum.RIGHT)
    {
        let x = canvasWidth;
        let y = canvasHeight/2;
        ctx.strokeStyle = gradientArrowRight

        for (let i=0; i<arrowOffset.length; i++)
        {
            ctx.globalAlpha = Math.abs(Math.sin(clockSec));
            ctx.beginPath();
            ctx.lineWidth = arrowWidth[i];
            ctx.moveTo(x-arrowOffset[i] - arrowLength, y + arrowLength);
            ctx.lineTo(x-arrowOffset[i], y);
            ctx.lineTo(x-arrowOffset[i] - arrowLength, y - arrowLength);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
}

function keyDown(event)
{
    if (movePending) return;
    let ship0 = shipList[shipList.length - 1];

    if ((event.keyCode == KEY_W) && (gameState == GameStateEnum.PLAYING))
    {
        if (shipState & ShipStateEnum.BACK) shipState = shipState - ShipStateEnum.BACK;
        else
        {
            shipState = shipState | ShipStateEnum.BACK;
            thrustSystemMain.respawnAll();
        }
    }
    else if ((event.keyCode == KEY_A) && (gameState == GameStateEnum.PLAYING))
    {
        if (shipState & ShipStateEnum.COUNTERCLOCKWISE) shipState = shipState - ShipStateEnum.COUNTERCLOCKWISE;
        else if (shipAngularSpeed > -15)
        {
            shipState = shipState | ShipStateEnum.COUNTERCLOCKWISE;
            thrustSystemCWB.respawnAll();
            thrustSystemCWF.respawnAll();
            if (shipState & ShipStateEnum.CLOCKWISE) shipState = shipState - ShipStateEnum.CLOCKWISE;
        }
        else
        {
            helpMsg = "Counterclockwise thrusters disabled. Maximum safe angular speed: 15°/timestep.";
            helpSec = 0;
        }

    }
    else if ((event.keyCode == KEY_D) && (gameState == GameStateEnum.PLAYING))
    {
        if (shipState & ShipStateEnum.CLOCKWISE) shipState = shipState - ShipStateEnum.CLOCKWISE;
        else if (shipAngularSpeed < 15)
        {
            shipState = shipState | ShipStateEnum.CLOCKWISE;
            thrustSystemCWB.respawnAll();
            thrustSystemCWF.respawnAll();
            if (shipState & ShipStateEnum.COUNTERCLOCKWISE) shipState = shipState - ShipStateEnum.COUNTERCLOCKWISE;
        }
        else
        {
            helpMsg = "Clockwise thrusters disabled. Maximum safe angular speed: 15°/timestep.";
            helpSec = 0;
        }
    }
    else if ((event.keyCode == KEY_SPACE) && (gameState == GameStateEnum.PLAYING))
    {
        if (shipState & ShipStateEnum.BACK)
        {
            shipSpeedX += Math.cos(ship0.heading * DEGREES_TO_RAD)
            shipSpeedY += Math.sin(ship0.heading * DEGREES_TO_RAD)
        }
        if (shipState & ShipStateEnum.COUNTERCLOCKWISE)
        {
            shipAngularSpeed -= 5;
            if (shipAngularSpeed <= -15) shipAngularSpeed = -15;

        }
        if (shipState & ShipStateEnum.CLOCKWISE)
        {
            shipAngularSpeed += 5;
            if (shipAngularSpeed >= 15) shipAngularSpeed = 15;
        }
        movePending = true;
    }

    else if (event.keyCode == KEY_LEFT_ARROW) dragWorld(50,0);
    else if (event.keyCode == KEY_RIGHT_ARROW) dragWorld(-50,0);
    else if (event.keyCode == KEY_UP_ARROW) dragWorld(0,50);
    else if (event.keyCode == KEY_DOWN_ARROW) dragWorld(0,-50);
    else if ((event.keyCode == KEY_PLUS_FIREFOX) || (event.keyCode == KEY_PLUS_CHROME)) zoom('+');
    else if ((event.keyCode == KEY_MINUS_FIREFOX) || (event.keyCode == KEY_MINUS_CHROME)) zoom('-');
    else if (event.keyCode == KEY_H) helpCounter = 1;
    else if (event.keyCode == KEY_ESC) helpCounter = 1000;
    else if (event.keyCode == KEY_1) initLevel(level1)
    else if (event.keyCode == KEY_2) initLevel(level2)
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
        if (code === '+') zoomGoal = Math.min(1.0, zoomGoal * 1.6);
        else if (code === '-') zoomGoal = Math.max(0.1, zoomGoal * 0.625);
    }

    if (zoomScale === zoomGoal) return;

    let scale0 = zoomScale;
    if (clockSec - zoomTime >= LERP_TIME) zoomScale = zoomGoal;
    else zoomScale = zoomOrg + (clockSec - zoomTime) * (zoomGoal - zoomOrg) / LERP_TIME;

    let shiftFactor = 1.0 / zoomScale - 1.0 / scale0;
    offsetX = (canvasWidth / 2.0) * shiftFactor + offsetX;
    offsetY = (canvasHeight / 2.0) * shiftFactor + offsetY;

    //console.info("offset=" + offsetX + ", "+ offsetY+"),   zoomScale="+zoomScale + "goal="+zoomGoal + "deltaTime="+(clockSec - zoomTime));
}


function updateGates(ship0, ship)
{
    for (const gate of gateList)
    {
        let clearedGate = false;
        let gateMinX = Math.min(gate.x1,gate.x2);
        let gateMaxX = Math.max(gate.x1,gate.x2);
        let gateMinY = Math.min(gate.y1,gate.y2);
        let gateMaxY = Math.max(gate.y1,gate.y2);
        if ((gateMinX > ship0.x) && (gateMinX > ship.x)) continue;
        if ((gateMinY > ship0.y) && (gateMinY > ship.y)) continue;
        if ((gateMaxX < ship0.x) && (gateMaxX < ship.x)) continue;
        if ((gateMaxY < ship0.y) && (gateMaxY < ship.y)) continue;

        let yy0 = gate.slope * ship0.x + gate.yIntercept;
        let yy  = gate.slope * ship.x + gate.yIntercept;
        if (ship0.y <= yy0)
        {
            if (ship.y >= yy)
            {
                if (gate.state == GateStateEnum.ON) clearedGate = true;
            }
        }
        if (ship0.y >= yy0)
        {
            if (ship.y <= yy)
            {
                if (gate.state == GateStateEnum.ON) clearedGate = true;
            }
        }
        if (clearedGate == true)
        {
            gatesCompleted++;
            gate.state = GateStateEnum.START_BREAKING;
            currentLevel.clearedGate();
        }
    }
}

function checkBoundary(ship)
{
    if (gameState !== GameStateEnum.PLAYING) return;
    for (const station of stationList)
    {
        if (!station.isInside(ship.x, ship.y))
        {
            gameState = GameStateEnum.TRACTOR_BEAM;
            tractorBeamNodes = [station, station.neighbor];
            tractorBeamHeadingGoal = Math.round(Math.atan2(-ship.y, -ship.x) / DEGREES_TO_RAD);
            if (tractorBeamHeadingGoal > 180) tractorBeamHeadingGoal = tractorBeamHeadingGoal - 360;
            return;
        }
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