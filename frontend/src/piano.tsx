import "./piano.css";
import { Note } from "./player";

interface PianoRollProps {
  play: (note: Note) => void;
}

export function PianoRoll({ play }: PianoRollProps) {
  return (
    <ul class="set">
      <li class="white c" onClick={() => play("C")}>
        <p>A</p>
      </li>
      <li class="black cs" onClick={() => play("C#")}>
        <p>W</p>
      </li>
      <li class="white d" onClick={() => play("D")}>
        <p>S</p>
      </li>
      <li class="black ds" onClick={() => play("D#")}>
        <p>E</p>
      </li>
      <li class="white e" onClick={() => play("E")}>
        <p>D</p>
      </li>
      <li class="white f" onClick={() => play("F")}>
        <p>F</p>
      </li>
      <li class="black fs" onClick={() => play("F#")}>
        <p>R</p>
      </li>
      <li class="white g" onClick={() => play("G")}>
        <p>G</p>
      </li>
      <li class="black gs" onClick={() => play("G#")}>
        <p>Y</p>
      </li>
      <li class="white a" onClick={() => play("A")}>
        <p>H</p>
      </li>
      <li class="black as" onClick={() => play("A#")}>
        <p>U</p>
      </li>
      <li class="white b" onClick={() => play("B")}>
        <p>J</p>
      </li>
    </ul>
  );
}
