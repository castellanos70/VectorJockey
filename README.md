# VectorJockey
<p>Spaceflight Training Simulator for High School Physics</p>

<h2>SOURCE CODE Guide:</h2>

Start in <tt>src/VectorJockey.js</tt>:<br>
most of the global variables are at the top of src/VectorJockey.js<br>
Also in this file is <tt>window.onload = function () {init();};</tt> which calls <br>
<pre><tt>     src/VectorJockey.js --> init() </tt></pre>when the page is loaded. <br> <br>
Main game loop is also in this file: <br>
<pre><tt>     src/VectorJockey.js --> render() </tt></pre><br>
The last line of <tt>render()</tt> is <tt>requestAnimationFrameProtected()</tt> which (when a frame is not already pending) calls <br>
<pre><tt>     src/VectorJockey.js --> requestAnimationFrame(render); </tt></pre><br>
This, is what makes <tt>render() </tt>the animation loop <br>
