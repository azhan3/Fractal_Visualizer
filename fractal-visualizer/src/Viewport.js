import React, { useState, useEffect, useRef } from 'react';

// Path2D for a Heart SVG
const cross = "m35,0 v35 h-35 v30 h35 v35 h30 v-35 h35 v-30 h-35 v-35 z"
const ptSVG = "m1,0 a1,1,0,0,0,0,2 a-1,-1,0,0,0,0,-2 z"
const SVG_PATH = new Path2D(ptSVG);

// Scaling Constants for Canvas
const SCALE = 1;
const OFFSET = SCALE;
export const canvasWidth = window.innerWidth;
export const canvasHeight = window.innerHeight;

export function draw(ctx, location, dotSize){
  ctx.fillStyle = 'black';
  ctx.save();
  ctx.scale(dotSize, dotSize);
  //console.log(location)
  ctx.translate(location.x / dotSize - OFFSET, location.y / dotSize - OFFSET);
  ctx.fill(SVG_PATH);
  // .restore(): Canvas 2D API restores the most recently saved canvas state
  ctx.restore();
};

export function useCanvas(){
    const canvasRef = useRef(null);
    const [coordinates, setCoordinates] = useState([]);
  const [dotSize, setDotSize] = useState(1);

    useEffect(()=>{
        const canvasObj = canvasRef.current;
        const ctx = canvasObj.getContext('2d');
        // clear the canvas area before rendering the coordinates held in state
        ctx.clearRect( 0,0, canvasWidth, canvasHeight );

        // draw all coordinates held in state
        coordinates.forEach((coordinate)=>{draw(ctx, coordinate, dotSize)});
    });

    return [ coordinates, setCoordinates, canvasRef, canvasWidth, canvasHeight, dotSize, setDotSize ];
}
