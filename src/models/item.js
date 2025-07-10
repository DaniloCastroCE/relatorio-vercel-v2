const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    zona: {
        type: String,
        trim: true,
    },
    horario: {
        type: String,
        default: "",
    },
    contato: {
        type: String,
    },
    envio: {
        type: String,
    },
    os: {
        type: String,
        default: ""
    },
    obs: {
        type: String,
        default: "",
    },
    exec: {
        type: String,
        default: "-"
    },
    user: {
        type: Object,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model('Item', itemSchema)