var VSHADER_SOURCE =
'precision highp float;\n' +
'attribute vec4 a_Position;\n' +
'attribute vec3 a_Normal;\n' +
'varying vec3 v_Normal;\n' +
'varying vec4 position;\n' +
'varying vec3 v_color;\n' +
'varying vec3 v_light;\n' +
'varying vec3 v_pointLight;\n' +
  'uniform mat4 u_ProjectionMatrix;\n' + //投影矩阵
  'uniform vec4 u_FragColor;\n' +  // uniform
  'uniform mat4 u_TransformMatrix;\n' + //模型变换矩阵
  'uniform mat4 u_TransformInvertMatrix;\n' + //模型变换矩阵
  'uniform float u_SelectIndex;\n' + // 选中树的索引号
  'uniform vec3 u_pointLight;\n' + // pointLight position
  'uniform float u_Type;\n' +//  0:wireframe  1:normal 2：triangle face 3：light  4: set index color
  'uniform float u_shadingMode;\n' +// 0 phong 1:flat 2:gouraud
  'uniform float u_sideview;\n' + // topview:0, sideview:1
'const vec3 light = vec3(1,1,1);\n'+
'const vec3 ks = vec3(1,1,1);\n'+
'const vec3 kd = vec3(0,1,0);\n'+
'const vec3 p_ks = vec3(.5,.5,1);\n'+//蓝色调
'const vec3 pointLightColor = vec3(1,1,0);\n'+
  'void main() {\n' +
  '  vec4 _position = u_TransformMatrix* a_Position;\n' +
  '  gl_Position = u_ProjectionMatrix * u_TransformMatrix* a_Position;\n' +
  '  v_pointLight = u_pointLight;\n' +
  '  if(v_pointLight.r>-900.)v_pointLight -= _position.xyz;\n' +
  // '  v_light=(u_TransformInvertMatrix * vec4(light,0.)).rgb;\n'+
  '  v_light=light;\n'+
  '  if(u_Type==3.) {\n'+
  '    v_Normal=(u_TransformInvertMatrix * vec4(a_Normal,0.)).rgb;\n'+
  '  }\n' +
  '  if(u_shadingMode==1.||u_shadingMode==2.){\n'+
  '      v_color = u_FragColor.rgb*vec3(1,0,1);\n' + //u_FragColor is diffuse
  '      float objectIndex = u_FragColor.g; \n' +
  '      if(objectIndex==0.){v_color=pointLightColor;}\n' +
  '      vec3 view; \n' +
  '      if(u_sideview ==1.) view = normalize(vec3(0.,-200., 75.));\n' +
  '      if(u_sideview ==2.) view = normalize(vec3(0.,0., 200.) );\n' +
  // '      vec3 halfWay = normalize(v_pointLight-view);\n' +
  '      vec3 halfWay = normalize(view+normalize(v_light));\n' +
  //     Dot product of the reflection and the orientation of a view
  '      float lDotV = max(dot(v_Normal, halfWay),0.0);\n' +
  '      vec3 specular = ks*pow(lDotV,u_FragColor.a);\n' +  // uniform
  '      vec3 diffuse = max(dot(normalize(v_light),v_Normal),0.0) * vec3(1);\n' +  // uniform
  '      vec3 diffuse2 = vec3(0);\n' +
  '      vec3 specular2 = vec3(0);\n' +
  '        if(v_pointLight.r>-900.) {\n'+
  '          diffuse2 = max(dot(normalize(v_pointLight),v_Normal),0.0) * p_ks;\n' +
  '          halfWay = normalize(normalize(v_pointLight)+view);\n' +
  '          lDotV = max(dot(v_Normal, halfWay),0.0);\n' +
  '          specular2 = ks*pow(lDotV,u_FragColor.a*5.);\n' +  // uniform
  '        }\n' +
  '      v_color = v_color*diffuse;\n'+
  '      if(u_FragColor.a>0.) v_color += diffuse2 + specular + specular2;\n'+
  '      if(u_SelectIndex==objectIndex&&objectIndex!=0.) v_color = diffuse*kd;\n' +
  '      if(objectIndex==0.&&v_pointLight.r>-900.) v_color += vec3(.4,.4,0);\n' +
  '  }\n'+
  '  gl_PointSize = 10.0;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
'precision highp float;\n' +
'uniform vec4 u_FragColor;\n' +  // uniform
'varying vec4 position;\n' +
'varying vec3 v_color;\n' +
'varying vec3 v_Normal;\n' +
'varying vec3 v_light;\n' +
'varying vec3 v_pointLight;\n' +
'uniform float u_sideview;\n' + // topview:0, sideview:1
'uniform float u_SelectIndex;\n' + // 选中树的索引号
'uniform float u_Type;\n' +//  0:wireframe  1:normal 2：triangle face 3：light  4: set index color
'uniform float u_shadingMode;\n' +// 0 phong 1:flat 2:gouraud
'const vec3 ks = vec3(1,1,1);\n'+
'const vec3 kd = vec3(0,1,0);\n'+
'const vec3 p_ks = vec3(.5,.5,1);\n'+//蓝色调
'const vec3 pointLightColor = vec3(1,1,0);\n'+
'void main() {\n' +
'  float objectIndex = u_FragColor.g; \n' +
// Make the length of the view 1.0
//ks = (1,1,1)
//kd = (1,0,0)//()
'  gl_FragColor = vec4(u_FragColor.rgb*vec3(1,0,1),1);\n' + //u_FragColor is diffuse
'  if(objectIndex==.0){gl_FragColor = vec4(pointLightColor,1);}\n' + 
'  if(u_Type==4.){\n'+//set indexColor
'    gl_FragColor = vec4(objectIndex/255.,0,0,1);\n'+
'  }else{\n'+
'    if(u_Type==1.) gl_FragColor = vec4(1,0,1,1);\n' +
'    else if(u_SelectIndex==objectIndex&&objectIndex!=0.) gl_FragColor = vec4(kd,1);\n' +
'    if(u_Type==3.){\n'+
'      if(u_shadingMode==0.){\n'+
'        vec3 view; \n' +
'        if(u_sideview ==1.) view = normalize(vec3(0.,-200., 75.));\n' +
'        if(u_sideview ==2.) view = normalize(vec3(0.,0., 200.));\n' +
// '        vec3 halfWay = normalize(v_pointLight-view);\n' +
'        vec3 halfWay = normalize(view+normalize(v_light));\n' +
//       Dot product of the reflection and the orientation of a view
'        float lDotV = max(dot(v_Normal, halfWay),0.0);\n' +
'        vec3 specular = ks*pow(lDotV,u_FragColor.a);\n' +  // uniform
'        vec3 diffuse = max(dot(normalize(v_light),v_Normal),0.0) * vec3(1);\n' +  // uniform
'        vec3 diffuse2 = vec3(0);\n' +
'        vec3 specular2 = vec3(0);\n' +
'        if(v_pointLight.r>-900.) {\n'+
'          diffuse2 = max(dot(normalize(v_pointLight),v_Normal),0.0) * p_ks;\n' +
'          halfWay = normalize(v_pointLight-view);\n' +
'          lDotV = max(dot(v_Normal, halfWay),0.0);\n' +
'          specular2 = ks*pow(lDotV,u_FragColor.a*5.);\n' +  // uniform
'        }\n' +
'        gl_FragColor.rgb = gl_FragColor.rgb*diffuse;\n'+
'        if(u_FragColor.a>0.) gl_FragColor.rgb += diffuse2 +specular + specular2;\n'+
'        if(u_SelectIndex==objectIndex&&objectIndex!=0.) gl_FragColor = vec4(diffuse*kd,1);\n' +
'        if(objectIndex==0.&&v_pointLight.r>-900.) gl_FragColor += vec4(.4,.4,0,0);\n' +
'      }else{\n' +
'        gl_FragColor.rgb = v_color;\n'+
'      }\n' +
'    }\n' +
'  }' +
'}\n';

function main() {
  // Retrieve <canvas> element
  canvas = document.getElementById('canvas');
  canvas.style.border ='1px solid #000';
  canvas.oncontextmenu=function stop(){ return false; };
 
  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  canvas.addEventListener("wheel", wheel);
  // gl = canvas.getContext("webgl",{
  //   preserveDrawingBuffer:true
  // });
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.clearColor(1,1,1,1);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

 u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if(!u_ProjectionMatrix) { 
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  u_TransformMatrix = gl.getUniformLocation(gl.program, 'u_TransformMatrix');
  u_TransformInvertMatrix = gl.getUniformLocation(gl.program, 'u_TransformInvertMatrix');
  if(!u_TransformMatrix) { 
    console.log('Failed to get the storage location of u_TransformMatrix');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.enableVertexAttribArray(a_Position);
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  // Get the storage location of a_Position
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  gl.enableVertexAttribArray(a_Normal);
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_pointLight = gl.getUniformLocation(gl.program, 'u_pointLight');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  u_shadingMode = gl.getUniformLocation(gl.program, 'u_shadingMode');
  u_SelectIndex = gl.getUniformLocation(gl.program, 'u_SelectIndex');
  if (!u_SelectIndex) {
    console.log('Failed to get the storage location of u_SelectIndex');
    return;
  }
  u_Type = gl.getUniformLocation(gl.program, 'u_Type');
  if (!u_Type) {
    console.log('Failed to get the storage location of u_Type');
    return;
  }
  u_sideview = gl.getUniformLocation(gl.program, 'u_sideview');
  if (!u_sideview) {
    console.log('Failed to get the storage location of u_sideview');
    return;
  }
   document.querySelector('#save').addEventListener('click', saveFile);
  console.log("Initialize completed");
  level4_data = getPrismData(4,50,true);
  level6_data = getPrismData(6,50,true);
  //球模型 sphere model
  sphere_data = getSphereData(10);
 
  
  
  // Register function (event handler) to be called on a mouse press

  //The default isClick parameter in click2 is false, only change it to true when mouse is up/released
  canvas.onmousedown = function(ev){ click2(ev); };
  canvas.onmousemove = function(ev){move(ev);};
  //isMove is set to -1 when mouse is up
  canvas.onmouseup = function(ev){if(isMove!==1){isMove=-1;}click2(ev,true);};
  canvas.ondblclick = function(ev){dblclick(ev);};
  window.onkeypress = function(ev){keypress(ev)};
  (function autoRender(time){
    cameraData.time = time/3000;
    drawScene(gl);
    requestAnimationFrame(autoRender);
  })(0);
}
var oldPosition = null;
var oldTouch = null;
var canvasRect = null;
var isMove = -1; 
var level4_data,level6_data,sphere_data;
var sideview = false;
var normalsMode = false;
var wireframeMode = false;
var lightMode = false;
var shadingMode = 0;// 0 phong 1:flat 2:gouraud
var u_FragColor = null;
var u_ProjectionMatrix = null;
var u_TransformMatrix = null;
var a_Position = null;
var gl = null;
var canvas = null;
var perspective = false;
var selectIndex = -1;
var selectPoint = null;
var lightSwitch = true; //灯光开关
var projMatrix = new Matrix4();
projMatrix.setOrtho(-200,200,-200,200,0,1000);
var modelMatrix = null;
var cameraData = {
  camera:[0, 0, 200],
  cameraPoint:null,//lookFrom Point
  target:[0,0,0],
  targetPoint:null,//lookTo Point
  up:[0,1,0],
  time:0,//animation time
  matrix:new Matrix4(),//cache
};
var translateMatrix;
var fov = 75;
var g_points = [
  [
    [//sphere light
      glMatrix.mat4.fromTranslation([],[0,-100,100]),//sphere position
      glMatrix.mat4.create(),
      glMatrix.mat4.create(),
      glMatrix.mat4.create()
    ],1,0],
]; // The array for the position and left/right click of a mouse press
var pointIndex = g_points.length;
var sameTree = false;

function move(ev){
  if(isMove>=0&&selectIndex>=0){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var position = getPosition(x,y);
    if(isMove===0){
      var transform = [];
      glMatrix.mat4.fromTranslation(transform,glMatrix.vec4.sub([],position,oldPosition));
      glMatrix.mat4.mul(selectPoint[0][0],selectPoint[0][0],transform);
    }else if(isMove===2){
      var offsetX = x-oldTouch[0];
      var offsetY = y-oldTouch[1];
      if(Math.abs(offsetX)>=Math.abs(offsetY)){
        //rotateZ
        glMatrix.mat4.rotateZ(selectPoint[0][2],selectPoint[0][2],Math.sign(offsetX)/5);
      }else{
        //rotateX
        glMatrix.mat4.rotateX(selectPoint[0][3],selectPoint[0][3],Math.sign(offsetY)/10);
      }
    }
    //drawScene(gl);
  }else if (isMove >= 0 && selectIndex < 0){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    //left click on the background and panning
    var zAxis = glMatrix.vec3.normalize([],glMatrix.vec3.sub([],cameraData.camera,cameraData.target));
    var xAxis = glMatrix.vec3.cross([],cameraData.up,zAxis);
    var yAxis = glMatrix.vec3.cross([],zAxis,xAxis);
    var axisMatrix = glMatrix.mat4.set([],...xAxis,0,...yAxis,0,...zAxis,0,   0,0,0,1);
    if (isMove == 0) {
      var scaleX = canvas.width/400;
      var scaleY = canvas.height/400;
      var offsetX = (x-oldTouch[0])/scaleX;
      var offsetY = -(y-oldTouch[1])/scaleY;
      var transform = glMatrix.mat4.translate([],axisMatrix,[offsetX,offsetY,0]);
      transform = glMatrix.vec3.transformMat4([],[0,0,0],transform);
      glMatrix.vec3.add(cameraData.camera,cameraData.camera,transform);
      glMatrix.vec3.add(cameraData.target,cameraData.target,transform);
    }
    //drawScene(gl);
  } 
    oldPosition = position;
    oldTouch = [x,y];
}
function keypress(ev){
  if(ev.key==='e'){
    cameraData.targetPoint = selectPoint;
    cameraData.cameraPoint = null;
  }
}
function dblclick(ev){
  cameraData.cameraPoint = selectPoint;
  cameraData.targetPoint = null;
}
var initMouse={x:0,y:0};
function click2(ev,isClick){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var z = 0;
  canvasRect = ev.target.getBoundingClientRect();
  // 检查是否选中树
  drawScene(gl,true);
  var pixels = new Uint8Array(4);
  gl.readPixels(
    Math.round(x - canvasRect.left),
    Math.round(canvas.height-(y - canvasRect.top)),
    1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixels
  );

  //console.log("pixels: " + pixels);
  if(isClick){
    //mouse is released and check if it is just a click, move or not
    if(initMouse.x===x&&initMouse.y===y){
      //no move and sphere is clicked, then switch the light
      if(pixels[1]===0&&pixels[0]==0){
        lightSwitch = !lightSwitch;
      }

      //left/right click on the background and draw tree
      if ((ev.button == 0 || ev.button == 2) && pixels[1] == 255 && selectIndex > 0){
         selectIndex = -1;
         selectPoint = null;
      }
      else if ((ev.button == 0 || ev.button == 2) && (!cameraData.cameraPoint) && pixels[1] == 255 && selectIndex <= 0) {
            //no tree selected then left click draw red tree, right click draw blue tree
        selectIndex = -1;
        selectPoint = null;
        var point = getPosition(x,y);
        glMatrix.vec4.add(point,point,[...cameraData.target,0]);
        var transform = [glMatrix.mat4.fromTranslation([],point),glMatrix.mat4.create(),glMatrix.mat4.create(),glMatrix.mat4.create()];//translate scale rotateZ rotateX 
        g_points.push([transform,ev.button,pointIndex]); //the final one is the user matrix
        if(g_points.length>21) g_points.splice(1,1);
        pointIndex = (pointIndex+1)%256; //id (pointIndex) loop from 0 to 255
        if(pointIndex==0)pointIndex+=1;
      }
    }
    
    //middle click on the background and drag
    //if (ev.button == 1)
  }else if(pixels[1]===0){
    //选中树
      selectIndex = pixels[0];
      g_points.forEach(point=>{
        if(point[2]===selectIndex){
          selectPoint = point;
        }
      });
      isMove=ev.button;
      oldPosition = getPosition(x,y);
      oldTouch = [x,y];
  //}else if ((ev.button == 0 || ev.button == 1) &&){

  }else if(ev.button == 0 || ev.button == 2 || ev.button == 1){
    if(selectIndex<=0){
      selectIndex = -1;
      selectPoint = null;
      isMove = ev.button;
      oldPosition = getPosition(x,y);
      oldTouch = [x,y];
    }
  }
  initMouse = {
    x:ev.clientX,y:ev.clientY
  };
  //drawScene(gl);
}

//Function to modify the difference bewteen mouse click and tree
function getPosition(x,y){
    var scaleX = canvas.width/400;
    var scaleY = canvas.height/400;
    x = ((x - canvasRect.left) - canvas.width/2)/scaleX;
    y = (canvas.height/2 - (y - canvasRect.top))/scaleY;
    z = 0;
    var point = new glMatrix.vec4.clone([x,y,z,0]); // translate and
    if (perspective) {
      glMatrix.vec4.transformMat4(point,point,glMatrix.mat4.invert([],projMatrix.elements));
    }
    glMatrix.vec4.transformMat4(point,point,glMatrix.mat4.invert([],cameraData.matrix.elements));
    return point;
}
function wheel(event){
  //no tree is selected, then zoom in and out effect
  //when in ortho mode, disable this function
  if (isMove !== 1) {
    if(selectIndex <= 0) {
      if (perspective) {
        var scale = 1;
        if(event.deltaY>0){
          scale = 5;
        }else{
          scale = -5;
        }
        fov = Math.max(40,Math.min(120,fov + scale));
        projMatrix.setPerspective(fov, canvas.width/canvas.height, .0001, 2000);
        console.log("inside wheel setPerspective" + fov);
        //drawScene(gl);
      }
    }else{
      var scale = 1;
      if(event.deltaY>0){
        scale = 1.2;
      }else{
        scale = .8;
      }
      var transform = [];
      glMatrix.mat4.fromScaling(transform,[scale,scale,scale]);
      glMatrix.mat4.mul(selectPoint[0][1],selectPoint[0][1],transform);
      if(selectPoint[0][1][0]<.5)glMatrix.mat4.fromScaling(selectPoint[0][1],[.5,.5,.5]);
      else if(selectPoint[0][1][0]>2)glMatrix.mat4.fromScaling(selectPoint[0][1],[2,2,2]);
      //drawScene(gl);
    }
  }else{
    //middle click and wheel
    if(selectIndex <= 0) {
      const zAxis = glMatrix.vec3.normalize([],glMatrix.vec3.sub([],cameraData.camera,cameraData.target));
      glMatrix.vec3.scale(zAxis,zAxis,Math.max(-100,Math.min(100,event.deltaY)));
      glMatrix.vec3.add(cameraData.camera,cameraData.camera,zAxis);
      glMatrix.vec3.add(cameraData.target,cameraData.target,zAxis);
      //drawScene(gl);
    }
  }
}
function drawScene(gl,indexColor=false) {
  if (g_points.size == 0)
    return;


  if(lightSwitch){
    var lightMatrix = g_points[0][0];
    var pointTransform = glMatrix.mat4.mul([],lightMatrix[3],lightMatrix[2]);
    glMatrix.mat4.mul(pointTransform,lightMatrix[1],pointTransform);
    glMatrix.mat4.mul(pointTransform,lightMatrix[0],pointTransform);
    gl.uniform3fv(u_pointLight,glMatrix.vec3.transformMat4([],[0,0,0],pointTransform));
  }else{
    gl.uniform3fv(u_pointLight,[-1000,0,0]);
  }

  modelMatrix = new Matrix4();
  if (sideview){
    gl.uniform1f(u_sideview, 1);
  }else{
    gl.uniform1f(u_sideview, 2);
  }
  if(cameraData.targetPoint){
    var position = glMatrix.vec3.transformMat4([],[0,0,0],cameraData.targetPoint[0][0]);
    let offset = [0,0,50*cameraData.targetPoint[0][1][0]];
    glMatrix.vec3.transformMat4(offset,offset,cameraData.targetPoint[0][2]);
    glMatrix.vec3.transformMat4(offset,offset,cameraData.targetPoint[0][3]);
    glMatrix.vec3.add(position,position,offset);
    const scale = offset[2]*3;
    cameraData.matrix = (new Matrix4()).lookAt(...glMatrix.vec3.add([],position,[Math.cos(cameraData.time)*scale,Math.sin(cameraData.time)*scale,offset[2]]),...position,...[0,0,1]);
  }else if(cameraData.cameraPoint){
    var position = glMatrix.vec3.transformMat4([],[0,0,0],cameraData.cameraPoint[0][0]);
    let offset = [0,0,50*cameraData.cameraPoint[0][1][0]];
    glMatrix.vec3.transformMat4(offset,offset,cameraData.cameraPoint[0][2]);
    glMatrix.vec3.transformMat4(offset,offset,cameraData.cameraPoint[0][3]);
    glMatrix.vec3.add(position,position,offset);
    cameraData.matrix = (new Matrix4()).lookAt(...position,...glMatrix.vec3.add([],position,[Math.cos(cameraData.time),Math.sin(cameraData.time),0]),...[0,0,1]);
  }else{
    cameraData.matrix = (new Matrix4()).lookAt(...cameraData.camera,...cameraData.target,...cameraData.up);
  }
  modelMatrix.set(projMatrix).multiply(cameraData.matrix);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, modelMatrix.elements);
  gl.clear(gl.DEPTH_BUFFER_BIT|gl.COLOR_BUFFER_BIT);
  g_points.forEach(item=>{
    if(false&&perspective&&(cameraData.targetPoint&&item===cameraData.targetPoint||cameraData.cameraPoint&&item===cameraData.cameraPoint))return;
    let selectData = null;
    var _transform = glMatrix.mat4.mul([],item[0][3],item[0][2]);
    gl.uniformMatrix4fv(u_TransformInvertMatrix,false, _transform);
    glMatrix.mat4.mul(_transform,item[0][1],_transform);
    glMatrix.mat4.mul(_transform,item[0][0],_transform);
    gl.uniformMatrix4fv(u_TransformMatrix,false, _transform);
    // gl.uniformMatrix4fv(u_TransformInvertMatrix,false, glMatrix.mat4.invert([],_transform));
    
    if(item[1] == 0){
      //红树
      gl.uniform4f(u_FragColor, 1, item[2], 0, 5);
      selectData = level4_data;
    }else if(item[1] == 2){
      //蓝树
      gl.uniform4f(u_FragColor, 0, item[2], 1, 20);
      selectData = level6_data;
    }else if(item[1] == 1){
      //黄光
      gl.uniform4f(u_FragColor, 1, item[2], 0, 0);
      selectData = sphere_data;
    }
    gl.uniform1f(u_SelectIndex, selectIndex);
    if(indexColor){
      //根据索引设置颜色
      gl.uniform1f(u_Type, 4);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
      gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(selectData.triangles), gl.STATIC_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, selectData.triangles.length/3);
    }else{
      if(normalsMode){
        //法向量
        gl.uniform1f(u_Type, 1);
        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(selectData.normalLines), gl.STATIC_DRAW);
        gl.drawArrays(gl.LINES, 0, selectData.normalLines.length/3);
      }
      if(wireframeMode){
        //Wireframe
        gl.uniform1f(u_Type, 0);
        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(selectData.lines), gl.STATIC_DRAW);
        gl.drawArrays(gl.LINES, 0, selectData.lines.length/3);
      }else if(lightMode){
        //light mode
        gl.uniform1f(u_Type, 3);
        gl.uniform1f(u_shadingMode, shadingMode);
        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(selectData.triangles), gl.STATIC_DRAW);
        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        if(shadingMode==1){
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(selectData.flatNormals), gl.STATIC_DRAW);
        }else{
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(selectData.normals), gl.STATIC_DRAW);
        }
        gl.drawArrays(gl.TRIANGLES, 0, selectData.triangles.length/3);
      }else{
        //TRIANGLES mode
        gl.uniform1f(u_Type, 2);
        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(selectData.triangles), gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, selectData.triangles.length/3);
      }
      //scale = [1,1,1];
    }
  });

}

function clickSideview() {
  // Get the checkbox
  var checkBox = document.getElementById("sideview");

  // If the checkbox is checked/uncheck
  if (checkBox.checked == true){
    sideview = true;
    cameraData.camera = glMatrix.vec3.add([],[0,-200,75],cameraData.target);
    console.log("click sideview");
  } else {
    sideview = false;
    cameraData.camera = glMatrix.vec3.add([],[0,0,200],cameraData.target);
    console.log("click topview");
  }
  //drawScene(gl);
}

function clickPersepectiveView() {
  var checkB = document.getElementById("perspective");
  
// If the checkbox is checked
  if (checkB.checked == true){
    perspective = true;
    projMatrix.setPerspective(fov, canvas.width/canvas.height, 1, 2000);
    //drawScene(gl);
    console.log("click perspective");
  } else {
    perspective = false;
    projMatrix.setOrtho(-200,200,-200,200,-1000,1000);
    //drawScene(gl);
    console.log("click Ortho");
  }
}
function clickNormalsView(){
  // Get the checkbox
  var checkBox = document.getElementById("normals");

  // If the checkbox is checked/uncheck
  if (checkBox.checked == true){
    normalsMode = true;
    //drawScene(gl);
    console.log("click normals");
  } else {
    normalsMode = false;
    //drawScene(gl);
    console.log("click normals");
  }
}
function clickWireframeView(){
  // Get the checkbox
  var checkBox = document.getElementById("wireframe");

  // If the checkbox is checked/uncheck
  if (checkBox.checked == true){
    wireframeMode = true;
    //drawScene(gl);
    console.log("click wireframe");
  } else {
    wireframeMode = false;
    //drawScene(gl);
    console.log("click wireframe");
  }
}
function clickLightView(){
  // Get the checkbox
  var checkBox = document.getElementById("light");

  // If the checkbox is checked/uncheck
  if (checkBox.checked == true){
    lightMode = true;
    //drawScene(gl);
    console.log("click light");
  } else {
    lightMode = false;
    //drawScene(gl);
    console.log("click light");
  }
}
function clickShadingView(){
  // Get the checkbox
  var checkBox = document.getElementById("shading");
  shadingMode = checkBox.value;
  //drawScene(gl);
}

function setLightView(value) {
  // Get the checkbox
  document.getElementById("light").checked = value;
  lightMode = value;
}

function setLWireframeView(value) {
  // Get the checkbox
  document.getElementById("wireframe").checked = value;
  wireframeMode = value;
}

function setNormalsView(value) {
  // Get the checkbox
  document.getElementById("normals").checked = value;
  normalsMode = value;
}

function setPersepectiveView(value) {
  // Get the checkbox
  document.getElementById("perspective").checked = value;
  perspective = value;
}

function setSideview(value) {
  // Get the checkbox
  document.getElementById("sideview").checked = value;
  sideview = value;
}

function fakeClick(obj) {
  var ev = document.createEvent("MouseEvents");
  ev.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  obj.dispatchEvent(ev);
}

function exportRaw(name, data) {
  var urlObject = window.URL || window.webkitURL || window;
  var export_blob = new Blob([data]);
  var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
  save_link.href = urlObject.createObjectURL(export_blob);
  save_link.download = name;
  fakeClick(save_link);
}

function saveFile(){
  //var sideview = false;
 //var normalsMode = false;
//var wireframeMode = false;
//var lightMode = false;
  var saveValue = [];
  saveValue.push(g_points);
  saveValue.push(wireframeMode);
  saveValue.push(sideview);
  saveValue.push(normalsMode);
  saveValue.push(lightMode);
  saveValue.push(perspective);
  //arr.push(document.querySelector('#text').value);
  exportRaw('program2Save.json', JSON.stringify(saveValue));
}

function onChange(event) {
  var file = event.target.files[0];
  var reader = new FileReader();
  reader.onload = function(e) {
    // The file's text will be printed here
    var save = JSON.parse(e.target.result);
    var points = save[0];
    g_points = [];
    points.forEach(item=>{
      g_points.push(item);
    });

    setLWireframeView(save[1]);
    setSideview(save[2]);
    setNormalsView(save[3]);
    setLightView(save[4]);
    setPersepectiveView(save[5]);
    //drawScene(gl);
 
  };

  reader.readAsText(file);
}

function getModelData(b1,b2,t1,t2,rotateMatrix,bottom){
  let ModelData = {
    triangles:[],
    lines:[],
    normals:[],
    flatNormals:[],
    normalLines:[],
  };
  let normal_b1 = glMatrix.vec3.normalize([],b1);
  let normal_b2 = glMatrix.vec3.normalize([],b2);
  let normal_t1 = glMatrix.vec3.normalize([],t1);
  let normal_t2 = glMatrix.vec3.normalize([],t2);
  if(rotateMatrix&&bottom){
    normal_t1 = glMatrix.vec3.normalize([],[t1[0],0,t1[2]]);
    normal_t2 = glMatrix.vec3.normalize([],[t2[0],0,t2[2]]);
    {
      //normal revisement
      const line_t1_b1 = glMatrix.vec3.normalize([],glMatrix.vec3.sub([],t1,b1));
      const line_t2_b2 = glMatrix.vec3.normalize([],glMatrix.vec3.sub([],t2,b2));
      const axis_t1 = glMatrix.vec3.cross([],line_t1_b1,normal_t1);
      normal_t1 = glMatrix.vec3.transformMat4([],line_t1_b1,getRotateMat(axis_t1,Math.PI/2));
      const axis_t2 = glMatrix.vec3.cross([],line_t2_b2,normal_t2);
      normal_t2 = glMatrix.vec3.transformMat4([],line_t2_b2,getRotateMat(axis_t2,Math.PI/2));
      const axis_b1 = glMatrix.vec3.cross([],line_t1_b1,normal_b1);
      normal_b1 = glMatrix.vec3.transformMat4([],line_t1_b1,getRotateMat(axis_b1,Math.PI/2));
      const axis_b2 = glMatrix.vec3.cross([],line_t2_b2,normal_b2);
      normal_b2 = glMatrix.vec3.transformMat4([],line_t2_b2,getRotateMat(axis_b2,Math.PI/2));
    }
    //transform
    b1 = glMatrix.vec3.transformMat4([],b1,rotateMatrix);
    b2 = glMatrix.vec3.transformMat4([],b2,rotateMatrix);
    t1 = glMatrix.vec3.transformMat4([],t1,rotateMatrix);
    t2 = glMatrix.vec3.transformMat4([],t2,rotateMatrix);
    b1 = glMatrix.vec3.add([],b1,bottom);
    b2 = glMatrix.vec3.add([],b2,bottom);
    t1 = glMatrix.vec3.add([],t1,bottom);
    t2 = glMatrix.vec3.add([],t2,bottom);
    normal_b1 = glMatrix.vec3.transformMat4([],normal_b1,rotateMatrix);
    normal_b2 = glMatrix.vec3.transformMat4([],normal_b2,rotateMatrix);
    normal_t1 = glMatrix.vec3.transformMat4([],normal_t1,rotateMatrix);
    normal_t2 = glMatrix.vec3.transformMat4([],normal_t2,rotateMatrix);
  }
  ModelData.triangles.push(...b1,...b2,...t1,...t1,...b2,...t2);
  ModelData.lines.push(...b1,...b2,...b2,...t2,...t2,...t1,...t1,...b1);
  ModelData.normals.push(...normal_b1,...normal_b2,...normal_t1,...normal_t1,...normal_b2,...normal_t2);
  const flatNormal = glMatrix.vec3.normalize([],glMatrix.vec3.cross([],
    glMatrix.vec3.normalize([],glMatrix.vec3.sub([],t2,b2)),
    glMatrix.vec3.normalize([],glMatrix.vec3.sub([],b1,b2)),
  ));
  ModelData.flatNormals.push(...flatNormal,...flatNormal,...flatNormal,...flatNormal,...flatNormal,...flatNormal);
  ModelData.normalLines.push(
    ...b1,...glMatrix.vec3.add([],b1,glMatrix.vec3.scale([],normal_b1,10)),
    ...b2,...glMatrix.vec3.add([],b2,glMatrix.vec3.scale([],normal_b2,10)),
    ...t1,...glMatrix.vec3.add([],t1,glMatrix.vec3.scale([],normal_t1,10)),
    ...t2,...glMatrix.vec3.add([],t2,glMatrix.vec3.scale([],normal_t2,10)),
  );
  // ModelData.normalLines.push(
  //   ...b1,...glMatrix.vec3.add([],b1,glMatrix.vec3.scale([],flatNormal,10)),
  //   ...b2,...glMatrix.vec3.add([],b2,glMatrix.vec3.scale([],flatNormal,10)),
  //   ...t1,...glMatrix.vec3.add([],t1,glMatrix.vec3.scale([],flatNormal,10)),
  //   ...t2,...glMatrix.vec3.add([],t2,glMatrix.vec3.scale([],flatNormal,10)),
  // );
  return ModelData;
}
function getSphereData(radius,subdivisions=10){
  const sphereData = {
    triangles:[],
    lines:[],
    normals:[],
    flatNormals:[],
    normalLines:[],
  };
  for(var longitude=0;longitude<subdivisions;longitude++){
    for(var latitude=0;latitude<subdivisions;latitude++){
      let t1 = [radius,0,0];
      t1 = glMatrix.vec3.rotateZ([],t1,[0,0,0],latitude/subdivisions*Math.PI-Math.PI/2);
      t1 = glMatrix.vec3.rotateY([],t1,[0,0,0],longitude/subdivisions*Math.PI*2);
      let t2 = [radius,0,0];
      t2 = glMatrix.vec3.rotateZ([],t2,[0,0,0],latitude/subdivisions*Math.PI-Math.PI/2);
      t2 = glMatrix.vec3.rotateY([],t2,[0,0,0],(longitude+1)/subdivisions*Math.PI*2);
      let b1 = [radius,0,0];
      b1 = glMatrix.vec3.rotateZ([],b1,[0,0,0],(latitude+1)/subdivisions*Math.PI-Math.PI/2);
      b1 = glMatrix.vec3.rotateY([],b1,[0,0,0],longitude/subdivisions*Math.PI*2);
      let b2 = [radius,0,0];
      b2 = glMatrix.vec3.rotateZ([],b2,[0,0,0],(latitude+1)/subdivisions*Math.PI-Math.PI/2);
      b2 = glMatrix.vec3.rotateY([],b2,[0,0,0],(longitude+1)/subdivisions*Math.PI*2);
      
      let model = getModelData(t1,t2,b1,b2,);
      sphereData.triangles.push(...model.triangles);
      sphereData.lines.push(...model.lines);
      sphereData.normals.push(...model.normals);
      sphereData.flatNormals.push(...model.flatNormals);
      sphereData.normalLines.push(...model.normalLines);
    }
  }
  return sphereData;
}
function getPrismData(depth,length,isRoot){
  //Use the line below if you would like to see the trees I created using createTree function but not dots from another file
  //var treeBone = createTree(depth,length,isRoot);
  
  var treeBone;
  if (depth == 4) {
    treeBone = treeR4;
  }else{
    treeBone = treeR6;
  }
  
  const prismData = {
    triangles:[],
    lines:[],
    normals:[],
    flatNormals:[],
    normalLines:[],
  };
  for(let i=0;i<treeBone.length/6;i++){
    const bottom = [treeBone[i*6],treeBone[i*6+1],treeBone[i*6+2]];
    const top = [treeBone[i*6+3],treeBone[i*6+4],treeBone[i*6+5]];
    const prism = createPrism(bottom,top);
    prismData.triangles.push(...prism.triangles);
    prismData.lines.push(...prism.lines);
    prismData.normals.push(...prism.normals);
    prismData.flatNormals.push(...prism.flatNormals);
    prismData.normalLines.push(...prism.normalLines);
  }
  return prismData;
}
function createPrism(bottom,top,subdivisions=12){
  let rotateTo = glMatrix.vec3.sub([],top,bottom);
  const len = glMatrix.vec3.len(rotateTo);
  rotateTo = glMatrix.vec3.normalize([],rotateTo);
  const angle = glMatrix.vec3.angle([0,1,0],rotateTo);
  const axis = glMatrix.vec3.cross([],[0,1,0],rotateTo);
  const rotateMatrix = getRotateMat(axis,angle);
  const bottomRadius = len/8;
  const topRadius = bottomRadius/2;
  const prism = {
    triangles:[],
    lines:[],
    normals:[],
    flatNormals:[],
    normalLines:[],
  };
  for(let i = 0;i<subdivisions;i++){
    let b1 = [bottomRadius,0,0];
    b1 = glMatrix.vec3.rotateY([],b1,[0,0,0],i/subdivisions*Math.PI*2);
    let t1 = [topRadius,len,0];
    t1 = glMatrix.vec3.rotateY([],t1,[0,len,0],i/subdivisions*Math.PI*2);
    let b2 = glMatrix.vec3.rotateY([],b1,[0,0,0],1/subdivisions*Math.PI*2);
    let t2 = glMatrix.vec3.rotateY([],t1,[0,len,0],1/subdivisions*Math.PI*2);
    let model = getModelData(b1,b2,t1,t2,rotateMatrix,bottom);
    prism.triangles.push(...model.triangles);
    prism.lines.push(...model.lines);
    prism.normals.push(...model.normals);
    prism.flatNormals.push(...model.flatNormals);
    prism.normalLines.push(...model.normalLines);
  }
  return prism;
}


function getRotateMat(axis,angle){
  let mat4 = glMatrix.mat4.create();
  if(angle){
    mat4 = glMatrix.mat4.fromRotation(mat4,angle,axis);
  }
  return mat4;
}

//Below two functions are to create trees by formula but not points generated by modeling from another file

function nodeRotate(vec3,axis,angle){
  return glMatrix.vec3.transformMat4([],vec3,getRotateMat(axis,angle));
}


//三叉树 point 数据生成方法
function createTree(depth,length,angle,ancestor,parent,ancestor2=[-1,0,0]){
  let root = [];
  if(angle===true){
    //root node
    angle = 0;
    ancestor = [0,0,0];
    parent = [0,0,length];
    root = [...ancestor,...parent];
    length/=2;
  }
  const offsetAngle = Math.PI*2/3;
  //旋转轴
  const axis = glMatrix.vec3.normalize([],[
    parent[0]-ancestor[0],
    parent[1]-ancestor[1],
    parent[2]-ancestor[2],
  ]);

  //第一个点的初始坐标
  let v1 = [-axis[0]*length,-axis[1]*length,-axis[2]*length];
  const axisV1 = glMatrix.vec3.cross([],axis,glMatrix.vec3.normalize([],[
    ancestor2[0]-ancestor[0],
    ancestor2[1]-ancestor[1],
    ancestor2[2]-ancestor[2],
  ]));
  v1 = nodeRotate(v1,axisV1,Math.PI*3/4);
  

  //v2 v3 根据新生成的v1向量 旋转 +/- 120° 生成v2 v3向量坐标
  let v2 = nodeRotate(v1,axis,offsetAngle);
  let v3 = nodeRotate(v1,axis,-offsetAngle);
  const childLine = [];
  
  //生成最终坐标
  v1 = glMatrix.vec3.add([],parent,v1);
  v2 = glMatrix.vec3.add([],parent,v2);
  v3 = glMatrix.vec3.add([],parent,v3);

  //递归子节点
  if(depth>1){
    childLine.push(...createTree(depth-1,length/2,angle,parent,v1,ancestor));
    childLine.push(...createTree(depth-1,length/2,angle+offsetAngle,parent,v2,ancestor));
    childLine.push(...createTree(depth-1,length/2,angle-offsetAngle,parent,v3,ancestor));
  }
  return [
    ...root,
    ...parent,...v1,
    ...parent,...v2,
    ...parent,...v3,
    ...childLine
  ];
}



  // Note: WebGL is column major order
  






