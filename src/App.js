import React, { useState } from "react";
import "./index.css";

const App = () => {
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [flippedIndex, setFlippedIndex] = useState(-1);
  const [currentId, setCurrentId] = useState(0); // Initialize with the desired starting ID
  const [data, setData] = useState([]);

  const handleCardClick = () => {
    setFlippedIndex((prevIndex) => (prevIndex === currentId ? -1 : currentId));
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

  const handleNextClick = () => {
    setCurrentId((prevId) => Math.min(prevId + 1, data.length - 1));
    setFlippedIndex(-1); // Reset the flipped state when changing the flashcard
  };

  const handlePrevClick = () => {
    setCurrentId((prevId) => Math.max(prevId - 1, 0));
    setFlippedIndex(-1); // Reset the flipped state when changing the flashcard
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
      setData(apiData);
      setCurrentId(0); // Reset the current id when loading new flashcards
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
          {data.length > 0 && ( // Only render when there are flashcards
            <div className="flashcards">
              <div
                className={`flashcard ${
                  flippedIndex === currentId ? "flipped" : ""
                }`}
                onClick={handleCardClick}
              >
                <div className="flashcard-inner">
                  <div className="flashcard-front">
                    <h4>Question</h4>
                    <div>{data[currentId]?.question}</div>
                  </div>
                  <div className="flashcard-back">
                    <h4>Answer</h4>
                    <div>{data[currentId]?.answer}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
            <button id="prev" onClick={handlePrevClick}>
              Previous
            </button>
            <button id="next" onClick={handleNextClick}>
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;
