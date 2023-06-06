import React, { useEffect, useState, useRef } from 'react';
import Viewport from './Viewport';

const App = () => {
  const [zoom, setZoom] = useState(2);
  const [pointsData, setPointsData] = useState([]);
  const [nValue, setNValue] = useState(1000);
  const [pValue, setPValue] = useState(3);
  const [lValue, setLValue] = useState(0.5);

  const svgRef = useRef(null);
  const visualizeButtonRef = useRef(null);

  const handleZoomIn = () => {
    setZoom(prevZoom => prevZoom * 2);
  };

  const handleZoomOut = () => {
    setZoom(prevZoom => prevZoom / 2);
  };

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:31415/data'); // Replace with your API endpoint
      const data = await response.json();
      setPointsData(data.points); // Update pointsData state with fetched data
    } catch (error) {
      console.error('Error fetching data:', error);
    }
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
        console.log(data);
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

  useEffect(() => {
    visualizeButtonRef.current.addEventListener('click', fetchData);
    return () => {
      visualizeButtonRef.current.removeEventListener('click', fetchData);
    };
  }, []);

  const renderPoints = () => {
    return pointsData.map((point, index) => {
      const scaledX = calculateScaledCoordinate(point.x, 800, 800);
      const scaledY = calculateScaledCoordinate(point.y, 600, 600);
      return (
        <circle key={index} cx={scaledX} cy={scaledY} r="2" fill="black" />
      );
    });
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

  return (
    <div>
      <div>
        <button onClick={handleZoomIn}>Zoom In</button>
        <button onClick={handleZoomOut}>Zoom Out</button>
      </div>
            <Viewport

            />
      <div>
        <input type="text" value={nValue} onChange={handleNValueChange} placeholder="Enter N value" />
        <input type="text" value={pValue} onChange={handlePValueChange} placeholder="Enter P value" />
        <input type="text" value={lValue} onChange={handleLValueChange} placeholder="Enter L value" />

        <button ref={visualizeButtonRef} onClick={handleVisualize}>Visualize!</button>
      </div>

    </div>
  );
};

export default App;
