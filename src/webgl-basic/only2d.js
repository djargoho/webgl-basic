"use strict";

var vertexShaderSource = `#version 300 es
  attribute vec4 a_position;

  uniform vec2 u_resolution;

  void main() {
     // convert the position from pixels to 0.0 to 1.0
     vec2 zeroToOne = a_position.xy / u_resolution;

     // convert from 0->1 to 0->2
     vec2 zeroToTwo = zeroToOne * 2.0;

     // convert from 0->2 to -1->+1 (clipspace)
     vec2 clipSpace = zeroToTwo - 1.0;

     gl_Position = vec4(clipSpace, 0, 1);
  }
`;
var fragmentShaderSource = `#version 300 es

    precision mediump float;

    void main() {
        gl_FragColor = vec4(1, 0, 0.5, 1); // return redish-purple
    }
`;

function createShader(gl, type, source) {
  //1.해당 타입에 맞는 shader를 생성한다.
  var shader = gl.createShader(type);

  //2. 만들 해당 타입의 shader 와 그 타입에 맞는 소스를 넣어준다.
  gl.shaderSource(shader, source);
  //3. 해당 shader을 컴퓨터가 읽을 수 있도록 compile 시켜준다.
  gl.compileShader(shader);

  //4. compile 한 shader가 제대로 success 되었는지 확인한다.
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  //5. 제대로 성공 했으면 return 값으로 shader을 보내주면 된다.
  console.log("shader", success);
  if (success) {
    return shader;
  }
  //실패했을 시 실패 정보에 대한 shader의 정보를 얻을 수 있을거라 보이는 function
  console.log(gl.getShaderInfoLog(shader)); // eslint-disable-line
  //실패했을시 해당 메모리에 쌓이는걸 막기위해 shader을 delete 처리한다.
  gl.deleteShader(shader);
  //실패했을 시, undefined 값으로 return 한다
  return undefined;
}

function createProgram(gl, vertexShader, fragmentShader) {
  //vertex shader과 fragment shader을 읻기 위한 프로그램(로직)을 생성한다.
  var program = gl.createProgram();
  //program과 함께, vertexShader을 첨부한다.
  //   console.log("vertexShader", vertexShader);
  gl.attachShader(program, vertexShader);
  //program과 함께, fragmentShader을 첨부한다.
  gl.attachShader(program, fragmentShader);

  //2가지 type의 shader을 해당 프로그램에 link(연결)하여 준다.
  gl.linkProgram(program);

  //정상적으로 link가 되었는지 확인하여 준다. 정상이면 true를 반환한다.
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  //실패했을 시 프로그램 로그를 반환할 듯하다.
  console.log(gl.getProgramInfoLog(program)); // eslint-disable-line
  //실패했을 시, 웹 메모리 낭비를 막기위해 해당 프로그램을 삭제한다.
  gl.deleteProgram(program);
  //실패 했을 시 return 한다.
  return undefined;
}

function main() {
  // Get A WebGL context
  var canvas = document.getElementById("c");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }
  // Use our boilerplate utils to compile the shaders and link into a program
  var program = webglUtils.createProgramFromScripts(gl, [
    "2d-vertex-shader",
    "2d-fragment-shader"
  ]);

  //   // vertex shader를 생성한다. (web gl context, gl type, glsl source))
  //   var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  //   console.log("vertexShader", vertexShader);
  //   // fragment shader를 생성한다. (web gl context, gl type, glsl source)
  //   var fragmentShader = createShader(
  //     gl,
  //     gl.FRAGMENT_SHADER,
  //     fragmentShaderSource
  //   );

  //   // Link the two shaders into a program
  //   // 2가지 type의 shader(vertex, fragment)를 연결시켜 준다.
  //   var program = createProgram(gl, vertexShader, fragmentShader);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // look up uniform locations
  var resolutionUniformLocation = gl.getUniformLocation(
    program,
    "u_resolution"
  );

  // Create a buffer to put three 2d clip space points in
  var positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  var positions = [10, 20, 80, 20, 10, 30, 10, 30, 80, 20, 80, 30];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2; // 2 components per iteration
  var type = gl.FLOAT; // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0; // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionAttributeLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );

  // set the resolution
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  // draw
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);
}

main();
