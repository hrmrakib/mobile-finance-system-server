const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("i ...........");
});

app.listen(port, () => {
  console.log("Server is ONNNNNNNN!");
});
