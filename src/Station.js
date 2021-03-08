StationEdgeTypeEnum = {"UPPER": 0, "LOWER": 1, "VERTICAL_LEFT": 2, "VERTICAL_RIGHT": 3}
class Station
{
    //static totalStations = 5;
    //static EdgeTypeEnum = {"UPPER": 0, "LOWER": 1, "VERTICAL_LEFT": 2, "VERTICAL_RIGHT": 3}

    constructor(index, x, y, edgeType)
    {
        this.index = index;
        this.neighbor = undefined;
        this.x = x;
        this.y = y;
        this.heading = Math.random() * Math.PI;
        this.edgeType = edgeType;
        this.slope = NaN;
        this.yIntercept = NaN;
    }

    //Only call this after **all** stations have been constructed
    calculateLine()
    {
        this.neighbor = stationList[(this.index + 1) % 5];
        this.slope = (this.neighbor.y - this.y) / (this.neighbor.x - this.x);
        this.yIntercept = this.y - this.slope * this.x;

    }

    //This assumes the stations to be on the vertices of a **convex** polygon.
    isInside(x, y)
    {
        if (this.edgeType === StationEdgeTypeEnum.UPPER)
        {
            let yy = this.slope * x + this.yIntercept;
            if (y < yy) return false;
            return true;
        }

        if (this.edgeType === StationEdgeTypeEnum.LOWER)
        {
            let yy = this.slope * x + this.yIntercept;
            if (y > yy) return false;
            return true;
        }

        if (this.edgeType === StationEdgeTypeEnum.VERTICAL_LEFT)
        {
            if (x < this.x) return false;
            return true;
        }
        if (this.edgeType === StationEdgeTypeEnum.VERTICAL_RIGHT)
        {
            if (x > this.x) return false;
            return true;
        }
    }
}