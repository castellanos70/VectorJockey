// as needed for ctx.renderSprite
class Coord
{
   constructor(theta,y, heading=0) {
      if (y === undefined) {
         this.x = Math.cos(theta)
         this.y = Math.sin(theta)
      }
      else
      {
         this.x = theta
         this.y = y
      }
      this.heading = heading 
   }
   // cross product, positive if edge[0]->this is 'right' of edge in a clockwise scan
   cross (edge) {
      let p1=edge[0].loc;
      let p2=edge[1].loc;
      return (this.x-p1.x)*(p2.y-p1.y) - (this.y-p1.y)*(p2.x-p1.x)
   }
   scale(val)
   {
      return new Coord (this.x*val,this.y*val, this.heading)
   }
   add(p)
   {
      return new Coord (this.x+p.x,this.y+p.y, 0)
   }
}

class Station
{
    //static totalStations = 5;
    speed = 0.05 // radians / second

    constructor(loc)
    {
        this.loc = loc;
        this.loc.heading = Math.random() * Math.PI;
    }
}
