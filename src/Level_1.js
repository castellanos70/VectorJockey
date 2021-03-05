class Level_1
{
    constructor()
    {
        this.hitSpeed400 = false;
    }

    init()
    {
        let ship = new Ship(0, 0, 0, ShipStateEnum.OFF);
        shipList.push(ship);

        gateList.push(new Gate(400, -250, 0, 350, "#00900090"));
        gateList.push(new Gate(3300, 250, 0, 400, "#A0000C90"));
        gateList.push(new Gate(2000, 700, 80, 600, "#d181d990"));
        gateList.push(new Gate(-2000, 1000, 30, 300, "#B8C41490"));
        gateList.push(new Gate(-1200, -2200, 45, 300, "#fd7f0290"));
        gateList.push(new Gate(1200, -1900, 15, 300, "#2832c290"));

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
    }


    clearedGate()
    {
        helpSec = 0;
        if (helpCounter < 8) helpCounter = 8;
        if (gatesCompleted == 1) helpMsg = "Congratulations! You have cleared the first Gate.";
        else if (gatesCompleted == 2) helpMsg = "Two down, Three to go (clear 5 of 6 to finish)";
        else if (gatesCompleted == 3) helpMsg = "(#^.^#) That makes Three!";
        else if (gatesCompleted == 4) helpMsg = "(o|o) BAM! One more.";
        else
        {
            helpMsg = "CONGRATULATIONS! Spaceflight Time-trial Completed.";
            gameState = GameStateEnum.WIN;
        }
    }

    getNextHelpMsg()
    {
        if (gameState === GameStateEnum.LOST) return "GAME OVER";

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
            case 1: return "Vector Jockey: *** Level 1 ***";
            case 2: return "Goal: Pilot ship through your choice of 5 gates ...";
            case 3: return "... in less time-steps than any competitor.";
            case 4: return "Be careful not to build up too much speed:";
            case 5: return "Crossing the boundary, the Purple Pentagon, is GAME OVER.";
            case 6: return "Newton\'s 1st law of motion is often stated as:";
            case 7: return "An object at rest stays at rest";
            case 8: return "and an object in motion stays in motion ";
            case 9: return "with the same speed and same direction";
            case 10: return "... unless ...";
            case 11: return "... unless acted upon by an unbalanced force.";
            case 12: return "Cars turn & break using friction between tires & road.";
            case 13: return "Airplanes turn & break using ailerons & rudders pushing on air.";
            case 14: return "In empty space, there is nothing to push on.";
            case 15: return "                                            ";
            case 16: return "Your ship uses Newton\'s 3rd Law:";
            case 17: return "Any force of one object on another ...";
            case 18: return "... is paired with an equal and opposite force, ...";
            case 19: return "... equal in magnitude and opposite in direction, ...";
            case 20: return "... of the other on the first.";
            case 21: return "A basketball player jumps, ...";
            case 22: return "... pushing on the Earth and the Earth pushes back.";
            case 23: return "In the air, the Earth pulls the jumper with the force of gravity."
            case 24: return "The jumper pulls the Earth with equal & opposite gravitational force.";
            case 25: return "Newton\'s 2nd law, F=ma, says the jumper gets more acceleration.";
            case 26: return "(＠_＠;)";
            case 27: return "If a B\'-ball player jumped off the side of a small spacecraft ... ";
            case 28: return "... the spacecraft would move measurably in the opposite direction.";
            case 29: return "A rocket fires low mass particles at super high velocity.";
            case 30: return "The fast particles accelerate the rocket in the opposite direction.";
            case 31: return "                                              ";
            case 32: return "Have fun and may the ma be with you!";
            default:
                let r = Math.random();
                if (r<0.89) return "";
                if (r<0.90) return "Pilot your ship through any 5 of the 6 gates.";
                if (r<0.91) return "Pass 5 gates in less time-steps than any competitor.";
                if (r<0.92) return "Crossing the purple pentagon boundary is GAME OVER.";
                if (r<0.93) return "At any time, press 1 to restart the level.";
                if (r<0.94) return "With main thrust off, ship will \'coast\' along the thin azure line.";
                if (r<0.95) return "When the azure line crosses a gate, you\'re golden: just coast!";
                if (r<0.96) return "Ship forward direction had no effect on direction of motion.";
                if (r<0.97) return "Rotational thrusters have no effect on direction of motion.";
                if (r<0.975) return "¸.·´¯`·.´¯`·.¸¸.·´¯`·.¸><(((º>";
                if (r<0.98) return "F = ma";
                if (r<0.985) return "Force = mass ✕ acceleration";
                if (r<0.99) return "A body remains in motion in a straight line unless acted upon by a force.";
                if (r<0.995) return "Every action produces an equal and opposite reaction.";
                return "All forces occur in pairs: equal in magnitude and opposite in direction.";
        } //@formatter:on
        return "";
    }
}