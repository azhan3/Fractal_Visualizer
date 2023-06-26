# Project Summary - Visualization of Fractals in Zp Space

### Project Goal :
The goal of the project was to develop a program that provides a visual representation of fractals in the Zp space, where both R and Qp are normed sets. The space Qp is known to be totally disconnected, making it beneficial to work with Zp, which is homeomorphic to the Cantor set. The project was inspired by a paper by Trautwein, Roder, and Barozzi that explores the topological properties of Zp and its models that resemble fractals.

The program allows users to specify a prime number `p` and generates a fractal representation for a specified range of integers (e.g., first 2000 integers). The generated fractal visually represents the properties of the integers, with different colors or visual cues indicating specific forms of the numbers (e.g., integers congruent to 1 mod 3 in blue and integers congruent to 2 mod 3 in red).

### Key Features:
- Visual representation of fractals in Zp space for a given prime number `p`.
- Ability to specify the form of numbers to be represented, such as congruence modulo a specified value.
- Comparisons between different forms of numbers, allowing users to differentiate between multiple conditions.
- Distinct Visualization of Prime Races 

### Technologies Used:
- Java: The core programming language used for implementing the fractal generation algorithm.
- Vert.x: A reactive application framework used for building the backend server.
- Node.js: A JavaScript runtime used for server-side scripting and communication with the frontend.
- React.js: A JavaScript library used for building the user interface components of the frontend.
- Electron.js: A framework for creating cross-platform desktop applications using web technologies.
- Windows Batch: Used for executing automated tasks and managing the build process.

### Features Implemented:
The project aimed to provide a powerful visualization tool for exploring and understanding the fractal properties of Zp space. By generating and comparing different forms of integers within the fractal, users can gain insights into the topological and mathematical structures of Zp. The program is designed to be flexible, allowing for the visualization of ALL / most prime numbers, not just up to 13 like originally planned, providing an extremely broad range of exploration possibilities.

The project also accomplished the visualizations of Prime Races within the fractals, which was another feature requested by our client. Not only can Prime Races be visualized, all elements of the project are toggleable and the colours of the Prime Race points can be changed by the user.

Future enhancements could include expanding the range of prime numbers, implementing additional customization options for the fractal visualization, and optimizing the performance for handling larger sets of integers.

### Final Remarks:
Overall, the project offers an interactive and visually appealing solution for studying and analyzing the topological properties of Zp through fractal representations.
