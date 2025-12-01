import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import ToggleSwitch, { choice } from "./ToggleSwitch";
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
import Draggable from "react-draggable";

const DEFAULT_PRECISION = 30;
const DEFAULT_ZOOM = 1;
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 128;
const BASE_PRECISION = 30;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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
  const [nValue, setNValue] = useState(1000);
  const [pValue, setPValue] = useState(3);
  const [lValue, setLValue] = useState(0.5);
  const [useRecommendedScaleFactor, setUseRecommendedScaleFactor] =
    useState(false);
  const floatingRef = useRef(null);
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
  const [algorithm, setAlgorithm] = useState(choice);

  
  const requestTimeoutRef = useRef(null);

  const primeRaceColors = useMemo(
    () => selectedColor.map((color) => hexToRgba(color)),
    [selectedColor]
  );

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleZoomIn = () => {
    setViewState((prev) => ({
      ...prev,
      zoom: clamp(prev.zoom * 2, ZOOM_MIN, ZOOM_MAX),
    }));
  };

  const handleZoomOut = () => {
    setViewState((prev) => ({
      ...prev,
      zoom: clamp(prev.zoom / 2, ZOOM_MIN, ZOOM_MAX),
    }));
  };

  const requestPoints = useCallback(() => {

    const primesList = parseNumberList(primes);
    const remaindersList = parseNumberList(remainders);
    setPrimesArray(primesList);
    setRemaindersArray(remaindersList);

    const requestData = {
      zoom: viewState.zoom,
      panX: viewState.panX,
      panY: viewState.panY,
      precision: Math.round(viewState.precision),
      nValue: parseInt(nValue, 10) || 0,
      pValue: parseInt(pValue, 10) || 0,
      lValue: parseFloat(lValue, 10) || 0,
      Algorithm: parseInt(algorithm, 10),
      RecommendL: useRecommendedScaleFactor,
      PrimeRaces: {
        primes: primesList,
        remainders: remaindersList,
      },
    };

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    };

    fetch("http://localhost:8888/send-data", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        const primaryPoints = (data.points && data.points.points) ? data.points.points : [];
        const minPoint = (data.min && data.min.points && data.min.points[0]) ? data.min.points[0] : null;
        const maxPoint = (data.max && data.max.points && data.max.points[0]) ? data.max.points[0] : null;
        const bounds = buildBounds(minPoint, maxPoint, primaryPoints);

        setRenderPoints(normalizePoints(primaryPoints, bounds, viewState.precision));

        const primeData = data.PrimeRaces || {};
        const primeKeys = Object.keys(primeData);
        const nextPrimePoints = primeKeys.map((key) => {
          const list = primeData[key];
          const points = list && list.points ? list.points : [];
          return normalizePoints(points, bounds, viewState.precision);
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
      })
      .catch((error) => {
        console.error("Error sending data:", error);
      });
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
    viewState.precision,
    algorithm,
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

  const handleSend = () => {
    requestPoints();
  };

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
  const handleVisualize = () => {
    requestPoints();
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

  const [expanded, setExpanded] = useState(true);

  const handleToggleExpand = () => {
    setExpanded(!expanded);
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

  const handlePrecisionChange = (event) => {
    const nextValue = Number(event.target.value);
    if (!Number.isFinite(nextValue)) {
      return;
    }
    setViewState((prev) => ({
      ...prev,
      precision: Math.round(nextValue),
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
      <Draggable handle=".drag-handle" nodeRef={floatingRef}>
        <div className="floating-area" ref={floatingRef}>
          <div className="prime-races-header">
            <div className="drag-handle">
              Prime Races
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={expanded}
                  onChange={handleToggleExpand}
                />
                <span className="checkmark"></span>
              </label>
            </div>
          </div>
          {expanded && (
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
                      <span style={{ fontSize: "2em" }}>
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
          )}
        </div>
      </Draggable>

      <div className="sidebar">
        <div className="button">
          <div className="button-wrapper" onClick={handleZoomIn}>
            <div className="text">Zoom In</div>
            <span className="icon">
              <svg
                viewBox="0 0 20 20"
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
                  {" "}
                  <path
                    d="M20 20L14.9497 14.9497M14.9497 14.9497C16.2165 13.683 17 11.933 17 10C17 6.13401 13.866 3 10 3C6.13401 3 3 6.13401 3 10M14.9497 14.9497C13.683 16.2165 11.933 17 10 17C8.09269 17 6.36355 16.2372 5.10102 15M7 10H13M10 7V13"
                    stroke="#B78C38"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                </g>
              </svg>
            </span>
          </div>
        </div>

        <div className="button">
          <div className="button-wrapper" onClick={handleZoomOut}>
            <div className="text">Zoom Out</div>
            <span className="icon">
              <svg
                viewBox="0 0 20 20"
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
                    d="M20 20L14.9497 14.9498M14.9497 14.9498C16.2165 13.683 17 11.933 17 10C17 6.13401 13.866 3 10 3C6.13401 3 3 6.13401 3 10M14.9497 14.9498C13.683 16.2165 11.933 17 10 17C8.09269 17 6.36355 16.2372 5.10102 15M7 10H13"
                    stroke="#B78C38"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </g>
              </svg>
            </span>
          </div>
        </div>

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
                    d="M9 9L15 15"
                    stroke="#B78C38"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M15 9L9 15"
                    stroke="#B78C38"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="#B78C38"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></circle>
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

        <div className="form__group field">
          <input
            type="number"
            className="form__field"
            placeholder="Precision"
            value={viewState.precision}
            onChange={handlePrecisionChange}
            name="precision"
            id="precision"
          />
          <label htmlFor="precision" className="form__label">
            Precision
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

        <div className="button">
          <div className="button-wrapper" onClick={handleSend}>
            <div className="text">Send</div>
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
                    d="M20 4L3 9.31372L10.5 13.5M20 4L14.5 21L10.5 13.5M20 4L10.5 13.5"
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

        <div className="button">
          <div className="button-wrapper" onClick={handleVisualize}>
            <div className="text">Visualize!</div>
            <span className="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                fill="#fff"
              >
                <path
                  fill="#B78C38"
                  d="M16,1C7.729,1,1,7.729,1,16s6.729,15,15,15s15-6.729,15-15S24.271,1,16,1z M28.949,15H17V3.051C23.37,3.539,28.461,8.63,28.949,15z M3,16C3,8.832,8.832,3,16,3v13l4.876,12.043C19.369,28.655,17.725,29,16,29C8.832,29,3,23.168,3,16z M21.786,27.625l-4.159-10.29l7.701,7.701C24.307,26.088,23.11,26.963,21.786,27.625z M26.001,24.294L17.707,16H29C29,19.151,27.872,22.042,26.001,24.294z"
                ></path>
              </svg>
            </span>
          </div>
        </div>
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
        <span>Zoom Level: {viewState.zoom.toFixed(2)}</span>
      </div>
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        <svg className="icon" viewBox="0 0 24 24" fill="#000000">
          {collapsed ? (
            <path
              d="M4 6L20 12L4 18"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M4 6L20 12L4 18"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </div>

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
