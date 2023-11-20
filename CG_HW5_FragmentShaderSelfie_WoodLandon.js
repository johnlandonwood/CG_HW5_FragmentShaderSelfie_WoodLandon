var canvas;
var gl;
var vBuffer;
var blueProgram, redProgram, greenProgram;
var imgProgram;

const vertices = [
    -1.0, 1.0, 0.0, 1.0,
    -1.0, -1.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
    1.0, -1.0, 0.0, 1.0
];

var texSize = 256;
var data = new Uint8Array (3*texSize*texSize);   
for (var i = 0; i<= texSize; i++)  {
    for (var j=0; j<=texSize; j++) {
        data[3*texSize*i+3*j  ] = rawData[i*256+j];
        data[3*texSize*i+3*j+1] = rawData[i*256+j];
        data[3*texSize*i+3*j+2] = rawData[i*256+j];
    }
}

var texCoords = [
    vec2(0, 0),
    vec2(1, 0),
    vec2(1, 1),
    vec2(0, 1)
];

function configureTexture(image, width, height) {
    console.log(width, height);
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

window.onload = function init() {
    canvas = document.getElementById('glCanvas');
    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");
    gl.viewport(0, 0, 512, 512);

    blueProgram = initShaders(gl, "vertex-shader1", "fragment-shader1");
    grayscaleProgram = initShaders(gl, "img-vertex-shader", "grayscale-fragment-shader");
    sepiaProgram = initShaders(gl, "img-vertex-shader", "sepia-fragment-shader");
    contrastProgram = initShaders(gl, "img-vertex-shader", "inversion-fragment-shader");

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);



    configureTexture (data, texSize, texSize)


    document.getElementById('fileInput').onchange = (e) => {
        let file = e.target.files[0];
        let fileReader = new FileReader();
        fileReader.onload = (e) => {
            let result = e.target.result;
            let resultImage = new Image();
            resultImage.onload = () => {
                let canvas = document.createElement('canvas');
                let ctx = canvas.getContext("2d");
    
                ctx.drawImage(resultImage, 0, 0, resultImage.width, resultImage.height);
    
                let imageData = ctx.getImageData(0, 0, resultImage.width, resultImage.height);
                console.log(imageData);
    
                let image = new Uint8Array(resultImage.width * resultImage.height * 4);
                for (let i = 0; i < resultImage.width * resultImage.height * 4; i++) image[i] = imageData.data[i];
    
                configureTexture(imageData, resultImage.width, resultImage.height);
            }
            resultImage.src = result;
        }
        fileReader.readAsDataURL(file);
    }

    document.getElementById('shaderSelector').addEventListener('change', function (event) {
      const selectedIndex = event.target.value;
      switch (selectedIndex) {
        case '0':
          render(grayscaleProgram);
          break;
        case '1':
          render(sepiaProgram);
          break;
        case '2':
          render(contrastProgram);
          break;
        case '3':
          render(blueProgram);
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

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);

    var texCoordLoc = gl.getAttribLocation( program, "aTexCoord");
    gl.vertexAttribPointer( texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
