import React, { useEffect, useState, useRef } from 'react';
import Viewport from './Viewport';
import { useCanvas } from './Viewport';
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

  const handleZoomIn = () => {
    setZoom(prevZoom => prevZoom * 2);
  };

  const handleZoomOut = () => {
    setZoom(prevZoom => prevZoom / 2);
  };


  const handleVisualize = () => {
    const requestData = {
      zoom: zoom,
      nValue: parseInt(nValue, 10),
      pValue: parseInt(pValue, 10),
      lValue: parseFloat(lValue, 10)

    };

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    };

    fetch('http://localhost:31415/view', requestOptions)
      .then(response => response.json())
      .then(data => {
        // Process the response data if needed
        console.log(data.text)
        console.log(data)
        setPointsData(data.data.points);
        setMax(data.data.max.points[0])
        setMin(data.data.min.points[0])
      })
      .catch(error => {
        console.error('Error sending data:', error);
      });
  };

  const calculateScaledCoordinate = (coordinate, maxCoordinate, viewportSize) => {
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
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);



  const renderPoints = () => {

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
const scalePointsToFitCanvas = (pointsData, minX, minY, maxX, maxY, canvasWidth, canvasHeight) => {
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
}
    const handleCanvasClick=(event)=>{
      // on each click get current mouse location
      const currentCoord = { x: event.clientX, y: event.clientY };
      // add the newest mouse location to an array in state
      console.log(coordinates)
      setCoordinates([...coordinates, currentCoord]);
    };

      const handleClearCanvas=(event)=>{
        setCoordinates([]);
        setCoordinates(scalePointsToFitCanvas(pointsData["points"], minimum.x, minimum.y, maximum.x, maximum.y, window.innerHeight, window.innerHeight))
      };

  const [ coordinates, setCoordinates, canvasRef, canvasWidth, canvasHeight ] = useCanvas();

  return (
    <div>
      <div>
        <button onClick={handleZoomIn}>Zoom In</button>
        <button onClick={handleZoomOut}>Zoom Out</button>
      </div>

      <canvas
        className="App-canvas"
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleCanvasClick} />

      <div className="button" >
        <button onClick={handleClearCanvas} > CLEAR </button>
      </div>
        <input type="text" value={nValue} onChange={handleNValueChange} placeholder="Enter N value" />
        <input type="text" value={pValue} onChange={handlePValueChange} placeholder="Enter P value" />
        <input type="text" value={lValue} onChange={handleLValueChange} placeholder="Enter L value" />

        <button ref={visualizeButtonRef} onClick={handleVisualize}>Visualize!</button>

    </div>
  );
};

export default App;
