const Spin = {CLOCKWISE:1, COUNTERCLOCKWISE:-1, NOSPIN:0}

function mod (x,y) { return (x%y+y)%y }

class Ship
{
    constructor(loc, heading, forwardThrust, thrust)
    {
        this.loc = loc;
        this.heading = heading;
        this.forwardThrust = forwardThrust // bool
        this.spinThrust= Spin.NOSPIN
        this.angularSpeed = 0 // in degrees per pulse
        this.speedX = 0
        this.speedY = 0
        // Shared between all ships as a memory optimization, though not perfectly accurate
        this.thrust = thrust
    }

    clone() {
       let ship = new Ship(new Coord(this.loc.x,this.loc.y),
                           this.heading,this.forwardThrust, this.thrust)
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
          if (spin * this.angularSpeed >=15) return false
          this.spinThrust = spin
          this.thrust.respawnSideThrust()
       }
       return true 
    }

    isMoving ()
    {
       return this.speedX>0 || this.speedY>0 || this.angularSpeed>0 
         || this.forwardThrust || this.spinThrust != Spin.NOSPIN
    }

    computeNewSpeed() 
    {
       if (this.forwardThrust) {
          this.speedX += Math.cos(this.heading * DEGREES_TO_RAD)
          this.speedY += Math.sin(this.heading * DEGREES_TO_RAD)
       }
       this.angularSpeed = Math.min(15,Math.max(-15,this.angularSpeed + 5 * this.spinThrust))
    }

    computeNewPos()
    {
       if (Math.abs(this.speedX) < 0.0001) this.speedX = 0;
       if (Math.abs(this.speedY) < 0.0001) this.speedY = 0;
       if (Math.abs(this.angularSpeed) < 4) this.angularSpeed = 0;
       this.loc.x = this.loc.x + this.speedX;
       this.loc.y = this.loc.y + this.speedY;
       this.heading = this.heading + this.angularSpeed;
    }

    isOutside (stations)
    {
       return this.loc.cross(stations) > 0 ? stations : null
    }

    getAngleOneDegreeToGoal(angle, goal)
    {
       if (Math.abs(angle - goal) < 1.1) return goal 
       return angle + Math.sign(mod(angle-goal,360) - 180)
    }

    // return true for back inside of beams
    tractor()
    {
        this.speedX *= 0.95;
        this.speedY *= 0.95;
        this.angularSpeed *= 0.9;

        this.heading = this.getAngleOneDegreeToGoal(this.heading, tractorBeamHeadingGoal);

        if (Math.abs(this.speedX) < 1) this.speedX = 0;
        if (Math.abs(this.speedY) < 1) this.speedY = 0;
        if (Math.abs(this.angularSpeed) < 1) this.angularSpeed = 0;

        if ((this.speedX !== 0) || (this.speedY !== 0) || (this.angularSpeed !== 0) || (this.heading !== tractorBeamHeadingGoal))
           return false 
        this.loc.x += 2.0 * Math.cos(this.heading * DEGREES_TO_RAD);
        this.loc.y += 2.0 * Math.sin(this.heading * DEGREES_TO_RAD);
        return this.isOutside(tractorBeamNodes) == null
    }

    render(sprite)
    {
       ctx.setTransform(1, 0, 0, 1, 0, 0);
       ctx.scale(zoomScale, zoomScale);
       ctx.translate(offsetX+this.loc.x, offsetY+this.loc.y);
       ctx.rotate(this.heading*DEGREES_TO_RAD)
       ctx.drawImage(sprite,-shipImage.width/2, -shipImage.height/2);
    }

    renderMotionVector()
    {
       ctx.setTransform(1, 0, 0, 1, 0, 0);
       ctx.beginPath();
       ctx.lineWidth = 1;
       let x0 = (offsetX + this.loc.x) * zoomScale;
       let y0 = (offsetY + this.loc.y) * zoomScale;
       ctx.moveTo(x0, y0);
       ctx.lineTo(x0 + (maxX - minX) * this.speedX * zoomScale, y0 + (maxY - minY) * this.speedY * zoomScale);
       ctx.strokeStyle = colorAzure;
       ctx.stroke();

       let counterclockwise = false;
       if (this.angularSpeed < 0) counterclockwise = true;
       let radius = 150 * zoomScale;
       let startAngle = this.heading * DEGREES_TO_RAD;
       let endAngle = (this.heading + this.angularSpeed * 15) * DEGREES_TO_RAD;
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
