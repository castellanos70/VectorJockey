class Level_0
{
    constructor()
    {
        this.zoomOut1 = false;
        this.zoomOut2 = false;
        this.zoomInDone = false;
        this.dragDone = false;
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

        if (gameTime < 56)
        {
            shipAngularSpeed = 0;
            shipSpeedY = 0;
            if (!(shipState & ShipStateEnum.BACK)) movePending = false;
            if (shipState & ShipStateEnum.CLOCKWISE) shipState -= ShipStateEnum.CLOCKWISE;
            if (shipState & ShipStateEnum.COUNTERCLOCKWISE) shipState -= ShipStateEnum.COUNTERCLOCKWISE;
        }
        else if (gameTime < 70)
        {
            if (helpCounter < 6) helpCounter = 6;
            if (shipState & ShipStateEnum.BACK) movePending = false;
            shipAngularSpeed = 0;
            shipSpeedX = 56;
            shipSpeedY = 0;
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
        }
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
            gameState = GameStateEnum.WIN;
        }
    }


    getNextHelpMsg()
    {
        if (gameState === GameStateEnum.LOST)
        {
            if (helpCounter < 1000) helpCounter = 1000;
            helpCounter++;
            switch (helpCounter) //@formatter:off
            {
                case 1001: return "Ship center has crossed the boundary: GAME OVER";
                case 1002: return "Press 0 to restart tutorial";
                default:
                    helpCounter = 1001;
                    return "Press 1 to advance to level 1";
            } //@formatter:on
        }

        let ship = shipList[shipList.length - 1];
        if (helpCounter < 99)
        {
            helpCounter++;
            switch (helpCounter) //@formatter:off
            {
                case 1: return ":.:.: Level 0 :.:.: The Tutorial";
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
                    if (shipSpeedX >= 56) return "560 m/s! Time to turn around and slow down.";

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
                    if (shipSpeedX == 1 && gameTime == 1)
                    {
                        return "^_^ Notice \"Time\"=1 and \"Linear Speed\"=10 m/s. You are moving!";
                    }
                    if (gameTime == 2)
                    {
                        return "Goal: Pilot ship through the 3 gates in under 150 time-steps.";
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
                    if (ship.heading >= 45)
                    {
                        return "Ship now has a clockwise angular speed of " + shipAngularSpeed + "°/time-step.";
                    }
                    helpCounter = 7;
                    if (shipState & ShipStateEnum.BACK)
                    {
                        if (ship.heading == 0) return "Time to turn around. Turn off Main Thruster (W).";
                        return "Press W to toggle off Main Thruster.";
                    }

                    if (ship.heading < 40)
                    {
                        if (!(shipState & ShipStateEnum.CLOCKWISE))
                        {
                            return "Press D to toggle Clockwise Thruster."
                        }
                        if (ship.heading > 0)
                        {
                            return "Press *spacebar*, further increasing angular velocity.";
                        }
                        return "Press *spacebar* to apply clockwise thrust."
                    }
                case 9:
                    if (ship.heading >= 165)
                    {
                        return "With a forward direction of 165°, it is time for counterclockwise thrust.";
                    }
                    helpCounter = 8;
                    if (shipState & ShipStateEnum.BACK) return "Press W to toggle off Main Thruster.";

                    return "Press *spacebar* until ship\'s forward direction is 165°.";
                case 10:
                    if (ship.heading >= 180)
                    {
                        return "Ready Main Thrusters for deceleration!";
                    }
                    helpCounter = 9;
                    if (shipState & ShipStateEnum.BACK) return "Press W to toggle off Main Thruster.";

                    if (!(shipState & ShipStateEnum.COUNTERCLOCKWISE))
                    {
                            return "Press A to toggle Counterclockwise Thruster."
                    }
                    return "Press *spacebar* to apply counterclockwise thrust."
                case 11: return "Stopping now takes equal and opposite thrust for 56 time-steps!";
                case 12: return "Your ship has just enough space to stop before ...";
                case 13: return "... its center crosses the boundary pentagon.";
                case 14:
                    if (shipSpeedX <= 3)
                    {
                        return "Coolio. Ready for the last gate?";
                    }
                    helpCounter = 13;
                    if (!(shipState & ShipStateEnum.BACK))
                    {
                        return "Press W to toggle Main Thruster on.";
                    }
                    return "Press or Hold down *spacebar* to until ship comes to rest."
                default:

            } //@formatter:on
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
        return "";
    }
}