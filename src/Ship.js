const Spin = {CLOCKWISE:1, COUNTERCLOCKWISE:-1, NOSPIN:0}

var count =0

function mod (x,y) { return (x%y+y)%y }

class Ship
{
    constructor(loc = new Coord(0,0), forwardThrust = false, thrust = thrusts)
    {
        this.loc = loc 
        this.forwardThrust = forwardThrust 
        this.spinThrust= Spin.NOSPIN
        this.angularSpeed = 0 // in radians per pulse
        this.speedX = 0
        this.speedY = 0
       // Shared between all ships as a memory optimization, though not perfectly accurate
        this.thrust = thrust 
    }

    clone() {
       let ship = new Ship(new Coord(this.loc.x,this.loc.y, this.loc.heading),
                           this.forwardThrust, this.thrust)
       ship.speedX = this.speedX
       ship.speedY = this.speedY
       ship.angularSpeed = this.angularSpeed
       return ship
    }

    toggleForwardThrusters()
    {
       this.forwardThrust = ! this.forwardThrust
       if (this.forwardThrust) this.thrust.respawnMainThrust()
    }

    // return false on over range 
    toggleSideThrusters(spin)
    {
       if (this.spinThrust == spin) this.spinThrust=Spin.NOSPIN
       else  {
          if (spin * this.angularSpeed >= DEG_15) return false
          this.spinThrust = spin
          this.thrust.respawnSideThrust()
       }
       return true 
    }

    isMoving ()
    {
       return Math.abs(this.speedX)>0 || Math.abs(this.speedY)>0 || Math.abs(this.angularSpeed)>0 
         || this.forwardThrust || this.spinThrust != Spin.NOSPIN
    }

    computeNewSpeed() 
    {
       if (this.forwardThrust) {
          this.speedX += Math.cos(this.loc.heading)
          this.speedY += Math.sin(this.loc.heading)
       }
       this.angularSpeed = Math.min(DEG_15,Math.max(-DEG_15,this.angularSpeed + DEG_15/3 * this.spinThrust))
    }

    computeNewPos()
    {
       if (Math.abs(this.speedX) < 0.0001) this.speedX = 0;
       if (Math.abs(this.speedY) < 0.0001) this.speedY = 0;
       if (Math.abs(this.angularSpeed) < 4*DEGREES_TO_RAD) this.angularSpeed = 0;
       this.loc.x = this.loc.x + this.speedX;
       this.loc.y = this.loc.y + this.speedY;
       this.loc.heading = this.loc.heading + this.angularSpeed; 
    }

    isOutside (stations)
    {
       return this.loc.cross(stations) > 0 ? stations : null
    }

    getAngleOneDegreeToGoal(angle, goal)
    {
       if (mod(Math.abs(angle - goal), 2*Math.PI) < 1.1 * DEGREES_TO_RAD) return goal 
       return angle + Math.sign(mod(angle-goal,2*Math.PI) - Math.PI) * DEGREES_TO_RAD // i.e. one degree change
    }

    // return true for back inside of beams
    tractor()
    {
        this.speedX *= 0.95;
        this.speedY *= 0.95;
        this.angularSpeed *= 0.9;

        this.loc.heading = this.getAngleOneDegreeToGoal(this.loc.heading, tractorBeamHeadingGoal);

        if (Math.abs(this.speedX) < 1) this.speedX = 0;
        if (Math.abs(this.speedY) < 1) this.speedY = 0;
        if (Math.abs(this.angularSpeed) < 1*DEGREES_TO_RAD) this.angularSpeed = 0;

        if ((this.speedX !== 0) || (this.speedY !== 0) || (this.angularSpeed !== 0) || (this.loc.heading !== tractorBeamHeadingGoal))
           return false 
        this.loc.x += 2.0 * Math.cos(this.loc.heading);
        this.loc.y += 2.0 * Math.sin(this.loc.heading);
        return this.isOutside(tractorBeamNodes) == null
    }

    render(sprite)
    {
       ctx.renderSprite(this.loc, shipImage)
    }


    renderMotionVector()
    {
       ctx.setTransform(1, 0, 0, 1, 0, 0);
       ctx.beginPath();
       ctx.lineWidth = 1;
       let center = this.loc.add(new Coord(offsetX,offsetY))
       let momentumVector = new Coord((maxX - minX) * this.speedX, (maxY - minY) * this.speedY)
       ctx.drawLine(center, 
                    center.add(momentumVector),
                    zoomScale)
       ctx.strokeStyle = colorAzure;
       ctx.stroke();

       let counterclockwise = false;
       if (this.angularSpeed < 0) counterclockwise = true;
       let radius = 150
       let startAngle = this.loc.heading; 
       let endAngle = this.loc.heading + this.angularSpeed * 15
       ctx.beginPath();
       ctx.lineWidth = 3;
       let startArc = new Coord(startAngle)
       ctx.drawLine(center.add(startArc.scale(0.5 * radius)), 
                    center.add(startArc.scale(radius)),
                    zoomScale )
       ctx.stroke(); // ship heading vector 

       ctx.beginPath();
       ctx.arc(center.x * zoomScale, center.y * zoomScale, radius * zoomScale, startAngle, endAngle, counterclockwise);
       ctx.stroke();
    }

    renderThrust(applyZoom)
    {
       if (this.forwardThrust)
       {
          this.thrust.thrustSystemMain.render(this, -(shipImage.width-4)/2, 0, 0, applyZoom);
       }

       if (this.spinThrust == Spin.CLOCKWISE)
       {
          this.thrust.thrustSystemCWB.render(this, -28, 30, -90, applyZoom);
          this.thrust.thrustSystemCWF.render(this, 39, -23, 90, applyZoom);
       }
       if (this.spinThrust == Spin.COUNTERCLOCKWISE)
       {
          this.thrust.thrustSystemCWB.render(this, -27, -30, 90, applyZoom);
          this.thrust.thrustSystemCWF.render(this, 39, 23, -90, applyZoom);
       }
    }
}
