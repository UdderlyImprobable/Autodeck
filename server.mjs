console.log("Current working directory:", process.cwd());
const PORT = process.env.PORT || 8000;
import { config } from "dotenv";
config();
import express from "express";
import { json } from "express";
import fetch from "node-fetch";
import cors from "cors";
import pdf from "pdf-parse";
import multer from "multer";

const app = express();
app.use(json());
app.use(cors());
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const API_KEY = process.env.API_KEY;

const generateConcepts = async (userQuery) => {
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an effective and efficient flashcard generator`,
        },

        {
          role: "user",
          content: `Identify the concepts in this text, don't state them in your response: ${userQuery}`,
        },

        {
          role: "user",
          content: `Develop all possible questions from the concepts identified. Stay within the bounds of the text and don't generate questions with answers that can't be gotten from the text. Write nothing but the questions and end each question with a question mark`,
        },

        {
          role: "user",
          content: `Answer each question, verifying your answers using: ${userQuery}. Write nothing but the answers`,
        },
      ],
      max_tokens: 1000,
      n: 1,
    }),
  };

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      options
    );
    const data = await response.json();
    console.log("Data: ", data);

    // Access assistant's messages from the choices array
    console.log("Data.choices: ", data.choices[0]);
    const assistantMessages = data.choices[0];

    // Extract questions and answers from assistant's messages
    const questions = [];
    const answers = [];

    const message = assistantMessages.message.content;

    const elements = message.split(/\n|\n\n/);
    const filteredElements = elements.filter(
      (element) =>
        element.trim() !== "" &&
        ![
          "Answers:",
          "Answer",
          "Question",
          "Questions",
          ":",
          " ",
          "Answer",
        ].includes(element.trim())
    );
    const trimmedElements = filteredElements.map(function (str) {
      return str.trim();
    });
    for (const element of trimmedElements) {
      if (element.endsWith("?")) {
        questions.push(element);
      } else {
        answers.push(element);
      }
    }
    console.log(questions);
    console.log(answers);

    return { questions, answers };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const generateFlashcards = async (userQuery) => {
  try {
    const conceptsResponse = await generateConcepts(userQuery);
    const concepts =
      typeof conceptsResponse === "string"
        ? JSON.parse(conceptsResponse)
        : conceptsResponse;

    const flashcards = [];

    for (let i = 0; i < concepts.questions.length; i++) {
      const question = concepts.questions[i];
      const answer = concepts.answers[i];

      const flashcard = {
        id: i, // Assuming you want the index as the ID
        question,
        answer,
      };

      flashcards.push(flashcard);
    }
    console.log(flashcards);
    return flashcards;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

app.post("/", async (req, res) => {
  const userQuery = req.body.message;

  try {
    const flashcards = await generateFlashcards(userQuery);
    res.send(flashcards);
  } catch (error) {
    res.status(500).send("Internal Server Error");
    console.error(error);
  }
});

app.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file; // Access the uploaded file from req.file

  // Use the PDF processing library to parse the PDF and extract text
  const pdfData = await pdf(file.buffer); // Use file.buffer to get the file data
  const extractedText = pdfData.text;
  console.log(extractedText);
  try {
    // Call the generateFlashcards function with extracted text
    const flashcards = await generateFlashcards(extractedText);
    console.log(flashcards);
    res.send(flashcards);
  } catch (error) {
    res.status(500).send("Internal Server Error");
    console.error(error);
  }
});

app.listen(PORT, () => console.log(`Your server is running on PORT ${PORT}`));
