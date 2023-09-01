import React, { useState, useRef } from "react";
import "./index.css";
import logo from "./autodeckLogo.svg";

const App = () => {
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [flippedIndex, setFlippedIndex] = useState(-1);
  const [currentId, setCurrentId] = useState(0);
  const [data, setData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const selectedFileRef = useRef(null);
  const [uploadType, setUploadType] = useState("none"); // "none", "file", or "text"

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

  const handleFileUpload = async () => {
    if (selectedFileRef.current && selectedFileRef.current.files.length > 0) {
      const selectedFile = selectedFileRef.current.files[0];
      setIsLoading(true);

      const reader = new FileReader();
      reader.onload = async () => {
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
          const response = await fetch("http://localhost:8000/upload", {
            method: "POST",
            body: formData,
          });
          const apiData = await response.json();
          setData(apiData);
          setCurrentId(0);
          setIsLoading(false);
        } catch (error) {
          console.error(error);
          setIsLoading(false);
        }
      };

      reader.readAsText(selectedFile);
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
          <header className="App-header">
            <img src={logo} className="logo" alt="logo" />
          </header>
        </div>
        <div className="body-container">
          <div className="side-bar"></div>
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
                <div className="navigateFlashcards">
                  <button id="prev" onClick={handlePrevClick}>
                    Previous
                  </button>
                  <button id="next" onClick={handleNextClick}>
                    Next
                  </button>
                </div>
              </div>
            )}

            <div className="input-container">
              <div className="upload-toggle">
                <button
                  className={uploadType === "file" ? "active" : ""}
                  onClick={() => setUploadType("file")}
                >
                  Upload File
                </button>
                <button
                  className={uploadType === "text" ? "active" : ""}
                  onClick={() => setUploadType("text")}
                >
                  Text Upload
                </button>
              </div>
              <div className="inputs">
                {uploadType === "text" && (
                  <div className="submit">
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
                )}
                {uploadType === "file" && (
                  <div className="upload">
                    <input
                      type="file"
                      accept=".pdf"
                      ref={selectedFileRef}
                      style={{ display: "none" }}
                      onChange={handleFileUpload}
                    />
                    <button
                      id="upload"
                      onClick={() => selectedFileRef.current.click()}
                    >
                      📁 Upload PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;
