"use strict";
// set up the grid //
document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector("#game-grid");
    const rows = 20;
    const columns = rows;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            const gridSquare = document.createElement("div");
            gridSquare.id = `xy_${i}-${j}`;
            gridSquare.classList.add("border-[1px]", "border-black", "w-[30px]", "h-[30px]");
            grid.appendChild(gridSquare);
        }
    }
    // initialize the player and enemies //
    const defaultDelay = 200; // ms
    let noEnemies = 12;
    let noPoints = 1;
    let player = [];
    let enemies = [];
    let points = [];
    const playerColor = "bg-red-500";
    const enemyColor = "bg-blue-500";
    const pointColor = "bg-yellow-500";
    const bgColor = "bg-zinc-300";
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    // assign a random initial player position
    player.push(`xy_${getRandomInt(columns)}-${getRandomInt(rows)}`);
    // assign a random initial point position
    function placePoints() {
        for (let i = 0; i < noPoints; i++) {
            let newCoord = `xy_${getRandomInt(columns)}-${getRandomInt(rows)}`;
            if (!player.includes(newCoord)) {
                points = [newCoord];
                console.log("points placed", newCoord);
            }
        }
    }
    placePoints();
    // assign random initial enemy positions
    let playerX = player[0].split("xy_")[1].split("-")[0];
    let playerY = player[0].split("xy_")[1].split("-")[1];
    for (let i = 0; i < noEnemies; i++) {
        let tooClose = false;
        let coord = `xy_${getRandomInt(columns)}-${getRandomInt(rows)}`;
        let coordX = coord.split("xy_")[1].split("-")[0];
        let coordY = coord.split("xy_")[1].split("-")[1];
        if (Math.abs(coordX - playerX) <= 1 && Math.abs(playerY - playerY) <= 1) {
            tooClose = true;
        }
        if (!tooClose && !enemies.includes(coord) && !points.includes(coord)) {
            enemies.push(coord);
        }
    }
    // apply colors to the player, enemies and points
    function colorSquares(squares, color) {
        squares.forEach((coordinate) => {
            const square = document.querySelector(`#${coordinate}`);
            square.classList.toggle(color);
        });
    }
    colorSquares(player, playerColor);
    colorSquares(enemies, enemyColor);
    colorSquares(points, pointColor);
    // init the score
    let score = 0;
    const scoreDisplay = document.getElementById("score");
    scoreDisplay.innerHTML = score;
    function checkIfScored() {
        if (player[0] === points[0]) {
            colorSquares(points, pointColor);
            placePoints();
            colorSquares(points, pointColor);
            score++;
            scoreDisplay.innerHTML = score;
            console.log(score);
        }
    }
    // move the player with arrow keys
    document.addEventListener("keydown", (event) => {
        switch (event.key) {
            case "ArrowLeft":
                colorSquares(player, playerColor);
                player = [
                    `xy_${Number(player[0].split("xy_")[1].split("-")[0])}-${Number(player[0].split("xy_")[1].split("-")[1]) - 1}`,
                ];
                checkIfScored();
                colorSquares(player, playerColor);
                break;
            case "ArrowUp":
                colorSquares(player, playerColor);
                player = [
                    `xy_${Number(player[0].split("xy_")[1].split("-")[0]) - 1}-${Number(player[0].split("xy_")[1].split("-")[1])}`,
                ];
                checkIfScored();
                colorSquares(player, playerColor);
                break;
            case "ArrowRight":
                colorSquares(player, playerColor);
                player = [
                    `xy_${Number(player[0].split("xy_")[1].split("-")[0])}-${Number(player[0].split("xy_")[1].split("-")[1]) + 1}`,
                ];
                checkIfScored();
                colorSquares(player, playerColor);
                break;
            case "ArrowDown":
                colorSquares(player, playerColor);
                player = [
                    `xy_${Number(player[0].split("xy_")[1].split("-")[0]) + 1}-${Number(player[0].split("xy_")[1].split("-")[1])}`,
                ];
                checkIfScored();
                colorSquares(player, playerColor);
                break;
        }
    });
});
