import React, { useEffect, useState, useRef } from "react";
import Viewport from "./Viewport";
import { useCanvas } from "./Viewport";
import ToggleSwitch, { choice } from "./ToggleSwitch";
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

const App = () => {
  const [zoom, setZoom] = useState(1);
  const [pointsData, setPointsData] = useState([]);
  const [nValue, setNValue] = useState(1000);
  const [pValue, setPValue] = useState(3);
  const [lValue, setLValue] = useState(0.5);
  const [useRecommendedScaleFactor, setUseRecommendedScaleFactor] =
      useState(false);

  const [minimum, setMin] = useState([]);
  const [maximum, setMax] = useState([]);

  const svgRef = useRef(null);
  const visualizeButtonRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);

  const [primes, setPrimes] = useState("3");
  const [remainders, setRemainders] = useState("2");

  const [primesArray, setPrimesArray] = useState([]);
  const [remaindersArray, setRemaindersArray] = useState([]);
  const [primeRacesData, setPrimeRacesData] = useState([]);
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleZoomIn = () => {
    console.log("Zoom In...");
    setZoom((prevZoom) => prevZoom * 2);
  };

  const handleZoomOut = () => {
    console.log("Zoom Out...");
    setZoom((prevZoom) => prevZoom / 2);
  };

  const handleSend = () => {
    setPrimesArray(primes.trim() ? primes.split(" ").map(Number) : []);
    setRemaindersArray(
        remainders.trim() ? remainders.split(" ").map(Number) : []
    );
    const requestData = {
      zoom: zoom,
      nValue: parseInt(nValue, 10),
      pValue: parseInt(pValue, 10),
      lValue: parseFloat(lValue, 10),
      Algorithm: parseInt(choice, 10),
      RecommendL: useRecommendedScaleFactor,
      PrimeRaces: {
        primes: primes.trim() ? primes.split(" ").map(Number) : [],
        remainders: remainders.trim() ? remainders.split(" ").map(Number) : [],
      },
    };

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    };

    fetch("http://localhost:31415/view", requestOptions)
        .then((response) => response.json())
        .then((data) => {
          // Process the response data if needed
          console.log(data.text);
          console.log(data);
          setPointsData(data.data.points);
          setPrimeRacesData(data.data.PrimeRaces);
          console.log(Object.keys(data.data.PrimeRaces).length);
          let n = Object.keys(data.data.PrimeRaces).length;

          setPrimeRacesToggles(Array(n).fill(false));
          setSelectedColor(Array(n).fill("#FF4136"));

          setMax(data.data.max.points[0]);
          setMin(data.data.min.points[0]);
          return data; // Pass data to the next .then()
        })

        .catch((error) => {
          console.error("Error sending data:", error);
        });
  };

  const renderPoints = () => {};

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
  const scalePointsToFitCanvas = (
      pointsData,
      minX,
      minY,
      maxX,
      maxY,
      canvasWidth,
      canvasHeight
  ) => {
    const scaledPoints = [];

    const scaledCanvasWidth = canvasWidth * zoom;
    const scaledCanvasHeight = canvasHeight * zoom - 45;

    const scaleX = scaledCanvasWidth / (maxX - minX);
    const scaleY = scaledCanvasHeight / (maxY - minY);

    for (let i = 0; i < pointsData.length; i++) {
      const point = pointsData[i];
      const scaledX = (point.x - minX) * scaleX;
      const scaledY = (point.y - minY) * scaleY;

      scaledPoints.push({ x: scaledX, y: scaledY });
    }

    return scaledPoints;
  };

  //  const handleCanvasClick = (event) => {
  //    // on each click get current mouse location
  //    const currentCoord = { x: event.clientX, y: event.clientY };
  //    // add the newest mouse location to an array in state
  //    console.log(coordinates);
  //    setCoordinates([...coordinates, currentCoord]);
  //  };

  const handleClearCanvas = (event) => {
    setCoordinates([]);
    setPrimeRacesPTS([]);
  };
  const handleVisualize = () => {
    console.log(PrimeRacesToggles);

    console.log("Visualize");
    setCoordinates(
        scalePointsToFitCanvas(
            pointsData["points"],
            minimum.x,
            minimum.y,
            maximum.x,
            maximum.y,
            window.innerHeight,
            window.innerHeight
        )
    );
    let PrimePts = [];
    for (let key in primeRacesData) {
      let coordinates = primeRacesData[key];
      PrimePts.push(
          scalePointsToFitCanvas(
              coordinates.points,
              minimum.x,
              minimum.y,
              maximum.x,
              maximum.y,
              window.innerHeight,
              window.innerHeight
          )
      );
    }
    console.log(PrimePts);
    setPrimeRacesPTS(PrimePts);
    setCanvasWidth(window.innerWidth * zoom);
    setCanvasHeight(window.innerHeight * zoom + 20 * zoom);
  };
  const handleSizeChange = (event) => {
    const value = event.target.value;

    setDotSize(value === "" ? "1" : value);

    setSizePlaceholder(value);
  };
  let [
    coordinates,
    setCoordinates,
    canvasRef,
    canvasWidth,
    setCanvasWidth,
    canvasHeight,
    setCanvasHeight,
    dotSize,
    setDotSize,
    PrimeRacesPTS,
    setPrimeRacesPTS,
    PrimeRacesToggles,
    setPrimeRacesToggles,
    fractalDots,
    setFractalDots,
    primeRaces,
    setPrimeRaces,
    selectedColor,
    setSelectedColor,
  ] = useCanvas(window.innerWidth, window.innerHeight);
  const [sizePlaceholder, setSizePlaceholder] = useState(1);
  const handleChoiceChange = () => {};
  const test = () => {
    console.log(`Canvas: ${canvasWidth * zoom} ${canvasHeight * zoom}`);
    console.log(`Zoom: ${zoom}`);
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
  const handlePrimeRaceToggleChange = (key) => {
    setPrimeRacesToggles((prevState) => ({
      ...prevState,
      [key]: !prevState[key], // Toggle the value of the corresponding key
    }));
  };
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleToggleDropdown = (key) => {
    setDropdownOpen(key === dropdownOpen ? null : key);
  };

  const handleColorSelection = (key, color) => {
    setSelectedColor({ ...selectedColor, [key]: color });
    setDropdownOpen(false); // Close the dropdown menu
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
        <Draggable handle=".drag-handle">
          <div className="floating-area">
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
                  {/* Display prime races and toggles */}
                  {Object.keys(PrimeRacesToggles).map((key) => (
                      <div key={key} className="prime-race-item">
                        <label className="switch">
                          <input
                              type="checkbox"
                              checked={PrimeRacesToggles[key]}
                              onChange={() => handlePrimeRaceToggleChange(key)}
                          />
                          <div>
                      <span style={{ fontSize: "2em" }}>
                        {primesArray[key]}x + {remaindersArray[key]}
                      </span>
                          </div>
                        </label>
                        <div className="color-choose">
                          {/* Dropdown component */}
                          <div className={`dropdown dropdown-${key}`}>
                            <div
                                className="dropdown-toggle"
                                onClick={() => handleToggleDropdown(key)}
                            >
                              <div
                                  className="selected-color"
                                  style={{ backgroundColor: selectedColor[key] }}
                              ></div>
                              <span className="dropdown-icon"></span>
                            </div>
                            {dropdownOpen === key && ( // Check if the dropdownOpen state matches the current key
                                <ul className="dropdown-menu">
                                  {colors.map((color) => (
                                      <li
                                          key={color}
                                          className="dropdown-item"
                                          style={{ backgroundColor: color }}
                                          onClick={() => handleColorSelection(key, color)}
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
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                      d="M20 20L14.9497 14.9497M14.9497 14.9497C16.2165 13.683 17 11.933 17 10C17 6.13401 13.866 3 10 3C6.13401 3 3 6.13401 3 10M14.9497 14.9497C13.683 16.2165 11.933 17 10 17C8.09269 17 6.36355 16.2372 5.10102 15M7 10H13M10 7V13"
                      stroke="#B78C38"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
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
            <div className="button-wrapper" onClick={handleClearCanvas}>
              <div className="text">Clear</div>
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
                type="input"
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
                type="input"
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
                type="input"
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
                type="input"
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
              <Draggable>
                <canvas
                    className="App-canvas"
                    ref={canvasRef}
                    width={canvasWidth}
                    height={canvasHeight}
                />
              </Draggable>
            </div>
          </div>
        </div>
      </div>
  );
};

export default App;
