class Level_0
{
    constructor()
    {
        this.zoomOut1 = false;
        this.zoomOut2 = false;
        this.zoomInDone = false;
        this.dragDone = false;
        this.lastSpeedX = 0;
        this.lastAngularSpeed = 0;
        this.helpSubcount = 0
    }

    init()
    {
        let ship = new Ship(0, 0, 0, ShipStateEnum.OFF);
        shipList.push(ship);

        gateList.push(new Gate(500, -200, 80, 600, "#B8C41490"));
        gateList.push(new Gate(3100, -100, 100, 500, "#A0000C90"));
        gateList.push(new Gate(3300, 300, 0, 600, "#fd7f0290"));

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

        this.zoomOut1 = false;
        this.zoomOut2 = false;
        this.zoomInDone = false;
        this.dragDone = false;
        this.lastSpeedX = 0;
        this.lastAngularSpeed = 0;
        this.helpSubcount = 0
    }

    updateStatus(ship)
    {
        if (!this.zoomOut1)
        {
            if (zoomScale < .5)
            {
                this.zoomOut1 = true;
                helpSec = -1;
            }
        }
        if (!this.zoomOut2)
        {
            if (zoomScale < .15)
            {
                this.zoomOut2 = true;
                helpSec = -1;
            }
        }
        if (this.zoomOut2)
        {
            if (!this.zoomInDone)
            {
                if (zoomScale > .5)
                {
                    this.zoomInDone = true;
                    helpSec = -1;
                }
            }
        }

        let undoMove = false;
        if (gameTime < 56)
        {
            shipAngularSpeed = 0;
            shipSpeedY = 0;
            if (shipState !== ShipStateEnum.BACK) undoMove = true;
        }
        else if (gameTime < 71)
        {
            if (helpCounter < 6) helpCounter = 6;
            else if (gameTime < 59)
            {
                if (shipState & ShipStateEnum.BACK) undoMove = true;
                if (!(shipState & ShipStateEnum.CLOCKWISE)) undoMove = true;
            }
            else if (gameTime < 68)
            {
                if (shipState & ShipStateEnum.BACK) undoMove = true;
                if (shipState !== ShipStateEnum.OFF) undoMove = true;
            }
            else
            {
                if (!(shipState & ShipStateEnum.COUNTERCLOCKWISE)) undoMove = true;
                if (gameTime < 70)
                {
                    if (shipState & ShipStateEnum.BACK) undoMove = true;
                }
                else if (!(shipState & ShipStateEnum.BACK)) undoMove = true;
            }
        }
        else if (gameTime < 126)
        {
            if (shipState !== ShipStateEnum.BACK) undoMove = true;
        }
        if (undoMove)
        {
            movePending = false;
            shipSpeedX = this.lastSpeedX;
            shipSpeedY = 0;
            shipAngularSpeed = this.lastAngularSpeed;
        }


        if (movePending)
        {
            if (gameState == GameStateEnum.PLAYING) gameTime++;
            let ship0 = ship;
            let shipX = ship0.x + shipSpeedX;
            let shipY = ship0.y + shipSpeedY;
            let heading = ship0.heading + shipAngularSpeed;
            ship = new Ship(shipX, shipY, heading, shipState);
            shipList.push(ship);
            updateGates(ship0, ship);
            helpSec = -1;
        }

        this.lastAngularSpeed = shipAngularSpeed;
        this.lastSpeedX = shipSpeedX;
        return ship;
    }


    clearedGate()
    {
        helpSec = 0;
        if (gatesCompleted == 1) helpMsg = "You have cleared the first Gate.";
        else if (gatesCompleted == 2) helpMsg = "You have cleared the second Gate.";
        else
        {
            helpMsg = "CONGRATULATIONS! Tutorial Completed.";
        }
    }


    getNextHelpMsg()
    {
        if (gameState === GameStateEnum.LOST)
        {
            if (helpCounter < 1000) helpCounter = 1000;
            helpCounter++;
            switch (helpCounter)
            { //@formatter:off
                case 1001: return "Ship center has crossed the boundary: GAME OVER";
                case 1002: return "Press 0 to restart tutorial";
                default:
                    helpCounter = 1001;
                    return "Press 1 to advance to level 1";
            } //@formatter:on
        }

        let ship = shipList[shipList.length - 1];
        helpCounter++;
        switch (helpCounter)
        {   //@formatter:off
            case 1: return "Level 0 :.:.:.:.:.: The Tutorial :.:.:.:.:.:";
            case 2: return "At any time, if you want to skip tutorial, press 1.";
            case 3: return "At any time, if you want to restart tutorial, press 0.";
            case 4: return "Level 0 consists of your ship, 3 gates and a boundary.";
            case 5:
                if (!this.zoomOut1)
                {
                    helpCounter = 4;
                    return  "Use Scrollwheel or \'-\' key to get a wider view of the play area.";
                }
                else if (!this.zoomOut2)
                {
                    helpCounter = 4;
                    return  "You Zoomed! Take it a bit more (Scrollwheel or \'-\' key).";
                }
                else if (!this.zoomInDone)
                {
                    helpCounter = 4;
                    return  "Zoom back in by using Scrollwheel or \'=/+\' key.";
                }
                else if (!this.dragDone)
                {
                    helpCounter = 4;
                    return  "Use Click-n-drag or arrow keys to scroll view area.";
                }
                if (shipSpeedX > 0) helpCounter = 6;
                return "Great! You\'ve seen the world \\,,/(^_^)\\,,/";
            case 6: return "Let\'s get the ship moving --~~~=:>[XXXXX]>";
            case 7:
                if (shipSpeedX >= 56)
                {   this.helpSubcount = 0;
                    return "560 m/s! Time to turn around and slow down.";
                }

                helpCounter = 6;
                if ((ship.x < -offsetX*zoomScale) || (ship.x > -offsetX*zoomScale + canvasWidth) ||
                    (ship.y < -offsetY*zoomScale) || (ship.y > -offsetY*zoomScale + canvasHeight) )
                {
                    if (Math.random() < 0.5) return "Scroll (Click-n-drag or arrow keys) until ship is visible.";
                    else
                    {
                        if (ship.y < -offsetY*zoomScale) return "Your ship is off the top edge of the display.";
                        if (ship.y > -offsetY*zoomScale + canvasHeight) return "Your ship is off the bottom edge of the display.";
                        if (ship.x < -offsetX*zoomScale) return "Your ship is off the left edge of the display.";
                        if (ship.x > -offsetX*zoomScale + canvasHeight) return "Your ship is off the right edge of the display.";
                    }
                }
                if (shipSpeedX == 1 && gameTime == 1 && this.helpSubcount == 0)
                {
                    this.helpSubcount = 1;
                    return "^_^ Notice \"Time\"=1 and \"Linear Speed\"=10 m/s. You are moving!";
                }
                if (gameTime == 2)
                {
                    return "Goal: Pilot ship through the 3 gates in under 174 time-steps.";
                }
                if (shipState == ShipStateEnum.OFF)
                {
                    if (shipSpeedX >= 1)
                    {
                        if (Math.random() < 0.5) return "More Speed! Press W to toggle Main Thruster.";
                        return "Press W to toggle Main Thruster.";
                    }
                    return "Press W to toggle Main Thruster.";
                }
                let r = Math.random();
                if (r < 0.2) return "With thruster on, press *spacebar* until ship reaches 560 m/s";
                if (r < 0.4) return "Thrusters have no effect until *spacebar* is pressed.";
                if (r < 0.6) return "One time-step in the simulator represents 10 seconds.";
                if (r < 0.8) return "Hold down *spacebar* to quickly advance many time steps.";
                return "Press *spacebar* to advance time by 1 time-step.";
            case 8:
                if (ship.heading >= 165)
                {
                    this.helpSubcount = 0;
                    return "With a forward direction of 165°, it is time for counterclockwise thrust.";
                }
                helpCounter = 7;
                if (shipState & ShipStateEnum.BACK)
                {
                    if (ship.heading == 0) return "Time to turn around. Turn OFF Main Thruster (W).";
                    return "Press W to toggle Main Thruster OFF.";
                }

                if (ship.heading == 0)
                {
                    if (!(shipState & ShipStateEnum.CLOCKWISE))
                    {
                        return "Press D to toggle Clockwise Thruster."
                    }
                    return "Press *spacebar* to apply clockwise thrust.";
                }
                if (this.helpSubcount === 0)
                {   this.helpSubcount = 1;
                    return "Ship has an angular speed and will spin in direction of azure arc.";
                }
                if (this.helpSubcount === 1)
                {   this.helpSubcount = 2;
                    return "With main thrust off, ship will \'coast\' along the thin azure line.";
                }
                if (this.helpSubcount === 2 && shipAngularSpeed > 10)
                {   this.helpSubcount = 3;
                    return "Notice clockwise thruster has no effect on the ship\'s direction of motion.";
                }
                if (ship.heading >= 45 && this.helpSubcount === 3)
                {
                    this.helpSubcount = 4;
                    return "Ship now has a clockwise angular speed of " + shipAngularSpeed + "°/time-step.";
                }
                if (shipAngularSpeed < 15)
                {
                    if (!(shipState & ShipStateEnum.CLOCKWISE))
                    {
                        return "Press D to toggle Clockwise Thruster ON.";
                    }
                    return "Press *spacebar*, further increasing angular velocity.";
                }
                if (shipState & ShipStateEnum.COUNTERCLOCKWISE)
                {
                    return "Press A to toggle Counterclockwise Thruster OFF."
                }
                return "Press *spacebar* until ship\'s forward direction is 165°.";
            case 9:
                if (shipAngularSpeed == 0)
                {
                    this.helpSubcount = 0;
                    return "The ship needs 55 time-steps of equal and opposite thrust!";
                }
                helpCounter = 8;
                if (ship.heading >= 180)
                {
                    if (this.helpSubcount === 0)
                    {
                        this.helpSubcount = 1;
                        return "Excellent! Ship is facing 180° from its direction of motion.";
                    }
                    return "With both Counterclockwise & Main Thruster ON, press *spacebar*.";
                }
                if (shipState & ShipStateEnum.BACK) return "Press W to toggle off Main Thruster.";
                if (!(shipState & ShipStateEnum.COUNTERCLOCKWISE))
                {
                    return "Press A to toggle Counterclockwise Thruster ON."
                }
                return "Press *spacebar* to apply counterclockwise thrust."
            case 10: return "Your ship has barely enough space to stop before ...";
            case 12: return "... its center crosses the boundary pentagon.";
            case 13:
                if (shipSpeedX <= 0)
                {
                    return "Coolio. Ready for the last gate?";
                }
                helpCounter = 12;
                if (!(shipState & ShipStateEnum.BACK))
                {
                    return "Press W to toggle Main Thruster on.";
                }
                if (shipState & ShipStateEnum.COUNTERCLOCKWISE)
                {
                    return "Press A to toggle Counterclockwise Thruster OFF."
                }
                if (shipState & ShipStateEnum.CLOCKWISE)
                {
                    return "Press D to toggle Clockwise Thruster OFF."
                }
                return "With main thruster on, press *spacebar*  until ship comes to rest."
            case 14: return "One shot of counterclockwise thrust (A) with main thruster (W)";
            case 15: return "When the azure line crosses a gate, you\'re golden: just coast!";
            case 16: return "When coasting, the ship spinning has no effect on direction.";
            default:
                if (gatesCompleted < 3) return "Continue through the last gate!";
                let rr = Math.random()
                if (rr < 0.25) return "Try moving your ship around the arena.";
                if (rr < 0.50) return "Press 0 to restart this tutorial.";
                if (rr < 0.75) return "Press 1 to begin level 1.";
                return "";
        } //@formatter:on
    }
}