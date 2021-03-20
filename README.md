# VectorJockey
Spaceflight Training Simulator for High School Physics

SOURCE CODE Guide:

Place to start is src/VectorJockey.js:
    most of the global variables are at the top of src/VectorJockey.js
    Also in this file is window.onload = function () {init();}; which calls 
        src/VectorJockey.js --> init() when the page is loaded.
    Main game loop is also in this file:
        src/VectorJockey.js --> render()
        The last line of render() is  requestAnimationFrameProtected() which (when a frame is not already pending) calls
           src/VectorJockey.js --> requestAnimationFrame(render);
        This, is what makes render() the animation loop
