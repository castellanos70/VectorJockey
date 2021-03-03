var canvas;
var ctx;
var pendingFrameRequest = false;

var canvasWidth, canvasHeight;
var shipImage = new Image();
var stationImage = new Image();
var gateImage = new Image();
var fileObject;
var shipSpeedX=0;
var shipSpeedY=0;
var shipAngularSpeed = 0;
var shipList = [];
var gateList = [];
var stationList = [];
var starList = [];
var gatesCompleted = 0;
var gameTime = 0;
const minX = -4000;
const maxX = 4000;
const minY = -4000;
const maxY = 4000;
var zoomScale = 0.625;
var zoomGoal = zoomScale;
var zoomOrg = zoomScale;
var lerpTime = 0.75;
var zoomTime = 0;

var offsetX = 0;
var offsetY = 0;

var isDrag = false;
var dragX=0, dragY=0;
var canvasImage, canvasData, canvasBuf;
var game_font = new FontFace('RobotoMono', 'url(../data/RobotoMono-Regular.woff)');

const PI2 = 2.0 * Math.PI;
const KEY_W = 87;
const KEY_A = 65;
const KEY_D = 68;
const KEY_H = 72;
const KEY_SPACE = 32;
const KEY_LEFT_ARROW = 37;
const KEY_UP_ARROW = 38;
const KEY_RIGHT_ARROW = 39;
const KEY_DOWN_ARROW = 40;
const KEY_PLUS = 61;
const KEY_MINUS = 173;
const KEY_ESC = 27;

//ShipStateEnum are powers of 2 so bitwise or can turn on multiple at once.
const ShipStateEnum = {"OFF":0, "BACK":1, "CLOCKWISE":2, "COUNTERCLOCKWISE":4}
const GateStateEnum = {"OFF":0, "ON":1, "START_BREAKING":2, "BREAKING":3}
const GameStateEnum = {"PLAYING":0, "WIN":1, "LOST":2}
const degreesToRad = Math.PI/180.0;

var gameState = GameStateEnum.PLAYING;
var gameOverFrame = -1
var shipState = ShipStateEnum.OFF;
var movePending = false;
var clockSec;

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

class Station
{
    constructor(index, x, y)
    {
        this.index = index;
        this.x = x;
        this.y = y;
        this.heading = Math.random()*Math.PI;
        this.slope = NaN;
        this.yIntercept = NaN;
    }

    //Only call this after **all** stations have been constructed
    calculateLine()
    {
        let neighbor = stationList[(this.index + 1) % 5];
        this.slope = (neighbor.y - this.y)/(neighbor.x - this.x);
        this.yIntercept = this.y - this.slope*this.x;

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

    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    ctx.canvas.width = canvasWidth;
    ctx.canvas.height = canvasHeight;
    offsetX = canvasWidth/2;
    offsetY = canvasHeight/2;
    //Adjust offset for the stating sim at zoom != 1
    let shiftFactor = 1.0 / zoomScale - 1.0;
    offsetX = (canvasWidth / 2.0) * shiftFactor + offsetX;
    offsetY = (canvasHeight / 2.0) * shiftFactor + offsetY;

    canvasImage = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

    game_font.load().then(function(loaded_face)
    {
        document.fonts.add(loaded_face);
        isHelpVisible = true;
    }).catch(function(error) {
        // error occurred
    });

    fileObject = new XMLHttpRequest();

    fileObject.onreadystatechange = function() {readStars();};
    fileObject.open("GET", "../data/BrightStarCatalog.csv", true);
    fileObject.setRequestHeader("Content-Type",  "application/x-www-form-urlencoded");
    fileObject.send();

    let ship = new Ship(0,0,0,ShipStateEnum.OFF);
    shipList.push(ship);

    gateList.push(new Gate(400,-250,0, 250, "#00900090"));
    gateList.push(new Gate(3300,250,0, 400, "#A0000C90"));
    gateList.push(new Gate(2000,700,80, 600, "#d181d990"));
    gateList.push(new Gate(-2000,1000,30, 300, "#B8C41490"));
    gateList.push(new Gate(-1200,-2200,45, 300, "#fd7f0290"));
    gateList.push(new Gate(1200,-1900,15, 300, "#2832c290"));

    thrustSystemMain = new ThrustSystem(900, 11, 10);
    thrustSystemCWB = new ThrustSystem(150, 2, 3);
    thrustSystemCWF = new ThrustSystem(150, 2, 3);
    thrustSystemCCB = new ThrustSystem(150, 2, 3);
    thrustSystemCCF = new ThrustSystem(150, 2, 3);

    for (let k = 0.0; k < 5.0; k++)
    {
        let x = maxX * Math.cos(k * 2.0 * Math.PI / 5.0);
        let y = maxY * Math.sin(k * 2.0 * Math.PI / 5.0);
        stationList.push(new Station(k, x, y));
    }

    //Uses neighbor in calculation so must be done after list is fully constructed.
    for (const station of stationList)
    {
        station.calculateLine();
    }

    window.addEventListener('keydown', keyDown);
    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', mouseUp);
    window.addEventListener('wheel', mouseWheel);
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
    if (gameState == GameStateEnum.LOST)
    {
        gameOverFrame++;
        if ((gameOverFrame - gameTime) < 30 * 50)
        {
            if ((gameOverFrame - gameTime) % 30 == 0) movePending = true;
        }
    }
    if (movePending)
    {
        movePending = false;
        if (gameState == GameStateEnum.PLAYING) gameTime++;
        let ship0 = ship;
        let shipX = ship0.x + shipSpeedX;
        let shipY = ship0.y + shipSpeedY;
        let heading = ship0.heading + shipAngularSpeed;
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
    renderBoundary();

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
    let startAngle = ship.heading * degreesToRad;
    let endAngle = (ship.heading + shipAngularSpeed * 15) * degreesToRad;
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

    if (isHelpVisible) //Cannot display until font is loaded
    {
        displayHelp();
        displayStatus();
    }
    requestAnimationFrameProtected();
}

function renderShip(ship)
{
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(zoomScale, zoomScale);
    ctx.translate(offsetX+ship.x, offsetY+ship.y);
    ctx.rotate(ship.heading*degreesToRad)
    ctx.drawImage(shipImage,-shipImage.width/2, -shipImage.height/2);
    ctx.fillStyle = "#A00000";
}

function renderThrust(ship)
{
    //ctx.fillStyle = "#A00000";
    if (shipState & ShipStateEnum.BACK)
    {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        let x = (offsetX+ship.x)*zoomScale;
        let y = (offsetY+ship.y)*zoomScale;
        ctx.translate(x, y);
        ctx.rotate(ship.heading*degreesToRad);
        ctx.translate(-(shipImage.width-4)*zoomScale/2, 0);
        //ctx.fillRect(-25 - shipImage.width / 2, -1, 25/zoomScale, 3/zoomScale);
        thrustSystemMain.render();
    }
    if (shipState & ShipStateEnum.CLOCKWISE)
    {
        let x = (offsetX+ship.x)*zoomScale;
        let y = (offsetY+ship.y)*zoomScale;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(x, y);
        ctx.rotate(ship.heading*degreesToRad);
        ctx.translate(-28*zoomScale, +30*zoomScale);
        ctx.rotate(-90*degreesToRad);
        thrustSystemCWB.render();

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(x, y);
        ctx.rotate(ship.heading*degreesToRad);
        ctx.translate(+39*zoomScale, -23*zoomScale);
        ctx.rotate(90*degreesToRad);
        thrustSystemCWF.render();
    }
    if (shipState & ShipStateEnum.COUNTERCLOCKWISE)
    {
        let x = (offsetX+ship.x)*zoomScale;
        let y = (offsetY+ship.y)*zoomScale;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(x, y);
        ctx.rotate(ship.heading*degreesToRad);
        ctx.translate(-27*zoomScale, -30*zoomScale);
        ctx.rotate(90*degreesToRad);
        thrustSystemCWB.render();

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(x, y);
        ctx.rotate(ship.heading*degreesToRad);
        ctx.translate(39*zoomScale, 23*zoomScale);
        ctx.rotate(-90*degreesToRad);
        thrustSystemCWF.render();
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
    ctx.rotate((gate.heading-90)*degreesToRad);
    ctx.drawImage(gateImage,-gateImage.width/2, -gateImage.height/2);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.translate((offsetX+gate.x2)*zoomScale, (offsetY+gate.y2)*zoomScale);
    ctx.rotate((90.0+gate.heading)*degreesToRad);
    ctx.drawImage(gateImage,-gateImage.width/2, -gateImage.height/2);
}

function renderBoundary()
{
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(offsetX*zoomScale, offsetY*zoomScale);
    ctx.beginPath();
    ctx.lineWidth = 1;
    for (let k = 0; k < 6; k++)
    {
        let x = stationList[k%5].x*zoomScale
        let y = stationList[k%5].y*zoomScale
        //console.info("vertex["+String(k)+"]: (" + String(x)+ ", " + String(y) +")");
        if (k < .5) ctx.moveTo(x, y);
        else
        {
            ctx.lineTo(x, y);
        }
        //ctx.fillStyle = "white";
        //ctx.fillText(String(k), x, y);
    }
    ctx.strokeStyle = "#6309c6";
    ctx.stroke();

    for (const station of stationList)
    {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        let x = station.x*zoomScale
        let y = station.y*zoomScale
        ctx.translate(offsetX*zoomScale + x, offsetY*zoomScale + y);
        ctx.rotate((3*(clockSec % 360)+station.heading)*degreesToRad);
        ctx.drawImage(stationImage, -stationImage.width / 2, -stationImage.height / 2);
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
            helpMsg = "Counterclockwise thrusters disabled at maximum safe angular velocity.";
            helpSec = -1;
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
            helpMsg = "Clockwise thrusters disabled at maximum safe angular velocity.";
            helpSec = -1;
        }
    }
    else if ((event.keyCode == KEY_SPACE) && (gameState == GameStateEnum.PLAYING))
    {
        if (shipState & ShipStateEnum.BACK)
        {
            shipSpeedX += Math.cos(ship0.heading * degreesToRad)
            shipSpeedY += Math.sin(ship0.heading * degreesToRad)
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
    else if (event.keyCode == KEY_PLUS) zoom('+');
    else if (event.keyCode == KEY_MINUS) zoom('-');
    else if (event.keyCode == KEY_H) helpCounter = 0;
    else if (event.keyCode == KEY_ESC) helpCounter = 100;
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
    if (offsetX > maxX + (canvasWidth / 4) / zoomScale) offsetX = maxX + (canvasWidth / 4) / zoomScale;
    if (offsetY > maxY + (canvasHeight / 4) / zoomScale) offsetY = maxY + (canvasHeight / 4) / zoomScale;
    if (offsetX < minX + (canvasWidth / 2) / zoomScale) offsetX = minX + (canvasWidth / 2) / zoomScale;
    if (offsetY < minY + (canvasHeight / 2) / zoomScale) offsetY = minY + (canvasHeight / 2) / zoomScale;

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
    if (clockSec - zoomTime >= lerpTime) zoomScale = zoomGoal;
    else zoomScale = zoomOrg + (clockSec - zoomTime) * (zoomGoal - zoomOrg) / lerpTime;

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
        if ((gate.x1 > ship0.x) && (gate.x1 > ship.x)) continue;
        if ((gate.y1 > ship0.y) && (gate.y1 > ship.y)) continue;
        if ((gate.x2 < ship0.x) && (gate.x2 < ship.x)) continue;
        if ((gate.y2 < ship0.y) && (gate.y2 < ship.y)) continue;

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
            helpSec = -1;
            if (helpCounter < 8) helpCounter = 8;
            if (gatesCompleted == 1) helpMsg = "Congratulations! You have cleared the first Gate.";
            else if (gatesCompleted == 2) helpMsg = "Two down, Three to go (clear 5 of 6 to finish)";
            else if (gatesCompleted == 3) helpMsg = "That makes Three!";
            else if (gatesCompleted == 4) helpMsg = "BAM! One more.";
            else
            {
                helpMsg = "CONGRATULATIONS! Spaceflight Time-trial Completedw";
                gameState = GameStateEnum.WIN;
            }
        }
    }
}

function checkBoundary(ship)
{
    if (gameState !== GameStateEnum.PLAYING) return;

    //Boundary from station 0 to 1
    let yy = stationList[0].slope * ship.x + stationList[0].yIntercept;
    if (ship.y > yy)  gameState = GameStateEnum.LOST;

    //Boundary from station 1 to 2
    yy = stationList[1].slope * ship.x + stationList[1].yIntercept;
    if (ship.y > yy)  gameState = GameStateEnum.LOST;

    //Boundary from station 2 to 3
    if (ship.x < stationList[2].x)  gameState = GameStateEnum.LOST;

    //Boundary from station 3 to 4
    yy = stationList[3].slope * ship.x + stationList[3].yIntercept;
    if (ship.y < yy)  gameState = GameStateEnum.LOST;

    //Boundary from station 4 to 0
    yy = stationList[4].slope * ship.x + stationList[4].yIntercept;
    if (ship.y < yy)  gameState = GameStateEnum.LOST;

    if (gameState == GameStateEnum.LOST)
    {
        gameOverFrame = gameTime;
        shipState = ShipStateEnum.OFF;
        helpMsg = "GAME OVER";
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