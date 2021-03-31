class Gate
{   //Note: assumes no gate is perfectly vertical (dx = 0)
    constructor(x, y, heading, distance, color)
    {
        this.MAX_DISTANCE_FROM_LINE = 30;
        this.LOCK_DISTANCE = distance/4.0;
        this.x = x;
        this.y = y;
        this.distance = distance;
        this.state = GateStateEnum.ON;
        this.color = color;
        let rheading = heading * DEGREES_TO_RAD
        let dx = Math.round(0.5*distance*Math.cos(rheading));
        let dy = Math.round(0.5*distance*Math.sin(rheading));
        this.left = new Coord(x-dx, y-dy, rheading )
        this.right = new Coord(x+dx, y+dy, rheading + Math.PI)

        this.slope = dy/dx;
        this.yIntercept = y - this.slope*x;

        this.nodeCount = 25;
        this.nodeX = new Array(this.nodeCount);
        this.nodeY = new Array(this.nodeCount);
        this.nodeVx = new Array(this.nodeCount);
        this.nodeVy = new Array(this.nodeCount);
        this.goal = new Array(this.nodeCount);
        for (let i = 0; i < this.nodeCount; i++)
        {
            this.nodeX[i] = randomInt(this.right.x - this.left.x) + this.left.x;
            this.nodeY[i] = this.slope * this.nodeX[i] + this.yIntercept;
            this.nodeVx[i] = this.getRandomSpeed();
            this.nodeVy[i] = this.getRandomSpeed();
            this.goal[i] = undefined;
        }
    }

    getRandomSpeed(sign = 0)
    {
        let speed = Math.random()-0.5;
        if (Math.abs(speed) < 0.05)
        {
            if (speed < 0) speed = -0.05;
            else speed = 0.05;
        }
        if (sign > 0) return Math.abs(speed);
        if (sign < 0) return -Math.abs(speed);
        return speed;
    }

    render()
    {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;

        if (this.state == GateStateEnum.START_BREAKING)
        {
            for (let i=0; i<this.nodeCount; i++)
            {
                let diffToX1 = this.left.x - this.nodeX[i];
                let diffToX2 = this.right.x - this.nodeX[i];
                let diffToY1 = this.left.y - this.nodeY[i];
                let diffToY2 = this.right.y - this.nodeY[i];
                let distTo1 = Math.sqrt(diffToX1 * diffToX1 + diffToY1 * diffToY1);
                let distTo2 = Math.sqrt(diffToX2 * diffToX2 + diffToY2 * diffToY2);
                if (distTo1 < distTo2)
                {
                    this.goal[i] = 1;
                    this.nodeVx[i] = .5 * (diffToX1) / distTo1;
                    this.nodeVy[i] = .5 * (diffToY1) / distTo1;
                }
                else
                {
                    this.goal[i] = 2;
                    this.nodeVx[i] = .5 * (diffToX2) / distTo2;
                    this.nodeVy[i] = .5 * (diffToY2) / distTo2;
                }

            }
            this.state = GateStateEnum.BREAKING;
        }

        if (this.state == GateStateEnum.BREAKING)
        {
            let done = true;
            for (let i=0; i<this.nodeCount; i++)
            {
                if (this.goal[i] !== undefined)
                {
                    this.nodeX[i] += this.nodeVx[i];
                    this.nodeY[i] += this.nodeVy[i];
                    ctx.beginPath();
                    ctx.arc(this.nodeX[i], this.nodeY[i], 3, 0, PI2);
                    ctx.fill();

                    if (this.goal[i] === 1)
                    {
                        let dx = Math.abs(this.left.x - this.nodeX[i]);
                        let dy = Math.abs(this.left.y - this.nodeY[i]);
                        if (dx < 20 && dy < 20) this.goal[i] = undefined;
                        else
                        {
                            done = false;
                            ctx.beginPath();
                            ctx.moveTo(this.left.x, this.left.y);
                            ctx.lineTo(this.nodeX[i], this.nodeY[i]);
                            ctx.stroke();
                        }
                    }
                    else if (this.goal[i] === 2)
                    {
                        let dx = Math.abs(this.right.x - this.nodeX[i]);
                        let dy = Math.abs(this.right.y - this.nodeY[i]);
                        if (dx < 20 && dy < 20) this.goal[i] = undefined;
                        else
                        {
                            done = false;
                            ctx.beginPath();
                            ctx.moveTo(this.right.x, this.right.y);
                            ctx.lineTo(this.nodeX[i], this.nodeY[i]);
                            ctx.stroke();
                        }
                    }
                }
            }
            if (done) this.state = GateStateEnum.OFF;
            return;
        }

        let nearestTo_1 = 0;
        let nearestTo_2 = 0;
        let nearestDistTo_1 = Number.MAX_SAFE_INTEGER;
        let nearestDistTo_2 = Number.MAX_SAFE_INTEGER;


        for (let i=0; i<this.nodeCount; i++)
        {
            ctx.beginPath();
            ctx.arc(this.nodeX[i], this.nodeY[i], 3, 0, PI2);
            ctx.fill();
            this.nodeX[i] += this.nodeVx[i];
            this.nodeY[i] += this.nodeVy[i];

            let diffToX1 = this.left.x-this.nodeX[i];
            let diffToX2 = this.right.x-this.nodeX[i];
            let diffToY1 = this.left.y-this.nodeY[i];
            let diffToY2 = this.right.y-this.nodeY[i];

            let distTo1 = Math.sqrt(diffToX1*diffToX1 + diffToY1*diffToY1);
            let distTo2 = Math.sqrt(diffToX2*diffToX2 + diffToY2*diffToY2);

            if (distTo1 < nearestDistTo_1)
            {
                nearestTo_1 = i;
                nearestDistTo_1 = distTo1;
            }
            if (distTo2 < nearestDistTo_2)
            {
                nearestTo_2 = i;
                nearestDistTo_2 = distTo2;
            }


            if (distTo1 <= this.LOCK_DISTANCE)
            {
                if (this.goal[i] === 1)
                {
                    if (distTo1 < 10)
                    {
                        //shoot at gate 2
                        this.goal[i] = 2;
                        this.nodeX[i] = this.left.x;
                        this.nodeY[i] = this.left.y;
                        let r = 2*this.getRandomSpeed(1)
                        this.nodeVx[i] = (1.5+r)*(this.right.x-this.left.x)/this.distance;
                        this.nodeVy[i] = (1.5+r)*(this.right.y-this.left.y)/this.distance;
                    }
                }
                else if (this.goal[i] === 2) {}
                else
                {
                    this.goal[i] = 1;
                    this.nodeVx[i] = .3*(diffToX1)/distTo1;
                    this.nodeVy[i] = .3*(diffToY1)/distTo1;
                }
                ctx.beginPath();
                ctx.moveTo(this.nodeX[i], this.nodeY[i]);
                ctx.lineTo(this.left.x, this.left.y);
                ctx.stroke();
            }

            else if (distTo2 <= this.LOCK_DISTANCE)
            {
                if (this.goal[i] === 2)
                {
                    if (distTo2 < 10)
                    {
                        //shoot at gate 1
                        this.goal[i] = 1;
                        this.nodeX[i] = this.right.x;
                        this.nodeY[i] = this.right.y;
                        let r = 2*this.getRandomSpeed(1)
                        this.nodeVx[i] = (1.5+r)*(this.left.x-this.right.x)/this.distance;
                        this.nodeVy[i] = (1.5+r)*(this.left.y-this.right.y)/this.distance;
                    }
                }
                else if (this.goal[i] === 1) {}
                else
                {
                    this.goal[i] = 2;
                    this.nodeVx[i] = .3*(diffToX2)/distTo2;
                    this.nodeVy[i] = .3*(diffToY2)/distTo2;
                }
                ctx.beginPath();
                ctx.moveTo(this.nodeX[i], this.nodeY[i]);
                ctx.lineTo(this.right.x, this.right.y);
                ctx.stroke();
            }
            else
            {
                let a = (this.right.x - this.left.x) * (this.left.y - this.nodeY[i]);
                let b = (this.right.y - this.left.y) * (this.left.x - this.nodeX[i]);
                let distToLine = Math.abs(a - b) / this.distance;
                if (distToLine > this.MAX_DISTANCE_FROM_LINE)
                {
                    this.nodeVx[i] = Math.random();
                    this.nodeVy[i] = Math.random();
                    if (this.nodeX[i] > this.x) this.nodeVx[i] = -this.nodeVx[i];
                    if (this.nodeY[i] > this.y) this.nodeVy[i] = -this.nodeVy[i];
                }
            }

            let neighborDist = Number.MAX_SAFE_INTEGER;
            let neighbor = i;
            for (let k=0; k<this.nodeCount; k++)
            {
                if (i == k) continue;
                let dx = this.nodeX[i] - this.nodeX[k];
                let dy = this.nodeY[i] - this.nodeY[k];
                let dist = dx * dx + dy * dy;

                if ((dist < neighborDist) && (this.nodeX[i] <= this.nodeX[k]))
                {
                    neighborDist = dist;
                    neighbor = k;
                }
                if (dist < 30*30)
                {
                    ctx.beginPath();
                    ctx.moveTo(this.nodeX[i], this.nodeY[i]);
                    ctx.lineTo(this.nodeX[k], this.nodeY[k]);
                    ctx.stroke();
                }
                if (dist < 10*10)
                {
                   if ((distTo1 > this.LOCK_DISTANCE) && (distTo2 > this.LOCK_DISTANCE))
                   {
                       this.goal[i] = undefined;
                       this.nodeVx[i] = this.getRandomSpeed(this.nodeX[i]-this.nodeX[k]);
                       this.nodeVy[i] = this.getRandomSpeed(this.nodeY[i]-this.nodeY[k]);
                   }
                }
            }

            ctx.beginPath();
            ctx.moveTo(this.nodeX[i], this.nodeY[i]);
            ctx.lineTo(this.nodeX[neighbor], this.nodeY[neighbor]);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(this.left.x, this.left.y);
        ctx.lineTo(this.nodeX[nearestTo_1], this.nodeY[nearestTo_1]);
        ctx.moveTo(this.right.x, this.right.y);
        ctx.lineTo(this.nodeX[nearestTo_2], this.nodeY[nearestTo_2]);
        ctx.stroke();
    }
}
