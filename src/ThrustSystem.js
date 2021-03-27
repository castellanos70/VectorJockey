var thrustSystemMain;
var thrustSystemCWF, thrustSystemCWB;
var thrustSystemCCF, thrustSystemCCB;
colorList = ["#C32005AA", "#C43006AA","#D63E06AA", "#ED6414AA",
    "#FA8A22AA", "#FBBC30AA","#FBD43DAA", "#FCEA5AAA",
    "#FBF787AA", "#FCFBC2AA", "#F4FBD0AA", "#FFFFFFAA",
    "#CCAAFFAA", "#DDBBFFAA", "#CCDDFFAA", "#CCDDFFAA"];


class Particle
{
    constructor(pixelSize) {
        this.pixelSize = pixelSize
    }

    respawn(height,baseAge)
    {
        this.x = 0;
        this.y = (Math.random() * height) - height / 2;
        let minV = -(1 + 10 * 0 + 2 * (0));
        let maxV = -(1 + 10 * (1) + 2 * (height / 2 - 0));
        this.vx = -(1 + 10 * Math.random() + 2 * (height / 2 - Math.abs(this.y)));
        this.age = Math.floor(baseAge / 2 + baseAge * Math.random());
        this.color = colorList[Math.floor(colorList.length * (this.vx - minV) / (maxV - minV))];
    }

    render(height, baseAge)
    {
        this.x += this.vx;
        this.age--;
        ctx.fillStyle = this.color;
        if (brighter) ctx.fillRect(this.x, this.y - 1, 3, 3);
        else ctx.fillRect(this.x, this.y, 1, 1);
        if (this.age <= 0) this.respawn(height, baseAge);
    }
}

class ThrustSystem
{
    constructor(particleCount, height, baseAge)
    {
        let n = Math.floor(particleCount/2);
        this.height = height;
        this.baseAge = baseAge;
        this.particles = (new Array(n).fill(new Particle(3)))
                  .concat(new Array(n).fill(new Particle(1)))
        this.particles.forEach(particle=>particle.respawn(this.height, this.baseAge))
    }


    render(ship, dx, dy, theta, applyZoom)
    {
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        if (applyZoom)
        {
            ctx.scale(zoomScale, zoomScale);
            ctx.translate(offsetX+ship.loc.x, offsetY+ship.loc.y);
            ctx.rotate(ship.heading*DEGREES_TO_RAD);
            ctx.translate(dx, dy);
        }
        else
        {
            let x = (offsetX + ship.loc.x) * zoomScale;
            let y = (offsetY + ship.loc.y) * zoomScale;
            ctx.translate(x, y);
            ctx.rotate(ship.heading*DEGREES_TO_RAD);
            ctx.translate(dx*zoomScale, dy*zoomScale);
        }
        if (theta) ctx.rotate(theta*DEGREES_TO_RAD);
        this.particles.forEach(particle=>particle.render(this.height,this.baseAge))
    }
}

class ThrustSystems {
   constructor () 
   {
      this.respawnMainThrust();
      this.respawnSideThrust();
   }
   respawnMainThrust() 
   {
      this.thrustSystemMain = new ThrustSystem(900, 11, 10);
   }

   respawnSideThrust() 
   {
      this.thrustSystemCWB = new ThrustSystem(150, 2, 3);
      this.thrustSystemCWF = new ThrustSystem(150, 2, 3);
   }

}
