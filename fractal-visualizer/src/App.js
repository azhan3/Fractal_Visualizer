import React, { useEffect, useState, useRef } from 'react';

const App = () => {
  const [zoom, setZoom] = useState(2);
  const [pointsData, setPointsData] = useState([]);
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
    fetchData();
  };

  const calculateScaledCoordinate = (coordinate, maxCoordinate, viewportSize) => {
    const center = viewportSize / 2;
    const scaledCoordinate = (coordinate / 100000000000) * zoom + center; // Apply scaling factor

    console.log(scaledCoordinate);
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

  return (
    <div>
      <div>
        <button onClick={handleZoomIn}>Zoom In</button>
        <button onClick={handleZoomOut}>Zoom Out</button>
      </div>
      <svg
        ref={svgRef}
        style={{ width: '100%', height: '60vh', border: '1px solid black' }}
      >
        {/* Render coordinate plane */}
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="gray" />
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="gray" />

        {/* Render points on the coordinate plane */}
        {renderPoints()}
      </svg>
      <div>
        <button ref={visualizeButtonRef}>Visualize!</button>
      </div>
    </div>
  );
};

export default App;
