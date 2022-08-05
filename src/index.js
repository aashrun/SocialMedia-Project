const express = require("express");
const bodyParser = require("body-parser");
const route = require("./routes/route.js");
const mongoose = require("mongoose");
const app = express();
const multer =require("multer");

app.use(bodyParser.json());
app.use(multer().any());

mongoose.connect(
    "mongodb+srv://shivani-0515:shivani0515@shivani.o6uy2fw.mongodb.net/shivani0507-DB?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("MongoDb is connected."))
  .catch( err => console.log(err));


app.use("/", route);

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});