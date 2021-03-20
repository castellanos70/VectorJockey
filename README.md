# VectorJockey
<p>Spaceflight Training Simulator for High School Physics</p>

<h2>SOURCE CODE Guide:</h2>

Start in <tt>src/VectorJockey.js</tt>:<br>
Most global variables are at the top of <tt>src/VectorJockey.js</tt><br>
Also at top level (not inside a function) in this file is <tt>window.onload = function () {init();};</tt> which calls
<pre><tt>     src/VectorJockey.js --> init() </tt> when the page is loaded. </pre>
Main game loop is also in this file:
<pre><tt>     src/VectorJockey.js --> render() </tt></pre>
The last line of <tt>render()</tt> is <tt>requestAnimationFrameProtected()</tt> which (when a frame is not already pending) calls
<pre><tt>     src/VectorJockey.js --> requestAnimationFrame(render); </tt></pre>
This, is what makes <tt>render() </tt>the animation loop <br>
