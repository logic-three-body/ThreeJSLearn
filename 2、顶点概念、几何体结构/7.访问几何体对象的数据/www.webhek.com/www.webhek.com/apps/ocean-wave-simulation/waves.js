(function() {
    'use strict';

    var INITIAL_SIZE = 250,
        INITIAL_WIND = [10.0, 10.0],
        INITIAL_CHOPPINESS = 1.5;

    var UI_COLOR = 'rgb(52, 137, 189)';

    var addToVector = function(out, a, b) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        return out;
    };

    var subtractFromVector = function(out, a, b) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        return out;
    };

    var multiplyVectorByScalar = function(out, v, k) {
        out[0] = v[0] * k;
        out[1] = v[1] * k;
        out[2] = v[2] * k;
        return out;
    };

    var makeIdentityMatrix = function(matrix) {
        matrix[0] = 1.0;
        matrix[1] = 0.0;
        matrix[2] = 0.0;
        matrix[3] = 0.0;
        matrix[4] = 0.0;
        matrix[5] = 1.0;
        matrix[6] = 0.0;
        matrix[7] = 0.0;
        matrix[8] = 0.0;
        matrix[9] = 0.0;
        matrix[10] = 1.0;
        matrix[11] = 0.0;
        matrix[12] = 0.0;
        matrix[13] = 0.0;
        matrix[14] = 0.0;
        matrix[15] = 1.0;
        return matrix;
    };

    var makeXRotationMatrix = function(matrix, angle) {
        matrix[0] = 1.0;
        matrix[1] = 0.0;
        matrix[2] = 0.0;
        matrix[3] = 0.0;
        matrix[4] = 0.0;
        matrix[5] = Math.cos(angle);
        matrix[6] = Math.sin(angle);
        matrix[7] = 0.0;
        matrix[8] = 0.0;
        matrix[9] = -Math.sin(angle);
        matrix[10] = Math.cos(angle);
        matrix[11] = 0.0;
        matrix[12] = 0.0;
        matrix[13] = 0.0;
        matrix[14] = 0.0;
        matrix[15] = 1.0;
        return matrix;
    };

    var makeYRotationMatrix = function(matrix, angle) {
        matrix[0] = Math.cos(angle);
        matrix[1] = 0.0
        matrix[2] = -Math.sin(angle);
        matrix[3] = 0.0
        matrix[4] = 0.0
        matrix[5] = 1.0
        matrix[6] = 0.0;
        matrix[7] = 0.0;
        matrix[8] = Math.sin(angle);
        matrix[9] = 0.0
        matrix[10] = Math.cos(angle);
        matrix[11] = 0.0;
        matrix[12] = 0.0;
        matrix[13] = 0.0;
        matrix[14] = 0.0;
        matrix[15] = 1.0;
        return matrix;
    };

    var distanceBetweenVectors = function(a, b) {
        var xDist = b[0] - a[0],
            yDist = b[1] - a[1],
            zDist = b[2] - a[2];
        return Math.sqrt(xDist * xDist + yDist * yDist + zDist * zDist);
    };

    var lengthOfVector = function(v) {
        var x = v[0],
            y = v[1],
            z = v[2];
        return Math.sqrt(x * x + y * y + z * z);
    };

    var setVector4 = function(out, x, y, z, w) {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[3] = w;
        return out;
    }

    var projectVector4 = function(out, v) {
        var reciprocalW = 1 / v[3];
        out[0] = v[0] * reciprocalW;
        out[1] = v[1] * reciprocalW;
        out[2] = v[2] * reciprocalW;
        return out;
    };

    var transformVectorByMatrix = function(out, v, m) {
        var x = v[0],
            y = v[1],
            z = v[2],
            w = v[3];
        out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
        out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
        out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
        out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
        return out;
    };

    var invertMatrix = function(out, m) {
        var m0 = m[0],
            m4 = m[4],
            m8 = m[8],
            m12 = m[12],
            m1 = m[1],
            m5 = m[5],
            m9 = m[9],
            m13 = m[13],
            m2 = m[2],
            m6 = m[6],
            m10 = m[10],
            m14 = m[14],
            m3 = m[3],
            m7 = m[7],
            m11 = m[11],
            m15 = m[15],

            temp0 = m10 * m15,
            temp1 = m14 * m11,
            temp2 = m6 * m15,
            temp3 = m14 * m7,
            temp4 = m6 * m11,
            temp5 = m10 * m7,
            temp6 = m2 * m15,
            temp7 = m14 * m3,
            temp8 = m2 * m11,
            temp9 = m10 * m3,
            temp10 = m2 * m7,
            temp11 = m6 * m3,
            temp12 = m8 * m13,
            temp13 = m12 * m9,
            temp14 = m4 * m13,
            temp15 = m12 * m5,
            temp16 = m4 * m9,
            temp17 = m8 * m5,
            temp18 = m0 * m13,
            temp19 = m12 * m1,
            temp20 = m0 * m9,
            temp21 = m8 * m1,
            temp22 = m0 * m5,
            temp23 = m4 * m1,

            t0 = (temp0 * m5 + temp3 * m9 + temp4 * m13) - (temp1 * m5 + temp2 * m9 + temp5 * m13),
            t1 = (temp1 * m1 + temp6 * m9 + temp9 * m13) - (temp0 * m1 + temp7 * m9 + temp8 * m13),
            t2 = (temp2 * m1 + temp7 * m5 + temp10 * m13) - (temp3 * m1 + temp6 * m5 + temp11 * m13),
            t3 = (temp5 * m1 + temp8 * m5 + temp11 * m9) - (temp4 * m1 + temp9 * m5 + temp10 * m9),

            d = 1.0 / (m0 * t0 + m4 * t1 + m8 * t2 + m12 * t3);

        out[0] = d * t0;
        out[1] = d * t1;
        out[2] = d * t2;
        out[3] = d * t3;
        out[4] = d * ((temp1 * m4 + temp2 * m8 + temp5 * m12) - (temp0 * m4 + temp3 * m8 + temp4 * m12));
        out[5] = d * ((temp0 * m0 + temp7 * m8 + temp8 * m12) - (temp1 * m0 + temp6 * m8 + temp9 * m12));
        out[6] = d * ((temp3 * m0 + temp6 * m4 + temp11 * m12) - (temp2 * m0 + temp7 * m4 + temp10 * m12));
        out[7] = d * ((temp4 * m0 + temp9 * m4 + temp10 * m8) - (temp5 * m0 + temp8 * m4 + temp11 * m8));
        out[8] = d * ((temp12 * m7 + temp15 * m11 + temp16 * m15) - (temp13 * m7 + temp14 * m11 + temp17 * m15));
        out[9] = d * ((temp13 * m3 + temp18 * m11 + temp21 * m15) - (temp12 * m3 + temp19 * m11 + temp20 * m15));
        out[10] = d * ((temp14 * m3 + temp19 * m7 + temp22 * m15) - (temp15 * m3 + temp18 * m7 + temp23 * m15));
        out[11] = d * ((temp17 * m3 + temp20 * m7 + temp23 * m11) - (temp16 * m3 + temp21 * m7 + temp22 * m11));
        out[12] = d * ((temp14 * m10 + temp17 * m14 + temp13 * m6) - (temp16 * m14 + temp12 * m6 + temp15 * m10));
        out[13] = d * ((temp20 * m14 + temp12 * m2 + temp19 * m10) - (temp18 * m10 + temp21 * m14 + temp13 * m2));
        out[14] = d * ((temp18 * m6 + temp23 * m14 + temp15 * m2) - (temp22 * m14 + temp14 * m2 + temp19 * m6));
        out[15] = d * ((temp22 * m10 + temp16 * m2 + temp21 * m6) - (temp20 * m6 + temp23 * m10 + temp17 * m2));

        return out;
    };

    var premultiplyMatrix = function(out, matrixA, matrixB) {
        var b0 = matrixB[0],
            b4 = matrixB[4],
            b8 = matrixB[8],
            b12 = matrixB[12],
            b1 = matrixB[1],
            b5 = matrixB[5],
            b9 = matrixB[9],
            b13 = matrixB[13],
            b2 = matrixB[2],
            b6 = matrixB[6],
            b10 = matrixB[10],
            b14 = matrixB[14],
            b3 = matrixB[3],
            b7 = matrixB[7],
            b11 = matrixB[11],
            b15 = matrixB[15],

            aX = matrixA[0],
            aY = matrixA[1],
            aZ = matrixA[2],
            aW = matrixA[3];
        out[0] = b0 * aX + b4 * aY + b8 * aZ + b12 * aW;
        out[1] = b1 * aX + b5 * aY + b9 * aZ + b13 * aW;
        out[2] = b2 * aX + b6 * aY + b10 * aZ + b14 * aW;
        out[3] = b3 * aX + b7 * aY + b11 * aZ + b15 * aW;

        aX = matrixA[4], aY = matrixA[5], aZ = matrixA[6], aW = matrixA[7];
        out[4] = b0 * aX + b4 * aY + b8 * aZ + b12 * aW;
        out[5] = b1 * aX + b5 * aY + b9 * aZ + b13 * aW;
        out[6] = b2 * aX + b6 * aY + b10 * aZ + b14 * aW;
        out[7] = b3 * aX + b7 * aY + b11 * aZ + b15 * aW;

        aX = matrixA[8], aY = matrixA[9], aZ = matrixA[10], aW = matrixA[11];
        out[8] = b0 * aX + b4 * aY + b8 * aZ + b12 * aW;
        out[9] = b1 * aX + b5 * aY + b9 * aZ + b13 * aW;
        out[10] = b2 * aX + b6 * aY + b10 * aZ + b14 * aW;
        out[11] = b3 * aX + b7 * aY + b11 * aZ + b15 * aW;

        aX = matrixA[12], aY = matrixA[13], aZ = matrixA[14], aW = matrixA[15];
        out[12] = b0 * aX + b4 * aY + b8 * aZ + b12 * aW;
        out[13] = b1 * aX + b5 * aY + b9 * aZ + b13 * aW;
        out[14] = b2 * aX + b6 * aY + b10 * aZ + b14 * aW;
        out[15] = b3 * aX + b7 * aY + b11 * aZ + b15 * aW;

        return out;
    };

    var makePerspectiveMatrix = function(matrix, fov, aspect, near, far) {
        var f = Math.tan(0.5 * (Math.PI - fov)),
            range = near - far;

        matrix[0] = f / aspect;
        matrix[1] = 0;
        matrix[2] = 0;
        matrix[3] = 0;
        matrix[4] = 0;
        matrix[5] = f;
        matrix[6] = 0;
        matrix[7] = 0;
        matrix[8] = 0;
        matrix[9] = 0;
        matrix[10] = far / range;
        matrix[11] = -1;
        matrix[12] = 0;
        matrix[13] = 0;
        matrix[14] = (near * far) / range;
        matrix[15] = 0.0;

        return matrix;
    };

    var clamp = function(x, min, max) {
        return Math.min(Math.max(x, min), max);
    };

    var log2 = function(number) {
        return Math.log(number) / Math.log(2);
    };

    var ProgramWrapper = function(gl, vertexShader, fragmentShader, attributeLocations) {
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        for (var attributeName in attributeLocations) {
            gl.bindAttribLocation(program, attributeLocations[attributeName], attributeName);
        }
        gl.linkProgram(program);
        var uniformLocations = {};
        var numberOfUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (var i = 0; i < numberOfUniforms; i += 1) {
            var activeUniform = gl.getActiveUniform(program, i),
                uniformLocation = gl.getUniformLocation(program, activeUniform.name);
            uniformLocations[activeUniform.name] = uniformLocation;
        }

        this.getUniformLocation = function(name) {
            return uniformLocations[name];
        };

        this.getProgram = function() {
            return program;
        }
    };

    var buildShader = function(gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        console.log(gl.getShaderInfoLog(shader));
        return shader;
    };

    var buildTexture = function(gl, unit, format, type, width, height, data, wrapS, wrapT, minFilter, magFilter) {
        var texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, type, data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
        return texture;
    };

    var buildFramebuffer = function(gl, attachment) {
        var framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, attachment, 0);
        return framebuffer;
    };

    var epsilon = function(x) {
        return Math.abs(x) < 0.000001 ? 0 : x;
    };

    var toCSSMatrix = function(m) { //flip y to make css and webgl coordinates consistent
        return 'matrix3d(' +
            epsilon(m[0]) + ',' +
            -epsilon(m[1]) + ',' +
            epsilon(m[2]) + ',' +
            epsilon(m[3]) + ',' +
            epsilon(m[4]) + ',' +
            -epsilon(m[5]) + ',' +
            epsilon(m[6]) + ',' +
            epsilon(m[7]) + ',' +
            epsilon(m[8]) + ',' +
            -epsilon(m[9]) + ',' +
            epsilon(m[10]) + ',' +
            epsilon(m[11]) + ',' +
            epsilon(m[12]) + ',' +
            -epsilon(m[13]) + ',' +
            epsilon(m[14]) + ',' +
            epsilon(m[15]) +
            ')';
    };

    var setPerspective = function(element, value) {
        element.style.WebkitPerspective = value;
        element.style.perspective = value;
    };

    var setTransformOrigin = function(element, value) {
        element.style.WebkitTransformOrigin = value;
        element.style.transformOrigin = value;
    };

    var setTransformStyle = function(element, value) {
        element.style.WebkitTransformStyle = value;
        element.style.transformStyle = value;
    };

    var setTransform = function(element, value) {
        element.style.WebkitTransform = value;
        element.style.transform = value;
    };

    var setText = function(element, value, decimalPlaces) {
        element.textContent = value.toFixed(decimalPlaces);
    };

    var getMousePosition = function(event, element) {
        var boundingRect = element.getBoundingClientRect();
        return {
            x: event.clientX - boundingRect.left,
            y: event.clientY - boundingRect.top
        };
    };

    var CAMERA_DISTANCE = 1500,
        ORBIT_POINT = [-200.0, 0.0, 600.0],
        INITIAL_AZIMUTH = 0.4,
        INITIAL_ELEVATION = 0.5,
        MIN_AZIMUTH = -0.2,
        MAX_AZIMUTH = 0.5,
        MIN_ELEVATION = 0.4,
        MAX_ELEVATION = 0.8;

    var Camera = function() {
        var azimuth = INITIAL_AZIMUTH,
            elevation = INITIAL_ELEVATION,

            viewMatrix = makeIdentityMatrix(new Float32Array(16)),
            position = new Float32Array(3),
            changed = true;

        this.changeAzimuth = function(deltaAzimuth) {
            azimuth += deltaAzimuth;
            azimuth = clamp(azimuth, MIN_AZIMUTH, MAX_AZIMUTH);
            changed = true;
        };

        this.changeElevation = function(deltaElevation) {
            elevation += deltaElevation;
            elevation = clamp(elevation, MIN_ELEVATION, MAX_ELEVATION);
            changed = true;
        };

        this.getPosition = function() {
            return position;
        };

        var orbitTranslationMatrix = makeIdentityMatrix(new Float32Array(16)),
            xRotationMatrix = new Float32Array(16),
            yRotationMatrix = new Float32Array(16),
            distanceTranslationMatrix = makeIdentityMatrix(new Float32Array(16));

        this.getViewMatrix = function() {
            if (changed) {
                makeIdentityMatrix(viewMatrix);

                makeXRotationMatrix(xRotationMatrix, elevation);
                makeYRotationMatrix(yRotationMatrix, azimuth);
                distanceTranslationMatrix[14] = -CAMERA_DISTANCE;
                orbitTranslationMatrix[12] = -ORBIT_POINT[0];
                orbitTranslationMatrix[13] = -ORBIT_POINT[1];
                orbitTranslationMatrix[14] = -ORBIT_POINT[2];

                premultiplyMatrix(viewMatrix, viewMatrix, orbitTranslationMatrix);
                premultiplyMatrix(viewMatrix, viewMatrix, yRotationMatrix);
                premultiplyMatrix(viewMatrix, viewMatrix, xRotationMatrix);
                premultiplyMatrix(viewMatrix, viewMatrix, distanceTranslationMatrix);

                position[0] = CAMERA_DISTANCE * Math.sin(Math.PI / 2 - elevation) * Math.sin(-azimuth) + ORBIT_POINT[0];
                position[1] = CAMERA_DISTANCE * Math.cos(Math.PI / 2 - elevation) + ORBIT_POINT[1];
                position[2] = CAMERA_DISTANCE * Math.sin(Math.PI / 2 - elevation) * Math.cos(-azimuth) + ORBIT_POINT[2];

                changed = false;
            }

            return viewMatrix;
        };
    };

    var CLEAR_COLOR = [1.0, 1.0, 1.0, 0.0],
        GEOMETRY_ORIGIN = [-1000.0, -1000.0],
        SUN_DIRECTION = [-1.0, 1.0, 1.0],
        OCEAN_COLOR = [0.004, 0.016, 0.047],
        SKY_COLOR = [3.2, 9.6, 12.8],
        EXPOSURE = 0.35,
        GEOMETRY_RESOLUTION = 256,
        GEOMETRY_SIZE = 2000,
        RESOLUTION = 512;

    var SIZE_OF_FLOAT = 4;

    var OCEAN_COORDINATES_UNIT = 1;

    var INITIAL_SPECTRUM_UNIT = 0,
        SPECTRUM_UNIT = 1,
        DISPLACEMENT_MAP_UNIT = 2,
        NORMAL_MAP_UNIT = 3,
        PING_PHASE_UNIT = 4,
        PONG_PHASE_UNIT = 5,
        PING_TRANSFORM_UNIT = 6,
        PONG_TRANSFORM_UNIT = 7;

    var FULLSCREEN_VERTEX_SOURCE = [
        'attribute vec2 a_position;',
        'varying vec2 v_coordinates;',

        'void main (void) {',
        'v_coordinates = a_position * 0.5 + 0.5;',
        'gl_Position = vec4(a_position, 0.0, 1.0);',
        '}',
    ].join('\n');

    //GPU FFT using a Stockham formulation
    var SUBTRANSFORM_FRAGMENT_SOURCE = [
        'precision highp float;',

        'const float PI = 3.14159265359;',

        'uniform sampler2D u_input;',

        'uniform float u_transformSize;',
        'uniform float u_subtransformSize;',

        'varying vec2 v_coordinates;',

        'vec2 multiplyComplex (vec2 a, vec2 b) {',
        'return vec2(a[0] * b[0] - a[1] * b[1], a[1] * b[0] + a[0] * b[1]);',
        '}',

        'void main (void) {',

        '#ifdef HORIZONTAL',
        'float index = v_coordinates.x * u_transformSize - 0.5;',
        '#else',
        'float index = v_coordinates.y * u_transformSize - 0.5;',
        '#endif',

        'float evenIndex = floor(index / u_subtransformSize) * (u_subtransformSize * 0.5) + mod(index, u_subtransformSize * 0.5);',

        //transform two complex sequences simultaneously
        '#ifdef HORIZONTAL',
        'vec4 even = texture2D(u_input, vec2(evenIndex + 0.5, gl_FragCoord.y) / u_transformSize).rgba;',
        'vec4 odd = texture2D(u_input, vec2(evenIndex + u_transformSize * 0.5 + 0.5, gl_FragCoord.y) / u_transformSize).rgba;',
        '#else',
        'vec4 even = texture2D(u_input, vec2(gl_FragCoord.x, evenIndex + 0.5) / u_transformSize).rgba;',
        'vec4 odd = texture2D(u_input, vec2(gl_FragCoord.x, evenIndex + u_transformSize * 0.5 + 0.5) / u_transformSize).rgba;',
        '#endif',

        'float twiddleArgument = -2.0 * PI * (index / u_subtransformSize);',
        'vec2 twiddle = vec2(cos(twiddleArgument), sin(twiddleArgument));',

        'vec2 outputA = even.xy + multiplyComplex(twiddle, odd.xy);',
        'vec2 outputB = even.zw + multiplyComplex(twiddle, odd.zw);',

        'gl_FragColor = vec4(outputA, outputB);',
        '}'
    ].join('\n');

    var INITIAL_SPECTRUM_FRAGMENT_SOURCE = [
        'precision highp float;',

        'const float PI = 3.14159265359;',
        'const float G = 9.81;',
        'const float KM = 370.0;',
        'const float CM = 0.23;',

        'uniform vec2 u_wind;',
        'uniform float u_resolution;',
        'uniform float u_size;',

        'float square (float x) {',
        'return x * x;',
        '}',

        'float omega (float k) {',
        'return sqrt(G * k * (1.0 + square(k / KM)));',
        '}',

        'float tanh (float x) {',
        'return (1.0 - exp(-2.0 * x)) / (1.0 + exp(-2.0 * x));',
        '}',

        'void main (void) {',
        'vec2 coordinates = gl_FragCoord.xy - 0.5;',
        'float n = (coordinates.x < u_resolution * 0.5) ? coordinates.x : coordinates.x - u_resolution;',
        'float m = (coordinates.y < u_resolution * 0.5) ? coordinates.y : coordinates.y - u_resolution;',
        'vec2 waveVector = (2.0 * PI * vec2(n, m)) / u_size;',
        'float k = length(waveVector);',

        'float U10 = length(u_wind);',

        'float Omega = 0.84;',
        'float kp = G * square(Omega / U10);',

        'float c = omega(k) / k;',
        'float cp = omega(kp) / kp;',

        'float Lpm = exp(-1.25 * square(kp / k));',
        'float gamma = 1.7;',
        'float sigma = 0.08 * (1.0 + 4.0 * pow(Omega, -3.0));',
        'float Gamma = exp(-square(sqrt(k / kp) - 1.0) / 2.0 * square(sigma));',
        'float Jp = pow(gamma, Gamma);',
        'float Fp = Lpm * Jp * exp(-Omega / sqrt(10.0) * (sqrt(k / kp) - 1.0));',
        'float alphap = 0.006 * sqrt(Omega);',
        'float Bl = 0.5 * alphap * cp / c * Fp;',

        'float z0 = 0.000037 * square(U10) / G * pow(U10 / cp, 0.9);',
        'float uStar = 0.41 * U10 / log(10.0 / z0);',
        'float alpham = 0.01 * ((uStar < CM) ? (1.0 + log(uStar / CM)) : (1.0 + 3.0 * log(uStar / CM)));',
        'float Fm = exp(-0.25 * square(k / KM - 1.0));',
        'float Bh = 0.5 * alpham * CM / c * Fm * Lpm;',

        'float a0 = log(2.0) / 4.0;',
        'float am = 0.13 * uStar / CM;',
        'float Delta = tanh(a0 + 4.0 * pow(c / cp, 2.5) + am * pow(CM / c, 2.5));',

        'float cosPhi = dot(normalize(u_wind), normalize(waveVector));',

        'float S = (1.0 / (2.0 * PI)) * pow(k, -4.0) * (Bl + Bh) * (1.0 + Delta * (2.0 * cosPhi * cosPhi - 1.0));',

        'float dk = 2.0 * PI / u_size;',
        'float h = sqrt(S / 2.0) * dk;',

        'if (waveVector.x == 0.0 && waveVector.y == 0.0) {',
        'h = 0.0;', //no DC term
        '}',

        'gl_FragColor = vec4(h, 0.0, 0.0, 0.0);',
        '}'
    ].join('\n');

    //phases stored in separate texture to ensure wave continuity on resizing
    var PHASE_FRAGMENT_SOURCE = [
        'precision highp float;',

        'const float PI = 3.14159265359;',
        'const float G = 9.81;',
        'const float KM = 370.0;',

        'varying vec2 v_coordinates;',

        'uniform sampler2D u_phases;',

        'uniform float u_deltaTime;',
        'uniform float u_resolution;',
        'uniform float u_size;',

        'float omega (float k) {',
        'return sqrt(G * k * (1.0 + k * k / KM * KM));',
        '}',

        'void main (void) {',
        'float deltaTime = 1.0 / 60.0;',
        'vec2 coordinates = gl_FragCoord.xy - 0.5;',
        'float n = (coordinates.x < u_resolution * 0.5) ? coordinates.x : coordinates.x - u_resolution;',
        'float m = (coordinates.y < u_resolution * 0.5) ? coordinates.y : coordinates.y - u_resolution;',
        'vec2 waveVector = (2.0 * PI * vec2(n, m)) / u_size;',

        'float phase = texture2D(u_phases, v_coordinates).r;',
        'float deltaPhase = omega(length(waveVector)) * u_deltaTime;',
        'phase = mod(phase + deltaPhase, 2.0 * PI);',

        'gl_FragColor = vec4(phase, 0.0, 0.0, 0.0);',
        '}'
    ].join('\n');

    var SPECTRUM_FRAGMENT_SOURCE = [
        'precision highp float;',

        'const float PI = 3.14159265359;',
        'const float G = 9.81;',
        'const float KM = 370.0;',

        'varying vec2 v_coordinates;',

        'uniform float u_size;',
        'uniform float u_resolution;',

        'uniform sampler2D u_phases;',
        'uniform sampler2D u_initialSpectrum;',

        'uniform float u_choppiness;',

        'vec2 multiplyComplex (vec2 a, vec2 b) {',
        'return vec2(a[0] * b[0] - a[1] * b[1], a[1] * b[0] + a[0] * b[1]);',
        '}',

        'vec2 multiplyByI (vec2 z) {',
        'return vec2(-z[1], z[0]);',
        '}',

        'float omega (float k) {',
        'return sqrt(G * k * (1.0 + k * k / KM * KM));',
        '}',

        'void main (void) {',
        'vec2 coordinates = gl_FragCoord.xy - 0.5;',
        'float n = (coordinates.x < u_resolution * 0.5) ? coordinates.x : coordinates.x - u_resolution;',
        'float m = (coordinates.y < u_resolution * 0.5) ? coordinates.y : coordinates.y - u_resolution;',
        'vec2 waveVector = (2.0 * PI * vec2(n, m)) / u_size;',

        'float phase = texture2D(u_phases, v_coordinates).r;',
        'vec2 phaseVector = vec2(cos(phase), sin(phase));',

        'vec2 h0 = texture2D(u_initialSpectrum, v_coordinates).rg;',
        'vec2 h0Star = texture2D(u_initialSpectrum, vec2(1.0 - v_coordinates + 1.0 / u_resolution)).rg;',
        'h0Star.y *= -1.0;',

        'vec2 h = multiplyComplex(h0, phaseVector) + multiplyComplex(h0Star, vec2(phaseVector.x, -phaseVector.y));',

        'vec2 hX = -multiplyByI(h * (waveVector.x / length(waveVector))) * u_choppiness;',
        'vec2 hZ = -multiplyByI(h * (waveVector.y / length(waveVector))) * u_choppiness;',

        //no DC term
        'if (waveVector.x == 0.0 && waveVector.y == 0.0) {',
        'h = vec2(0.0);',
        'hX = vec2(0.0);',
        'hZ = vec2(0.0);',
        '}',

        'gl_FragColor = vec4(hX + multiplyByI(h), hZ);',
        '}'
    ].join('\n');

    //cannot use common heightmap optimisations because displacements are horizontal as well as vertical
    var NORMAL_MAP_FRAGMENT_SOURCE = [
        'precision highp float;',

        'varying vec2 v_coordinates;',

        'uniform sampler2D u_displacementMap;',
        'uniform float u_resolution;',
        'uniform float u_size;',

        'void main (void) {',
        'float texel = 1.0 / u_resolution;',
        'float texelSize = u_size / u_resolution;',

        'vec3 center = texture2D(u_displacementMap, v_coordinates).rgb;',
        'vec3 right = vec3(texelSize, 0.0, 0.0) + texture2D(u_displacementMap, v_coordinates + vec2(texel, 0.0)).rgb - center;',
        'vec3 left = vec3(-texelSize, 0.0, 0.0) + texture2D(u_displacementMap, v_coordinates + vec2(-texel, 0.0)).rgb - center;',
        'vec3 top = vec3(0.0, 0.0, -texelSize) + texture2D(u_displacementMap, v_coordinates + vec2(0.0, -texel)).rgb - center;',
        'vec3 bottom = vec3(0.0, 0.0, texelSize) + texture2D(u_displacementMap, v_coordinates + vec2(0.0, texel)).rgb - center;',

        'vec3 topRight = cross(right, top);',
        'vec3 topLeft = cross(top, left);',
        'vec3 bottomLeft = cross(left, bottom);',
        'vec3 bottomRight = cross(bottom, right);',

        'gl_FragColor = vec4(normalize(topRight + topLeft + bottomLeft + bottomRight), 1.0);',
        '}'
    ].join('\n');

    var OCEAN_VERTEX_SOURCE = [
        'precision highp float;',

        'attribute vec3 a_position;',
        'attribute vec2 a_coordinates;',

        'varying vec3 v_position;',
        'varying vec2 v_coordinates;',

        'uniform mat4 u_projectionMatrix;',
        'uniform mat4 u_viewMatrix;',

        'uniform float u_size;',
        'uniform float u_geometrySize;',

        'uniform sampler2D u_displacementMap;',

        'void main (void) {',
        'vec3 position = a_position + texture2D(u_displacementMap, a_coordinates).rgb * (u_geometrySize / u_size);',

        'v_position = position;',
        'v_coordinates = a_coordinates;',

        'gl_Position = u_projectionMatrix * u_viewMatrix * vec4(position, 1.0);',
        '}'
    ].join('\n');

    var OCEAN_FRAGMENT_SOURCE = [
        'precision highp float;',

        'varying vec2 v_coordinates;',
        'varying vec3 v_position;',

        'uniform sampler2D u_displacementMap;',
        'uniform sampler2D u_normalMap;',

        'uniform vec3 u_cameraPosition;',

        'uniform vec3 u_oceanColor;',
        'uniform vec3 u_skyColor;',
        'uniform float u_exposure;',

        'uniform vec3 u_sunDirection;',

        'vec3 hdr (vec3 color, float exposure) {',
        'return 1.0 - exp(-color * exposure);',
        '}',

        'void main (void) {',
        'vec3 normal = texture2D(u_normalMap, v_coordinates).rgb;',

        'vec3 view = normalize(u_cameraPosition - v_position);',
        'float fresnel = 0.02 + 0.98 * pow(1.0 - dot(normal, view), 5.0);',
        'vec3 sky = fresnel * u_skyColor;',

        'float diffuse = clamp(dot(normal, normalize(u_sunDirection)), 0.0, 1.0);',
        'vec3 water = (1.0 - fresnel) * u_oceanColor * u_skyColor * diffuse;',

        'vec3 color = sky + water;',

        'gl_FragColor = vec4(hdr(color, u_exposure), 1.0);',
        '}'
    ].join('\n');

    var Simulator = function(canvas, width, height) {
        var canvas = canvas;
        canvas.width = width;
        canvas.height = height;

        var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        var windX = INITIAL_WIND[0],
            windY = INITIAL_WIND[1],
            size = INITIAL_SIZE,
            choppiness = INITIAL_CHOPPINESS;

        var changed = true;

        gl.getExtension('OES_texture_float');
        gl.getExtension('OES_texture_float_linear');

        gl.clearColor.apply(gl, CLEAR_COLOR);
        gl.enable(gl.DEPTH_TEST);

        var fullscreenVertexShader = buildShader(gl, gl.VERTEX_SHADER, FULLSCREEN_VERTEX_SOURCE);

        var horizontalSubtransformProgram = new ProgramWrapper(gl, fullscreenVertexShader,
            buildShader(gl, gl.FRAGMENT_SHADER, '#define HORIZONTAL \n' + SUBTRANSFORM_FRAGMENT_SOURCE), {
                'a_position': 0
            });

        gl.useProgram(horizontalSubtransformProgram.getProgram());
        gl.uniform1f(horizontalSubtransformProgram.getUniformLocation('u_transformSize'), RESOLUTION);

        var verticalSubtransformProgram = new ProgramWrapper(gl, fullscreenVertexShader,
            buildShader(gl, gl.FRAGMENT_SHADER, SUBTRANSFORM_FRAGMENT_SOURCE), {
                'a_position': 0
            });
        gl.useProgram(verticalSubtransformProgram.getProgram());
        gl.uniform1f(verticalSubtransformProgram.getUniformLocation('u_transformSize'), RESOLUTION);

        var initialSpectrumProgram = new ProgramWrapper(gl, fullscreenVertexShader,
            buildShader(gl, gl.FRAGMENT_SHADER, INITIAL_SPECTRUM_FRAGMENT_SOURCE), {
                'a_position': 0
            });
        gl.useProgram(initialSpectrumProgram.getProgram());
        gl.uniform1f(initialSpectrumProgram.getUniformLocation('u_resolution'), RESOLUTION);

        var phaseProgram = new ProgramWrapper(gl, fullscreenVertexShader,
            buildShader(gl, gl.FRAGMENT_SHADER, PHASE_FRAGMENT_SOURCE), {
                'a_position': 0
            });
        gl.useProgram(phaseProgram.getProgram());
        gl.uniform1f(phaseProgram.getUniformLocation('u_resolution'), RESOLUTION);

        var spectrumProgram = new ProgramWrapper(gl, fullscreenVertexShader,
            buildShader(gl, gl.FRAGMENT_SHADER, SPECTRUM_FRAGMENT_SOURCE), {
                'a_position': 0
            });
        gl.useProgram(spectrumProgram.getProgram());
        gl.uniform1i(spectrumProgram.getUniformLocation('u_initialSpectrum'), INITIAL_SPECTRUM_UNIT);
        gl.uniform1f(spectrumProgram.getUniformLocation('u_resolution'), RESOLUTION);

        var normalMapProgram = new ProgramWrapper(gl, fullscreenVertexShader,
            buildShader(gl, gl.FRAGMENT_SHADER, NORMAL_MAP_FRAGMENT_SOURCE), {
                'a_position': 0
            });
        gl.useProgram(normalMapProgram.getProgram());
        gl.uniform1i(normalMapProgram.getUniformLocation('u_displacementMap'), DISPLACEMENT_MAP_UNIT);
        gl.uniform1f(normalMapProgram.getUniformLocation('u_resolution'), RESOLUTION);

        var oceanProgram = new ProgramWrapper(gl,
            buildShader(gl, gl.VERTEX_SHADER, OCEAN_VERTEX_SOURCE),
            buildShader(gl, gl.FRAGMENT_SHADER, OCEAN_FRAGMENT_SOURCE), {
                'a_position': 0,
                'a_coordinates': OCEAN_COORDINATES_UNIT
            });
        gl.useProgram(oceanProgram.getProgram());
        gl.uniform1f(oceanProgram.getUniformLocation('u_geometrySize'), GEOMETRY_SIZE);
        gl.uniform1i(oceanProgram.getUniformLocation('u_displacementMap'), DISPLACEMENT_MAP_UNIT);
        gl.uniform1i(oceanProgram.getUniformLocation('u_normalMap'), NORMAL_MAP_UNIT);
        gl.uniform3f(oceanProgram.getUniformLocation('u_oceanColor'), OCEAN_COLOR[0], OCEAN_COLOR[1], OCEAN_COLOR[2]);
        gl.uniform3f(oceanProgram.getUniformLocation('u_skyColor'), SKY_COLOR[0], SKY_COLOR[1], SKY_COLOR[2]);
        gl.uniform3f(oceanProgram.getUniformLocation('u_sunDirection'), SUN_DIRECTION[0], SUN_DIRECTION[1], SUN_DIRECTION[2]);
        gl.uniform1f(oceanProgram.getUniformLocation('u_exposure'), EXPOSURE);

        gl.enableVertexAttribArray(0);

        var fullscreenVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, fullscreenVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), gl.STATIC_DRAW);

        var oceanVertices = [],
            oceanCoordinates = [];

        var oceanData = [];
        for (var zIndex = 0; zIndex < GEOMETRY_RESOLUTION; zIndex += 1) {
            for (var xIndex = 0; xIndex < GEOMETRY_RESOLUTION; xIndex += 1) {
                oceanData.push((xIndex * GEOMETRY_SIZE) / (GEOMETRY_RESOLUTION - 1) + GEOMETRY_ORIGIN[0]);
                oceanData.push((0.0));
                oceanData.push((zIndex * GEOMETRY_SIZE) / (GEOMETRY_RESOLUTION - 1) + GEOMETRY_ORIGIN[1]);
                oceanData.push(xIndex / (GEOMETRY_RESOLUTION - 1));
                oceanData.push(zIndex / (GEOMETRY_RESOLUTION - 1));
            }
        }

        var oceanIndices = [];
        for (var zIndex = 0; zIndex < GEOMETRY_RESOLUTION - 1; zIndex += 1) {
            for (var xIndex = 0; xIndex < GEOMETRY_RESOLUTION - 1; xIndex += 1) {
                var topLeft = zIndex * GEOMETRY_RESOLUTION + xIndex,
                    topRight = topLeft + 1,
                    bottomLeft = topLeft + GEOMETRY_RESOLUTION,
                    bottomRight = bottomLeft + 1;

                oceanIndices.push(topLeft);
                oceanIndices.push(bottomLeft);
                oceanIndices.push(bottomRight);
                oceanIndices.push(bottomRight);
                oceanIndices.push(topRight);
                oceanIndices.push(topLeft);
            }
        }

        var oceanBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, oceanBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(oceanData), gl.STATIC_DRAW);
        gl.vertexAttribPointer(OCEAN_COORDINATES_UNIT, 2, gl.FLOAT, false, 5 * SIZE_OF_FLOAT, 3 * SIZE_OF_FLOAT);

        var oceanIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, oceanIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(oceanIndices), gl.STATIC_DRAW);

        var initialSpectrumTexture = buildTexture(gl, INITIAL_SPECTRUM_UNIT, gl.RGBA, gl.FLOAT, RESOLUTION, RESOLUTION, null, gl.REPEAT, gl.REPEAT, gl.NEAREST, gl.NEAREST),
            pongPhaseTexture = buildTexture(gl, PONG_PHASE_UNIT, gl.RGBA, gl.FLOAT, RESOLUTION, RESOLUTION, null, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE, gl.NEAREST, gl.NEAREST),
            spectrumTexture = buildTexture(gl, SPECTRUM_UNIT, gl.RGBA, gl.FLOAT, RESOLUTION, RESOLUTION, null, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE, gl.NEAREST, gl.NEAREST),
            displacementMap = buildTexture(gl, DISPLACEMENT_MAP_UNIT, gl.RGBA, gl.FLOAT, RESOLUTION, RESOLUTION, null, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE, gl.LINEAR, gl.LINEAR),
            normalMap = buildTexture(gl, NORMAL_MAP_UNIT, gl.RGBA, gl.FLOAT, RESOLUTION, RESOLUTION, null, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE, gl.LINEAR, gl.LINEAR),
            pingTransformTexture = buildTexture(gl, PING_TRANSFORM_UNIT, gl.RGBA, gl.FLOAT, RESOLUTION, RESOLUTION, null, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE, gl.NEAREST, gl.NEAREST),
            pongTransformTexture = buildTexture(gl, PONG_TRANSFORM_UNIT, gl.RGBA, gl.FLOAT, RESOLUTION, RESOLUTION, null, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE, gl.NEAREST, gl.NEAREST);

        var pingPhase = true;

        var phaseArray = new Float32Array(RESOLUTION * RESOLUTION * 4);
        for (var i = 0; i < RESOLUTION; i += 1) {
            for (var j = 0; j < RESOLUTION; j += 1) {
                phaseArray[i * RESOLUTION * 4 + j * 4] = Math.random() * 2.0 * Math.PI;
                phaseArray[i * RESOLUTION * 4 + j * 4 + 1] = 0;
                phaseArray[i * RESOLUTION * 4 + j * 4 + 2] = 0;
                phaseArray[i * RESOLUTION * 4 + j * 4 + 3] = 0;
            }
        }
        var pingPhaseTexture = buildTexture(gl, PING_PHASE_UNIT, gl.RGBA, gl.FLOAT, RESOLUTION, RESOLUTION, phaseArray, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE, gl.NEAREST, gl.NEAREST);

        //changing framebuffers faster than changing attachments in WebGL
        var initialSpectrumFramebuffer = buildFramebuffer(gl, initialSpectrumTexture),
            pingPhaseFramebuffer = buildFramebuffer(gl, pingPhaseTexture),
            pongPhaseFramebuffer = buildFramebuffer(gl, pongPhaseTexture),
            spectrumFramebuffer = buildFramebuffer(gl, spectrumTexture),
            displacementMapFramebuffer = buildFramebuffer(gl, displacementMap),
            normalMapFramebuffer = buildFramebuffer(gl, normalMap),
            pingTransformFramebuffer = buildFramebuffer(gl, pingTransformTexture),
            pongTransformFramebuffer = buildFramebuffer(gl, pongTransformTexture);

        this.setWind = function(x, y) {
            windX = x;
            windY = y;
            changed = true;
        };

        this.setSize = function(newSize) {
            size = newSize;
            changed = true;
        };

        this.setChoppiness = function(newChoppiness) {
            choppiness = newChoppiness;
        };

        this.resize = function(width, height) {
            canvas.width = width;
            canvas.height = height;
        };

        this.render = function(deltaTime, projectionMatrix, viewMatrix, cameraPosition) {
            gl.viewport(0, 0, RESOLUTION, RESOLUTION);
            gl.disable(gl.DEPTH_TEST);

            gl.bindBuffer(gl.ARRAY_BUFFER, fullscreenVertexBuffer);
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

            if (changed) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, initialSpectrumFramebuffer);
                gl.useProgram(initialSpectrumProgram.getProgram());
                gl.uniform2f(initialSpectrumProgram.getUniformLocation('u_wind'), windX, windY);
                gl.uniform1f(initialSpectrumProgram.getUniformLocation('u_size'), size);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            }

            //store phases separately to ensure continuity of waves during parameter editing
            gl.useProgram(phaseProgram.getProgram());
            gl.bindFramebuffer(gl.FRAMEBUFFER, pingPhase ? pongPhaseFramebuffer : pingPhaseFramebuffer);
            gl.uniform1i(phaseProgram.getUniformLocation('u_phases'), pingPhase ? PING_PHASE_UNIT : PONG_PHASE_UNIT);
            pingPhase = !pingPhase;
            gl.uniform1f(phaseProgram.getUniformLocation('u_deltaTime'), deltaTime);
            gl.uniform1f(phaseProgram.getUniformLocation('u_size'), size);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            gl.useProgram(spectrumProgram.getProgram());
            gl.bindFramebuffer(gl.FRAMEBUFFER, spectrumFramebuffer);
            gl.uniform1i(spectrumProgram.getUniformLocation('u_phases'), pingPhase ? PING_PHASE_UNIT : PONG_PHASE_UNIT);
            gl.uniform1f(spectrumProgram.getUniformLocation('u_size'), size);
            gl.uniform1f(spectrumProgram.getUniformLocation('u_choppiness'), choppiness);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            var subtransformProgram = horizontalSubtransformProgram;
            gl.useProgram(horizontalSubtransformProgram.getProgram());

            //GPU FFT using Stockham formulation
            var iterations = log2(RESOLUTION) * 2;
            for (var i = 0; i < iterations; i += 1) {
                if (i === 0) {
                    gl.bindFramebuffer(gl.FRAMEBUFFER, pingTransformFramebuffer);
                    gl.uniform1i(subtransformProgram.getUniformLocation('u_input'), SPECTRUM_UNIT);
                } else if (i === iterations - 1) {
                    gl.bindFramebuffer(gl.FRAMEBUFFER, displacementMapFramebuffer);
                    gl.uniform1i(subtransformProgram.getUniformLocation('u_input'), (iterations % 2 === 0) ? PING_TRANSFORM_UNIT : PONG_TRANSFORM_UNIT);
                } else if (i % 2 === 1) {
                    gl.bindFramebuffer(gl.FRAMEBUFFER, pongTransformFramebuffer);
                    gl.uniform1i(subtransformProgram.getUniformLocation('u_input'), PING_TRANSFORM_UNIT);
                } else {
                    gl.bindFramebuffer(gl.FRAMEBUFFER, pingTransformFramebuffer);
                    gl.uniform1i(subtransformProgram.getUniformLocation('u_input'), PONG_TRANSFORM_UNIT);
                }

                if (i === iterations / 2) {
                    subtransformProgram = verticalSubtransformProgram;
                    gl.useProgram(verticalSubtransformProgram.getProgram());
                }

                gl.uniform1f(subtransformProgram.getUniformLocation('u_subtransformSize'), Math.pow(2, (i % (iterations / 2)) + 1));
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            }

            gl.bindFramebuffer(gl.FRAMEBUFFER, normalMapFramebuffer);
            gl.useProgram(normalMapProgram.getProgram());
            if (changed) {
                gl.uniform1f(normalMapProgram.getUniformLocation('u_size'), size);
            }
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.enable(gl.DEPTH_TEST);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            gl.enableVertexAttribArray(OCEAN_COORDINATES_UNIT);

            gl.bindBuffer(gl.ARRAY_BUFFER, oceanBuffer);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 5 * SIZE_OF_FLOAT, 0);

            gl.useProgram(oceanProgram.getProgram());
            if (changed) {
                gl.uniform1f(oceanProgram.getUniformLocation('u_size'), size);
                changed = false;
            }
            gl.uniformMatrix4fv(oceanProgram.getUniformLocation('u_projectionMatrix'), false, projectionMatrix);
            gl.uniformMatrix4fv(oceanProgram.getUniformLocation('u_viewMatrix'), false, viewMatrix);
            gl.uniform3fv(oceanProgram.getUniformLocation('u_cameraPosition'), cameraPosition);
            gl.drawElements(gl.TRIANGLES, oceanIndices.length, gl.UNSIGNED_SHORT, 0);

            gl.disableVertexAttribArray(OCEAN_COORDINATES_UNIT);

        };

    };

    var PROFILE_AMPLITUDE = 50,
        PROFILE_OMEGA = 0.05,
        PROFILE_PHI = -2.5,
        PROFILE_STEP = 5,
        PROFILE_OFFSET = 52,
        PROFILE_COLOR = 'rgb(52, 137, 189)',
        PROFILE_LINE_WIDTH = 3,
        CHOPPINESS_SCALE = 0.15;

    //waves in simulation are not actually Gerstner waves but Gerstner waves are used for visualisation purposes
    var Profile = function(canvas) {
        var context = canvas.getContext('2d');
        var width = canvas.width;
        var height = canvas.height

        context.strokeStyle = PROFILE_COLOR;
        context.lineWidth = PROFILE_LINE_WIDTH;

        var evaluateX = function(x, choppiness) {
            return x - choppiness * CHOPPINESS_SCALE * PROFILE_AMPLITUDE * Math.sin(x * PROFILE_OMEGA + PROFILE_PHI);
        };

        var evaluateY = function(x) {
            return PROFILE_AMPLITUDE * Math.cos(x * PROFILE_OMEGA + PROFILE_PHI) + PROFILE_OFFSET;
        };

        this.render = function(choppiness) {
            context.clearRect(0, 0, width, height);
            context.beginPath();
            context.moveTo(evaluateX(0, choppiness), evaluateY(0));
            for (var x = 0; x <= width; x += PROFILE_STEP) {
                context.lineTo(evaluateX(x, choppiness), evaluateY(x));
            }
            context.stroke();
        };
        this.render(INITIAL_CHOPPINESS);
    };

    var ARROW_ORIGIN = [-1250, 0, 500],
        ARROW_SHAFT_WIDTH = 80,
        ARROW_HEAD_WIDTH = 160,
        ARROW_HEAD_HEIGHT = 60,
        ARROW_OFFSET = 40,
        WIND_SCALE = 8.0,
        MIN_WIND_SPEED = 5.0,
        MAX_WIND_SPEED = 25.0;

    var Arrow = function(parent, valueX, valueY) {
        var arrow = [valueX * WIND_SCALE, 0.0, valueY * WIND_SCALE];
        var tip = addToVector([], ARROW_ORIGIN, arrow);

        var shaftDiv = document.createElement('div');
        shaftDiv.style.position = 'absolute';
        shaftDiv.style.width = ARROW_SHAFT_WIDTH + 'px';
        shaftDiv.style.background = UI_COLOR;
        setTransformOrigin(shaftDiv, 'center top');
        setTransform(shaftDiv, 'translate3d(' + (ARROW_ORIGIN[0] - ARROW_SHAFT_WIDTH / 2) + 'px, ' + ARROW_ORIGIN[1] + 'px, ' + ARROW_ORIGIN[2] + 'px) rotateX(90deg)');
        parent.appendChild(shaftDiv);

        var headDiv = document.createElement('div');
        headDiv.style.position = 'absolute';
        headDiv.style.borderStyle = 'solid';
        headDiv.style.borderColor = UI_COLOR + ' transparent transparent transparent';
        headDiv.style.borderWidth = ARROW_HEAD_HEIGHT + 'px ' + ARROW_HEAD_WIDTH / 2 + 'px 0px ' + ARROW_HEAD_WIDTH / 2 + 'px';
        setTransformOrigin(headDiv, 'center top');
        setTransform(headDiv, 'translate3d(' + (ARROW_ORIGIN[0] - ARROW_HEAD_WIDTH / 2) + 'px, ' + ARROW_ORIGIN[1] + 'px, ' + ARROW_ORIGIN[2] + 'px) rotateX(90deg)');
        parent.appendChild(headDiv);

        var render = function() {
            var angle = Math.atan2(arrow[2], arrow[0]);

            var arrowLength = lengthOfVector(arrow);

            shaftDiv.style.height = (arrowLength - ARROW_HEAD_HEIGHT + 1 + ARROW_OFFSET) + 'px';
            setTransform(shaftDiv, 'translate3d(' + (ARROW_ORIGIN[0] - ARROW_SHAFT_WIDTH / 2) + 'px, ' + ARROW_ORIGIN[1] + 'px, ' + ARROW_ORIGIN[2] + 'px) rotateX(90deg) rotateZ(' + (angle - Math.PI / 2) + 'rad) translateY(' + -ARROW_OFFSET + 'px)');
            setTransform(headDiv, 'translate3d(' + (ARROW_ORIGIN[0] - ARROW_HEAD_WIDTH / 2) + 'px, ' + ARROW_ORIGIN[1] + 'px, ' + ARROW_ORIGIN[2] + 'px) rotateX(90deg) rotateZ(' + (angle - Math.PI / 2) + 'rad) translateY(' + (arrowLength - ARROW_HEAD_HEIGHT - 1) + 'px)');
        };

        this.update = function(mouseX, mouseZ) {
            arrow = [mouseX, 0, mouseZ];
            subtractFromVector(arrow, arrow, ARROW_ORIGIN);

            var arrowLength = lengthOfVector(arrow);
            if (arrowLength > MAX_WIND_SPEED * WIND_SCALE) {
                multiplyVectorByScalar(arrow, arrow, (MAX_WIND_SPEED * WIND_SCALE) / arrowLength);
            } else if (lengthOfVector(arrow) < MIN_WIND_SPEED * WIND_SCALE) {
                multiplyVectorByScalar(arrow, arrow, (MIN_WIND_SPEED * WIND_SCALE) / arrowLength);
            }

            addToVector(tip, ARROW_ORIGIN, arrow);

            render();

            valueX = arrow[0] / WIND_SCALE;
            valueY = arrow[2] / WIND_SCALE;
        };

        this.getValue = function() {
            return lengthOfVector(arrow) / WIND_SCALE;
        };

        this.getValueX = function() {
            return valueX;
        };

        this.getValueY = function() {
            return valueY;
        };

        this.distanceToTip = function(vector) {
            return distanceBetweenVectors(tip, vector);
        };

        this.getTipZ = function() {
            return tip[2];
        };

        render();
    };

    var HANDLE_COLOR = '#666666',
        SLIDER_LEFT_COLOR = UI_COLOR,
        SLIDER_RIGHT_COLOR = '#999999';

    var Slider = function(parent, x, z, length, minValue, maxValue, value, sliderBreadth, handleSize) {
        var sliderLeftDiv = document.createElement('div');
        sliderLeftDiv.style.position = 'absolute';
        sliderLeftDiv.style.width = length + 'px';
        sliderLeftDiv.style.height = sliderBreadth + 'px';
        sliderLeftDiv.style.backgroundColor = SLIDER_LEFT_COLOR;
        setTransformOrigin(sliderLeftDiv, 'center top');
        setTransform(sliderLeftDiv, 'translate3d(' + x + 'px, 0, ' + z + 'px) rotateX(90deg)');
        parent.appendChild(sliderLeftDiv);

        var sliderRightDiv = document.createElement('div');
        sliderRightDiv.style.position = 'absolute';
        sliderRightDiv.style.width = length + 'px';
        sliderRightDiv.style.height = sliderBreadth + 'px';
        sliderRightDiv.style.backgroundColor = SLIDER_RIGHT_COLOR;
        setTransformOrigin(sliderRightDiv, 'center top');
        setTransform(sliderRightDiv, 'translate3d(' + x + 'px, 0, ' + z + 'px) rotateX(90deg)');
        parent.appendChild(sliderRightDiv);

        var handleDiv = document.createElement('div');
        handleDiv.style.position = 'absolute';
        handleDiv.style.width = handleSize + 'px';
        handleDiv.style.height = handleSize + 'px';
        handleDiv.style.borderRadius = handleSize * 0.5 + 'px';
        handleDiv.style.background = HANDLE_COLOR;
        setTransformOrigin(handleDiv, 'center top');
        setTransform(handleDiv, 'translate3d(' + x + 'px, 0px, ' + z + 'px) rotateX(90deg)');
        parent.appendChild(handleDiv);

        var handleX = (x + ((value - minValue) / (maxValue - minValue)) * length) - handleDiv.offsetWidth / 2;

        var render = function() {
            var fraction = (value - minValue) / (maxValue - minValue);

            setTransform(handleDiv, 'translate3d(' + (handleX - handleDiv.offsetWidth * 0.5) + 'px, 0, ' + (z - handleDiv.offsetHeight * 0.5) + 'px) rotateX(90deg)');
            sliderLeftDiv.style.width = fraction * length + 'px';
            sliderRightDiv.style.width = (1.0 - fraction) * length + 'px';
            setTransform(sliderRightDiv, 'translate3d(' + (x + fraction * length) + 'px, 0, ' + z + 'px) rotateX(90deg)');
        };

        this.update = function(mouseX, callback) {
            handleX = clamp(mouseX, x, x + length);
            var fraction = clamp((mouseX - x) / length, 0.0, 1.0);
            value = minValue + fraction * (maxValue - minValue);

            callback(value);

            render();
        };

        this.getValue = function() {
            return value;
        };

        this.distanceToHandle = function(vector) {
            return distanceBetweenVectors([handleX, 0, z], vector);
        };

        render();
    };

    var hasWebGLSupport = function() {
        var canvas = document.createElement('canvas');
        var gl = null;
        try {
            gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        } catch (e) {
            return false;
        }
        if (gl === null || gl.getExtension('OES_texture_float') === null || gl.getExtension('OES_texture_float_linear') === null) {
            return false;
        }
        return true;
    };

    var requestAnimationFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame || window.msRequestAnimationFrame;

    var FOV = (60 / 180) * Math.PI,
        NEAR = 1,
        FAR = 10000,
        MIN_ASPECT = 16 / 9;

    var WIND_SPEED_DECIMAL_PLACES = 1,
        SIZE_DECIMAL_PLACES = 0,
        CHOPPINESS_DECIMAL_PLACES = 1;

    var SENSITIVITY = 1.0;

    var WIND_SPEED_X = -1350;
    var MIN_WIND_SPEED_Z = 600,
        WIND_SPEED_OFFSET = 30;

    var OVERLAY_DIV_ID = 'overlay',
        PROFILE_CANVAS_ID = 'profile',
        SIMULATOR_CANVAS_ID = 'simulator',
        UI_DIV_ID = 'ui',
        CAMERA_DIV_ID = 'camera',
        WIND_SPEED_DIV_ID = 'wind',
        WIND_SPEED_SPAN_ID = 'wind-speed',
        CHOPPINESS_DIV_ID = 'choppiness';

    var SIZE_SLIDER_X = -200,
        SIZE_SLIDER_Z = 1100,
        SIZE_SLIDER_LENGTH = 400,
        MIN_SIZE = 100,
        MAX_SIZE = 1000,
        SIZE_SLIDER_BREADTH = 3,
        SIZE_HANDLE_SIZE = 24;

    var CHOPPINESS_SLIDER_X = -1420,
        CHOPPINESS_SLIDER_Z = 75,
        CHOPPINESS_SLIDER_LENGTH = 300,
        MIN_CHOPPINESS = 0,
        MAX_CHOPPINESS = 2.5,
        CHOPPINESS_SLIDER_BREADTH = 6,
        CHOPPINESS_HANDLE_SIZE = 30;


    var ARROW_TIP_RADIUS = 100,
        SIZE_HANDLE_RADIUS = 30,
        CHOPPINESS_HANDLE_RADIUS = 100;

    var NONE = 0,
        ORBITING = 1,
        ROTATING = 2,
        SLIDING_SIZE = 3,
        SLIDING_CHOPPINESS = 4;

    var main = function() {
        var simulatorCanvas = document.getElementById(SIMULATOR_CANVAS_ID),
            overlayDiv = document.getElementById(OVERLAY_DIV_ID),
            uiDiv = document.getElementById(UI_DIV_ID),
            cameraDiv = document.getElementById(CAMERA_DIV_ID),
            windDiv = document.getElementById(WIND_SPEED_DIV_ID),
            windSpeedSpan = document.getElementById(WIND_SPEED_SPAN_ID),
            choppinessDiv = document.getElementById('choppiness'),
            sizeSpan = document.getElementById('size-value');

        setText(choppinessDiv, INITIAL_CHOPPINESS, CHOPPINESS_DECIMAL_PLACES);
        setText(sizeSpan, INITIAL_SIZE, SIZE_DECIMAL_PLACES);

        var camera = new Camera(),
            projectionMatrix = makePerspectiveMatrix(new Float32Array(16), FOV, MIN_ASPECT, NEAR, FAR);

        var simulator = new Simulator(simulatorCanvas, window.innerWidth, window.innerHeight);

        var profile = new Profile(document.getElementById(PROFILE_CANVAS_ID)),
            sizeSlider = new Slider(cameraDiv, SIZE_SLIDER_X, SIZE_SLIDER_Z,
                SIZE_SLIDER_LENGTH, MIN_SIZE, MAX_SIZE, INITIAL_SIZE, SIZE_SLIDER_BREADTH, SIZE_HANDLE_SIZE),
            choppinessSlider = new Slider(cameraDiv, CHOPPINESS_SLIDER_X, CHOPPINESS_SLIDER_Z,
                CHOPPINESS_SLIDER_LENGTH, MIN_CHOPPINESS, MAX_CHOPPINESS, INITIAL_CHOPPINESS, CHOPPINESS_SLIDER_BREADTH, CHOPPINESS_HANDLE_SIZE);

        var width = window.innerWidth,
            height = window.innerHeight;

        var lastMouseX = 0;
        var lastMouseY = 0;
        var mode = NONE;

        var setUIPerspective = function(height) {
            var fovValue = 0.5 / Math.tan(FOV / 2) * height;
            setPerspective(uiDiv, fovValue + 'px');
        };

        var windArrow = new Arrow(cameraDiv, INITIAL_WIND[0], INITIAL_WIND[1]);
        setText(windSpeedSpan, windArrow.getValue(), WIND_SPEED_DECIMAL_PLACES);
        setTransform(windDiv, 'translate3d(' + WIND_SPEED_X + 'px, 0px, ' + Math.max(MIN_WIND_SPEED_Z, windArrow.getTipZ() + WIND_SPEED_OFFSET) + 'px) rotateX(90deg)');

        var inverseProjectionViewMatrix = [],
            nearPoint = [],
            farPoint = [];
        var unproject = function(viewMatrix, x, y, width, height) {
            premultiplyMatrix(inverseProjectionViewMatrix, viewMatrix, projectionMatrix);
            invertMatrix(inverseProjectionViewMatrix, inverseProjectionViewMatrix);

            setVector4(nearPoint, (x / width) * 2.0 - 1.0, ((height - y) / height) * 2.0 - 1.0, 1.0, 1.0);
            transformVectorByMatrix(nearPoint, nearPoint, inverseProjectionViewMatrix);

            setVector4(farPoint, (x / width) * 2.0 - 1.0, ((height - y) / height) * 2.0 - 1.0, -1.0, 1.0);
            transformVectorByMatrix(farPoint, farPoint, inverseProjectionViewMatrix);

            projectVector4(nearPoint, nearPoint);
            projectVector4(farPoint, farPoint);

            var t = -nearPoint[1] / (farPoint[1] - nearPoint[1]);
            var point = [
                nearPoint[0] + t * (farPoint[0] - nearPoint[0]),
                nearPoint[1] + t * (farPoint[1] - nearPoint[1]),
                nearPoint[2] + t * (farPoint[2] - nearPoint[2]),
            ];

            return point;
        };

        var onMouseDown = function(event) {
            event.preventDefault();

            var mousePosition = getMousePosition(event, uiDiv);
            var mouseX = mousePosition.x,
                mouseY = mousePosition.y;

            var point = unproject(camera.getViewMatrix(), mouseX, mouseY, width, height);

            if (windArrow.distanceToTip(point) < ARROW_TIP_RADIUS) {
                mode = ROTATING;
            } else if (sizeSlider.distanceToHandle(point) < SIZE_HANDLE_RADIUS) {
                mode = SLIDING_SIZE;
            } else if (choppinessSlider.distanceToHandle(point) < CHOPPINESS_HANDLE_RADIUS) {
                mode = SLIDING_CHOPPINESS;
            } else {
                mode = ORBITING;
                lastMouseX = mouseX;
                lastMouseY = mouseY;
            }
        }
        overlayDiv.addEventListener('mousedown', onMouseDown, false);

        overlayDiv.addEventListener('mousemove', function(event) {
            event.preventDefault();

            var mousePosition = getMousePosition(event, uiDiv),
                mouseX = mousePosition.x,
                mouseY = mousePosition.y;

            var point = unproject(camera.getViewMatrix(), mouseX, mouseY, width, height);

            if (windArrow.distanceToTip(point) < ARROW_TIP_RADIUS || mode === ROTATING) {
                overlayDiv.style.cursor = 'move';
            } else if (sizeSlider.distanceToHandle(point) < SIZE_HANDLE_RADIUS ||
                choppinessSlider.distanceToHandle(point) < CHOPPINESS_HANDLE_RADIUS ||
                mode === SLIDING_SIZE || mode === SLIDING_CHOPPINESS) {
                overlayDiv.style.cursor = 'ew-resize';
            } else if (mode === ORBITING) {
                overlayDiv.style.cursor = '-webkit-grabbing';
                overlayDiv.style.cursor = '-moz-grabbing';
                overlayDiv.style.cursor = 'grabbing';
            } else {
                overlayDiv.style.cursor = '-webkit-grab';
                overlayDiv.style.cursor = '-moz-grab';
                overlayDiv.style.cursor = 'grab';
            }

            if (mode === ORBITING) {
                camera.changeAzimuth((mouseX - lastMouseX) / width * SENSITIVITY);
                camera.changeElevation((mouseY - lastMouseY) / height * SENSITIVITY);
                lastMouseX = mouseX;
                lastMouseY = mouseY;
            } else if (mode === ROTATING) {
                windArrow.update(point[0], point[2]);
                simulator.setWind(windArrow.getValueX(), windArrow.getValueY());
                setText(windSpeedSpan, windArrow.getValue(), WIND_SPEED_DECIMAL_PLACES);

                setTransform(windDiv, 'translate3d(' + WIND_SPEED_X + 'px, 0px, ' + Math.max(MIN_WIND_SPEED_Z, windArrow.getTipZ() + WIND_SPEED_OFFSET) + 'px) rotateX(90deg)');
            } else if (mode === SLIDING_SIZE) {
                sizeSlider.update(point[0], function(size) {
                    simulator.setSize(size);
                    setText(sizeSpan, size, SIZE_DECIMAL_PLACES);
                });
            } else if (mode === SLIDING_CHOPPINESS) {
                choppinessSlider.update(point[0], function(choppiness) {
                    simulator.setChoppiness(choppiness);
                    setText(choppinessDiv, choppiness, CHOPPINESS_DECIMAL_PLACES);
                    profile.render(choppiness);
                });
            }
        });

        overlayDiv.addEventListener('mouseup', function(event) {
            event.preventDefault();
            mode = NONE;
        });;

        window.addEventListener('mouseout', function(event) {
            var from = event.relatedTarget || event.toElement;
            if (!from || from.nodeName === 'HTML') {
                mode = NONE;
            }
        });

        var onresize = function() {
            var windowWidth = window.innerWidth,
                windowHeight = window.innerHeight;

            overlayDiv.style.width = windowWidth + 'px';
            overlayDiv.style.height = (windowHeight - 20) + 'px';

            if (windowWidth / windowHeight > MIN_ASPECT) {
                makePerspectiveMatrix(projectionMatrix, FOV, windowWidth / windowHeight, NEAR, FAR);
                simulator.resize(windowWidth, windowHeight);
                uiDiv.style.width = windowWidth + 'px';
                uiDiv.style.height = windowHeight + 'px';
                cameraDiv.style.width = windowWidth + 'px';
                cameraDiv.style.height = windowHeight + 'px';
                simulatorCanvas.style.top = '0px';
                uiDiv.style.top = '0px';
                setUIPerspective(windowHeight);
                width = windowWidth;
                height = windowHeight;
            } else {
                var newHeight = windowWidth / MIN_ASPECT;
                makePerspectiveMatrix(projectionMatrix, FOV, windowWidth / newHeight, NEAR, FAR);
                simulator.resize(windowWidth, newHeight);
                simulatorCanvas.style.top = (windowHeight - newHeight) * 0.5 + 'px';
                uiDiv.style.top = (windowHeight - newHeight) * 0.5 + 'px';
                setUIPerspective(newHeight);
                uiDiv.style.width = windowWidth + 'px';
                uiDiv.style.height = newHeight + 'px';
                cameraDiv.style.width = windowWidth + 'px';
                cameraDiv.style.height = newHeight + 'px';
                width = windowWidth;
                height = newHeight;
            }
        };

        window.addEventListener('resize', onresize);
        onresize();

        var lastTime = (new Date()).getTime();
        var render = function render(currentTime) {
            var deltaTime = (currentTime - lastTime) / 1000 || 0.0;
            lastTime = currentTime;

            var fovValue = 0.5 / Math.tan(FOV / 2) * height;
            setTransform(cameraDiv, 'translate3d(0px, 0px, ' + fovValue + 'px) ' + toCSSMatrix(camera.getViewMatrix()) + ' translate3d(' + width / 2 + 'px, ' + height / 2 + 'px, 0px)');
            simulator.render(deltaTime, projectionMatrix, camera.getViewMatrix(), camera.getPosition());

            requestAnimationFrame(render);
        };
        render();
    }

    if (hasWebGLSupport()) {
        main();
    } else {
        document.getElementById('error').style.display = 'block';
    }
}());