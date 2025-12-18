import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import ToggleSwitch from "./ToggleSwitch";
import WebGLViewport from "./WebGLViewport";
import "./Styles/input.scss";
import "./Styles/button.css";
import "./Styles/sidebar.css";
import "./Styles/App.css";
import "./Styles/Viewport.css";
import "./Styles/border.css";
import "./Styles/checkbox.css";
import "./Styles/color-chooser.css";
import "./Styles/toggle-small.scss";
// removed react-draggable: prime races moved into sidebar

const DEFAULT_PRECISION = 30;
const DEFAULT_ZOOM = 1;
const BASE_PRECISION = 30;

const parseNumberList = (value) => {
  if (!value || !value.trim()) {
    return [];
  }
  return value
    .trim()
    .split(/\s+/)
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));
};

const buildBounds = (minPoint, maxPoint, points) => {
  let minX = Number(minPoint?.x);
  let minY = Number(minPoint?.y);
  let maxX = Number(maxPoint?.x);
  let maxY = Number(maxPoint?.y);

  const hasBounds =
    Number.isFinite(minX) &&
    Number.isFinite(minY) &&
    Number.isFinite(maxX) &&
    Number.isFinite(maxY);

  if (!hasBounds && points && points.length) {
    minX = Number(points[0].x);
    minY = Number(points[0].y);
    maxX = minX;
    maxY = minY;
    for (let i = 1; i < points.length; i++) {
      const x = Number(points[i].x);
      const y = Number(points[i].y);
      if (Number.isFinite(x)) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
      if (Number.isFinite(y)) {
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return null;
  }

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const extentX = maxX - minX;
  const extentY = maxY - minY;
  const extent = Math.max(extentX, extentY);
  const scale = extent > 0 ? 2 / extent : 1;

  return {
    centerX,
    centerY,
    scale,
  };
};

const normalizePoints = (points, bounds, precision) => {
  if (!points || points.length === 0 || !bounds) {
    return new Float32Array();
  }

  const stride = Math.max(1, Math.floor(BASE_PRECISION / Math.max(1, precision)));
  const count = Math.ceil(points.length / stride);
  const buffer = new Float32Array(count * 2);
  let offset = 0;

  for (let i = 0; i < points.length; i += stride) {
    const point = points[i];
    const x = (Number(point.x) - bounds.centerX) * bounds.scale;
    const y = (Number(point.y) - bounds.centerY) * bounds.scale;
    buffer[offset++] = x;
    buffer[offset++] = y;
  }

  return buffer;
};

const buildBoundsFromArrays = (minArray, maxArray, xArray, yArray) => {
  let minX = Number(minArray?.[0]);
  let minY = Number(minArray?.[1]);
  let maxX = Number(maxArray?.[0]);
  let maxY = Number(maxArray?.[1]);

  const hasBounds =
    Number.isFinite(minX) &&
    Number.isFinite(minY) &&
    Number.isFinite(maxX) &&
    Number.isFinite(maxY);

  const safeX = Array.isArray(xArray) ? xArray : [];
  const safeY = Array.isArray(yArray) ? yArray : [];

  if (!hasBounds && safeX.length && safeY.length) {
    const count = Math.min(safeX.length, safeY.length);
    minX = Number(safeX[0]);
    minY = Number(safeY[0]);
    maxX = minX;
    maxY = minY;
    for (let i = 1; i < count; i++) {
      const x = Number(safeX[i]);
      const y = Number(safeY[i]);
      if (Number.isFinite(x)) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
      if (Number.isFinite(y)) {
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return null;
  }

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const extentX = maxX - minX;
  const extentY = maxY - minY;
  const extent = Math.max(extentX, extentY);
  const scale = extent > 0 ? 2 / extent : 1;

  return {
    centerX,
    centerY,
    scale,
  };
};

const normalizePointArrays = (xArray, yArray, bounds, precision) => {
  const safeX = Array.isArray(xArray) ? xArray : [];
  const safeY = Array.isArray(yArray) ? yArray : [];

  if (!bounds || safeX.length === 0 || safeY.length === 0) {
    return new Float32Array();
  }

  const count = Math.min(safeX.length, safeY.length);
  const stride = Math.max(1, Math.floor(BASE_PRECISION / Math.max(1, precision)));
  const outputCount = Math.ceil(count / stride);
  const buffer = new Float32Array(outputCount * 2);
  let offset = 0;

  for (let i = 0; i < count; i += stride) {
    const x = (Number(safeX[i]) - bounds.centerX) * bounds.scale;
    const y = (Number(safeY[i]) - bounds.centerY) * bounds.scale;
    buffer[offset++] = x;
    buffer[offset++] = y;
  }

  return buffer;
};

// Normalize raw Float32Array pairs (x,y,x,y,...) into scaled Float32Array
const normalizeFloat32Raw = (float32Pairs, bounds, precision) => {
  if (!float32Pairs || float32Pairs.length === 0 || !bounds) {
    return new Float32Array();
  }

  const count = Math.floor(float32Pairs.length / 2);
  const stride = Math.max(1, Math.floor(BASE_PRECISION / Math.max(1, precision)));
  const outputCount = Math.ceil(count / stride);
  const buffer = new Float32Array(outputCount * 2);
  let offset = 0;

  for (let i = 0; i < count; i += stride) {
    const x = (float32Pairs[i * 2 + 0] - bounds.centerX) * bounds.scale;
    const y = (float32Pairs[i * 2 + 1] - bounds.centerY) * bounds.scale;
    buffer[offset++] = x;
    buffer[offset++] = y;
  }

  return buffer;
};

const hexToRgba = (hex) => {
  if (typeof hex !== "string") {
    return [0, 0, 0, 1];
  }

  const normalized = hex.replace("#", "");
  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16) / 255;
    const g = parseInt(normalized[1] + normalized[1], 16) / 255;
    const b = parseInt(normalized[2] + normalized[2], 16) / 255;
    return [r, g, b, 1];
  }

  if (normalized.length === 6) {
    const r = parseInt(normalized.slice(0, 2), 16) / 255;
    const g = parseInt(normalized.slice(2, 4), 16) / 255;
    const b = parseInt(normalized.slice(4, 6), 16) / 255;
    return [r, g, b, 1];
  }

  return [0, 0, 0, 1];
};

const App = () => {
  const [viewState, setViewState] = useState({
    zoom: DEFAULT_ZOOM,
    panX: 0,
    panY: 0,
    precision: DEFAULT_PRECISION,
  });
  const [renderPoints, setRenderPoints] = useState(new Float32Array());
  const [primeRaceRenderPoints, setPrimeRaceRenderPoints] = useState([]);
  const [nValue, setNValue] = useState(10000);
  const [pValue, setPValue] = useState(5);
  const [lValue, setLValue] = useState(0.5);
  const [useRecommendedScaleFactor, setUseRecommendedScaleFactor] =
    useState(true);
  
  const [collapsed, setCollapsed] = useState(false);

  const [primes, setPrimes] = useState("3");
  const [remainders, setRemainders] = useState("2");

  const [primesArray, setPrimesArray] = useState([]);
  const [remaindersArray, setRemaindersArray] = useState([]);

  const [PrimeRacesToggles, setPrimeRacesToggles] = useState([]);
  const [selectedColor, setSelectedColor] = useState([]);
  const [fractalDots, setFractalDots] = useState(true);
  const [primeRaces, setPrimeRaces] = useState(true);
  const [dotSize, setDotSize] = useState(2);
  const [sizePlaceholder, setSizePlaceholder] = useState(2);
  const [algorithm, setAlgorithm] = useState(2);
  const requestTimeoutRef = useRef(null);
  const wsRef = useRef(null);
  const precisionRef = useRef(viewState.precision);
  const pendingRequestRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const isUnmountedRef = useRef(false);
  const streamStateRef = useRef({
    bounds: null,
    points: new Float32Array(),
    primePoints: [],
  });

  const primeRaceColors = useMemo(
    () => selectedColor.map((color) => hexToRgba(color)),
    [selectedColor]
  );

  useEffect(() => {
    precisionRef.current = viewState.precision;
  }, [viewState.precision]);

  const appendFloat32 = useCallback((prev, next) => {
    if (!next || next.length === 0) {
      return prev;
    }
    if (!prev || prev.length === 0) {
      return next;
    }
    const merged = new Float32Array(prev.length + next.length);
    merged.set(prev, 0);
    merged.set(next, prev.length);
    return merged;
  }, []);

  const handleStreamMessage = useCallback((message) => {
    const precision = precisionRef.current;

    if (message.type === "start") {
      const bounds = buildBoundsFromArrays(message.bounds?.min, message.bounds?.max, [], []);
      streamStateRef.current = {
        bounds,
        points: new Float32Array(),
        primePoints: [],
      };
      setRenderPoints(new Float32Array());
      setPrimeRaceRenderPoints([]);
      return;
    }

    if (message.type === "chunk") {
      const bounds = streamStateRef.current.bounds;
      if (!bounds) {
        return;
      }

      const payload = message.data || {};
      const pointsData = payload.points || {};
      const primaryX = Array.isArray(pointsData.x) ? pointsData.x : [];
      const primaryY = Array.isArray(pointsData.y) ? pointsData.y : [];
      const nextPoints = normalizePointArrays(primaryX, primaryY, bounds, precision);
      streamStateRef.current.points = appendFloat32(streamStateRef.current.points, nextPoints);
      setRenderPoints(streamStateRef.current.points);

      const primeData = payload.primeRaces || {};
      const primeKeys = Object.keys(primeData);
      if (primeKeys.length) {
        const nextPrimePoints = [...streamStateRef.current.primePoints];
        primeKeys.forEach((key) => {
          const index = Math.max(0, parseInt(key, 10) - 1);
          const list = primeData[key] || {};
          const xList = Array.isArray(list.x) ? list.x : [];
          const yList = Array.isArray(list.y) ? list.y : [];
          const nextChunk = normalizePointArrays(xList, yList, bounds, precision);
          nextPrimePoints[index] = appendFloat32(nextPrimePoints[index] || new Float32Array(), nextChunk);
        });

        streamStateRef.current.primePoints = nextPrimePoints;
        setPrimeRaceRenderPoints(nextPrimePoints);
        setPrimeRacesToggles((prev) =>
          prev.length === nextPrimePoints.length
            ? prev
            : Array(nextPrimePoints.length).fill(false)
        );
        setSelectedColor((prev) =>
          prev.length === nextPrimePoints.length
            ? prev
            : Array(nextPrimePoints.length).fill("#FF4136")
        );
      }
      return;
    }
  }, [appendFloat32]);

  const handleResponseData = useCallback((data) => {
    if (data && data.stream && data.type) {
      handleStreamMessage(data);
      return;
    }

    const precision = precisionRef.current;

    if (data && data.version === 1 && data.data) {
      const payload = data.data || {};
      const pointsData = payload.points || {};
      const primaryX = Array.isArray(pointsData.x) ? pointsData.x : [];
      const primaryY = Array.isArray(pointsData.y) ? pointsData.y : [];
      const bounds = buildBoundsFromArrays(data.bounds?.min, data.bounds?.max, primaryX, primaryY);

      setRenderPoints(normalizePointArrays(primaryX, primaryY, bounds, precision));

      const primeData = payload.primeRaces || {};
      const primeKeys = Object.keys(primeData);
      const nextPrimePoints = primeKeys.map((key) => {
        const list = primeData[key] || {};
        const xList = Array.isArray(list.x) ? list.x : [];
        const yList = Array.isArray(list.y) ? list.y : [];
        return normalizePointArrays(xList, yList, bounds, precision);
      });

      setPrimeRaceRenderPoints(nextPrimePoints);
      setPrimeRacesToggles((prev) =>
        prev.length === nextPrimePoints.length
          ? prev
          : Array(nextPrimePoints.length).fill(false)
      );
      setSelectedColor((prev) =>
        prev.length === nextPrimePoints.length
          ? prev
          : Array(nextPrimePoints.length).fill("#FF4136")
      );
      return;
    }

    const primaryPoints = (data.points && data.points.points) ? data.points.points : [];
    const minPoint = (data.min && data.min.points && data.min.points[0]) ? data.min.points[0] : null;
    const maxPoint = (data.max && data.max.points && data.max.points[0]) ? data.max.points[0] : null;
    const bounds = buildBounds(minPoint, maxPoint, primaryPoints);

    setRenderPoints(normalizePoints(primaryPoints, bounds, precision));

    const primeData = data.PrimeRaces || {};
    const primeKeys = Object.keys(primeData);
    const nextPrimePoints = primeKeys.map((key) => {
      const list = primeData[key];
      const points = list && list.points ? list.points : [];
      return normalizePoints(points, bounds, precision);
    });

    setPrimeRaceRenderPoints(nextPrimePoints);
    setPrimeRacesToggles((prev) =>
      prev.length === nextPrimePoints.length
        ? prev
        : Array(nextPrimePoints.length).fill(false)
    );
    setSelectedColor((prev) =>
      prev.length === nextPrimePoints.length
        ? prev
        : Array(nextPrimePoints.length).fill("#FF4136")
    );
  }, [handleStreamMessage]);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      return;
    }

    const ws = new WebSocket("ws://localhost:8888/ws");
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    ws.onopen = () => {
      if (pendingRequestRef.current) {
        ws.send(JSON.stringify(pendingRequestRef.current));
        pendingRequestRef.current = null;
      }
    };

    // map of pending metadata for binary frames keyed by seq
    const metaMap = {};

    ws.onmessage = (event) => {
      try {
        if (typeof event.data === 'string') {
          const payload = JSON.parse(event.data);
          // If this is chunk metadata, store it for the following binary frame
          if (payload.type === 'chunk-meta' && payload.seq !== undefined) {
            metaMap[payload.seq] = payload;
            return;
          }
          handleResponseData(payload);
          return;
        }

        // Binary frame: expect Float32Array payload matching the most recent meta by seq order
        const buffer = event.data;
        const floats = new Float32Array(buffer);

        // Find the oldest seq in metaMap (small map, linear scan is fine)
        const seqKeys = Object.keys(metaMap).map((k) => parseInt(k, 10)).sort((a, b) => a - b);
        if (seqKeys.length === 0) {
          console.warn('Received binary payload with no metadata');
          return;
        }
        const seq = seqKeys[0];
        const meta = metaMap[seq];
        delete metaMap[seq];

        const precision = precisionRef.current;
        const bounds = streamStateRef.current.bounds;
        if (!bounds) {
          return;
        }

        // Slice floats according to meta.primaryCount and primeCounts
        let offset = 0;
        const primaryCount = meta.primaryCount || 0;
        const primaryFloats = floats.subarray(offset, offset + primaryCount * 2);
        offset += primaryCount * 2;
        const primaryBuffer = new Float32Array(primaryFloats);

        const nextPrimary = normalizeFloat32Raw(primaryBuffer, bounds, precision);
        streamStateRef.current.points = appendFloat32(streamStateRef.current.points, nextPrimary);
        setRenderPoints(streamStateRef.current.points);

        const primeCounts = meta.primeCounts || {};
        const primeKeys = Object.keys(primeCounts);
        if (primeKeys.length) {
          const nextPrimePoints = [...streamStateRef.current.primePoints];
          for (const key of primeKeys) {
            const count = primeCounts[key] || 0;
            const floatLen = count * 2;
            const slice = floats.subarray(offset, offset + floatLen);
            offset += floatLen;
            const normalized = normalizeFloat32Raw(new Float32Array(slice), bounds, precision);
            const index = Math.max(0, parseInt(key, 10) - 1);
            nextPrimePoints[index] = appendFloat32(nextPrimePoints[index] || new Float32Array(), normalized);
          }

          streamStateRef.current.primePoints = nextPrimePoints;
          setPrimeRaceRenderPoints(nextPrimePoints);
          setPrimeRacesToggles((prev) =>
            prev.length === nextPrimePoints.length
              ? prev
              : Array(nextPrimePoints.length).fill(false)
          );
          setSelectedColor((prev) =>
            prev.length === nextPrimePoints.length
              ? prev
              : Array(nextPrimePoints.length).fill("#FF4136")
          );
        }

      } catch (error) {
        console.error("Error handling websocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      wsRef.current = null;
      if (!isUnmountedRef.current) {
        reconnectTimerRef.current = setTimeout(() => {
          connectWebSocket();
        }, 1000);
      }
    };
  }, [handleResponseData]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      isUnmountedRef.current = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const requestPoints = useCallback(() => {

    const primesList = parseNumberList(primes);
    const remaindersList = parseNumberList(remainders);
    setPrimesArray(primesList);
    setRemaindersArray(remaindersList);

    const requestData = {
      version: 1,
      requestId: `req-${Date.now()}`,
      data: {
        params: {
          nValue: parseInt(nValue, 10) || 0,
          pValue: parseInt(pValue, 10) || 0,
          lValue: parseFloat(lValue, 10) || 0,
          algorithm: parseInt(algorithm, 10),
          recommendL: useRecommendedScaleFactor,
        },
        view: {
          zoom: viewState.zoom,
          panX: viewState.panX,
          panY: viewState.panY,
        },
        filters: {
          primeRaces: {
            primes: primesList,
            remainders: remaindersList,
          },
        },
        stream: {
          enabled: true,
          chunkSize: 2000,
        },
      },
    };

    const activeSocket = wsRef.current;
    if (activeSocket && activeSocket.readyState === WebSocket.OPEN) {
      activeSocket.send(JSON.stringify(requestData));
      return;
    }

    pendingRequestRef.current = requestData;
    if (!activeSocket || activeSocket.readyState === WebSocket.CLOSED) {
      connectWebSocket();
    }
  }, [
    primes,
    remainders,
    nValue,
    pValue,
    lValue,
    useRecommendedScaleFactor,
    viewState.zoom,
    viewState.panX,
    viewState.panY,
    algorithm,
    connectWebSocket,
  ]);

  useEffect(() => {
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
    }
    requestTimeoutRef.current = setTimeout(() => {
      requestPoints();
    }, 250);

    return () => {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
    };
  }, [requestPoints]);

  

  const handleNValueChange = (event) => {
    setNValue(event.target.value);
  };

  const handlePValueChange = (event) => {
    setPValue(event.target.value);
  };
  const handleLValueChange = (event) => {
    setLValue(event.target.value);
  };
  const handlePrimesChange = (event) => {
    setPrimes(event.target.value);
  };
  const handleRemaindersChange = (event) => {
    setRemainders(event.target.value);
  };
  
  const handleSizeChange = (event) => {
    const value = event.target.value;
    setDotSize(value === "" ? 1 : Number(value));
    setSizePlaceholder(value);
  };
  const handleChoiceChange = (nextChoice) => {
    setAlgorithm(nextChoice);
  };

  const handleCheckboxChange = (event) => {
    setUseRecommendedScaleFactor(event.target.checked);
  };
  const handleFractalDots = (event) => {
    setFractalDots(event.target.checked);
  };
  const handlePrimeRaceChange = (event) => {
    setPrimeRaces(event.target.checked);
  };

  const handlePrimeRaceToggleChange = (index) => {
    setPrimeRacesToggles((prevState) =>
      prevState.map((value, currentIndex) =>
        currentIndex === index ? !value : value
      )
    );
  };
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleToggleDropdown = (key) => {
    setDropdownOpen(key === dropdownOpen ? null : key);
  };

  const handleColorSelection = (index, color) => {
    setSelectedColor((prevState) =>
      prevState.map((value, currentIndex) =>
        currentIndex === index ? color : value
      )
    );
    setDropdownOpen(false);
  };

  const handleReset = () => {
    setViewState((prev) => ({
      ...prev,
      zoom: DEFAULT_ZOOM,
      panX: 0,
      panY: 0,
    }));
  };

  

  const colors = [
    "#FF4136",
    "#FF851B",
    "#FFDC00",
    "#2ECC40",
    "#0074D9",
    "#B10DC9",
  ];

  return (
    <div className={`container ${collapsed ? "collapsed" : ""}`}>
      {/* Prime Races moved into sidebar - floating panel removed */}

      <div className="sidebar">

        <div className="button">
          <div className="button-wrapper" onClick={handleReset}>
            <div className="text">Reset Canvas</div>
            <span className="icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    d="M6 12h8.5"
                    stroke="#B78C38"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M10.5 8.5L14 12l-3.5 3.5"
                    stroke="#B78C38"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M18 6v12"
                    stroke="#B78C38"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </g>
              </svg>
            </span>
          </div>
        </div>

        <div className="form__group field">
          <input
            type="number"
            className="form__field"
            placeholder="Dot Size"
            value={sizePlaceholder}
            onChange={handleSizeChange}
            name="size"
            id="size"
            required
          />
          <label htmlFor="size" className="form__label">
            Dot Size
          </label>
        </div>

        <div className="form__group field">
          <input
            type="number"
            className="form__field"
            placeholder="Enter N value"
            value={nValue}
            onChange={handleNValueChange}
            name="nValue"
            id="nValue"
          />
          <label htmlFor="nValue" className="form__label">
            N Value
          </label>
        </div>

        <div className="form__group field">
          <input
            type="number"
            className="form__field"
            placeholder="Enter P value"
            value={pValue}
            onChange={handlePValueChange}
            name="pValue"
            id="pValue"
          />
          <label htmlFor="pValue" className="form__label">
            P Value
          </label>
        </div>

        <div className="form__group field">
          <input
            type="number"
            className="form__field"
            placeholder="Enter L value"
            value={lValue}
            onChange={handleLValueChange}
            name="lValue"
            id="lValue"
          />
          <label htmlFor="lValue" className="form__label">
            L Value
          </label>
        </div>

        
        <br></br>
        <label className="switch">
          <input
            type="checkbox"
            checked={useRecommendedScaleFactor}
            onChange={handleCheckboxChange}
          />
          <div>
            <span>Recommended Scale Factor</span>
          </div>
        </label>

        
        <div>
          <ToggleSwitch onChoiceChange={handleChoiceChange} />
        </div>

        <br></br>
        <label className="switch">
          <input
            type="checkbox"
            checked={fractalDots}
            onChange={handleFractalDots}
          />{" "}
          <div>
            <span>Points</span>
          </div>
        </label>

        <br></br>

        <label className="switch">
          <input
            type="checkbox"
            checked={primeRaces}
            onChange={handlePrimeRaceChange}
          />{" "}
          <div>
            <span>Primes Races</span>
          </div>
        </label>

        <div className="form__group field">
          <input
            type="input"
            className="form__field"
            placeholder="Enter Prime Number"
            value={primes}
            onChange={handlePrimesChange}
            name="prime"
            id="prime"
          />
          <label htmlFor="prime" className="form__label">
            Primes
          </label>
        </div>

        <div className="form__group field">
          <input
            type="input"
            className="form__field"
            placeholder="Enter Remainder"
            value={remainders}
            onChange={handleRemaindersChange}
            name="remainder"
            id="remainder"
          />
          <label htmlFor="remainder" className="form__label">
            Remainders
          </label>
        </div>
        <div className="prime-races-section">
          <div className="prime-races-header">
            <span style={{ fontWeight: 600 }}>Prime Races</span>
          </div>
          <div className="prime-races-content">
            {PrimeRacesToggles.map((enabled, index) => (
              <div key={index} className="prime-race-item">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => handlePrimeRaceToggleChange(index)}
                  />
                  <div>
                    <span style={{ fontSize: "1.1em" }}>
                      {primesArray[index]}x + {remaindersArray[index]}
                    </span>
                  </div>
                </label>
                <div className="color-choose">
                  <div className={`dropdown dropdown-${index}`}>
                    <div
                      className="dropdown-toggle"
                      onClick={() => handleToggleDropdown(index)}
                    >
                      <div
                        className="selected-color"
                        style={{ backgroundColor: selectedColor[index] }}
                      ></div>
                      <span className="dropdown-icon"></span>
                    </div>
                    {dropdownOpen === index && (
                      <ul className="dropdown-menu">
                        {colors.map((color) => (
                          <li
                            key={color}
                            className="dropdown-item"
                            style={{ backgroundColor: color }}
                            onClick={() => handleColorSelection(index, color)}
                          ></li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
            </div>
        </div>
      </div>

      <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
        <svg viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className="main">
        <div className="border">
          <div className="canvas-wrapper">
            <WebGLViewport
              points={renderPoints}
              primeRacePoints={primeRaceRenderPoints}
              primeRaceToggles={PrimeRacesToggles}
              primeRaceColors={primeRaceColors}
              viewState={viewState}
              pointSize={Number(dotSize) || 1}
              showPoints={fractalDots}
              showPrimeRaces={primeRaces}
              onViewStateChange={setViewState}
            />
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
