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

const App = () => {
  const [zoom, setZoom] = useState(2);
  const [pointsData, setPointsData] = useState([]);
  const [nValue, setNValue] = useState(1000);
  const [pValue, setPValue] = useState(3);
  const [lValue, setLValue] = useState(0.5);

  const [minimum, setMin] = useState([]);
  const [maximum, setMax] = useState([]);

  const svgRef = useRef(null);
  const visualizeButtonRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleZoomIn = () => {
    setZoom((prevZoom) => prevZoom * 2);
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => prevZoom / 2);
  };

  const handleSend = () => {
    const requestData = {
      zoom: zoom,
      nValue: parseInt(nValue, 10),
      pValue: parseInt(pValue, 10),
      lValue: parseFloat(lValue, 10),
      Algorithm: parseInt(choice, 10),
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
        setMax(data.data.max.points[0]);
        setMin(data.data.min.points[0]);
      })
      .catch((error) => {
        console.error("Error sending data:", error);
      });
  };

  const calculateScaledCoordinate = (
    coordinate,
    maxCoordinate,
    viewportSize
  ) => {
    const center = viewportSize / 2;
    const scaledCoordinate = (coordinate / 10) * zoom + center; // Apply scaling factor
    return scaledCoordinate;
  };

  const handleResize = () => {
    const svgElement = svgRef.current;
    if (svgElement) {
      const rect = svgElement.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
      setZoom(size / 800);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

    const scaleX = canvasWidth / (maxX - minX);
    const scaleY = canvasHeight / (maxY - minY);

    for (let i = 0; i < pointsData.length; i++) {
      const point = pointsData[i];
      const scaledX = (point.x - minX) * scaleX;
      const scaledY = (point.y - minY) * scaleY;

      scaledPoints.push({ x: scaledX, y: scaledY });
    }

    return scaledPoints;
  };
  const handleCanvasClick = (event) => {
    // on each click get current mouse location
    const currentCoord = { x: event.clientX, y: event.clientY };
    // add the newest mouse location to an array in state
    console.log(coordinates);
    setCoordinates([...coordinates, currentCoord]);
  };

  const handleClearCanvas = (event) => {
    setCoordinates([]);
  };
  const handleVisualize = () => {
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
  };
  const handleSizeChange = (event) => {
    const value = event.target.value;

    setDotSize(value === "" ? "1" : value);

    setSizePlaceholder(value);
  };
  const [
    coordinates,
    setCoordinates,
    canvasRef,
    canvasWidth,
    canvasHeight,
    dotSize,
    setDotSize,
  ] = useCanvas();
  const [sizePlaceholder, setSizePlaceholder] = useState(1);
  const handleChoiceChange = () => {
    console.log("Choice changed:", choice);
  };
  return (
    <div className={`container ${collapsed ? "collapsed" : ""}`}>
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
                  <path
                    d="M20 20L14.9497 14.9497M14.9497 14.9497C16.2165 13.683 17 11.933 17 10C17 6.13401 13.866 3 10 3C6.13401 3 3 6.13401 3 10M14.9497 14.9497C13.683 16.2165 11.933 17 10 17C8.09269 17 6.36355 16.2372 5.10102 15M7 10H13"
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
            <div className="text">CLEAR</div>
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
        <div className="button">
          <div className="button-wrapper" onClick={handleSend}>
            <div className="text">SEND!</div>
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
            <div className="text">VISUALIZE!</div>
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
        <canvas
          className="App-canvas"
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onClick={handleCanvasClick}
        />
        </div>

      </div>


    </div>
  );
};

export default App;
