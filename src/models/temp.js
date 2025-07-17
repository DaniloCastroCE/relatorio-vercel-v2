const mongoose = require('mongoose')
const {setDateNowInputBrazil} = require('../utils/dataNowInput')

const tempSchema = new mongoose.Schema({
  user: {
    type: Object,
    default: {}
  },
  emails: {
    type: String,
    default: ""
  },
  itens: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
    default: []
  },
  nome_plantao: {
    type: String,
    default: "",
    lowercase: true,
    trim: true,
  },
  dia_plantao: {
    type: String,
    default: setDateNowInputBrazil(),
    lowercase: true,
    trim: true,
  },
  saved: {
    type: String,
    default: "empty",
  },
  relatorio_id: {
    type: String,
    default: null,
  }

}, { timestamps: true })

module.exports = mongoose.model('Temp', tempSchema)