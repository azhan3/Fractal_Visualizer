import React, { useState, useEffect, useRef, useMemo } from "react";

const crossSVG = "m-1.5,-3 v1.5 h-1.5 v1.25 h1.5 v1.5 h1.25 v-1.5 h1.5 v-1.25 h-1.5 v-1.5 z";
const ptSVG = "m-1,-1 a1,1,0,0,0,2,2 a-1,-1,0,0,0,-2,-2 z";

const SVG_PATH_PT = new Path2D(ptSVG);
const SVG_PATH_CROSS = new Path2D(crossSVG);

export function draw(ctx, location, dotSize, offset, SVG_PATH, color) {
  ctx.fillStyle = color;
  ctx.save();
  ctx.scale(dotSize, dotSize);
  ctx.translate(location.x / dotSize + offset.x, location.y / dotSize + offset.y);
  ctx.fill(SVG_PATH);
  ctx.restore();
}

export function useCanvas(initialWidth, initialHeight) {
  const canvasRef = useRef(null);
  const [coordinates, setCoordinates] = useState([]);
  const [dotSize, setDotSize] = useState(1);
  const [canvasWidth, setCanvasWidth] = useState(initialWidth);
  const [canvasHeight, setCanvasHeight] = useState(initialHeight);
  const [PrimeRacesPTS, setPrimeRacesPTS] = useState([]);
  const [PrimeRacesToggles, setPrimeRacesToggles] = useState([]);
  const [fractalDots, setFractalDots] = useState(true);
  const [primeRaces, setPrimeRaces] = useState(true);
  const [selectedColor, setSelectedColor] = useState([]);

  const memoizedCanvasProps = useMemo(
      () => ({
        coordinates,
        dotSize,
        canvasWidth,
        canvasHeight,
        PrimeRacesPTS,
        PrimeRacesToggles,
        fractalDots,
        primeRaces,
        selectedColor,
      }),
      [coordinates, dotSize, canvasWidth, canvasHeight, PrimeRacesPTS, PrimeRacesToggles, fractalDots, primeRaces, selectedColor]
  );

  useEffect(() => {
    const canvasObj = canvasRef.current;
    const ctx = canvasObj.getContext("2d");
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Calculate the offset based on canvas size and dot size
    let offset = { x: canvasWidth / 4 - 2, y: canvasHeight / 50 - 2 };

    // Draw the primary coordinates if fractalDots is true
    if (fractalDots) {
      coordinates.forEach((coordinate) => {
        draw(ctx, coordinate, dotSize, offset, SVG_PATH_PT, "black");
      });
    }

    offset = { x: canvasWidth / 4 - 1, y: canvasHeight / 50 - 1 };

    // Draw the PrimeRacesPTS if primeRaces is true and corresponding toggle is true
    if (primeRaces) {
      PrimeRacesPTS.forEach((primeRace, index) => {
        if (PrimeRacesToggles[index]) {
          primeRace.forEach((coordinate) => {
            draw(ctx, coordinate, dotSize, offset, SVG_PATH_CROSS, selectedColor[index]);
          });
        }
      });
    }
  }, [memoizedCanvasProps]);

  return [
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
  ];
}
