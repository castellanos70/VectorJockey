class Level_2
{
    constructor()
    {
    }

    init()
    {
        minX = -5000;
        maxX = 5000;
        minY = -5000;
        maxY = 5000;
        let ship = new Ship(0, 0, 0, ShipStateEnum.OFF);
        shipList.push(ship);

        gateList.push(new Gate(0, -250, 0, 600, "#00900090"));
        gateList.push(new Gate(2400, 750, 0, 400, "#A0000C90"));
        gateList.push(new Gate(800, 2100, 80, 600, "#d181d990"));
        gateList.push(new Gate(-2000, 1000, 30, 400, "#B8C41490"));
        gateList.push(new Gate(-1200, -2200, 165, 500, "#fd7f0290"));
        gateList.push(new Gate(1200, -1900, 50, 500, "#2832c290"));

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
        infoSec = 0;
        if (helpCounter < 8) helpCounter = 8;
        if (gatesCompleted == 1) infoMsg = "o()xxxx[{::::::::::::::::> You have cleared the first Gate.";
        else if (gatesCompleted == 2) infoMsg = "Two down, Three to go (clear 5 of 6 to finish)";
        else if (gatesCompleted == 3) infoMsg = "(#^.^#) That makes Three! @)}---^-----";
        else if (gatesCompleted == 4) infoMsg = "One gate to go.";
        else
        {
            infoMsg = "(o|o) Shuwatch! Level 2 Spaceflight Time-trial Completed.";
            infoSec = 0;
            isShipFullHistory = true;
            gameState = GameStateEnum.WIN;
        }
    }

    getNextHelpMsg()
    {
        helpCounter++;
        switch(helpCounter)
        {   //@formatter:off
            case 1: return "Vector Jockey ::....::....::....::....::  Level 2  ::....::....::....::....:: (par 450)";
            case 2: case 3:
                return "Goal: Pilot your ship through any 5 of the 6 gates in less time-steps than any competitor.";
            case 4: return "                                                                ";
            case 5: return "At any time, press C to hide/show commands.";
            case 6: return "                                                                ";
            case 102: return "Newton\'s 1st law of motion is often stated as:";
            case 103: return "An object at rest stays at rest";
            case 104: return "and an object in motion stays in motion with the same speed and same direction ...";
            case 105: return "... unless acted upon by an unbalanced force.";
            case 106: return "Cars turn & break using friction between tires & road.";
            case 107: return "Airplanes turn & break using ailerons & rudders pushing on air.";
            case 108: return "In empty space, there is nothing to push on.";
            case 109: return "                                                               ";
            case 200: return "Your ship uses Newton\'s 3rd Law:";
            case 201: return "Any force of one object on another is paired with an equal and opposite force, ...";
            case 203: return "... equal in magnitude and opposite in direction, of the other on the first.";
            case 205: return "A basketball player jumps, ...";
            case 206: return "... pushing on the Earth and the Earth pushes back.";
            case 207: return "In the air, the Earth pulls the jumper with the force of gravity."
            case 208: return "The jumper pulls the Earth with equal & opposite gravitational force.";
            case 209: return "Newton\'s 2nd law, F=ma, says the jumper gets more acceleration.";
            case 210: return "¯\\(°_o)/¯";
            case 211: return "If a B\'-ball player jumped off the side of a small spacecraft ... ";
            case 212: return "... the spacecraft would move measurably in the opposite direction.";
            case 213: return "A rocket fires low mass particles at super high velocity.";
            case 214: return "The fast particles accelerate the rocket in the opposite direction.";
            case 215: return "                                                                   ";

            default:
                let r = Math.random();
                if (r<0.87) return "";
                if (r<0.88) return "Pilot your ship through any 5 of the 6 gates.";
                if (r<0.89) return "Pass 5 gates in less time-steps than any competitor.";
                if (r<0.90)
                {
                    if (isShipFullHistory) return "Press H toggle Ghost Ship of Actions Past.";
                    return "Press H toggle Trail of History.";
                }
                if (r<0.91) return "Press 2 to restart level 2.";
                if (r<0.92) return "Press 1 to restart level 1.";
                if (r<0.93) { infoMsg=99; return "";}
                if (r<0.94) return "¸.·´¯`·.´¯`·.¸¸.·´¯`·.¸><(((º>";
                if (r<0.95) return "F = ma";
                if (r<0.96) return "Force = mass × acceleration";
                if (r<0.97) return "A body remains in motion in a straight line unless acted upon by a force.";
                if (r<0.98) return "Every action produces an equal and opposite reaction.";
                if (r<0.99) return "All forces occur in pairs: equal in magnitude and opposite in direction.";
                return "May the ma be with you!";
        } //@formatter:on
    }
}