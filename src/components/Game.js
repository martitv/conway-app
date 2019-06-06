import React, { useState, useEffect, useRef } from "react";
import * as firebase from "firebase/app";
import "firebase/firebase-firestore";
import { firebase_config } from "../firebase-config";
import Canvas from "../components/Canvas";
import Button from "../components/Button";
import Vector from "../util/Vector";
import useInterval from "../hooks/use-interval";

const dead = 0;
const alive = 1;
const fps = 0.25;
const delay = fps * 1000;

firebase.initializeApp(firebase_config);
const db = firebase.firestore();
let dbStates = db.collection("states");

export default function Game(props) {
  const [board, updateBoard] = useState(
    Array.from(Array(18), _ => Array(40).fill(0))
  );
  const [play, updatePlay] = useState(false);
  const [saves, updateSaves] = useState([]);
  const savesList = useRef(null);
  const gameSize = Vector(board[0].length, board.length);

  useEffect(() => {
    const fetchSaves = () => {
      dbStates
        .get()
        .then(function(saves) {
          updateSaves(saves.docs.map(docRef => docRef.id));
        })
        .catch(function(error) {
          console.error("Error retriving saves: ", error);
        });
    };
    fetchSaves();
  }, []);

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
  function handleClickSave() {
    dbStates
      .add({
        state: board.map(row => row.join(""))
      })
      .then(function(docRef) {
        updateSaves([docRef.id, ...saves]);
      })
      .catch(function(error) {
        console.error("Error adding document: ", error);
      });
  }
  function handleClickLoad() {
    let savesElement = savesList.current;
    if (savesElement.selectedIndex < 0) return;
    let id = savesElement.options[savesElement.selectedIndex].value;
    let docRef = dbStates.doc(id);
    docRef
      .get()
      .then(function(doc) {
        if (doc.exists) {
          updateBoard(
            doc.data().state.map(row => row.split("").map(x => Number(x)))
          );
        } else {
          console.log("No such document!");
        }
      })
      .catch(function(error) {
        console.log("Error getting document:", error);
      });
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
        <Button label={play ? "Stop" : "Play"} handleClick={handleClickPlay} />
        <Button label={"Clear"} handleClick={handleClickClear} />
        <Button label={"Save"} handleClick={handleClickSave} />
        <Button label={"Load"} handleClick={handleClickLoad} />
      </div>
      <div className="saves-container">
        <select name="saves" ref={savesList} size="5">
          {saves.map((saveId, i) => (
            <option key={i} value={saveId}>{`State ${i + 1}`}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
