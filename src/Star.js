
function starRGB(r,g,b)  
{
   //             alpha         blue         green      red
   return (255 << 24) | (b << 16) |	(g << 8) | r;
}

//Should be static class method, but Google Closure Compiler does not support
//Using Smithsonian Astrophysical Observatory Star Catalog prefiltered to <9.5
// Apparent magnitude Sirius (brightest star): -1.44
// Apparent magnitude urban sky naked-eye: 3.0
// Apparent magnitude dark sky naked-eye: 6.0
// Apparent magnitude binocular limit: 9.5 (limit in this file).
// Apparent magnitude 12-inch telescope limit: 14.0.
// Apparent magnitude 200-inch telescope limit: 20.0.
// Hubble telescope limit: 30.0.
// Zoom steps:
//   zoomGoal=0.1
//   zoomGoal=0.13
//   zoomGoal=0.17
//   zoomGoal=0.21
//   zoomGoal=0.26
//   zoomGoal=0.33
//   zoomGoal=0.41
//   zoomGoal=0.51
//   zoomGoal=0.64 (start up default)
//   zoomGoal=0.8
//   zoomGoal=1
function getStarBrightness(magnitude, zoomScale)
{
    if (zoomScale < 0.2 && magnitude > 8.0) return undefined;

    //Maximum brightness = 5.0: spread onto 5 pixels
    if (magnitude < 2.3) return 5.0;
    if (zoomScale < 0.12)
    {
        if (magnitude < 3.0) return 3.0;
        if (magnitude < 3.5) return 2.0;
        if (magnitude < 6.0) return 1.0;
        return (2**6.0)/(2**magnitude);
    }
    if (zoomScale < 0.15)
    {
        if (magnitude < 3.0) return 5.0;
        if (magnitude < 4.0) return 3.0;
        if (magnitude < 5.0) return 2.0;
        if (magnitude < 6.5) return 1.0;
        return (2**6.5)/(2**magnitude);
    }
    if (zoomScale < 0.2)
    {
        if (magnitude < 3.5) return 5.0;
        if (magnitude < 4.5) return 3.0;
        if (magnitude < 5.0) return 2.0;
        if (magnitude < 7.0) return 1.0;
        return (2**7.0)/(2**magnitude);
    }
    if (zoomScale < 0.25)
    {
        if (magnitude < 3.5) return 5.0;
        if (magnitude < 4.5) return 3.0;
        if (magnitude < 5.5) return 2.0;
        if (magnitude < 7.5) return 1.0;
        return (2**7.5)/(2**magnitude);
    }
    if (zoomScale < 0.4)
    {
        if (magnitude < 4.0) return 5.0;
        if (magnitude < 4.5) return 3.0;
        if (magnitude < 6.0) return 2.0;
        if (magnitude < 8.0) return 1.0;
        return (2**8.0)/(2**magnitude);
    }
    if (zoomScale < 0.6)
    {
        if (magnitude < 4.0) return 5.0;
        if (magnitude < 4.5) return 3.0;
        if (magnitude < 6.5) return 2.0;
        if (magnitude < 8.5) return 1.0;
        return (2**8.5)/(2**magnitude);
    }
    if (zoomScale < 0.75)
    {
        if (magnitude < 4.5) return 5.0;
        if (magnitude < 5.0) return 3.0;
        if (magnitude < 7.0) return 2.0;
        if (magnitude < 8.8) return 1.0;
        return (2**8.8)/(2**magnitude);
    }
    if (magnitude < 5.0) return 5.0;
    if (magnitude < 6.0) return 3.0;
    if (magnitude < 8.0) return 2.0;
    if (magnitude < 9.0) return 1.0;
    return (2**9.0)/(2**magnitude);
}

//Should be static class method, but Google Closure Compiler does not support
function getStarColor(brightness, colorCode)
{
    if (brightness > 1.0) brightness= 1.0;
    let r=255;
    let g=255;
    let b=255;
    if (colorCode === 'M') {g=200; b=200;}
    else if (colorCode === 'K') {g=192; b=128;}
    else if (colorCode === 'G') b=0;
    else if (colorCode === 'F') b=175;
    else if (colorCode === 'A') {}
    else if (colorCode === 'B') r=200;
    else if (colorCode === 'O') {r=200; g=200;}
    else
    {
        console.info("****ERROR*** star:etStarColor  colorCode="+colorCode);
    }
    r = Math.floor(r*brightness);
    g = Math.floor(g*brightness);
    b = Math.floor(b*brightness);
    return  starRGB(r, g, b);
}


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
        if (declination >90 || declination < 0)
        {
        //    console.error("ERROR: star: "+this.catalog+"#: rightAscension="+rightAscension+"   declination="+declination)
            this.x = undefined;
            return;
        }

        //Shift Sky center between big and little dipper
        let radius = 2.4*(90.0-declination)/90.0;
        this.x = radius*Math.cos(theta) + 0.5;
        this.y = radius*Math.sin(theta) + 0.13;
        this.magnitude = parseFloat(strArray[3]);

        if (Math.abs(this.x) > 1.0/ZOOM_MIN || Math.abs(this.y) > 1.0/ZOOM_MIN)
        {
            //console.info("ERROR: Star(): theta=" + theta + ", r=" + radius + "   ("+this.x + ",  " + this.y+")");
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

        let brightness = getStarBrightness(star.magnitude, zoomScale);
        if (brightness === undefined) continue;
        let color = getStarColor(brightness, star.color);

        let idx = y * canvasWidth + x;
        canvasData[idx] = color;
        if (brightness >= 2.0)
        {
            canvasData[idx-1] = color;
        }
        if (brightness >= 3.0)
        {
            canvasData[idx+canvasWidth] = color;
        }
        if (brightness >= 4.0)
        {
            canvasData[idx+1] = color;
            canvasData[idx-canvasWidth] = color;
        }
        //if (star.name)
        //{
        //    canvasData[idx-1] = color;
        //    canvasData[idx+1] = color;
        //    canvasData[idx-canvasWidth] = color;
        //    canvasData[idx+canvasWidth] = color;
        //    canvasData[1+idx-canvasWidth] = color;
        //    canvasData[1+idx+canvasWidth] = color;
        //    canvasData[-1+idx-canvasWidth] = color;
        //    canvasData[-1+idx+canvasWidth] = color;
        //}
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
                //else
                //{
                //    console.info("Cropping star Harvard Catalog #" + star.catalog);
                //}
            }
        }
        renderStarsOffCanvas();
        requestAnimationFrameProtected();
    }
}
