class Level_1
{
    constructor()
    {
    }

    init()
    {
        minX = -3000;
        maxX = 3000;
        minY = -3000;
        maxY = 3000;

        let ship = new Ship(new Coord(0, 0), 0, false, thrusts);
        shipList.push(ship);

        gateList.push(new Gate(500, -200, 80, 600, "#B8C41490"));
        gateList.push(new Gate(-500, -350, 0, 350, "#00900090"));
        gateList.push(new Gate(800, -300, 165, 400, "#A0000C90"));
        gateList.push(new Gate(-700, 400, 45, 600, "#d181d990"));
        gateList.push(new Gate(100, 700, 165, 500, "#fd7f0290"));

        let lastStation;
        for (let k = 0; k < 5; k++)
        {
            let x = maxX * Math.cos(k * 2.0 * Math.PI / 5.0);
            let y = maxY * Math.sin(k * 2.0 * Math.PI / 5.0);

            let station = new Station(new Coord(x,y));
            stationList.push(station)
            if (k>0) boundaryList.push([lastStation, station])
            lastStation = station
        }
        boundaryList.push([lastStation, stationList[0]])
    }

    clearedGate()
    {
        infoSec = 0;
        if (helpCounter < 8) helpCounter = 8;
        if (gatesCompleted == 1) infoMsg = "First Gate Cleared! \\,,/(^_^)\\,,/";
        else if (gatesCompleted == 2) infoMsg = "Second Gate Cleared!  --~~~=:>[XXXXXXXXX]>";
        else if (gatesCompleted == 3) infoMsg = "Third Gate Cleared! ¸.·´¯`·.´¯`·.¸¸.·´¯`·.¸><(((º>";
        else if (gatesCompleted == 4) infoMsg = "(<>..<>)  Forth Gate Cleared!  (<>..<>)"
        else
        {
            infoMsg = "CONGRATULATIONS! Spaceflight Time-trial Completed.";
            infoSec = 0;
            isShipFullHistory = true;
            gameState = GameStateEnum.WIN;
            helpCounter = 1;
        }
    }

    getNextHelpMsg(ship)
    {
        if (gameTime === 1 && ship && ship.speedX === 1)
            return "You\'re Moving!!!        Notice Time = 1.        Notice Linear Speed = 10 meters/second.";
        if (gameTime === 2 && ship && ship.speedX === 2)
            return "You\'re advanced time twice.     Notice Time = 2.        Notice Linear Speed = 20 meters/second.";

        if (gameState === GameStateEnum.WIN)
        {
            if (helpCounter === 1)
            {
                helpCounter++;
                if (isShipFullHistory) return "Press H to show Ghost Ship of Actions Past.";
                return "Press H to show history tail";
            }
            let r = Math.random();
            if (r < 0.8) return "Press 2 to start Level 2";
            return "Press 1 to restart Level 1.";
        }


        helpCounter++;
        switch(helpCounter)
        {   //@formatter:off
            case 1: return "Vector Jockey >>========> Level 1: Delta-V, par 275";
            case 2: case 3: case 4:
                return "Goal: Pilot ship through all of 5 gates in less time-steps than any competitor.";
            case 5: case 6: case 7:
                if (ship && ship.speedX !== 0) return "Long thin Azure line shows the path your ship will take if time is advanced with thruster off.";
            case 8: return "                                                                ";
            default:
                let r = Math.random();
                if (r<0.91) return "";
                if (r<0.92)
                {
                    if (isShipFullHistory) return "Press H toggle Ghost Ship of Actions Past.";
                    return "Press H toggle Trail of History.";
                }
                if (r<0.93) return "Goal: Pass the 5 gates in less time-steps than any competitor.";
                if (r<0.94) return "At any time, press C to hide/show commands.";
                if (r<0.95) return "At any time, press 1 to restart the level.";
                if (r<0.96) return "With main thrust off, ship will \'coast\' along the thin azure line.";
                if (r<0.97) return "When the azure line crosses a gate, you\'re golden: just coast!";
                if (r<0.98) return "Ship forward direction had no effect on direction of motion.";
                if (r<0.99) return "Rotational thrusters do not change the ship\'s direction of motion.";
                return "";
        } //@formatter:on
    }
}
