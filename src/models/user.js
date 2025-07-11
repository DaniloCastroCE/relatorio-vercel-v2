const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    plantao: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    senha: {
      type: String,
      required: true,
    },
    temp_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Temp",
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {

  if (this.isModified("nome")) {
    if (this.nome.trim().length < 3) {
      return next(new Error("O nome precisar ter no minimo 3 caracteres!"));
    }

    this.nome = this.nome.toLowerCase().trim().replace(/\s+/g, ' ')
  }

  if(this.isModified("plantao")) {
    if(!this.plantao) {
      return next(new Error("Digite o nome do lider do plantão !"))
    }
  }

  if (!validator.isEmail(this.email)) {
      return next(new Error("Por favor, insira um email válido!"));
    }

  if (this.isModified("senha")) {
    if (/\s/.test(this.senha)) {
      return next(new Error("A senha não pode conter espaço em branco!"));
    }

    if (this.senha.length < 4) {
      return next(new Error("A senha precisar ter no minimo 4 caracteres!"));
    }

    try {
      const salt = await bcrypt.genSalt(10);
      this.senha = await bcrypt.hash(this.senha, salt);
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

userSchema.methods.compareSenha = async function (senhaInformada) {
  return await bcrypt.compare(senhaInformada, this.senha);
};

userSchema.methods.updateSenha = async function (novaSenha) {

  if (/\s/.test(novaSenha)) {
    throw new Error("A senha padrão não pode conter espaços!");
  }

  if (novaSenha.length < 4) {
    throw new Error("A senha padrão precisa ter no mínimo 4 caracteres!");
  }

  this.senha = novaSenha;

  return this.save(); 
};

userSchema.methods.updateNome = async function (novoNome) {
  if (!novoNome) {
    throw new Error("O nome está vazio!");
  }

  if (novoNome.trim().length < 3) {
    throw new Error("O nome precisa ter no mínimo 3 caracteres!");
  }

  this.nome = novoNome.toLowerCase().trim().replace(/\s+/g, ' ');

  return this.save();
}

module.exports = mongoose.model("User", userSchema);
