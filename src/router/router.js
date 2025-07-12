const express = require("express");
const router = express.Router();
const path = require("path");
const Item = require("../models/item");
const User = require('../models/user')
const Temp = require('../models/temp')
const Relatorio = require('../models/relatorio')
const validator = require("validator")

const checkAuth = (req, res, next) => {
  if (req.session.user) {
    return next()
  }
  return res.render('login', {
    status: "error",
    message: "Você precisa está logado para acessar a página."
  })
}


router.get("/relatorio", checkAuth, (req, res) => {
  return res.sendFile(path.join(__dirname, "../../public/pages/index.html"));
});

router.get("/", (req, res) => {
  return res.render('login', { status: null, message: null })
})

router.get("/getUser", checkAuth, (req, res) => {

  if (!req.session.user) {
    return res.status(401).json({
      status: "error",
      message: "Usuário não autenticado!"
    });
  }

  return res.status(200).json({
    status: "success",
    user: req.session.user
  })
})

router.get("/logout", (req, res) => {
  const nome = req.session.user?.nome || 'Desconhecido'

  req.session.destroy(err => {
    if (err) {
      console.error('Erro ao fazer logout:', err)
      return res.render('login', {
        status: 'error',
        message: 'Erro ao sair da conta. Tente novamente !'
      })
    }

    res.clearCookie('connect.sid')
    console.log(`${nome.toUpperCase()} está offline !`)
    return res.render('login', {
      status: 'success',
      message: `O úsuario ${nome.toUpperCase()} deslogou com sucesso !`
    })
  })
})

router.get("/countDocuments", checkAuth, async (req, res) => {
  const temp_id = req.session.user._id_temp || null
  try {
    const temp = await Temp.findById(temp_id)
    const qts = temp ? temp.itens.length : 0

    return res.status(200).json({
      status: "success",
      message: "Sucesso na consulta de quantidades de itens!",
      qt: qts,
    });
  } catch (error) {
    console.error(error)
    return res.status(400).json({
      status: "error",
      message: "Errou ao consultar a quantidade de itens!",
    });
  }
});

router.get("/getAll", checkAuth, async (req, res) => {
  const temp_id = req.session.user._id_temp || null
  try {
    const temp = await Temp.findById(temp_id).populate({
      path: 'itens',
      options: { sort: { createdAt: 1 } }
    })

    const itens = temp ? temp.itens : []

    if (itens.length === 0) req.session.user.save = 'no-salvo'

    return res.status(200).json({
      status: "success",
      message: "Sucesso na consulta de itens!",
      json: itens,
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: "Errou ao consultar itens",
      error: err.message,
    });
  }
});

router.get("/get/:id", checkAuth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    return res.status(200).json({
      status: "success",
      message: "Sucesso na consultar por ID de um item!",
      json: item,
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: "Errou em consultar por ID",
      error: err.message,
    });
  }
});

router.get("/checkNome/:nome", checkAuth, async (req, res) => {
  try {
    const nome = req.params.nome.toLowerCase().trim();
    const temp_id = req.session.user._id_temp

    if (!nome) {
      return res.status(200).json({
        status: "error",
        message: "Nome em branco",
        exists: false,
      });
    }
    const temp = await Temp.findById(temp_id).populate('itens')
    const nomeList = temp ? temp.itens.some(item => item.nome === nome) : false

    if (!nomeList) {
      return res.status(200).json({
        status: "error",
        message: "Não existe o nome",
        exists: false,
      });
    } else {
      return res.status(200).json({
        status: "success",
        message: "Nome encontrado",
        exists: true,
        time: nomeList.horario,
      });
    }
  } catch (err) {
    console.error(`Erro: ${err.message}`);
  }
});

router.get('/checkLista', checkAuth, async (req, res) => {
  const temp_id = req.session.user._id_temp
  try {
    const temp = await Temp.findOne({ _id: temp_id})

    
    if (!temp || !temp.itens || temp.itens.length < 1) {
      return res.status(404).json({
        status: "error",
        pass: false,
        message: "❗(error) Não existe itens na lista para criar uma nova ❗",
      });
    } else {
      return res.status(200).json({
        status: "success",
        pass: true,
        message: "Existe item ou itens na lista !",
      });
    }
  }catch (err) {
    return res.status(500).json({
      status: "error",
      pass: true,
      message: "Erro interno !",
      error: err.message,
    });
  }
})

router.delete("/deleteAll", checkAuth, async (req, res) => {
  const temp_id = req.session.user._id_temp
  try {

    if (req.session.user.save === "no-salvo") {
      const temp = await Temp.findById(temp_id).populate('itens')

      if (temp.itens.length < 1 || !temp) {
        return res.status(404).json({
          status: "error",
          message: "A lista está vazia !",
          error: err.message,
        });
      }

      if (temp && temp.itens && temp.itens.length > 0) {
        const results = await Promise.allSettled(
          temp.itens.map(item => Item.findByIdAndDelete(item._id))
        );

        results.forEach((resul, index) => {
          if (resul.status === 'rejected') {
            console.warn(`Falhou ao deletar item ${temp.itens[index]._id}:`, resul.reason);
          }
        });
      }
    }

    const result = await Temp.findByIdAndDelete(temp_id);
    await Relatorio.findOneAndUpdate(
      { temp_id: req.session.user._id_temp },
      { temp_id: null },
      { new: true }
    );
    req.session.user._id_temp = null
    req.session.user.save = 'no-salvo';
    req.session.user.dia_plantao = new Date().toISOString().split('T')[0]

    const usuario = await User.findOne({ _id: req.session.user._id })
    req.session.user.plantao = usuario.plantao

    await User.updateOne({ _id: req.session.user._id }, { $set: { temp_id: null } })

    return res.status(200).json({
      status: "success",
      message: "Sucesso em deletar todos os itens!",
      result: result,
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: "Errou em deletar todos os itens!",
      error: err.message,
    });
  }
});

router.put("/salvar", checkAuth, async (req, res) => {
  const temp_id = req.session.user._id_temp
  const user = req.session.user

  const { dia_plantao, nome_plantao } = req.body

  if (!dia_plantao || !nome_plantao) {
    return res.status(422).json({
      status: "error",
      message: "❌ Obrigatorio preenchar os campos PLANTÃO e DIA",
    });
  }

  try {
    const temp = await Temp.findById(temp_id).populate('itens')

    if (temp) {
      const [ano, mes, dia] = dia_plantao.split('-')
      const dataBR = `${dia}/${mes}/${ano}`;

      const relatorio = await Relatorio.findOne({ temp_id: temp_id })

      if (relatorio) {
        relatorio.nome_plantao = nome_plantao;
        relatorio.dia_plantao = dia_plantao;
        relatorio.relatorio = temp,
          relatorio.temp_id = temp_id
        await relatorio.save();
        req.session.user.save = 'salvo';

        return res.status(200).json({
          status: "success",
          message: `✅ Relatorio do dia ${dataBR}, foi atualizado com sucesso !`,
        });

      } else {
        const novoRelatorio = new Relatorio({
          nome_plantao,
          dia_plantao,
          relatorio: temp,
          temp_id: temp_id,
        })
        await novoRelatorio.save()

        req.session.user.save = 'salvo';
        console.log(`${user.nome} salvou o relatorio do dia ${dataBR}`)
        return res.status(201).json({
          status: "success",
          message: `✅ Relatorio dia ${dataBR}, foi salvo com sucesso !`,
        });
      }



    } else {
      return res.status(404).json({
        status: "error",
        message: "❌ Não existe relatorio para salvar !",
      });
    }


  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "❌ Erro interno",
      error: err.message
    });
  }
})

router.delete("/delete/:id", checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const itemDeletado = await Item.findByIdAndDelete(id);

    if (!itemDeletado) {
      return res.status(404).json({
        status: "error",
        message: "Item não encontrado para exclusão.",
      });
    }

    if (req.session.user.save === "salvo") req.session.user.save = "atualizar"

    return res.status(200).json({
      status: "success",
      message: `Item com ID ${id} deletado com sucesso.`,
      deleted: itemDeletado,
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: "Erro ao deletar item por ID.",
      error: err.message,
    });
  }
});

router.post("/create", checkAuth, async (req, res) => {
  const { nome, zona, horario, contato, envio, os, obs } = req.body;
  const user = req.session.user || null

  if (!nome) {
    return res.status(422).json({
      status: "error",
      message: "Obrigatorio preenchar os campos NOME e ZONA",
    });
  }

  const item = {
    nome, zona, horario, contato, envio, os, obs, user: {
      _id: user._id,
      nome: user.nome,
      email: user.email,
      plantao: user.plantao,
    }
  };

  const novoItem = new Item(item);

  await novoItem.save();

  let temp = await Temp.findById(user._id_temp)

  if (!temp) {
    temp = new Temp({
      user: {
        _id: user._id,
        nome: user.nome,
        email: user.email,
        date_online: user.date_online,
        plantao: user.plantao,
      },
      itens: [novoItem._id],
      _id_temp: user._id_temp,
    })
    req.session.user._id_temp = temp._id
    await User.updateOne({ _id: user._id }, { $set: { temp_id: temp._id } })
  } else {
    temp.itens.push(novoItem)
  }

  await temp.save()

  if (req.session.user.save === "salvo") req.session.user.save = "atualizar"

  return res.status(201).json({
    status: "success",
    message: `O Item (${nome.toUpperCase()}) foi adicionado a lista com sucesso !`,
    obj: item,
  });
});

router.post("/register", async (req, res) => {

  let { nome, email, plantao, senha } = req.body

  nome = nome.trim()
  email = email.trim()
  plantao = plantao.trim()

  if (!nome || !email || !senha || !plantao) {
    return res.status(400).json({
      status: 'error',
      message: "É nessacario preencher os campos nome, email, plantao e senha !"
    })
  }

  if (nome.length < 3) {
    return res.status(400).json({
      status: 'error',
      message: "O nome teve conter no minimo 3 caracteres !"
    })
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      status: 'error',
      message: `O email "${email.toUpperCase()}" não é valido !`
    })
  }

  if (/\s/.test(senha)) {
    return res.status(400).json({
      status: 'error',
      message: `A senha não pode conter espaço em branco !`
    })
  }

  try {
    const existsUser = await User.findOne({ email })

    if (existsUser) {
      return res.status(409).json({
        status: "error",
        message: `O email "${existsUser.email.toUpperCase()}" já existe, tente outro !`
      })
    }

    const newUser = new User({
      nome,
      email,
      plantao,
      senha
    })

    await newUser.save()

    console.log(`O úsuario ${nome.toUpperCase()} com email ${email.toUpperCase()}, foi criado com sucesso !`)

    return res.status(201).json({
      status: "success",
      message: `O úsuario ${nome.toUpperCase()} foi criado com sucesso !`
    })

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Erro interno",
      error: err.message
    })
  }

})

router.post("/login", async (req, res) => {
  const { email, senha } = req.body

  if (!email || !senha) {
    return res.render("login", {
      status: "error",
      message: "É necessario preencher todos os campos!"
    })
  }

  try {

    const usuario = await User.findOne({ email: email.toLowerCase().trim() })

    if (!usuario) {
      return res.render("login", {
        status: "error",
        message: "Úsuario não encontrado !"
      })
    }

    if (!(await usuario.compareSenha(senha))) {
      return res.render("login", {
        status: "error",
        message: "Senha incorreta !"
      })
    }

    let relatorio_temp = null
    if (usuario.temp_id) {
      relatorio_temp = await Relatorio.findOne({ temp_id: usuario.temp_id })
    }

    req.session.user = {
      _id: usuario._id,
      nome: usuario.nome,
      plantao: relatorio_temp ? relatorio_temp.nome_plantao : usuario.plantao,
      email: usuario.email,
      date_online: new Date(),
      _id_temp: usuario.temp_id,
      dia_plantao: relatorio_temp ? relatorio_temp.dia_plantao : new Date().toISOString().split('T')[0],
      save: 'no-salvo',
    }

    console.log(`${usuario.nome.toUpperCase()} está online !`)
    return res.redirect('/relatorio')

  } catch (err) {
    console.error(err.message)
    return res.render("login", {
      status: "error",
      message: "Erro interno, tente novamente !"
    })
  }

})

router.put("/update/:id", checkAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const { nome, zona, horario, contato, envio, os, obs, exec } = req.body;

    if (!nome) {
      return res.status(422).json({
        status: "error",
        message: "Obrigatorio preenchar os campos NOME e ZONA",
      });
    }
    const itemAtualizado = await Item.findByIdAndUpdate(
      id,
      { nome, zona, horario, contato, envio, os, obs, exec },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!itemAtualizado) {
      return res.status(404).json({
        status: "error",
        message: "Item não encontrado",
        item: itemAtualizado,
      });
    }

    if (req.session.user.save === "salvo") req.session.user.save = "atualizar"

    return res.status(200).json({
      status: "success",
      message: `O Item com ID ${id} foi atualizado com sucesso!`,
      obj: itemAtualizado,
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: "Errou em atualizar item!",
      error: err.message,
    });
  }
});

router.post("/dev/updateSenha", async (req, res) => {
  const { email, novaSenha } = req.body

  if (!email || !novaSenha) {
    return res.status(400).json({
      status: 'error',
      message: "É nessacario preencher os campos email e nova senha !"
    })
  }

  try {

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: `O email "${existsUser.email.toUpperCase()}" não foi encontrado !`
      })
    }

    await user.updateSenha(novaSenha)

    return res.status(200).json({
      status: "success",
      message: `O úsuario ${user.nome.toUpperCase()} com email "${user.email.toUpperCase()}" teve a sua senha atualizada !`
    })

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Erro interno",
      error: err.message
    })
  }

})

router.post("/dev/updateNome", async (req, res) => {
  const { email, novoNome } = req.body

  if (!email || !novoNome) {
    return res.status(400).json({
      status: 'error',
      message: "É nessacario preencher os campos email e novo nome !"
    })
  }

  try {

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: `O email "${existsUser.email.toUpperCase()}" não foi encontrado !`
      })
    }

    const nomeAntigo = user.nome.trim()

    await user.updateNome(novoNome)

    return res.status(200).json({
      status: "success",
      message: `O úsuario "${nomeAntigo.toUpperCase()}" teve a seu nome atualizado para "${user.nome.toUpperCase()}" !`
    })

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Erro interno",
      error: err.message
    })
  }

})

router.get("/dev/getAllReports", async (req, res) => {
  try {

    const relatorios = await Relatorio.find({}).sort({ createdAt: 1 })

    if (!relatorios) {
      return res.status(404).json({
        status: 'error',
        message: 'Não existe relatorio'
      })
    }

    const relatoriosCompletos = await Promise.all(
      relatorios.map(async (r) => {
        const itensDocs = await Item.find({ _id: { $in: r.relatorio.itens } }).lean();
        return {
          ...r.toObject(),
          relatorio: {
            ...r.relatorio,
            itens: itensDocs.length > 0 ? itensDocs : r.relatorio.itens
          }
        };
      })
    );


    return res.status(200).json({
      status: 'success',
      message: "Requisiçao bem sucedida !",
      relatorios: relatoriosCompletos,
    })

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Erro interno",
      error: err.message
    })
  }
})

router.get("/dev/getAllItens", async (req, res) => {
  try {

    const itens = await Item.find({}).sort({ createdAt: 1 })

    return res.status(200).json({
      status: 'success',
      message: "Requisiçao bem sucedida !",
      relatorios: itens,
    })

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Erro interno",
      error: err.message
    })
  }
})

module.exports = router;
