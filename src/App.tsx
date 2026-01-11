import { useState, useEffect } from "react";
import { paragraphs } from "./data/paragraphs";
import "./App.css";

type Difficulty = "easy" | "medium" | "hard";

export default function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [sampleText, setSampleText] = useState(
    paragraphs.easy[0].text
  );

  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [wpm, setWPM] = useState(0);
  const [errors, setErrors] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Pick a new paragraph when changing difficulty
  const selectDifficulty = (level: Difficulty) => {
    setDifficulty(level);
    const randomIndex = Math.floor(Math.random() * paragraphs[level].length);
    setSampleText(paragraphs[level][randomIndex].text);

    setTypedChars([]);
    setTimeLeft(60);
    setIsActive(false);
    setWPM(0);
    setErrors(0);
    setIsFinished(false);
  };

  // Timer
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isActive]);

  // Finish typing when timer ends
  useEffect(() => {
    if (timeLeft === 0) {
      setIsActive(false);
      setIsFinished(true);

      const textTyped = typedChars.join("");
      const wordsTyped = textTyped.trim().split(/\s+/).length;
      setWPM(wordsTyped);
    }
  }, [timeLeft, typedChars]);

  // Handle keyboard typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (timeLeft === 0) return;

      const key = e.key;

      // Start timer on first key
      if (!isActive) setIsActive(true);

      // Only accept single character keys
      if (key.length === 1) {
        setTypedChars((prev) => [...prev, key]);
      } else if (key === "Backspace") {
        setTypedChars((prev) => prev.slice(0, prev.length - 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, timeLeft]);

  // Count errors
  useEffect(() => {
    const errorCount = typedChars.reduce((acc, char, idx) => {
      if (char !== sampleText[idx]) return acc + 1;
      return acc;
    }, 0);
    setErrors(errorCount);
  }, [typedChars, sampleText]);

  // Render colored text
  const renderText = () => {
    return sampleText.split("").map((char, idx) => {
      let color = "";
      if (typedChars[idx] == null) {
        color = "";
      } else if (typedChars[idx] === char) {
        color = "green";
      } else {
        color = "red";
      }
      return (
        <span key={idx} style={{ color }}>
          {char}
        </span>
      );
    });
  };

  // Reset test
  const handleReset = () => {
    setTypedChars([]);
    setTimeLeft(60);
    setIsActive(false);
    setWPM(0);
    setErrors(0);
    setIsFinished(false);
  };

  return (
    <div className="container">
      <h1>Typing Speed Test</h1>

      <div className="difficulty-buttons">
        <button onClick={() => selectDifficulty("easy")}>Easy</button>
        <button onClick={() => selectDifficulty("medium")}>Medium</button>
        <button onClick={() => selectDifficulty("hard")}>Hard</button>
      </div>

      <div className="sample-text">{renderText()}</div>

      <div className="stats">
        <p>Time Left: {timeLeft}s</p>
        <p>Errors: {errors}</p>
      </div>

      {isFinished && (
        <div className="result">
          <h2>Results</h2>
          <p>Words Per Minute (WPM): {wpm}</p>
          <p>Total Errors: {errors}</p>
        </div>
      )}

      <button onClick={handleReset}>Reset</button>
    </div>
  );
}
