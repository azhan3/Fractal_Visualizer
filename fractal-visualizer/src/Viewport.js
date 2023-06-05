import React from 'react';

const Viewport = ({ pointsData, zoom, calculateScaledCoordinate }) => {
console.log(pointsData)
  return (
    <div className="viewport">
      <div className="coordinate-plane">
        {pointsData.map((point, index) => {
          const scaledX = calculateScaledCoordinate(point.x, 800, 800);
          const scaledY = calculateScaledCoordinate(point.y, 600, 600);
          return (
            <div
              key={index}
              className="point"
              style={{
                width: '4px',
                height: '4px',
                background: 'black',
                position: 'absolute',
                left: `${scaledX}px`,
                top: `${scaledY}px`,
                borderRadius: '50%',
              }}
            ></div>
          );
        })}
      </div>
    </div>
  );
};

export default Viewport;
