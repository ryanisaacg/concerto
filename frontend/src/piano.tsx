import "./piano.css";

interface PianoRollProps {
  play: () => void;
}

export function PianoRoll({ play }: PianoRollProps) {
  return (
    <ul class="set">
      <li class="white b" onClick={play}>
        <p>A</p>
      </li>
      <li class="black as" onClick={play}>
        <p>W</p>
      </li>
      <li class="white a" onClick={play}>
        <p>S</p>
      </li>
      <li class="black gs" onClick={play}>
        <p>E</p>
      </li>
      <li class="white g" onClick={play}>
        <p>D</p>
      </li>
      <li class="black fs" onClick={play}>
        <p>R</p>
      </li>
      <li class="white f" onClick={play}>
        <p>F</p>
      </li>
      <li class="white e" onClick={play}>
        <p>G</p>
      </li>
      <li class="black ds" onClick={play}>
        <p>Y</p>
      </li>
      <li class="white d" onClick={play}>
        <p>H</p>
      </li>
      <li class="black cs" onClick={play}>
        <p>U</p>
      </li>
      <li class="white c" onClick={play}>
        <p>J</p>
      </li>
    </ul>
  );
}
