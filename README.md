# VectorJockey
<p>Spaceflight Training Simulator for High School Physics</p>

<h2>SOURCE CODE Guide:</h2>

Place to start is src/VectorJockey.js:<br>
    most of the global variables are at the top of src/VectorJockey.js<br>
    Also in this file is window.onload = function () {init();}; which calls <br>
        src/VectorJockey.js --> init() when the page is loaded. <br> <br>
    Main game loop is also in this file: <br>
        src/VectorJockey.js --> render() <br>
        The last line of render() is  requestAnimationFrameProtected() which (when a frame is not already pending) calls <br>
           src/VectorJockey.js --> requestAnimationFrame(render); <br>
        This, is what makes render() the animation loop <br>
