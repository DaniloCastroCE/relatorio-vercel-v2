const mongoose = require('mongoose')

const tempSchema = new mongoose.Schema({
  user: {
    type: Object, 
    required: true
  },
  itens: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Item' }
  ]
}, {timestamps: true})

module.exports = mongoose.model('Temp', tempSchema)