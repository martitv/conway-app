import React, { useRef, useState, useLayoutEffect } from "react";
import Vector from "../util/Vector";

const alive = 1;

export default function Canvas({ board, setCellState }) {
  const gameSize = Vector(board[0].length, board.length);
  const cellSize = Vector(16, 16);

  const canvasRef = useRef(null);

  const [isMouseDown, updateMouseDown] = useState(false);

  useLayoutEffect(() => {
    drawCells();
  });

  function clearCell(position) {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(
      position.x * cellSize.x,
      position.y * cellSize.y,
      cellSize.x,
      cellSize.y
    );
  }
  function fillCell(position) {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(
      position.x * cellSize.x,
      position.y * cellSize.y,
      cellSize.x,
      cellSize.y
    );
  }
  function isAlive(position) {
    return board[position.y][position.x] === alive;
  }
  function isWithinCanvas(position) {
    return (
      position.x < gameSize.x &&
      position.x >= 0 &&
      position.y < gameSize.y &&
      position.y >= 0
    );
  }
  function handleClickCell(e) {
    if (e.ctrlKey) return;
    let position = getMousePositionOnCanvas(e);
    if (!isWithinCanvas(position)) return;
    if (isAlive(position)) {
      setCellState(0, position);
      clearCell(position);
    } else {
      setCellState(1, position);
      fillCell(position);
    }
  }
  function handleMouseMove(e) {
    if (!isMouseDown || !e.ctrlKey) return;
    let position = getMousePositionOnCanvas(e);
    if (!isWithinCanvas(position)) return;
    if (e.ctrlKey) {
      if (e.shiftKey) {
        setCellState(0, position);
        clearCell(position);
      } else {
        setCellState(1, position);
        fillCell(position);
      }
    }
  }
  function drawCell(position) {
    board[position.y][position.x] ? fillCell(position) : clearCell(position);
  }
  function drawCells() {
    for (let i = 0; i < gameSize.y; i++) {
      for (let j = 0; j < gameSize.x; j++) {
        drawCell(Vector(j, i));
      }
    }
  }
  function getMousePositionOnCanvas(e) {
    return Vector(
      Math.floor(e.nativeEvent.offsetX / cellSize.x),
      Math.floor(e.nativeEvent.offsetY / cellSize.y)
    );
  }

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        onClick={handleClickCell}
        onMouseDown={() => updateMouseDown(true)}
        onMouseUp={() => updateMouseDown(false)}
        onMouseMove={handleMouseMove}
        width={cellSize.x * gameSize.x}
        height={cellSize.y * gameSize.y}
      />
    </div>
  );
}
