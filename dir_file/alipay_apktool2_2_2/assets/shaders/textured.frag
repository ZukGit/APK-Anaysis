#ifdef OPENGL_ES
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#endif

#ifndef DIRECTIONAL_LIGHT_COUNT
#define DIRECTIONAL_LIGHT_COUNT 0
#endif
#ifndef SPOT_LIGHT_COUNT
#define SPOT_LIGHT_COUNT 0
#endif
#ifndef POINT_LIGHT_COUNT
#define POINT_LIGHT_COUNT 0
#endif
#if (DIRECTIONAL_LIGHT_COUNT > 0) || (POINT_LIGHT_COUNT > 0) || (SPOT_LIGHT_COUNT > 0)
#define LIGHTING
#endif

///////////////////////////////////////////////////////////
// Uniforms
uniform vec3 u_ambientColor;

uniform sampler2D u_diffuseTexture;

#if defined(LIGHTMAP)
uniform sampler2D u_lightmapTexture;
#endif

#if defined(LIGHTING)

#if defined(BUMPED)
uniform sampler2D u_normalmapTexture;
#endif

#if (DIRECTIONAL_LIGHT_COUNT > 0)
uniform vec3 u_directionalLightColor[DIRECTIONAL_LIGHT_COUNT];
#if !defined(BUMPED)
uniform vec3 u_directionalLightDirection[DIRECTIONAL_LIGHT_COUNT];
#endif
#endif

#if (POINT_LIGHT_COUNT > 0)
uniform vec3 u_pointLightColor[POINT_LIGHT_COUNT];
uniform vec3 u_pointLightPosition[POINT_LIGHT_COUNT];
uniform float u_pointLightRangeInverse[POINT_LIGHT_COUNT];
#endif

#if (SPOT_LIGHT_COUNT > 0)
uniform vec3 u_spotLightColor[SPOT_LIGHT_COUNT];
uniform float u_spotLightRangeInverse[SPOT_LIGHT_COUNT];
uniform float u_spotLightInnerAngleCos[SPOT_LIGHT_COUNT];
uniform float u_spotLightOuterAngleCos[SPOT_LIGHT_COUNT];
#if !defined(BUMPED)
uniform vec3 u_spotLightDirection[SPOT_LIGHT_COUNT];
#endif
#endif

#if defined(SPECULAR)
uniform float u_specularExponent;
#endif

#endif

#if defined(MODULATE_COLOR)
uniform vec4 u_modulateColor;
#endif

#if defined(MODULATE_ALPHA)
uniform float u_modulateAlpha;
#endif

#if defined(SHADOW_MAPPING)
uniform float       u_pixelOffset; // 1.0 / shadow_texture_size
uniform sampler2D   u_shadowMap;
#endif

///////////////////////////////////////////////////////////
// Variables
vec4 _baseColor;

///////////////////////////////////////////////////////////
// Varyings
varying vec2 v_texCoord;

#if defined(LIGHTMAP)
varying vec2 v_texCoord1;
#endif

#if defined(LIGHTING)

#if !defined(BUMPED)
varying vec3 v_normalVector;
#endif

#if defined(BUMPED) && (DIRECTIONAL_LIGHT_COUNT > 0)
varying vec3 v_directionalLightDirection[DIRECTIONAL_LIGHT_COUNT];
#endif

#if (POINT_LIGHT_COUNT > 0)
varying vec3 v_vertexToPointLightDirection[POINT_LIGHT_COUNT];
#endif

#if (SPOT_LIGHT_COUNT > 0)
varying vec3 v_vertexToSpotLightDirection[SPOT_LIGHT_COUNT];
#if defined(BUMPED)
varying vec3 v_spotLightDirection[SPOT_LIGHT_COUNT];
#endif
#endif

#if defined(SPECULAR)
varying vec3 v_cameraDirection; 
#endif

#include "lighting.frag"

#endif

#if defined(CLIP_PLANE)
varying float v_clipDistance;
#endif

// Alpha Test
#ifndef DISCARD_ALPHA
#define DISCARD_ALPHA 0.5
#endif

#if defined(SHADOW_MAPPING)
varying vec4 v_shadowTexCoord;

// shadow alpha
#ifndef SHADOW_ALPHA
#define SHADOW_ALPHA 0.6
#endif

float getDepth(vec2 uv)
{
    vec4 depthPacked = texture2D(u_shadowMap, uv);
    return depthPacked.r / 1.0 +
           depthPacked.g / 256.0 +
           depthPacked.b / 65536.0 +
           depthPacked.a / 16777216.0;
}

float getShadowValue()
{
    vec4 shadowUV = v_shadowTexCoord;
    shadowUV.xy = shadowUV.xy / shadowUV.w;
    float centerDepth = getDepth(shadowUV.xy);
    float final = (centerDepth > shadowUV.z) ? 1.0 : 0.0;
 
    // PCF
    vec4 depths = vec4(getDepth(shadowUV.xy + vec2(-u_pixelOffset, 0)),
                       getDepth(shadowUV.xy + vec2(+u_pixelOffset, 0)),
                       getDepth(shadowUV.xy + vec2(0, -u_pixelOffset)),
                       getDepth(shadowUV.xy + vec2(0, +u_pixelOffset)));
    bvec4 vecCmp = greaterThan(depths, vec4(shadowUV.z));
    final += float(vecCmp.x);
    final += float(vecCmp.y);
    final += float(vecCmp.z);
    final += float(vecCmp.w);
    final *= 0.2;

    return final * (1.0 - SHADOW_ALPHA) + SHADOW_ALPHA;
}
#endif


void main()
{
    #if defined(CLIP_PLANE)
    if(v_clipDistance < 0.0) discard;
    #endif
 
    _baseColor = texture2D(u_diffuseTexture, v_texCoord);
 
    gl_FragColor.a = _baseColor.a;

    #if defined(TEXTURE_DISCARD_ALPHA)
    if (gl_FragColor.a < DISCARD_ALPHA)
        discard;
    #endif

    #if defined(LIGHTING)

    gl_FragColor.rgb = getLitPixel();
    #else
    gl_FragColor.rgb = _baseColor.rgb;
    #endif

	#if defined(LIGHTMAP)
	vec4 lightColor = texture2D(u_lightmapTexture, v_texCoord1);
	gl_FragColor.rgb *= lightColor.rgb;
	#endif

    #if defined(MODULATE_COLOR)
    gl_FragColor *= u_modulateColor;
    #endif

    #if defined(MODULATE_ALPHA)
    gl_FragColor.a *= u_modulateAlpha;
    #endif
    
    #if defined(SHADOW_MAPPING)
    float sv = getShadowValue();
    gl_FragColor.rgb *= sv;
    #if defined(SHADOW_DISCARD)
    if (sv == 1.0) {
        discard;
    }
    #endif
    #endif
}
