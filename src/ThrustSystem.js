var thrustSystemMain;
var thrustSystemCWF, thrustSystemCWB;
var thrustSystemCCF, thrustSystemCCB;
colorList = ["#C32005AA", "#C43006AA","#D63E06AA", "#ED6414AA",
    "#FA8A22AA", "#FBBC30AA","#FBD43DAA", "#FCEA5AAA",
    "#FBF787AA", "#FCFBC2AA", "#F4FBD0AA", "#FFFFFFAA",
    "#CCAAFFAA", "#DDBBFFAA", "#CCDDFFAA", "#CCDDFFAA"];


class ThrustSystem
{
    constructor(particleCount, height, baseAge)
    {
        let n = particleCount;
        this.height = height;
        this.baseAge = baseAge;
        this.x = new Array(n);
        this.y = new Array(n);
        this.vx = new Array(n);
        this.age = new Array(n);
        this.color = new Array(n);
        for (let i=0; i<n; i++)
        {
            this.respawn(i);
        }
    }

    respawnAll()
    {
        for (let i = 0; i < this.x.length; i++) this.respawn(i);
    }

    respawn(i)
    {
        this.x[i] = 0;
        this.y[i] = (Math.random()*this.height)-this.height/2;
        let minV = -(1 + 10*0 + 2*(0));
        let maxV = -(1 + 10*(1) + 2*(this.height/2-0));
        this.vx[i] = -(1 + 10*Math.random() + 2*(this.height/2-Math.abs(this.y[i])));
        this.age[i] = Math.floor(this.baseAge/2+this.baseAge*Math.random());
        this.color[i] = colorList[Math.floor(colorList.length*(this.vx[i]-minV)/(maxV-minV))];
    }

    render(ship, dx, dy, theta)
    {
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        let x = (offsetX+ship.x)*zoomScale;
        let y = (offsetY+ship.y)*zoomScale;

        ctx.translate(x, y);
        ctx.rotate(ship.heading*DEGREES_TO_RAD);
        ctx.translate(dx*zoomScale, dy*zoomScale);
        if (theta) ctx.rotate(theta*DEGREES_TO_RAD);

        let m = 0.5*this.x.length;
        for (let i=0; i<this.x.length; i++)
        {
            this.x[i] += this.vx[i];
            this.age[i]--;
            ctx.fillStyle = this.color[i];
            if (i<m) ctx.fillRect(this.x[i], this.y[i]-1, 3, 3);
            else ctx.fillRect(this.x[i], this.y[i], 1, 1);
            if (this.age[i] <= 0) this.respawn(i);
        }
    }
}