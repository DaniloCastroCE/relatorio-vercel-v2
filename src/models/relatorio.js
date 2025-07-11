const mongoose = require('mongoose')
const Item = require('./item')
const User = require('./user')

const relatorioSchema = new mongoose.Schema({
  dia_plantao: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  nome_plantao: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  relatorio: {
    type: Object, 
    required: true,
  },
  temp_id: {
    type: String,
    default: null,
  },
}, {timestamps: true}) 

module.exports = mongoose.model("Relatorio", relatorioSchema);