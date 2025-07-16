const express = require("express");
const router = express.Router();
const path = require("path");
const Item = require("../models/item");
const User = require('../models/user')
const Temp = require('../models/temp')
const Relatorio = require('../models/relatorio')
const validator = require("validator")
const { setDateNowInputBrazil } = require('../utils/dataNowInput')

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

router.get("/getUser", checkAuth, async (req, res) => {
  const usuario = await User.findById(req.session.user.id).populate('temp')

  req.session.user.nome_plantao = usuario.temp.nome_plantao;
  req.session.user.dia_plantao = usuario.temp.dia_plantao;
  req.session.user.saved = usuario.temp.saved;

  if (!req.session.user) {
    return res.status(401).json({
      status: "error",
      message: "Usuário não autenticado!"
    });
  }

  return res.status(200).json({
    status: "success",
    user: req.session.user,
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
  const user = req.session.user || null
  try {
    const temp = await Temp.findById(user.temp_id)
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
  const user = req.session.user || null
  try {
    const temp = await Temp.findById(user.temp_id).populate('itens').sort({ createdAt: 1 })

    return res.status(200).json({
      status: "success",
      message: "Sucesso na consulta de itens!",
      json: temp.itens,
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
    const user = req.session.user

    if (!nome) {
      return res.status(200).json({
        status: "error",
        message: "Nome em branco",
        exists: false,
      });
    }
    const temp = await Temp.findById(user.temp_id).populate('itens')
    const nomeList = temp ? temp.itens.find(item => item.nome === nome) : null

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
  const user = req.session.user || null
  try {
    const temp = await Temp.findOne({ _id: user.temp_id }).populate('itens')

    if (!temp || !temp.itens) {
      return res.status(404).json({
        status: "error",
        pass: false,
        message: "❗(error 1) Não existe itens na lista para criar uma nova ❗",
        nome: req.session.user.nome,
      });
    }
    else if (temp.itens.length < 1) {
      return res.status(404).json({
        status: "error",
        pass: false,
        message: "❗(error 2) Não existe itens na lista para criar uma nova ❗",
        nome: req.session.user.nome,
      });
    } else {
      return res.status(200).json({
        status: "success",
        pass: true,
        itens: temp.itens,
        message: "Existe item ou itens na lista !",
        nome: req.session.user.nome,
      });
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      status: "error",
      pass: true,
      message: "Erro interno !",
      error: err.message,
    });
  }
})

router.delete("/deleteAll", checkAuth, async (req, res) => {
  const user = req.session.user
  try {

    const temp = await Temp.findById(user.temp_id).populate('itens')

    if (temp.itens.length < 1) {
      return res.status(400).json({
        status: "error",
        message: "A lista está vazia !",
      });
    } else if (temp.itens.length === 0) {
      temp.saved = 'empty'
    }

    const relatorio = await Relatorio.findById(temp.relatorio_id).populate('itens')
    if (temp.saved === 'update') {

      if (relatorio) {
        const relatorioIds = relatorio.itens.map(item => item._id.toString());
        const diferentes = temp.itens.filter(item => !relatorioIds.includes(item._id.toString()));

        if (diferentes.length > 0) {
          const idsParaDeletar = diferentes.map(item => item._id);
          await Item.deleteMany({ _id: { $in: idsParaDeletar } });
        }
      }
    } else if (temp.saved === 'not saved' || temp.saved === 'empty') {
      const idsParaDeletar = temp.itens.map(item => item._id);
      if (idsParaDeletar.length > 0) {
        await Item.deleteMany({ _id: { $in: idsParaDeletar } });
      }
    }

    if (relatorio && relatorio.itens.length === 0) {
      await relatorio.deleteOne()
    }

    temp.itens = []
    temp.relatorio_id = null
    temp.nome_plantao = user.meu_plantao
    temp.dia_plantao = setDateNowInputBrazil()
    temp.saved = 'empty'
    await temp.save()

    console.log(`${user.nome} limpou o seu arquivo temp !`)
    return res.status(200).json({
      status: "success",
      message: "Sucesso em deletar todos os itens!",
    });
  } catch (err) {
    console.error(err)
    return res.status(400).json({
      status: "error",
      message: "Errou em deletar todos os itens!",
      error: err.message,
    });
  }
});

router.put("/salvar", checkAuth, async (req, res) => {
  const user = req.session.user || null

  try {
    const temp = await Temp.findById(user.temp_id).populate('itens')

    if (!temp || temp.itens.length === 0) {
      return res.status(200).json({
        status: "error",
        message: `❌ Não existe itens na lista para salvar no relatorio !`,
      });
    }
    else if (temp) {
      const [ano, mes, dia] = temp.dia_plantao.split('-')
      const dataBR = `${dia}/${mes}/${ano}`;

      const relatorio = await Relatorio.findById(temp.relatorio_id)

      if (relatorio) {
        relatorio.nome_plantao = temp.nome_plantao
        relatorio.dia_plantao = temp.dia_plantao
        relatorio.itens = temp.itens.map(item => item._id)
        await relatorio.save()

        temp.saved = 'saved'
        await temp.save()
        return res.status(200).json({
          status: "success",
          message: `✅ Relatorio do dia ${dataBR}, foi atualizado com sucesso !`,
        });

      } else {

        const novoRelatorio = new Relatorio({
          nome_plantao: temp.nome_plantao,
          dia_plantao: temp.dia_plantao,
          itens: temp.itens.map(item => item._id),
          user: {
            id: user.id,
            nome: user.nome,
          }
        })
        await novoRelatorio.save()

        temp.saved = 'saved'
        temp.relatorio_id = novoRelatorio._id
        await temp.save()

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
    console.error(err)
    return res.status(500).json({
      status: "error",
      message: "❌ Erro interno",
      error: err.message
    });
  }
})

router.delete("/delete/:id", checkAuth, async (req, res) => {
  const user = req.session.user || null
  try {
    const { id } = req.params;
    const itemDeletado = await Item.findByIdAndDelete(id);

    if (!itemDeletado) {
      return res.status(404).json({
        status: "error",
        message: "Item não encontrado para exclusão.",
      });
    }

    const novoTemp = await Temp.findByIdAndUpdate(
      user.temp_id,
      {
        $pull:
          { itens: id }
      },
      { new: true }
    )

    if (novoTemp.itens.length === 0) {
      await Relatorio.deleteOne({ _id: novoTemp.relatorio_id })
      console.log(`Relatorio com ID ${novoTemp.relatorio_id} foi deletado !`)
      novoTemp.relatorio_id = null
      novoTemp.saved = 'empty'
      await novoTemp.save()
    
    } 
    else {
      await Relatorio.findByIdAndUpdate(
        novoTemp.relatorio_id,
        {
          $pull:
            { itens: id }
        })
    }

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
      id: user.id,
      nome: user.nome,
      plantao: user.plantao,
    }
  };

  try {
    const temp = await Temp.findById(user.temp_id)

    if (temp) {
      const novoItem = new Item(item);
      await novoItem.save();

      temp.itens.push(novoItem)
      temp.saved = temp.saved === 'empty' || temp.saved === 'not saved' ? 'not saved' : 'update',
        await temp.save()

      return res.status(201).json({
        status: "success",
        message: `O item ${item.nome.trim().toUpperCase()} foi criado com sucesso !`,
        item: novoItem,
      })
    } else {
      return res.status(400).json({
        status: "error",
        message: "Usuario não possui o arquivo temp.\nO sistema vai forçar um reloger para criar novamente !",
      })
    }


  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Erro interno !",
      error: err
    })
  }

});

router.get("/initTemp", async (req, res) => {
  try {
    const temp = await Temp.findById(req.session.user._id_temp)

    if (temp) {
      return res.status(200).json({
        status: "success",
        message: "Sucesso na requisição do nome e dia do plantão !",
        obj: {
          nome_plantao: temp.nome_plantao,
          dia_plantao: temp.dia_plantao,
        }
      })
    } else {
      return res.status(200).json({
        status: "success",
        message: "Temp está null, mas a requisição foi enviada!",
        obj: {
          nome_plantao: req.session.user.plantao,
          dia_plantao: setDateNowInputBrazil(),
        }
      })
    }

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Erro interno !",
      error: err,
    })
  }
})

router.post("/updateNameAndDay/:op", async (req, res) => {
  const user = req.session.user || null
  let { plantao } = req.body
  const { op } = req.params

  try {

    const temp = await Temp.findById(user.temp_id)
    const relatorio = await Relatorio.findById(temp.relatorio_id)

    if (op === "name") {
      plantao = !plantao || typeof plantao === 'undefined' || plantao.trim() === "" ? user.meu_plantao : plantao.toUpperCase().trim()
      req.session.user.nome_plantao = plantao // A linha não é necessario, o getUser ja atualiza
      temp.nome_plantao = plantao

      await temp.save()

      if (relatorio) {
        relatorio.nome_plantao = plantao
        await relatorio.save()
      }

      return res.status(200).json({
        status: "success",
        message: `O nome do plantão (${temp.nome_plantao}) foi atualizado com sucesso !`
      })
    }

    if (op === "dia") {
      plantao = !plantao ? user.dia_plantao : plantao
      req.session.user.dia_planto = plantao // A linha não é necessario, o getUser ja atualiza
      temp.dia_plantao = plantao
      await temp.save()

      if (relatorio) {
        relatorio.dia_plantao = plantao
        await relatorio.save()
      }

      return res.status(200).json({
        status: "success",
        message: `O dia do plantão (${temp.dia_plantao}) foi atualizado com sucesso !`
      })
    }

  } catch (err) {
    return res.status(200).json({
      status: "errir",
      message: "Error interno !",
      error: err
    })
  }
})

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
      senha,
      plantao
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
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.render("login", {
      status: "error",
      message: "É necessário preencher todos os campos!"
    });
  }

  try {
    const usuario = await User.findOne({ email: email.toLowerCase().trim() }).populate('temp');

    if (!usuario) {
      return res.render("login", {
        status: "error",
        message: "Usuário não encontrado!"
      });
    }

    if (!(await usuario.compareSenha(senha))) {
      return res.render("login", {
        status: "error",
        message: "Senha incorreta!"
      });
    }

    if (!usuario.temp) {
      const temp = new Temp({
        user: {
          id: usuario._id,
          nome: usuario.nome,
        },
        nome_plantao: usuario.plantao
      });
      usuario.temp = temp._id;
      await temp.save();
      await usuario.save()
    }
    else if (usuario.temp.itens.length === 0) {
      await Temp.findOneAndUpdate(
        { _id: usuario.temp._id },
        { $set: { dia_plantao: setDateNowInputBrazil() } },
        { new: true }
      )
    }

    req.session.user = {
      id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      meu_plantao: usuario.plantao,
      nome_plantao: usuario.temp.nome_plantao,
      dia_plantao: usuario.temp.itens.length === 0 ? new Date().toISOString().split('T')[0] : usuario.temp.dia_plantao,
      saved: usuario.temp.saved,
      temp_id: usuario.temp._id,
    }

    console.log(`${usuario.nome.toUpperCase()} está online!`);
    return res.redirect('/relatorio');

  } catch (err) {
    console.error(err);
    return res.render("login", {
      status: "error",
      message: "Erro interno, tente novamente!"
    });
  }
});

router.put("/update/:id", checkAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const { nome, zona, horario, contato, envio, os, obs, exec } = req.body;
    const user = req.session.user || null

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

router.get("/api/get-reports", async (req, res) => {
  try {

    const relatorios = await Relatorio.find({}).populate('itens').sort({ createdAt: 1 })

    if (!relatorios) {
      return res.status(404).json({
        status: 'error',
        message: 'Não existe relatorio'
      })
    }

    return res.status(200).json({
      status: 'success',
      message: "Requisiçao bem sucedida dos reports!",
      length: relatorios.length,
      reports: relatorios,
    })

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Erro interno",
      error: err.message
    })
  }
})

router.get("/api/get-itens", async (req, res) => {
  try {

    const itens = await Item.find({}).sort({ createdAt: 1 })

    return res.status(200).json({
      status: 'success',
      message: "Requisiçao bem sucedida dos itens!",
      length: itens.length,
      itens: itens,
    })

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Erro interno",
      error: err.message
    })
  }
})

router.get("/api/get-temps", async (req, res) => {
  try {

    const temps = await Temp.find({}).sort({ createdAt: 1 })

    return res.status(200).json({
      status: 'success',
      message: "Requisiçao bem sucedida dos temps!",
      length: temps.length,
      temps: temps,
    })

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Erro interno",
      error: err.message
    })
  }
})

router.get("/api/get-infoUser/:email", async (req, res) => {
  const { email } = req.params

  try {
    const user = await User.findOne({ email: email }).populate(
      {
        path: "temp",
        select: "itens",
        populate: {
          path: "itens"
        }
      }
    )

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: `Usuário não encontrado com email ${email.toUpperCase()}`,
      })
    }

    const relatorios = await Relatorio
      .find({ "user.id": user.id })
      .populate("itens")
      .select("dia_plantao nome_plantao itens")
      .lean()
      .sort({ createdAt: -1 })

    if (!relatorios) {
      return res.status(404).json({
        status: "error",
        message: `Usuário ${user.nome.toUpperCase()} com email ${email.toUpperCase()} não criou relatorio !`,
      })
    }

    return res.status(200).json({
      status: 'success',
      message: "Requisiçao bem sucedida !",
      json: {
        user: {
          nome: user.nome,
          email: user.email,
          _id: user.id,
        },
        temp: {
          _id: user.temp._id,
          length_itens: user.temp.itens.length,
          itens: user.temp.itens,
        },
        relatorios: {
          length: relatorios.length,
          json: relatorios,
        }
      },
    })

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Erro interno",
      error: err.messge,
      stack: err.stack,
    })
  }
})

module.exports = router;
