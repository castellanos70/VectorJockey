class Star
{
    constructor(strArray)
    {
        //let minRightAscension = 10;
        //let maxRightAscension = 21;
        //let minDeclination = 5;
        //let maxDeclination = 75;
        this.catalog = parseInt(strArray[0]);
        let rightAscension = parseFloat(strArray[1]);
        let declination = parseFloat(strArray[2]);
        let theta = rightAscension*2.0*Math.PI/24.0;
        if (rightAscension >24 || rightAscension < 0)
        {
            console.error("ERROR: star: "+this.catalog+"#: rightAscension="+rightAscension+"   declination="+declination)
        }
        if (declination >90 || declination < 0)
        {
            console.error("ERROR: star: "+this.catalog+"#: rightAscension="+rightAscension+"   declination="+declination)
        }

        //Points in the northern hemisphere of the celestial sphere have been projected onto a circle
        //    and filtered to the inscribed square.
        let rootHalf = Math.sqrt(0.5);
        let largerDim = Math.max(canvasWidth, canvasHeight);
        let radius = (largerDim/2)*(90.0-declination)/90.0;
        this.x = Math.floor(radius*Math.cos(theta)/rootHalf) + Math.floor(canvasWidth/2);
        this.y = Math.floor(radius*Math.sin(theta)/rootHalf) + Math.floor(canvasHeight/2);
        if (this.x < 0 || this.y < 0) this.x = -1;
        if (this.x > canvasWidth-1 || this.y > canvasHeight-1) this.x = -1;
        this.magnitude = parseFloat(strArray[3]);
        //console.info("star: ("+String(this.x)+", "+String(this.y)+")    str[0]="+strArray[0]+"  str[0]="+strArray[1]
        //+ "    color="+strArray[4])

        if (strArray[4][0] == 'O' || strArray[4][0] == 'B') this.color = 'B'
        else if (strArray[4][0] == 'G' || strArray[4][0] == 'K') this.color = 'Y'
        else if (strArray[4][0] == 'M') this.color = 'R'
        else this.color = 'W'
    }
}

function renderStarsOffCanvas()
{
    let buf = new ArrayBuffer(canvasImage.data.length);
    canvasBuf = new Uint8ClampedArray(buf);
    canvasData = new Uint32Array(buf);
    //console.info("canvasImage.data.length="+canvasImage.data.length);
    //console.info("canvasBuf="+canvasBuf.length);
    //console.info("canvasData="+canvasData.length);
    //console.info("canvasWidth*canvasHeight="+canvasWidth*canvasHeight);
    //console.info("canvasWidth*canvasHeight*4="+canvasWidth*canvasHeight*4);

    for (let i = 0; i < canvasData.length; i++)
    {
        canvasData[i] = 255 << 24;
    }

    for (const star of starList)
    {
        //             alpha         blue         green      red
        let color = (255 << 24) | (255 << 16) |	(255 << 8) | 255;
        //console.info("star color=: ("+star.color)
        if (star.magnitude < 5.0)
        {
            if (star.color == 'B') color = (255 << 24) | (255 << 16) | (200 << 8) | 200;
            else if (star.color == 'Y') color = (255 << 24) | (200 << 16) |	(255 << 8) | 255;
            else if (star.color == 'R') color = (255 << 24) | (200 << 16) |	(200 << 8) | 255;
        }
        else if (star.magnitude < 6.0)
        {
            if (star.color == 'B') color = (255 << 24) | (220 << 16) |	(120 << 8) | 120;
            else if (star.color == 'Y') color = (255 << 24) | (120 << 16) |	(220 << 8) | 220;
            else if (star.color == 'R') color = (255 << 24) | (120 << 16) |	(120 << 8) | 220;
            else if (star.color == 'W') color = (255 << 24) | (210 << 16) |	(210 << 8) | 210;
        }
        else
        {
            if (star.color == 'B') color = (255 << 24) | (200 << 16) |	(80 << 8) | 80;
            else if (star.color == 'Y') color = (255 << 24) | (80 << 16) |	(200 << 8) | 200;
            else if (star.color == 'R') color = (255 << 24) | (100 << 16) |	(100 << 8) | 200;
            else if (star.color == 'W') color = (255 << 24) | (130 << 16) |	(130 << 8) | 130;
        }
        //if (star.x < 0 || star.x >= canvasWidth) console.error("star: ("+String(star.x)+", "+String(star.y)+")")
        //if (star.y < 0 || star.y >= canvasHeight) console.error("star: ("+String(star.x)+", "+String(star.y)+")")
        let idx = star.y * canvasWidth + star.x;
        if (idx<0 || idx > canvasData.length) console.error("star: ("+String(star.x)+", "+String(star.y)+")    " + idx);
        canvasData[idx] = color;
        if (star.magnitude < 4.37)
        {
            //console.info("star: ("+String(star.x)+", "+String(star.y)+")")
            if (star.x > 0) canvasData[idx-1] = color;
        }
        if (star.magnitude < 3.01)
        {
            //console.info("star: ("+String(star.x)+", "+String(star.y)+")")
            if (star.y < canvasHeight-1) canvasData[idx+canvasWidth] = color;
        }
        if (star.magnitude < 2.5)
        {
            //console.info("star: ("+String(star.x)+", "+String(star.y)+")")
            if (star.x < canvasWidth-1) canvasData[idx+1] = color;
            if (star.y > 0) canvasData[idx-canvasWidth] = color;
        }
        //if (star.catalog==4301 || star.catalog==4295 || star.catalog==4660 || star.catalog==4554 ||
        //    star.catalog==4905 || star.catalog==5055 || star.catalog==5191 )//||  //Big Dipper
        //    star.catalog== 7001|| star.catalog== 7924|| star.catalog== 7557 ||//summer triangle
        //if (    star.catalog==424 || star.catalog== 5563|| star.catalog== 5735|| star.catalog== 6322||
        //    star.catalog== 5903|| star.catalog== 6116|| star.catalog== 6789)//little Dipper 7394
        //{
        //    color = (255 << 24) | 255;
        //    if (star.catalog== 7001) color = (255 << 24) | (0 << 16) |	(255 << 8) | 0; //Vega
        //    else if (star.catalog== 7924) color = (255 << 24) | (255 << 16) |	(200 << 8) | 0; //Deneb
        //    canvasData[idx] = color;
        //    canvasData[idx-1] = color;
        //    canvasData[idx+1] = color;
        //    canvasData[idx-canvasWidth] = color;
        //    canvasData[idx+canvasWidth] = color;
        //}


        //console.info("star: ("+String(star.x)+", "+String(star.y)+")")
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    canvasImage.data.set(canvasBuf);
}

function readStars()
{
    if (fileObject.readyState == 4) //Document is ready to parse.
    {
        if (fileObject.responseText)
        {   console.info("readStars(): canvas = (" + canvasWidth + ", " + canvasHeight +")");
            let strArray = fileObject.responseText.split("\n");
            //Skip row 0 (it is for header info)
            for (let i = 1; i < strArray.length - 1; i++)
            {
                //let data = strArray[i].split(',').map(Number);
                let data = strArray[i].split(',');
                let star = new Star(data);
                if (star.x >= 0)
                {
                    starList.push(star);
                }
                else
                {
                    //console.info("Cropping star Harvard Catalog #" + star.catalog);
                }
            }
        }

        renderStarsOffCanvas();
        requestAnimationFrameProtected();
    }
}