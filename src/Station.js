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
   // cross product, positive if p1->this is 'right' of p1->p2 in a clockwise scan
   cross (p1,p2) {
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

const zip2 = (a,b) => a.map ((k,i) => [k, b[i]])

function createBoundaryList(maxX) 
{
   stationList = new Array(5).fill(0).map(
      (v,k,a) => new Station(new Coord(k * 2.0 * Math.PI / 5.0).scale(maxX)))
   boundaryList = zip2(stationList, stationList.slice(1).concat([stationList[0]]))
   console.info(boundaryList)
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
