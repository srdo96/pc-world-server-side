const express = require("express");
const cors = require("cors");

const port = process.env.PORT || 5000;
const app = express();

app.listen(port, () => {
  console.log("Listening to port ->", port);
});
