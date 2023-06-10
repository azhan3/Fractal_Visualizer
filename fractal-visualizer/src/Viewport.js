import React, { useState, useEffect, useRef } from 'react';

// Path2D for a Heart SVG
const cross = "m35,0 v35 h-35 v30 h35 v35 h30 v-35 h35 v-30 h-35 v-35 z"
const ptSVG = "m30,0 a30,30,0,0,0,0,60 a-30,-30,0,0,0,0,-60 z"
const SVG_PATH = new Path2D(ptSVG);

// Scaling Constants for Canvas
const SCALE = 0.1;
const OFFSET = -30;
export const canvasWidth = window.innerWidth;
export const canvasHeight = window.innerHeight;

export function draw(ctx, location){
  ctx.fillStyle = 'black';
  ctx.save();
  ctx.scale(SCALE, SCALE);
  //console.log(location)
  ctx.translate(location.x / SCALE - OFFSET, location.y / SCALE - OFFSET);
  ctx.rotate(225 * Math.PI / 180);
  ctx.fill(SVG_PATH);
  // .restore(): Canvas 2D API restores the most recently saved canvas state
  ctx.restore();
};

export function useCanvas(){
    const canvasRef = useRef(null);
    const [coordinates, setCoordinates] = useState([]);

    useEffect(()=>{
        const canvasObj = canvasRef.current;
        const ctx = canvasObj.getContext('2d');
        // clear the canvas area before rendering the coordinates held in state
        ctx.clearRect( 0,0, canvasWidth, canvasHeight );

        // draw all coordinates held in state
        coordinates.forEach((coordinate)=>{draw(ctx, coordinate)});
    });

    return [ coordinates, setCoordinates, canvasRef, canvasWidth, canvasHeight ];
}
