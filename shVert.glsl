#version 300 es

layout (location = 0) in vec3 aPos;

uniform float dx, dy;

void main() {
    gl_Position = vec4(aPos[0]+dx, aPos[1]+dy, aPos[2], 1.0);
} 