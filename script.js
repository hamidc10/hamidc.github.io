const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');

overlay.style.pointerEvents = 'none';

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gridSize = 30;
const numColumns = Math.ceil(canvas.width / gridSize);
const numRows = Math.ceil(canvas.height / gridSize);

let snake1Path = [{ x: canvas.width / 2, y: canvas.height - gridSize / 2 }];
let snake2Path = [{ x: canvas.width - gridSize / 2, y: canvas.height / 2 }];
let snake3Path = [{ x: gridSize / 2, y: canvas.height / 2 }];

const refreshThreshold = 1; 
let resizeTimeout;

function moveSnake(snakePath) {
  const head = snakePath[snakePath.length - 1];
  let direction = Math.floor(Math.random() * 4);
  let newHead;

  const halfGrid = gridSize / 2; 

  if (direction === 0 && head.x < canvas.width - gridSize) {
    newHead = { x: head.x + gridSize, y: head.y };
  } else if (direction === 1 && head.x > 0) {
    newHead = { x: head.x - gridSize, y: head.y };
  } else if (direction === 2 && head.y < canvas.height - gridSize) {
    newHead = { x: head.x, y: head.y + gridSize };
  } else if (direction === 3 && head.y > 0) {
    newHead = { x: head.x, y: head.y - gridSize };
  }

  
  if (newHead) {
    newHead.x = Math.floor(newHead.x / gridSize) * gridSize + halfGrid;
    newHead.y = Math.floor(newHead.y / gridSize) * gridSize + halfGrid;

    if (
      newHead.x >= 0 &&
      newHead.x < canvas.width &&
      newHead.y >= 0 &&
      newHead.y < canvas.height
    ) {
      snakePath.push(newHead);

      const headGridX = Math.floor(newHead.x / gridSize);
      const headGridY = Math.floor(newHead.y / gridSize);

      for (let i = 0; i < squares.length; i++) {
        if (headGridX === squares[i].col && headGridY === squares[i].row) {
          squares.splice(i, 1);
          setTimeout(() => squares.push({ row: headGridY, col: headGridX }), 3000);
          break;
        }
      }
    }
  }

  if (snakePath.length > numColumns * 0.85) {
    snakePath.shift();
  }
}

function drawSnake(snakePath) {
  ctx.beginPath();
  ctx.lineWidth = 8;
  ctx.strokeStyle = 'rgba(240, 255, 250, 0.3)';

  for (let i = 1; i < snakePath.length; i++) {
    ctx.moveTo(snakePath[i - 1].x, snakePath[i - 1].y);
    ctx.lineTo(snakePath[i].x, snakePath[i].y);
  }
  ctx.stroke();
  ctx.closePath();
}

function checkCollision(snakePath, squares) {
  const head = snakePath[snakePath.length - 1];
  const headGridX = Math.floor(head.x / gridSize);
  const headGridY = Math.floor(head.y / gridSize);

  const foundIndex = squares.findIndex(
    (square) => headGridX === square.col && headGridY === square.row
  );

  if (foundIndex !== -1) {
    const collidedSquare = squares.splice(foundIndex, 1)[0];
    const intersection = snakePath.some(
      (segment) =>
        Math.floor(segment.x / gridSize) === collidedSquare.col &&
        Math.floor(segment.y / gridSize) === collidedSquare.row
    );
    if (!intersection) {
      collidedSquare.opacity = 1;

      const intervalId = setInterval(() => {
        collidedSquare.opacity -= 0.1; // Reduce opacity by 0.1 in each interval
        if (collidedSquare.opacity <= 0) {
          clearInterval(intervalId);
          setTimeout(() => {
            collidedSquare.opacity = 0.1; // Reset the opacity when the square reappears
            squares.push({ row: headGridY, col: headGridX, opacity: 0.1 }); // Reappear after delay
          }, 2000);
        }
      }, 100);
      return true;
    } else {
      squares.splice(foundIndex, 0, collidedSquare); 
    }
  }
  return false;
}


function drawSquares(squares) {
  for (let i = 0; i < squares.length; i++) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.099)';
    ctx.fillRect(squares[i].col * gridSize, squares[i].row * gridSize, gridSize, gridSize);
  }
}

const squares = [];
const squareRows = 64;
const squareCols = 64;
const startRow = Math.floor((numRows - squareRows) / 2);
const startCol = Math.floor((numColumns - squareCols) / 2);

for (let i = 0; i < squareRows; i++) {
  for (let j = 0; j < squareCols; j++) {
    squares.push({ row: startRow + i, col: startCol + j });
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const neonColors = ['rgba(240, 255, 250, 0.4)', 'rgba(240, 255, 250, 0.4)', 'rgba(240, 255, 250, 0.4)'];
  moveSnake(snake1Path);
  moveSnake(snake2Path);
  moveSnake(snake3Path);

  if (checkCollision(snake1Path, squares) || checkCollision(snake2Path, squares) || checkCollision(snake3Path, squares)) {}
  drawSnake(snake1Path);
  drawSnake(snake2Path);
  drawSnake(snake3Path);
  drawSquares(squares);
  setTimeout(() => requestAnimationFrame(animate), 45);
}

animate();

function handleResize() {
  if (Math.abs(window.innerWidth - canvas.width) > refreshThreshold || Math.abs(window.innerHeight - canvas.height) > refreshThreshold) {
    location.reload();
  } else {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const squareSize = Math.min(canvas.width, canvas.height) / gridSize;
    const squareRows = Math.ceil(canvas.height / squareSize);
    const squareCols = Math.ceil(canvas.width / squareSize);

    squares.length = 0;

    for (let i = 0; i < squareRows; i++) {
      for (let j = 0; j < squareCols; j++) {
        squares.push({ row: i, col: j });
      }
    }

    snake1Path.forEach((segment, index) => {
      snake1Path[index] = {
        x: index * squareSize / 2,
        y: squareSize / 2
      };
    });

    snake2Path.forEach((segment, index) => {
      snake2Path[index] = {
        x: canvas.width - index * squareSize / 2,
        y: canvas.height - squareSize / 2
      };
    });

    snake3Path.forEach((segment, index) => {
      snake3Path[index] = {
        x: canvas.width / 2,
        y: index * squareSize / 2
      };
    });

    for (let i = 0; i < squares.length; i++) {
      squares[i] = {
        row: Math.floor(i / squareCols),
        col: i % squareCols
      };
    }
  }
}

window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(handleResize, 250); // Debouncing the resize event
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

window.addEventListener('mouseup', () => {
  clearTimeout(resizeTimeout);
  handleResize();
});



