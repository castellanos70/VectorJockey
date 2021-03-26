class Ship
{
    constructor(loc, heading, state, thrust)
    {
        this.loc = loc;
        this.heading = heading;
        this.state = state;
        // Shared between all ships as a memory optimization, though not perfectly accurate
        this.thrust = thrust
    }

    isOutside (stations)
    {
       return this.loc.cross(stations) > 0 ? stations : null
    }

    render()
    {
       ctx.setTransform(1, 0, 0, 1, 0, 0);
       ctx.scale(zoomScale, zoomScale);
       ctx.translate(offsetX+this.loc.x, offsetY+this.loc.y);
       ctx.rotate(this.heading*DEGREES_TO_RAD)
       ctx.drawImage(shipImage,-shipImage.width/2, -shipImage.height/2);
    }

    renderMotionVector()
    {
       ctx.setTransform(1, 0, 0, 1, 0, 0);
       ctx.beginPath();
       ctx.lineWidth = 1;
       let x0 = (offsetX + this.loc.x) * zoomScale;
       let y0 = (offsetY + this.loc.y) * zoomScale;
       ctx.moveTo(x0, y0);
       ctx.lineTo(x0 + (maxX - minX) * shipSpeedX * zoomScale, y0 + (maxY - minY) * shipSpeedY * zoomScale);
       ctx.strokeStyle = colorAzure;
       ctx.stroke();

       let counterclockwise = false;
       if (shipAngularSpeed < 0) counterclockwise = true;
       let radius = 150 * zoomScale;
       let startAngle = this.heading * DEGREES_TO_RAD;
       let endAngle = (this.heading + shipAngularSpeed * 15) * DEGREES_TO_RAD;
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

    renderThrust(ShipStateEnum)
    {
       if (this.state & ShipStateEnum.BACK)
       {
          this.thrust.thrustSystemMain.render(this, -(shipImage.width-4)/2, 0);
       }

       if (this.state & ShipStateEnum.CLOCKWISE)
       {
          this.thrust.thrustSystemCWB.render(this, -28, 30, -90);
          this.thrust.thrustSystemCWF.render(this, 39, -23, 90);
       }
       if (this.state & ShipStateEnum.COUNTERCLOCKWISE)
       {
          this.thrust.thrustSystemCWB.render(this, -27, -30, 90);
          this.thrust.thrustSystemCWF.render(this, 39, 23, -90);
       }
    }
}

