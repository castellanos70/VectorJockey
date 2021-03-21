class Coord
{
   constructor(x,y) {
      this.x =x
      this.y =y
   }
   // cross product, positive if edge[0]->this is 'right' of edge in a clockwise scan
   cross (edge) {
      let p1=edge[0].loc;
      let p2=edge[1].loc;
      return (this.x-p1.x)*(p2.y-p1.y) - (this.y-p1.y)*(p2.x-p1.y)
   }
}

class Station
{
    //static totalStations = 5;

    constructor(loc)
    {
        this.loc = loc;
        this.heading = Math.random() * Math.PI;
    }
}
