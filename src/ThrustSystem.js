var thrustSystemMain;
var thrustSystemCWF, thrustSystemCWB;
var thrustSystemCCF, thrustSystemCCB;
colorList = ["#C32005AA", "#C43006AA","#D63E06AA", "#ED6414AA",
    "#FA8A22AA", "#FBBC30AA","#FBD43DAA", "#FCEA5AAA",
    "#FBF787AA", "#FCFBC2AA", "#F4FBD0AA", "#FFFFFFAA",
    "#CCAAFFAA", "#DDBBFFAA", "#CCDDFFAA", "#CCDDFFAA"];

class ParticleShape
{
   constructor(pixelSize, height, baseAge)
   {
       this.pixelSize = pixelSize
       this.height = height
       this.baseAge = baseAge
   }
}

class Particle
{
    constructor(shape) {
        this.shape = shape
    }

    respawn()
    {
        let height = this.shape.height
        this.x = 0;
        this.y = (Math.random()*height)-height/2;
        let minV = -(1 + 10*0 + 2*(0));
        let maxV = -(1 + 10*(1) + 2*(height/2-0));
        this.vx = -(1 + 10*Math.random() + 2*(height/2-Math.abs(this.y)));
        this.age = Math.floor(this.shape.baseAge*(Math.random() + 0.5));
        this.color = colorList[Math.floor(colorList.length*(this.vx-minV)/(maxV-minV))];
    }

    render( )
    {
        this.x += this.vx;
        this.age--;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y-1, this.shape.pixelSize, this.shape.pixelSize)
        if (this.age <= 0) this.respawn();
   }
}

class ThrustSystem
{
    constructor(particleCount, height, baseAge)
    {
        let n = Math.floor(particleCount/2);
        // separate object to share and save space
        let brightShape = new ParticleShape(3, height, baseAge)
        let dimShape = new ParticleShape(1, height, baseAge)
        this.particles = (new Array(n).fill(new Particle(brightShape)))
                  .concat(new Array(n).fill(new Particle(dimShape)))
        this.particles.forEach(particle=>particle.respawn())
    }


    render(ship, dx, dy, theta, applyZoom)
    {
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        if (applyZoom)
        {
            ctx.scale(zoomScale, zoomScale);
            ctx.translate(offsetX+ship.loc.x, offsetY+ship.loc.y);
            ctx.rotate(ship.loc.heading);
            ctx.translate(dx, dy);
        }
        else
        {
            let x = (offsetX + ship.loc.x) * zoomScale;
            let y = (offsetY + ship.loc.y) * zoomScale;
            ctx.translate(x, y);
            ctx.rotate(ship.loc.heading);
            ctx.translate(dx*zoomScale, dy*zoomScale);
        }
        if (theta) ctx.rotate(theta*DEGREES_TO_RAD);
        this.particles.forEach(particle=>particle.render())
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
