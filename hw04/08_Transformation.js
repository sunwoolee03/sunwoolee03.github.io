// 08_Transformation.js - Solar System with Colored Axes and Shader Fixes

import { resizeAspectRatio, setupText, updateText, Axes } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';

let isInitialized = false;
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let axesVAO;
let cubeVAO;
let axes

let lastTime = 0;

let sunRotation = 0;
let earthRotation = 0, earthOrbit = 0;
let moonRotation = 0, moonOrbit = 0;

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) return;
    main().then(success => {
        if (!success) {
            console.log('프로그램을 종료합니다.');
            return;
        }
        isInitialized = true;
        requestAnimationFrame(animate);
    }).catch(error => {
        console.error('프로그램 실행 중 오류 발생:', error);
    });
});

function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported by your browser.');
        return false;
    }
    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.3, 0.4, 1.0);
    return true;
}


function setupCubeBuffers() {
    const cubeVertices = new Float32Array([
        -0.5,  0.5, 0.0,
        -0.5, -0.5, 0.0,
         0.5, -0.5, 0.0,
         0.5,  0.5, 0.0
    ]);

    const indices = new Uint16Array([
        0, 1, 2,
        0, 2, 3
    ]);

    cubeVAO = gl.createVertexArray();
    gl.bindVertexArray(cubeVAO);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
    shader.setAttribPointer("a_position", 3, gl.FLOAT, false, 0, 0);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
}




function animate(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    sunRotation += 45 * Math.PI / 180 * deltaTime;
    earthRotation += 180 * Math.PI / 180 * deltaTime;
    earthOrbit += 30 * Math.PI / 180 * deltaTime;
    moonRotation += 180 * Math.PI / 180 * deltaTime;
    moonOrbit += 360 * Math.PI / 180 * deltaTime;

    gl.clear(gl.COLOR_BUFFER_BIT);

    axes.draw(mat4.create(), mat4.create());

    let sunMatrix = mat4.create();
    mat4.rotateZ(sunMatrix, sunMatrix, sunRotation);
    mat4.scale(sunMatrix, sunMatrix, [0.2, 0.2, 1]);
    drawObject(sunMatrix, [1, 0, 0, 1]);

    let earthMatrix = mat4.create();
    mat4.rotateZ(earthMatrix, earthMatrix, earthOrbit);
    mat4.translate(earthMatrix, earthMatrix, [0.7, 0, 0]);
    mat4.rotateZ(earthMatrix, earthMatrix, earthRotation);
    mat4.scale(earthMatrix, earthMatrix, [0.1, 0.1, 1]);
    drawObject(earthMatrix, [0, 1, 1, 1]);

    let moonMatrix = mat4.create();
    mat4.rotateZ(moonMatrix, moonMatrix, earthOrbit);
    mat4.translate(moonMatrix, moonMatrix, [0.7, 0, 0]);
    mat4.rotateZ(moonMatrix, moonMatrix, moonOrbit);
    mat4.translate(moonMatrix, moonMatrix, [0.2, 0, 0]);
    mat4.rotateZ(moonMatrix, moonMatrix, moonRotation);
    mat4.scale(moonMatrix, moonMatrix, [0.05, 0.05, 1]);
    drawObject(moonMatrix, [1, 1, 0, 1]);

    requestAnimationFrame(animate);
}


function drawObject(matrix, color) {

    shader.use();
    shader.setMat4("u_model", matrix);
    shader.setVec4("u_color", color);
    gl.bindVertexArray(cubeVAO);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    return new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

async function main() {
    try {
        if (!initWebGL()) throw new Error('WebGL 초기화 실패');
        shader = await initShader();
        //setupAxesBuffers();
        setupCubeBuffers();
        
        shader.use();
        axes = new Axes(gl, 1.0); 
        return true;
    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('프로그램 초기화에 실패했습니다.');
        return false;
    }
}