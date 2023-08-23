import React, { useState } from "react";
import "./index.css";

const App = () => {
  const [userInput, setUserInput] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [flippedIndex, setFlippedIndex] = useState(-1);

  const handleCardClick = (index) => {
    if (flippedIndex === index) {
      setFlippedIndex(-1);
    } else {
      setFlippedIndex(index);
    }
  };

  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      getMessages();
    }
  };

  const getMessages = async () => {
    if (userInput.trim() === "") {
      return;
    }

    setIsLoading(true);

    const options = {
      method: "POST",
      body: JSON.stringify({
        message: userInput,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await fetch("http://localhost:8000", options);
      const apiData = await response.json();

      setQuestions([apiData.questions]); // Update questions state
      setAnswers([apiData.answers]); // Update answers state
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <section className="main">
        <div className="nav">
          <h1>Autodeck</h1>
        </div>
        <div className="body">
          {isLoading && <div className="loading">Loading...</div>}
          <div className="flashcards">
            {questions.map((question, index) => (
              <div
                className={`flashcard ${
                  flippedIndex === index ? "flipped" : ""
                }`}
                key={index}
                onClick={() => handleCardClick(index)}
              >
                <div className="flashcard-inner">
                  <div className="flashcard-front">
                    <h4>Question</h4>
                    <div>{question}</div>
                  </div>
                  <div className="flashcard-back">
                    <h4>Answer</h4>
                    <div>{answers[index]}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="input-container">
            <input
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter your message..."
            />
            <button id="submit" onClick={getMessages}>
              ➢Submit
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;
