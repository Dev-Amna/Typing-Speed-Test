import { useState, useEffect, useRef } from "react";
import { paragraphs } from "./data/paragraphs";
import "./App.css";

type Difficulty = "easy" | "medium" | "hard";

export default function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [sampleText, setSampleText] = useState(
    paragraphs.easy[0].text
  );

  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [wpm, setWPM] = useState(0);
  const [errors, setErrors] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Start typing
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isActive) setIsActive(true);

    const value = e.target.value;
    setUserInput(value);

    // Count errors
    const errorCount = value
      .split("")
      .filter((char, idx) => char !== sampleText[idx]).length;
    setErrors(errorCount);
  };

  // Timer
  useEffect(() => {
    if (!isActive) return;
    if (timeLeft <= 0) {
      setIsActive(false);
      const wordsTyped = userInput.trim().split(/\s+/).length;
      setWPM(wordsTyped);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isActive, userInput]);

  // Select difficulty and new paragraph
  const selectDifficulty = (level: Difficulty) => {
    setDifficulty(level);
    const randomIndex = Math.floor(Math.random() * paragraphs[level].length);
    setSampleText(paragraphs[level][randomIndex].text);

    setUserInput("");
    setTimeLeft(60);
    setIsActive(false);
    setWPM(0);
    setErrors(0);
    textareaRef.current?.focus();
  };

  const handleReset = () => {
    setUserInput("");
    setTimeLeft(60);
    setIsActive(false);
    setWPM(0);
    setErrors(0);
    textareaRef.current?.focus();
  };

  // Helper: Render colored text
  const renderText = () => {
    return sampleText.split("").map((char, idx) => {
      let color = "";
      if (userInput[idx] == null) {
        color = "";
      } else if (userInput[idx] === char) {
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

  return (
    <div className="container">
      <h1>Typing Speed Test</h1>

      <div className="difficulty-buttons">
        <button onClick={() => selectDifficulty("easy")}>Easy</button>
        <button onClick={() => selectDifficulty("medium")}>Medium</button>
        <button onClick={() => selectDifficulty("hard")}>Hard</button>
      </div>

      <div className="sample-text">{renderText()}</div>

      <textarea
        ref={textareaRef}
        value={userInput}
        onChange={handleChange}
        placeholder="Start typing..."
        disabled={timeLeft === 0}
      />

      <div className="stats">
        <p>Time Left: {timeLeft}s</p>
        <p>Errors: {errors}</p>
        <p>WPM: {wpm}</p>
      </div>

      <button onClick={handleReset}>Reset</button>
    </div>
  );
}
