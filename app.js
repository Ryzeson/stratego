const canvas = $("canvas")[0];
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

// Dimensions
const BOARD_WIDTH = canvas.width * .5;
const BOARD_HEIGHT = BOARD_WIDTH;
const X_OFFSET = canvas.width / 4;
const Y_OFFSET = 40;
const ROWS = COLS = 10;
const CELL_WIDTH = BOARD_WIDTH / COLS;
const CELL_HEIGHT = BOARD_HEIGHT / ROWS;

// Game
const gamePieces = [
    '💣', '💣', '💣', '💣', '💣', '💣',
    '10', '9', '8', '8', '7', '7', '7',
    '6', '6', '6', '6', '5', '5', '5', '5',
    '4', '4', '4', '4', '3', '3', '3', '3', '3',
    '2', '2', '2', '2', '2', '2', '2', '2',
    '1', '🚩'
];

const PLAYER_ZERO = 0;
const PLAYER_ONE = 1;

const PLAYER_COLOR = "#186E7E";
const PLAYER_HOVER = "#155B68";
const PLAYER_CLICK = "#49D7F2";

const OPPONENT_COLOR = "#E57B1A";
const OPPONENT_HIGHLIGHT = "#9B4C04";
const WATER_COLOR = "#1A94BB";
const GRASS_COLOR = "green";
const GRASS_HIGHLIGHT = "#12AC3D";


let grid = [];
let playerGrid = [];
let selectedCell = [null,null];
let prevRHover;
let prevCHover;
let validMoves = [];

function drawBoard(x, y) {
    ctx.beginPath();
    ctx.rect(x, y, BOARD_WIDTH, BOARD_HEIGHT);
    ctx.fillStyle = GRASS_COLOR;
    ctx.fill();
    ctx.stroke();

    for (var i = 0; i < ROWS; i++) {
        // horizontal lines
        ctx.beginPath();
        ctx.moveTo(x, i*CELL_HEIGHT + y);
        ctx.lineTo(x + BOARD_WIDTH, i*CELL_HEIGHT + y);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.stroke();

        // vertical lines
        ctx.beginPath();
        ctx.moveTo(i*CELL_WIDTH + x, y);
        ctx.lineTo(i*CELL_WIDTH + x, y + BOARD_HEIGHT);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.stroke();
    }

    drawCell(4,2);
    drawCell(4,3);
    drawCell(5,2);
    drawCell(5,3);
    drawCell(4,6);
    drawCell(4,7);
    drawCell(5,6);
    drawCell(5,7);
}

function drawCell(r, c, s = "", color=WATER_COLOR) {
    ctx.beginPath();
    ctx.rect(c*CELL_WIDTH + X_OFFSET, r*CELL_HEIGHT + Y_OFFSET, CELL_WIDTH, CELL_HEIGHT);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    const fontSize = (BOARD_HEIGHT/20).toString();
    ctx.font = fontSize + "px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = 'center';
    ctx.fillText(s, (c+.5)*CELL_WIDTH + X_OFFSET, (r+.65)*CELL_HEIGHT + Y_OFFSET);
    ctx.stroke();
}

function getCell(x, y) {
    var coord = [];
    coord[0] = Math.floor((y - Y_OFFSET) / CELL_HEIGHT);
    coord[1] = Math.floor((x - X_OFFSET) / CELL_WIDTH);
    return coord;
}

function isBoardCell(r, c) {
    return (r > -1 && r < 10 && c > -1 && c < 10);
}

function isPlayerCell(r, c, p) {
    return (isBoardCell(r, c) && playerGrid[r][c] == p);
}

function isMoveablePiece(r, c) {
    if (grid[r][c] != '💣' && grid[r][c] != '🚩')
        return true;
    return false;
}

function isSelectedCell(r, c) {
    if (selectedCell[0] != null && selectedCell[1] != null && r == selectedCell[0] && c == selectedCell[1])
        return true;
    return false;
}

function isValidMove(r,c) {
    if (selectedCell[0] == null) {
        return false;
    }
    // scout movement rules
    if (+grid[selectedCell[0]][selectedCell[1]] == 2) {
        if (r == selectedCell[0] && (grid[r][c] == 0 || playerGrid[r][c] == 1)) {
            if (c < selectedCell[1]) {
                for (var col = c + 1; col < selectedCell[1]; col++) {
                    if (grid[r][col] != 0)
                        return false;
                }
            }
            else {
                for (var col = c - 1; col > selectedCell[1]; col--) {
                    if (grid[r][col] != 0)
                        return false;
                }
            }
            return true;
        }
        else if (c == selectedCell[1] && (grid[r][c] == 0 || playerGrid[r][c] == 1)) {
            if (r < selectedCell[0]) {
                for (var row = r + 1; row < selectedCell[0]; row++) {
                    if (grid[row][c] != 0)
                        return false;
                }
            }
            else {
                for (var row = r - 1; row > selectedCell[0]; row--) {
                    if (grid[row][c] != 0)
                        return false;
                }
            }
            return true;
        }
        else {
            return false;
        }
    }
    // normal movement rules
    if (((r == selectedCell[0] + 1 && c == selectedCell[1]) ||
        (r == selectedCell[0] - 1 && c == selectedCell[1]) ||
        (r == selectedCell[0] && c == selectedCell[1] + 1) ||
        (r == selectedCell[0] && c == selectedCell[1] - 1)) &&
        (grid[r][c] == 0 || playerGrid[r][c] == 1))
        return true;
    return false;
}

function showValidMoves() {
    for (var r = 0; r < ROWS; r ++) {
        for (var c = 0; c < COLS; c++) {
            if (isValidMove(r, c))
                validMoves.push([r,c]);
        }
    }
    for (var move of validMoves) {
        if (playerGrid[move[0]][move[1]] == 2)
            drawCell(move[0], move[1], "", GRASS_HIGHLIGHT);
        else
            drawCell(move[0], move[1], grid[move[0]][move[1]], OPPONENT_HIGHLIGHT);
    }
    return validMoves;
}

function clearValidMoves() {
    for (var move of validMoves) {
        if (playerGrid[move[0]][move[1]] == 2)
            drawCell(move[0], move[1], "", GRASS_COLOR);
        else
            drawCell(move[0], move[1], grid[move[0]][move[1]], OPPONENT_COLOR);
    }
    validMoves.length = 0;
}

function opponentMakeMove() {
    for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
            if(isPlayerCell(r, c, PLAYER_ONE) && isMoveablePiece(r,c))
                continue;
        }
    }

    console.log("Click ready :)");
    $("canvas").on("click", handleClick);
}

function opponentMove() {
    $("canvas").off("click", handleClick);
    setTimeout(opponentMakeMove, 5);
}


function randomizeSetup(p) {
    var pieces = gamePieces.slice();
    var rStart = 6;
    var rEnd = ROWS;
    var color = PLAYER_COLOR;
    if (p == PLAYER_ONE) {
        rStart -= 6;
        rEnd -= 6;
        color = OPPONENT_COLOR;
    }
    for (var r = rStart; r < rEnd; r ++) {
        for (var c = 0; c < COLS; c++) {
            let i = Math.floor(Math.random() * pieces.length);
            // if (p == PLAYER_ZERO)
                drawCell(r, c, pieces[i], color);
            // else 
            //     drawCell(r, c, "", color);
            grid[r][c] = pieces[i];
            pieces.splice(i, 1);
        }
    }
}

function initGrid() {
    for (var r = 0; r < ROWS; r ++) {
        let a = [];
        let b = [];
        for (var c = 0; c < COLS; c++) {
            a[c] = 0;
            if (r < 4)
                b[c] = 1;
            else if (r > 5)
                b[c] = 0;
            else
                b[c] = 2;
        }
        grid.push(a);
        playerGrid.push(b);
    }

    grid[4][2] = 'w';
    grid[4][3] = 'w';
    grid[5][2] = 'w';
    grid[5][3] = 'w';
    grid[4][6] = 'w';
    grid[4][7] = 'w';
    grid[5][6] = 'w';
    grid[5][7] = 'w';
}

function handleClick(e) {
    clearValidMoves();

    var coord = getCell(e.clientX, e.clientY);
    var r = coord[0];
    var c = coord[1];
    if (isPlayerCell(r,c, PLAYER_ZERO) && isMoveablePiece(r,c)) {
        if(selectedCell[0] != null)
            drawCell(selectedCell[0], selectedCell[1], grid[selectedCell[0]][selectedCell[1]], PLAYER_COLOR);
        drawCell(coord[0], coord[1], grid[r][c], PLAYER_CLICK);
        selectedCell[0] = r;
        selectedCell[1] = c;
        prevRHover = prevCHover = null;
        showValidMoves();
    }
    else if (isValidMove(r, c)) {
        if (playerGrid[r][c] == PLAYER_ONE) {
            if(grid[r][c] == '💣') {
                if (+grid[selectedCell[0]][selectedCell[1]] == 3) {
                    drawCell(r, c, grid[selectedCell[0]][selectedCell[1]], PLAYER_COLOR);
                    grid[r][c] = grid[selectedCell[0]][selectedCell[1]];
                    playerGrid[r][c] = 0;
                }
                    drawCell(selectedCell[0], selectedCell[1], "", GRASS_COLOR);
                    grid[selectedCell[0]][selectedCell[1]] = 0;
                    playerGrid[selectedCell[0]][selectedCell[1]] = 2;
            }
            else if(grid[r][c] == '🚩') {
                alert("You win!");
            }
            else {
                if (+grid[r][c] < +grid[selectedCell[0]][selectedCell[1]] ||
                    (+grid[r][c] == 10 && +grid[selectedCell[0]][selectedCell[1]] == 1)) {
                    drawCell(r, c, grid[selectedCell[0]][selectedCell[1]], PLAYER_COLOR);
                    grid[r][c] = grid[selectedCell[0]][selectedCell[1]];
                    playerGrid[r][c] = 0;
                }
                else if (+grid[r][c] == +grid[selectedCell[0]][selectedCell[1]]) {
                    drawCell(r, c, "", GRASS_COLOR);
                    grid[r][c] = 0;
                    playerGrid[r][c] = 2;
                }
                drawCell(selectedCell[0], selectedCell[1], "", GRASS_COLOR);
                grid[selectedCell[0]][selectedCell[1]] = 0;
                playerGrid[selectedCell[0]][selectedCell[1]] = 2;
            }
        }
        else {
            drawCell(r, c, grid[selectedCell[0]][selectedCell[1]], PLAYER_COLOR);
            drawCell(selectedCell[0], selectedCell[1], "", GRASS_COLOR);
            
            grid[r][c] = grid[selectedCell[0]][selectedCell[1]];
            grid[selectedCell[0]][selectedCell[1]] = 0;
            playerGrid[r][c] = 0;
            playerGrid[selectedCell[0]][selectedCell[1]] = 2;
    
        }
        selectedCell[0] = selectedCell[1] = null;
        opponentMove();
    }
    else {
        if (selectedCell[0] != null)
            drawCell(selectedCell[0], selectedCell[1], grid[selectedCell[0]][selectedCell[1]], PLAYER_COLOR);
        selectedCell[0] = selectedCell[1] = null;
    }
}

function handleMouseMove(e) {
    var coord = getCell(e.clientX, e.clientY);
    var r = coord[0];
    var c = coord[1];
    if (prevRHover != null)
        drawCell(prevRHover, prevCHover, grid[prevRHover][prevCHover], PLAYER_COLOR);
    if (!isSelectedCell(r,c) && isPlayerCell(r, c, PLAYER_ZERO)) {
        drawCell(coord[0], coord[1], grid[r][c], PLAYER_HOVER);
        prevRHover = r;
        prevCHover = c;
    }
    else
        prevRHover = prevCHover = null;
}

function init() {
    drawBoard(X_OFFSET, Y_OFFSET);
    initGrid();
    randomizeSetup(PLAYER_ZERO);
    randomizeSetup(PLAYER_ONE);

    for (var a of grid)
        console.log(a);
    for (var a of playerGrid)
        console.log(a);
}

init();

$("canvas").on("mousemove", handleMouseMove);

$("canvas").on("click", handleClick);