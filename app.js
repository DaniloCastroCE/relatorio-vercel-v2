require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const PORT = process.env.PORT || 4000;
const router = require("./src/router/router");
const methodOverride = require("method-override");
const connectDB = require('./src/config/db')
const sessionMiddleware = require('./src/config/session-middleware')

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(sessionMiddleware)
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(methodOverride("_method"));
app.use(router);

connectDB()


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rondando na porta ${PORT} !`);
});
