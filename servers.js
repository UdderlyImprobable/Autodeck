const express = require("express");
const app = express();
const port = 3001;

app
  .route("/http://localhost:3001/")

  .post(function (req, res) {
    res.send("Add a book");
  })
  .put(function (req, res) {
    res.send("Update the book");
  });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
