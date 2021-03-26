let starColorMap = {"O":"B", "B":"B", "G":"Y", "K":"Y", "M":"R"} 
function starRGB(r,g,b)  
{
   //             alpha         blue         green      red
   return (255 << 24) | (b << 16) |	(g << 8) | r;
}
var SQUARE_ROOT_1HALF = Math.sqrt(0.5);

class Star
{
    constructor(strArray)
    {
        this.catalog = parseInt(strArray[0]);
        this.color = strArray[4][0];
        this.name = undefined;
        this.constellation = undefined;
        if (strArray[5].length > 1)
        {
            this.name = strArray[5];
            this.constellation = strArray[6];
            console.info("star: "+this.name)
        }
        let rightAscension = parseFloat(strArray[1]);
        let declination = parseFloat(strArray[2]);

        let theta = rightAscension*2.0*Math.PI/24.0;
        //if (rightAscension >24 || rightAscension < 0)
        //{
        //    console.error("ERROR: star: "+this.catalog+"#: rightAscension="+rightAscension+"   declination="+declination)
        //    this.x = undefined;
        //    return;
        //}
        if (declination >90 || declination < 0)
        {
        //    console.error("ERROR: star: "+this.catalog+"#: rightAscension="+rightAscension+"   declination="+declination)
            this.x = undefined;
            return;
        }

        //Points in the northern hemisphere of the celestial sphere have been projected onto a circle
        //    and filtered to the inscribed square, Thus, the maximum x or y value in the starfield
        //    will be square root(.5)

        //let largerDim = Math.max(canvasWidth, canvasHeight);
        //let radius = (largerDim/2)*(90.0-declination)/90.0;
        //this.x = Math.floor(radius*Math.cos(theta)/rootHalf) + Math.floor(canvasWidth/2);
        //this.y = Math.floor(radius*Math.sin(theta)/rootHalf) + Math.floor(canvasHeight/2);
        // Omit stars exactly on the border as they will not render correctly
        //if (this.x <= 0 || this.y <= 0) this.x = -1;
        //if (this.x >= canvasWidth-1 || this.y >= canvasHeight-1) this.x = -1;

        //Shift Sky center between big and little dipper
        let radius = 2.4*(90.0-declination)/90.0;
        this.x = radius*Math.cos(theta) + 0.5;
        this.y = radius*Math.sin(theta) + 0.13;
        this.magnitude = parseFloat(strArray[3]);

        if (Math.abs(this.x) > 1.0/ZOOM_MIN || Math.abs(this.y) > 1.0/ZOOM_MIN)
        {
            console.info("ERROR: Star(): theta=" + theta + ", r=" + radius + "   ("+this.x + ",  " + this.y+")");
            this.x = undefined;
            return;
        }
        let largerDim = Math.max(canvasWidth, canvasHeight);
        let scale = (largerDim/2)/ZOOM_MIN;
        let screenX = scale*this.x*ZOOM_MIN + canvasWidth/2;
        let screenY = scale*this.y*ZOOM_MIN + canvasHeight/2;
        if (screenX < 0 || screenX >= canvasWidth || screenY < 0 || screenY > canvasHeight)
        {
            //console.info("CROP Star(): theta=" + theta + ", r=" + radius + "   ("+this.x + ",  " + this.y+")");
            this.x = undefined;
            return;
        }
        //console.info("Star(): theta=" + theta + ", r=" + radius + "   ("+this.x + ",  " + this.y+")");
        //if (this.name)
        //{
        //    console.info("Star(): " + this.name + "  " + this.constellation);
        //}
    }
}

function renderStarsOffCanvas()
{
    if (starList === undefined) return;
    if (canvasData === undefined)
    {
        let buf = new ArrayBuffer(canvasImage.data.length);
        canvasBuf = new Uint8ClampedArray(buf);
        canvasData = new Uint32Array(buf);
        console.info("canvasWidth =" + canvasWidth);
        console.info("canvasHeight =" + canvasHeight);
        //console.info("elements =" + (canvasWidth*canvasHeight*4));
        //console.info("canvasImage.data.length =" + canvasImage.data.length);
    }

    for (let i = 0; i < canvasData.length; i++)
    {
        canvasData[i] = 255 << 24;
    }

    let largerDim = Math.max(canvasWidth, canvasHeight);
    let radius = (largerDim/2)/ZOOM_MIN;
    for (const star of starList)
    {
        let x = Math.floor(radius*star.x*zoomScale + canvasWidth/2);
        let y = Math.floor(radius*star.y*zoomScale + canvasHeight/2);

        // Omit stars exactly on the border as they will not render correctly
        if (x <= 0 || y <= 0)
        {
            //if (x<0) console.info("ERROR: screen=   (" + x + ",  " + y + ")     star=(" + star.x + ",  " + star.y + ")");
            continue;
        }
        if (x >= canvasWidth-1 || y >= canvasHeight-1)
        {
            //if (x> canvasWidth-1)
            //    console.info("ERROR: screen=   (" + x + ",  " + y + ")     star=(" + star.x + ",  " + star.y + ")");
            continue;
        }

        let colorCode = star.color in starColorMap ? starColorMap[star.color] : 'W'
        // default color is white
        let white = starRGB(255, 255, 255)
        let color =
            (star.magnitude < 5.0 ?
               {"B" : starRGB(200, 200, 255),
                "Y" : starRGB(255, 255, 200),
                "R" : starRGB(255, 200, 200),
                "W" : white }
            : star.magnitude < 6.0 ?
               {"B" : starRGB(120, 120, 220),
                "Y" : starRGB(220, 220, 120),
                "R" : starRGB(220, 120, 120),
                "W" : white }
            :
               {"B" :  starRGB(80,  80, 200),
                "Y" : white, "R" : white, "W" : white }
            )[colorCode]

        let idx = y * canvasWidth + x;
        canvasData[idx] = color;
        if (star.magnitude < 4.37)
        {
            canvasData[idx-1] = color;
        }
        if (star.magnitude < 3.01)
        {
            canvasData[idx+canvasWidth] = color;
        }
        if (star.magnitude < 2.5)
        {
            canvasData[idx+1] = color;
            canvasData[idx-canvasWidth] = color;
        }
        if (star.name)
        {
            canvasData[idx-1] = color;
            canvasData[idx+1] = color;
            canvasData[idx-canvasWidth] = color;
            canvasData[idx+canvasWidth] = color;
            canvasData[1+idx-canvasWidth] = color;
            canvasData[1+idx+canvasWidth] = color;
            canvasData[-1+idx-canvasWidth] = color;
            canvasData[-1+idx+canvasWidth] = color;
        }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    canvasImage.data.set(canvasBuf);
}

function readStars()
{
    if (fileObject.readyState == 4) //Document is ready to parse.
    {
        if (fileObject.responseText)
        {   //console.info("readStars(): canvas = (" + canvasWidth + ", " + canvasHeight +")");
            let strArray = fileObject.responseText.split("\n");
            //Skip row 0 (it is for header info)
            starList = [];
            for (let i = 1; i < strArray.length - 1; i++)
            {
                //let data = strArray[i].split(',').map(Number);
                let data = strArray[i].split(',');
                let star = new Star(data);
                if (star.x !== undefined)
                {
                    starList.push(star);
                }
                else
                {
                    console.info("Cropping star Harvard Catalog #" + star.catalog);
                }
            }
        }
        renderStarsOffCanvas();
        requestAnimationFrameProtected();
    }
}
