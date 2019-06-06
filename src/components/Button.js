import React from "react";

export default function Button({ label, handleClick }) {
  return (
    <button onClick={handleClick}>
      <span>{label}</span>
    </button>
  );
}
