// Inputs
attribute vec4 a_position;

// Uniforms
uniform mat4 u_worldViewProjectionMatrix;
uniform vec2 u_depthRange; // x: nearPlane; y: 1.0 / (farPlane - nearPlane);

// Outputs
varying float v_depth;

#if defined(SKINNING)
attribute vec4 a_blendWeights;
attribute vec4 a_blendIndices;
uniform vec4 u_matrixPalette[SKINNING_JOINT_COUNT * 3];
#endif

#if defined(SKINNING)
#include "skinning.vert"
#else
#include "skinning-none.vert"
#endif

void main()
{
    vec4 position = getPosition();
    gl_Position = u_worldViewProjectionMatrix * position;
    v_depth = (gl_Position.z - u_depthRange.x) * u_depthRange.y;
}
