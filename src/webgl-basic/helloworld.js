"use strict";

//말 그대로 꼭지점 잡아주는 부분
var vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
// vec4는 4개의 소수점 값입니다. 
// JavaScript에서 a_position = {x: 0, y: 0, z: 0, w: 0}와 비슷함. 
// 아래에서 attribute size = 2라고 설정할 경우, 
// Attribute에서 기본값은 0, 0, 0, 1이기 때문에 버퍼에서 처음 2개 값(x와 y)을 가져옴. 
// 그리고 z와 w는 각각 0과 1의 기본값을 가진다.
in vec4 a_position;

// all shaders have a main function
void main() {

    
  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = a_position;
}
`;



var fragmentShaderSource = `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision mediump float;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  // Just set the output to a constant redish-purple
  // 색깔같은거 정해주는 부분
  // gl_FragColor는 Fragment Shader의 설정을 담당하는 특수 변수입니다.
  outColor = vec4(1, 0, 0.5, 1); // 붉은-보라색 반환
}
`;

//const gl = canvas.getContext("webgl2");
//즉 gl => canvas dom에 있는 webgl2 기능을 가져오는 parameter
// type => gl 즉 webGl2에 있는 타입을 정하는 parameter
//( gl.VERTEX_SHADER, gl.FRAGMENT_SHADER 2가지 타입으로 정해져 있음 )
//source 말 그대로 shader 관련 소스 정확한건 조금 더 공부해야 알듯 하다.
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

//createProgram
/*
    vertexShader 과 fragmentShader을 이어주는 프로그램(로직)
    gl => canvas dom 에서 가져오는 webgl2 기능 라이브러리 파라미터 
    vertexShader => webGL로 만들어진 vertex shader 
    fragmentShader => webGL로 만들어진 fragment shader 
*/
function createProgram(gl, vertexShader, fragmentShader) {
  //vertex shader과 fragment shader을 읻기 위한 프로그램(로직)을 생성한다.
  var program = gl.createProgram();
  //program과 함께, vertexShader을 첨부한다.
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

/*
    여기가 실질적으로 메인이다. 
    ★★
*/
function main() {
  // Get A WebGL context
  //canvas안에 있는  WebGL Context(기능?)을 가져온다.
  var canvas = document.getElementById("c");
  canvas.width = 600;
  canvas.height = 600;
  var gl = canvas.getContext("webgl2");

  if (!gl) {
    return;
  }

  // create GLSL shaders, upload the GLSL source, compile the shaders
  //GLSL 쉐이더를 생성하고 , GLSL source를 업로드 하며, shader를 compile 한다.

  // vertex shader를 생성한다. (web gl context, gl type, glsl source))
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);

  // fragment shader를 생성한다. (web gl context, gl type, glsl source)
  var fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  // Link the two shaders into a program
  // 2가지 type의 shader(vertex, fragment)를 연결시켜 준다.
  var program = createProgram(gl, vertexShader, fragmentShader);

  // look up where the vertex data needs to go.
  // GLSL source내에 들어간 vertex data가 들어갈 곳을 찾는다.
  //두번째 파라미터의 string은 해당 glsl source에 들어 있던 position 변수명을 적어주면 된다.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // Create a buffer and put three 2d clip space points in it
  // 버퍼를 형성하고 3 지점의 2d clip space point를 webgl2 canvas 내에 놓는다.
  var positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  //array_buffer에 positionBuffer를 셋팅한다. (ARRAY_BUFFER = positionBuffer 이라 생각하면 된다.)
  // position buffer 할당
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // 2d point 3개
  var positions = [-0.5, -0.5, 0, 0, 0, -0.5];

  //bufferData는 데이터를 GPU의 positionBuffer로 복사한다.
  //webGL은 강력한 type을 가지는 데이터가 필요.
  //그래서 Float32Array를 통해 32bit 부동 소수점 배열을 생성해서 postion의 값을 복사한다.
  //위에서 ARRAY_BUFFER - bind point로 할당했기 때문에 position buffer를 사용합니다.
  //마지막 3번째 매개변수(argument)는 WebGL에게 데이터를 어떻게 사용할 지 알려줌.
  // gl.STATIC_DRAW은 WebGL에 데이터가 많이 바뀌지는 않을 것 같다고 알려주는 것
  //여기 까지 작성한 건 초기화 코드. 이 페이지는 페이지가 로드 될 때 한번 실행된다.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  //여기 아래부터는 render/draw할 때마다 실행되는 렌더링 코드.

  //항상 CSS로 원하는 Canvas 크기를 지정해야 합니다.
  //window에서 실행할 경우 Canvas 크기가 400x300 픽셀이지만
  // iframe 내부에 있으면 사용 가능한 공간을 채우기 위해 늘어납니다.
  //CSS로 크기를 결정하고 일치하도록 조정함으로써 우리는 이 두 가지 경우를 모두 쉽게 처리할 수 있습니다.

  // Create a vertex array object (attribute state)
  // vertex array object를 만든다.
  //   var vao = gl.createVertexArray();

  // and make it the one we're currently working with
  // 그리고 해당 해당 vertexarray를 바인딩한다.
  //   gl.bindVertexArray(vao);

  // Turn on the attribute
  // 해당 vertexarray 를 셋팅한다.
  // positionAttributeLocation (GLSL 과 연동 시킨 location을 인자로 넘겨주면 된다.)
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2; // 2 components per iteration (실행 될때마다 2개의 구성 요소 사용)
  var type = gl.FLOAT; // the data is 32bit floats (데이터는 32bit 소수점)
  var normalize = false; // don't normalize the data (정규화되지 않은 데이터다 라고 알려주는 것 false)
  /* 
    0 = move forward size * sizeof(type) each iteration to get the next position
    0 = 반복할 때 마다 size * sizeof(type)만큼 다음 위치로 이동
  */
  var stride = 0;
  var offset = 0; // start at the beginning of the buffer (buffer 시작점)

  // attribute에게 positionBuffer(Array_Buffer)에서 데이터를 가져오는 방법을 알려준다.
  gl.vertexAttribPointer(
    positionAttributeLocation,
    size, //이 사이즈가 2면 x,y 값만 가져온다. 3이면 z, 4면 w 값까지 (사이즈가 2일경우 기본 z=0, w=1 기본값)
    type,
    normalize,
    stride,
    offset
  );

  //CSS로 크기를 결정하고 일치하도록 조정할 수 있도록 하는 라이브러리 및 기능
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  //우리는 gl_Position으로 설정될 clip 공간 값을 화면 공간이라고 불리는 픽셀로
  //변환하는 방법을 WebGL에게 알려줘야 합니다.
  //이를 위해 gl.viewport를 호출하고 현재 Canvas 크기를 넘겨야 합니다.
  // 이렇게 하면 -1 <-> +1 clip 공간이
  // x에 0 <-> gl.canvas.width,
  // y에 0 <-> gl.canvas.height로 대응
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  // 우선 canvas를 깨끗하게 지운다.
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  //webGL한테 우리가 만든 프로그램을 사용하라고 명령한다.
  gl.useProgram(program);

  // Bind the attribute/buffer set we want.
  // gl.bindVertexArray(vao);

  // draw
  // count가 3이기 때문에 vertex shader는 세 번 실행.
  // 먼저 vertex shader의 a_position.x와 a_position.y 속성이
  // positionBuffer의 처음 두 값으로 설정됩니다.
  // 두 번째로 a_position.xy가 그다음 두 값으로 설정됩니다.
  // 마지막에는 남아있는 두 값으로 설정됩니다.

  // primitiveType을 gl.TRIANGLES로 설정했기 때문에,
  // vertex shader가 세 번 실행될 때마다 WebGL은 gl_Position에 설정한 세 값에 따라 삼각형을 그린다.
  // Canvas 크기에 상관없이 이 값들은 clip 공간 좌표에 있으며 방향에 따라 -1에서 1사이 값으로 바뀐다.
  // Vertex Shader는 단순히 positionBuffer 값을
  // gl_Position에 복사하기 때문에 삼각형은 clip 공간 좌표에 그려진다.

  /*
        clips 공간에서 화면 공간으로 변환할 때 canvas 크기가 400 x 300 이라면 아래와 같이 표시 
         clip 공간       화면 공간
        0, 0     ->   200, 150
        0, 0.5   ->   200, 225
        0.7, 0     ->   340, 150
  */
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 3;
  gl.drawArrays(primitiveType, offset, count);


  /*
    WebGL은 이제 삼각형을 렌더링할 겁니다. 
    WebGL이 그릴 모든 픽셀은 fragment shader를 호출합니다.
    우리가 작성한 fragment shader는 gl_FragColor를 1, 0, 0.5, 1로 설정. 
    Canvas는 채널당 8bit이기 때문에 
    WebGL은 [255, 0, 127, 255] 값으로 canvas에 작성합니다.
  */
}

main();
