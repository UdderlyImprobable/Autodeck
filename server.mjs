const PORT = process.env.PORT || 8000;
import express from "express";
import { json } from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(json());
app.use(cors());

const API_KEY = "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";

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
          content: `Identify the concepts in this text: ${userQuery}`,
        },
      ],
      max_tokens: 100,
    }),
  };

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      options
    );
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const generateQuestions = async (concepts) => {
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
          content: `Develop 2 questions from this text, write only the questions. This is the text: ${concepts}`,
        },
      ],
      max_tokens: 100,
    }),
  };

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      options
    );
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const generateAnswers = async (questions, userQuery) => {
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
          content: `Answer the questions in this text, stating only the answers: ${questions}, verify your answers using the information in this text: ${userQuery}`,
        },
      ],
      max_tokens: 100,
    }),
  };

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      options
    );
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const generateFlashcards = async (userQuery) => {
  try {
    const concepts = await generateConcepts(userQuery);
    const questions = await generateQuestions(concepts);
    const answers = await generateAnswers(questions, userQuery);
    console.log({ questions, answers });
    return { questions, answers };
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

app.listen(PORT, () => console.log(`Your server is running on PORT ${PORT}`));
