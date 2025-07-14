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
  itens: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
    default: []
  },
  user: {
    type: Object,
    default: {},
  },

}, { timestamps: true })

module.exports = mongoose.model("Relatorio", relatorioSchema);