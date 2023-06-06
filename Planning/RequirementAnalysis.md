# Requirements Analysis

## Introduction
The client wants a program that can visually represent the topological properties of the normed sets R and Qp, with a focus on the space Qp. Qp is a totally disconnected space, and it is beneficial to work with Zp, which is homeomorphic to the Cantor set. The client will provide additional reading and supplementary knowledge on this topic.

## Desired Functionality
The client has a paper by Trautwein, Roder, and Barozzi that discusses models of Zp that make it homeomorphic to a fractal. The client wants a program that can visually represent these fractals for a given value of p. The program should be able to represent the fractal for the first 2000 (or a large number of) integers. Additionally, the program should allow the client to specify the form of the numbers to be represented, such as numbers congruent to 1 mod 3.

## Visualization and Comparison
Each integer corresponds to a point in the fractal. The client wants the program to visually represent the fractal based on the specified form of the numbers. For example, numbers congruent to 1 mod 3 can be represented in blue, and numbers congruent to 2 mod 3 can be represented in red. The program should provide a way to compare two or more numbers of different forms within the fractal.

## Scope
The client is primarily interested in comparing numbers of specific forms for small values of p, rather than having a large number of p values (3, 5, 7) with limited functionality.

---

# Notes from the Client

The client has a paper by Trautwein, Roder, and Barozzi that explores the topological properties of Zp. In section 3 of the paper, different models of Zp that make it homeomorphic to a fractal are discussed. The client is interested in obtaining a visual representation of these fractals.

The client wants a program that can generate the visual representation of the fractal for a given value of p. The program should allow the client to specify the form of the numbers to be represented, such as numbers congruent to 1 mod 3. The visualization should cover a range of integers, possibly the first 2000 or a large number.

Additionally, the client wants the program to support the comparison of numbers of different forms within the fractal. For example, the ability to compare numbers congruent to 1 mod 3 in blue and numbers congruent to 2 mod 3 in red.

The client emphasizes the importance of the comparison feature and is more interested in having the ability to compare numbers of specific forms for small values of p, rather than having a large number of p values with limited functionality. There is existing code available for the case when p = 3, which can be adapted.

The client provides a sample visual representation on the next page to illustrate the desired outcome.
