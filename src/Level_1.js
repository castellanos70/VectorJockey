class Level_1
{
    constructor()
    {
        this.hitSpeed400 = false;
    }

    init()
    {
        minX = -3000;
        maxX = 3000;
        minY = -3000;
        maxY = 3000;

        let ship = new Ship(0, 0, 0, ShipStateEnum.BACK);
        shipList.push(ship);

        gateList.push(new Gate(500, -200, 80, 600, "#B8C41490"));
        gateList.push(new Gate(-500, -350, 0, 350, "#00900090"));
        gateList.push(new Gate(800, -300, 165, 400, "#A0000C90"));
        gateList.push(new Gate(-700, 400, 45, 600, "#d181d990"));
        gateList.push(new Gate(100, 700, 165, 500, "#fd7f0290"));

        for (let k = 0; k < 5; k++)
        {
            let x = maxX * Math.cos(k * 2.0 * Math.PI / 5.0);
            let y = maxY * Math.sin(k * 2.0 * Math.PI / 5.0);

            let edgeType = StationEdgeTypeEnum.UPPER;
            if (k === 0 || k === 1) edgeType = StationEdgeTypeEnum.LOWER;
            else if (k === 2) edgeType = StationEdgeTypeEnum.VERTICAL_LEFT;
            stationList.push(new Station(k, x, y, edgeType));
        }

        //Uses neighbor in calculation so must be done after list is fully constructed.
        for (const station of stationList)
        {
            station.calculateLine();
        }
    }

    clearedGate()
    {
        helpSec = 0;
        if (helpCounter < 8) helpCounter = 8;
        if (gatesCompleted == 1) helpMsg = "First Gate Cleared! \\,,/(^_^)\\,,/";
        else if (gatesCompleted == 2) helpMsg = "Second Gate Cleared!  --~~~=:>[XXXXXXXXX]>";
        else if (gatesCompleted == 3) helpMsg = "Third Gate Cleared! ¸.·´¯`·.´¯`·.¸¸.·´¯`·.¸><(((º>";
        else if (gatesCompleted == 4) helpMsg = "(<>..<>)  Forth Gate Cleared!  (<>..<>)"
        else
        {
            helpMsg = "CONGRATULATIONS! Spaceflight Time-trial Completed.";
            helpSec = 0;
            isShipFullHistory = true;
            gameState = GameStateEnum.WIN;
        }
    }

    getNextHelpMsg()
    {
        if (gameState === GameStateEnum.WIN)
        {
            let r = Math.random();
            if (r < 0.8) return "Press 2 to start Level 2";
            return "Press 1 to restart Level 1.";
        }

        if ((gatesCompleted < 4) && (!this.hitSpeed400))
        {
            let speed = Math.sqrt(shipSpeedX * shipSpeedX + shipSpeedY * shipSpeedY) * 10.0;
            if (speed > 400)
            {
                this.hitSpeed400 = true;
                return "!!!Danger Will Robinson!!! your speed is above 400 m/s!";
            }
        }

        helpCounter++;
        switch(helpCounter)
        {   //@formatter:off
            case 1: return "Vector Jockey >>------> Level 1";
            case 2: return "Goal: Pilot ship through all of 5 gates ...";
            case 3: return "... in less time-steps than any competitor.";
            case 4: return "                                                                ";
            default:
                let r = Math.random();
                if (r<0.90) return "";
                if (r<0.91) return "Goal: Pilot ship through all of 5 gates";
                if (r<0.92) return "Pass the 5 gates in less time-steps than any competitor.";
                if (r<0.93) return "At any time, press C to hide/show commands.";
                if (r<0.94) return "Press H to toggle Ship Path History vs Animation."
                if (r<0.95) return "At any time, press 1 to restart the level.";
                if (r<0.96) return "With main thrust off, ship will \'coast\' along the thin azure line.";
                if (r<0.97) return "When the azure line crosses a gate, you\'re golden: just coast!";
                if (r<0.98) return "Ship forward direction had no effect on direction of motion.";
                if (r<0.99) return "Rotational thrusters do not change the ship\'s direction of motion.";
                return "";
        } //@formatter:on
    }
}