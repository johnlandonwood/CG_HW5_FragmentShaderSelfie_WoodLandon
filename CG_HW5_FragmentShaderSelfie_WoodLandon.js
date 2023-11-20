const vertices = [
    -1.0, 1.0, 0.0, 1.0,
    -1.0, -1.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
    1.0, -1.0, 0.0, 1.0
];

var canvas;
var gl;

var vBuffer;

window.onload = function init() {
    canvas = document.getElementById('glCanvas');
    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");
    gl.viewport(0, 0, 512, 512);

    blueProgram = initShaders(gl, "vertex-shader", "fragment-shader1");
    redProgram = initShaders(gl, "vertex-shader", "fragment-shader2");
    greenProgram = initShaders(gl, "vertex-shader", "fragment-shader3")

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    document.getElementById('shaderSelector').addEventListener('change', function (event) {
      const selectedIndex = event.target.value;
      switch (selectedIndex) {
        case '0':
          render(blueProgram);
          break;
        case '1':
          render(redProgram);
          break;
        case '2':
          render(greenProgram);
          break;
        default:
          render(blueProgram);
          break;
      }
    });

    render(blueProgram);
}

function render(program) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);


    const positionAttributeLocation = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 4, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
