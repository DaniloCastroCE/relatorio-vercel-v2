const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log(" Conectado ao MongoDB"))
    .catch((err) => console.error(" Erro ao conectar no MongoDB:", err));
};

module.exports = connectDB
