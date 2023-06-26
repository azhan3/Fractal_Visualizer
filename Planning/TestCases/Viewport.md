# Test Case: Viewport

## Description
Verify the functionality of the `useCanvas` hook for managing canvas properties and rendering.

## Steps
1. Initialize the `useCanvas` hook with initial width and height values.
2. Set the coordinates, dot size, canvas width, canvas height, PrimeRacesPTS, PrimeRacesToggles, fractalDots, primeRaces, and selectedColor values as required for testing.
3. Render the canvas using the `useCanvas` hook.
4. Verify that the canvas is cleared by checking that the context is cleared with the `clearRect` method.
5. Calculate the offset based on the canvas size and dot size.
6. If `fractalDots` is `true`, draw each coordinate from the `coordinates` array using the `draw` function with the SVG path for points and the color "black".
7. If `primeRaces` is `true`, iterate over each `primeRace` in the `PrimeRacesPTS` array and, if the corresponding toggle is `true` in `PrimeRacesToggles`, draw each coordinate using the `draw` function with the SVG path for crosses and the respective color from the `selectedColor` array.
8. Verify that the canvas is rendered correctly.
9. Ensure p=3, p=5, p=7 fractals render the same shape as the book AT THE VERY LEAST

## Expected Result
The `useCanvas` hook should manage the canvas properties correctly and render the canvas based on the provided values. The canvas should be cleared before drawing, and the coordinates, dot size, canvas size, fractal dots, and prime races should be rendered accurately on the canvas. The selected colors for prime races should be used for drawing the corresponding coordinates.
