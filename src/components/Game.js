import React, { useState } from "react";
import Canvas from "../components/Canvas";
import Vector from "../util/Vector";
import useInterval from "../hooks/use-interval";

const dead = 0;
const alive = 1;
const fps = 0.25;
const delay = fps * 1000;

export default function Game(props) {
  const [board, updateBoard] = useState(
    Array.from(Array(18), _ => Array(40).fill(0))
  );
  const [play, updatePlay] = useState(false);
  const gameSize = Vector(board[0].length, board.length);

  useInterval(
    () => {
      updateBoard(doFrame(board));
    },
    play ? delay : null
  );

  function handleClickPlay() {
    updatePlay(!play);
  }
  function handleClickClear() {
    updateBoard(Array.from(Array(gameSize.y), _ => Array(gameSize.x).fill(0)));
  }
  function getCellState(position) {
    return board[position.y][position.x];
  }
  function setCellState(value, position) {
    const newBoard = board.map(row => row.slice());
    newBoard[position.y][position.x] = value;
    updateBoard(newBoard);
  }
  function isAlive(position) {
    return getCellState(position) === alive;
  }
  function getStartStopPositions(position) {
    return [
      position.x === 0 ? position.x : position.x - 1,
      position.x === gameSize.x - 1 ? position.x : position.x + 1,
      position.y === 0 ? position.y : position.y - 1,
      position.y === gameSize.y - 1 ? position.y : position.y + 1
    ];
  }
  function aliveNeighbours(position, state) {
    let result = 0;
    const [startX, stopX, startY, stopY] = getStartStopPositions(position);

    for (let i = startY; i <= stopY; i++) {
      for (let j = startX; j <= stopX; j++) {
        if (!(i === position.y && j === position.x) && isAlive(Vector(j, i))) {
          result++;
        }
      }
    }
    return result;
  }
  function doFrame(board) {
    return board.map((row, i) =>
      row.map((cell, j) => {
        if (cell === alive) {
          let v = Vector(j, i);
          if ([2, 3].includes(aliveNeighbours(v, board))) {
            return alive;
          }
          return dead;
        } else {
          let v = Vector(j, i);
          if (aliveNeighbours(v, board) === 3) {
            return alive;
          }
          return dead;
        }
      })
    );
  }

  return (
    <div className="grid">
      <Canvas board={board} setCellState={setCellState} />

      <div className="button-container">
        <button onClick={handleClickPlay}>
          <span>{play ? "Stop" : "Play"}</span>
        </button>
        <button onClick={handleClickClear}>
          <span>Clear</span>
        </button>
      </div>
    </div>
  );
}
