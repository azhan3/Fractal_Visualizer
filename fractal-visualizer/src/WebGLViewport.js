import React, { useEffect, useRef } from "react";

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 128;
const BASE_COLOR = new Float32Array([0, 0, 0, 1]);

const vertexShaderSource = `#version 300 es
in vec2 a_position;
uniform float u_zoom;
uniform vec2 u_pan;
uniform float u_pointSize;
void main() {
  vec2 position = a_position * u_zoom + u_pan;
  gl_Position = vec4(position, 0.0, 1.0);
  gl_PointSize = max(1.0, u_pointSize);
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;
uniform vec4 u_color;
uniform float u_shape;
out vec4 outColor;
void main() {
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  if (u_shape > 0.5) {
    float thickness = 0.35;
    if (abs(uv.x) > thickness && abs(uv.y) > thickness) {
      discard;
    }
  } else {
    if (dot(uv, uv) > 1.0) {
      discard;
    }
  }
  outColor = u_color;
}
`;

const createShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || "Unknown shader error";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
};

const createProgram = (gl, vertexSource, fragmentSource) => {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || "Unknown link error";
    gl.deleteProgram(program);
    throw new Error(message);
  }

  return program;
};

const resizeCanvasToDisplaySize = (canvas, dpr) => {
  const width = Math.floor(canvas.clientWidth * dpr);
  const height = Math.floor(canvas.clientHeight * dpr);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
};

const createOrUpdateBuffer = (gl, attribLocation, bufferInfo, positions) => {
  if (!positions || positions.length === 0) {
    return bufferInfo ? { ...bufferInfo, count: 0 } : null;
  }

  const buffer = bufferInfo?.buffer || gl.createBuffer();
  const vao = bufferInfo?.vao || gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(attribLocation);
  gl.vertexAttribPointer(attribLocation, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  return { buffer, vao, count: positions.length / 2 };
};

const drawBuffer = (gl, bufferInfo, uniforms, color, shape) => {
  if (!bufferInfo || bufferInfo.count === 0) {
    return;
  }
  gl.uniform4fv(uniforms.color, color);
  gl.uniform1f(uniforms.shape, shape);
  gl.bindVertexArray(bufferInfo.vao);
  gl.drawArrays(gl.POINTS, 0, bufferInfo.count);
  gl.bindVertexArray(null);
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const WebGLViewport = ({
  points,
  primeRacePoints,
  primeRaceToggles,
  primeRaceColors,
  viewState,
  pointSize,
  showPoints,
  showPrimeRaces,
  onViewStateChange,
}) => {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const uniformsRef = useRef(null);
  const attribsRef = useRef(null);
  const buffersRef = useRef({ base: null, primes: [] });
  const animationRef = useRef(null);
  const viewStateRef = useRef(viewState);
  const pointSizeRef = useRef(pointSize);
  const showRef = useRef({ showPoints, showPrimeRaces });
  const primeRaceColorsRef = useRef(primeRaceColors);
  const primeRaceTogglesRef = useRef(primeRaceToggles);
  const isPanningRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    viewStateRef.current = viewState;
  }, [viewState]);

  useEffect(() => {
    pointSizeRef.current = pointSize;
  }, [pointSize]);

  useEffect(() => {
    showRef.current = { showPoints, showPrimeRaces };
  }, [showPoints, showPrimeRaces]);

  useEffect(() => {
    primeRaceColorsRef.current = primeRaceColors;
  }, [primeRaceColors]);

  useEffect(() => {
    primeRaceTogglesRef.current = primeRaceToggles;
  }, [primeRaceToggles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const gl = canvas.getContext("webgl2", { antialias: true, preserveDrawingBuffer: false });
    if (!gl) {
      console.error("WebGL2 is not supported by this browser.");
      return undefined;
    }

    glRef.current = gl;

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    programRef.current = program;

    const attribLocation = gl.getAttribLocation(program, "a_position");
    const uniforms = {
      zoom: gl.getUniformLocation(program, "u_zoom"),
      pan: gl.getUniformLocation(program, "u_pan"),
      pointSize: gl.getUniformLocation(program, "u_pointSize"),
      color: gl.getUniformLocation(program, "u_color"),
      shape: gl.getUniformLocation(program, "u_shape"),
    };

    attribsRef.current = { position: attribLocation };
    uniformsRef.current = uniforms;

    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(1, 1, 1, 1);
    gl.enable(gl.PROGRAM_POINT_SIZE);

    const render = () => {
      const glInstance = glRef.current;
      const uniformsInstance = uniformsRef.current;
      if (!glInstance || !uniformsInstance) {
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      resizeCanvasToDisplaySize(canvas, dpr);
      glInstance.viewport(0, 0, canvas.width, canvas.height);
      glInstance.clear(glInstance.COLOR_BUFFER_BIT);

      const currentView = viewStateRef.current;
      glInstance.useProgram(program);
      glInstance.uniform1f(uniformsInstance.zoom, currentView.zoom);
      glInstance.uniform2f(uniformsInstance.pan, currentView.panX, currentView.panY);
      glInstance.uniform1f(uniformsInstance.pointSize, pointSizeRef.current * dpr);

      if (showRef.current.showPoints) {
        drawBuffer(
          glInstance,
          buffersRef.current.base,
          uniformsInstance,
              BASE_COLOR,
          0
        );
      }

      if (showRef.current.showPrimeRaces) {
        buffersRef.current.primes.forEach((bufferInfo, index) => {
          if (!primeRaceTogglesRef.current[index]) {
            return;
          }
          const color = primeRaceColorsRef.current[index] || [0, 0, 0, 1];
          drawBuffer(glInstance, bufferInfo, uniformsInstance, color, 1);
        });
      }

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const gl = glRef.current;
    const attribs = attribsRef.current;
    if (!gl || !attribs) {
      return;
    }

    buffersRef.current.base = createOrUpdateBuffer(
      gl,
      attribs.position,
      buffersRef.current.base,
      points
    );
  }, [points]);

  useEffect(() => {
    const gl = glRef.current;
    const attribs = attribsRef.current;
    if (!gl || !attribs) {
      return;
    }

    const nextBuffers = (primeRacePoints || []).map((positions, index) =>
      createOrUpdateBuffer(
        gl,
        attribs.position,
        buffersRef.current.primes[index],
        positions
      )
    );

    buffersRef.current.primes = nextBuffers;
  }, [primeRacePoints]);

  const handlePointerDown = (event) => {
    if (event.button !== 0) {
      return;
    }
    isPanningRef.current = true;
    lastPointerRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isPanningRef.current) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - lastPointerRef.current.x;
    const dy = event.clientY - lastPointerRef.current.y;
    lastPointerRef.current = { x: event.clientX, y: event.clientY };

    const deltaX = (dx / rect.width) * 2;
    const deltaY = (dy / rect.height) * -2;

    onViewStateChange((prev) => ({
      ...prev,
      panX: prev.panX + deltaX,
      panY: prev.panY + deltaY,
    }));
  };

  const handlePointerUp = (event) => {
    isPanningRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleWheel = (event) => {
    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();
    const ndcX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = 1 - ((event.clientY - rect.top) / rect.height) * 2;
    const zoomFactor = Math.pow(2, -event.deltaY * 0.001);

    onViewStateChange((prev) => {
      const nextZoom = clamp(prev.zoom * zoomFactor, ZOOM_MIN, ZOOM_MAX);
      const zoomRatio = nextZoom / prev.zoom;
      const panX = prev.panX + (1 - zoomRatio) * (ndcX - prev.panX);
      const panY = prev.panY + (1 - zoomRatio) * (ndcY - prev.panY);
      return {
        ...prev,
        zoom: nextZoom,
        panX,
        panY,
      };
    });
  };

  return (
    <canvas
      ref={canvasRef}
      className="webgl-canvas"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    />
  );
};

export default WebGLViewport;
