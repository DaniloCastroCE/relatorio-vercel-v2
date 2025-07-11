var itens = { count: 0, ativo: false };
let usuario = null
const formatName = new FormatName()

const getUser = async () => {
  try {
    const response = await fetch("/getUser")
    const result = await response.json()
    if (result.status === 'success') {
      document.querySelector('#user-nome').textContent = formatName.type_one(result.user.nome)
      document.querySelector('#user-email').textContent = result.user.email
    
      usuario = {
        _id: result.user._id,
        nome: result.user.nome,
        email: result.user.email,
        plantao: result.user.plantao,
        date_online: result.user.date_online,
        dia_relatorio: new Date(result.user.date_online).toISOString().split('T')[0],
        save: result.user.save,
      }
      
      if(result.dados_relatorio) {
          usuario.plantao = result.dados_relatorio.nome_plantao
          usuario.dia_relatorio = new Date(result.dados_relatorio.dia_plantao).toISOString().split('T')[0]
      }
      console.log(usuario)
    }

  } catch (err) {
    console.error(err)
  }
}
getUser()

const resizeObserver = new ResizeObserver((entries) => {
  for (let entry of entries) {
    const divHeight = entry.contentRect.height;
    document.querySelector(".divEspaco").style.height = `${divHeight}px`;
  }
});
resizeObserver.observe(document.querySelector(".header"));

const loading = (op) => {
  const loading = document.querySelector(".loading");
  if (op === "open") {
    loading.classList.remove("display-none");
  } else if (op === "close") {
    loading.classList.add("display-none");
  }
};

const initAddCountItensToLogo = async () => {
  try {
    const text = document.querySelector("#lodoText");
    const response = await fetch("/countDocuments");
    const result = await response.json();

    if (result.status === "success") {
      itens.count = result.qt;
      itens.ativo = true;
    }
  } catch (error) {
    console.error(`Erro na função addCountItensToLogo: ${error}`);
    itens.count = 0;
  }
  addCountItensToLogo();
};

initAddCountItensToLogo();

const checkNomeList = async (obj) => {
  const nome = obj.value.toLowerCase().trim();

  if (nome) {
    try {
      const response = await fetch(`/checkNome/${nome}`);

      if (!response.ok) {
        throw new Error(`Falha na requisição: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.exists) showExistsNome(result.time);
    } catch (err) {
      console.error(`Erro: ${err}`);
    }
  } else {
    showExistsNome("nulo");
  }
};

let timeoutId;

const showExistsNome = (time) => {
  const texto =
    time !== "" && time !== undefined && time !== null ? `(${time})` : "";
  const info = document.querySelector("#exists-name");
  const infoAddOs = document.querySelector("#exists-name-addOs");
  const textInfo = info.querySelector("p");

  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  if (time === "nulo") {
    info.style.opacity = 0;
    info.style.visibility = "hidden";
    infoAddOs.style.opacity = 0;
    infoAddOs.style.visibility = "hidden";
  } else {
    textInfo.textContent = `Nome encontrado na lista! ${texto}`;
    info.style.visibility = "visible";
    info.style.opacity = 0.7;

    infoAddOs.style.visibility = "visible";
    infoAddOs.style.opacity = 1;

    timeoutId = setTimeout(() => {
      info.style.opacity = 0;
      info.style.visibility = "hidden";
      infoAddOs.style.opacity = 0;
      infoAddOs.style.visibility = "hidden";
    }, 10000);
  }
};

const addCountItensToLogo = (op) => {
  if (typeof op === "undefined") op = "";

  const text = document.querySelector("#lodoText");

  if (op === "+") {
    itens.count++;
  } else if (op === "-") {
    itens.count--;
  } else if (op === "clear") {
    itens.count = 0;
  }

  if (!itens.ativo) {
    text.textContent = "Relatório Maracanaú";
  } else if (itens.count <= 1) {
    text.textContent = `${itens.count} registro`;
  } else {
    text.textContent = `${itens.count} registros`;
  }
  //console.log('Relatório: ', itens.count)
};

const toggleMenu = () => {
  const menu = document.querySelector(".menu");
  menu.classList.toggle("showMenu");
};

const clickMenu = (id) => {
  const addOs = document.querySelector(".addOs");
  const lista_edit = document.querySelector(`#lista-edit`);
  const menu = document.querySelector(".menu");

  switch (id) {
    case "nav-add":
      addOs.classList.add("display-none");
      lista_edit.classList.add("display-none");
      addOs.classList.remove("display-none");
      if (!addOs.classList.contains("display-none")) {
        addItemToListPrevious("formInputs");
      }
      break;

    case "nav-list":
      addOs.classList.add("display-none");
      lista_edit.classList.add("display-none");
      lista_edit.classList.remove("display-none");
      if (!lista_edit.classList.contains("display-none")) {
        getAllOS(getAllOS_part);
      }
      break;

    default:
      break;
  }

  if (menu.classList.contains("showMenu")) {
    menu.classList.toggle("showMenu");
  }
};

const convertForm = (idForm, radios) => {
  const form = document.querySelector(`#${idForm}`);
  const campos = Array.from(form.elements);
  let inpValue = {};

  campos.forEach((el) => {
    if (el.name) {
      const tag = el.tagName.toLowerCase();

      if (
        el.type === "text" ||
        el.type === "time" ||
        tag === "textarea" ||
        tag === "select"
      ) {
        inpValue[el.name] = {
          type: tag === "input" ? el.type : tag,
          value: el.value,
          id: el.id ? el.id : "",
        };
      }
    }
  });

  radios.forEach((radioName) => {
    const selecionado = form.querySelector(
      `input[name="${radioName}"]:checked`
    );
    if (selecionado) {
      inpValue[radioName] = {
        type: "radio",
        value: selecionado.value,
      };
    }
  });

  return inpValue;
};

const editPrevious = (ItemList) => {
  //A função precisa de obj com valor: {orig: '', modif: ''}.

  Object.keys(ItemList).forEach((key) => {
    switch (key) {
      case "nome":
        ItemList.nome.modif = ItemList.nome.orig.toUpperCase().trim();
        break;

      case "zona":
        if (ItemList.zona.orig === "") {
          ItemList.zona.modif = "";
        } else if (
          ItemList.zona.orig.toLowerCase().trim() === "energia" ||
          ItemList.zona.orig === "0"
        ) {
          ItemList.zona.modif = "Falta de energia";
        } else if (ItemList.zona.orig.toLowerCase().trim() === "ronda") {
          ItemList.zona.modif = "Motivo: Ronda";
        } else {
          ItemList.zona.modif = `Disparo na zona ${ItemList.zona.orig}`;
        }
        break;

      case "horario":
        if (ItemList.horario.orig === "") {
          ItemList.horario.modif = "";
        } else if (
          ItemList.zona.orig.toLowerCase().trim() === "energia" ||
          ItemList.zona.orig === "0"
        ) {
          ItemList.zona.modif = `Falta de energia às ${ItemList.horario.orig}`;
        } else {
          ItemList.horario.modif = `Horário do Acionamento: ${ItemList.horario.orig}`;
        }
        break;

      case "contato":
        if (ItemList.contato.orig === "") {
          ItemList.contato.modif = "";
        } else if (ItemList.contato.orig === "sim") {
          ItemList.contato.modif = "Contato: SIM";
        } else if (ItemList.contato.orig === "nao") {
          ItemList.contato.modif = "Contato: NÃO";
        }
        break;

      case "envio":
        if (ItemList.envio.orig === "") {
          ItemList.envio.modif = "";
        } else if (ItemList.envio.orig === "sim") {
          ItemList.envio.modif = "Envio de inspetor: SIM";
        } else if (ItemList.envio.orig === "nao") {
          ItemList.envio.modif = "Envio de inspetor: NÃO";
        }
        break;
      case "os":
        if (ItemList.os.orig === "" || ItemList.envio.orig === "nao") {
          ItemList.os.modif = "";
        } else if (ItemList.envio.orig === "sim") {
          ItemList.os.modif = `O.S. ${ItemList.os.orig.trim()}`;
        }
        break;
      case "exec":
        if (ItemList.exec.orig === "sim") {
          ItemList.exec.modif = "Ocorrência foi executada com sucesso!";
        } else if (ItemList.exec.orig === "-") {
          ItemList.exec.modif = "";
        } else if (ItemList.exec.orig === "nao") {
          ItemList.exec.modif = "Ocorrência não foi executada!";
        }

        break;
      case "obs":
        if (ItemList.obs.orig === "") {
          ItemList.obs.modif = "";
        } else {
          ItemList.obs.modif = `Observação: ${ItemList.obs.orig.replace(
            /\n/g,
            "<br>"
          )}`;
        }
        break;

      default:
        break;
    }
  });

  return ItemList;
};

const addItemToListPrevious = (idInputs, id) => {
  if (typeof id === "undefined") {
    id = "";
  }

  const inputs = convertForm(`${idInputs}${id}`, ["contato", "envio"]);
  let ItemList = {};
  let idOs = "";

  Object.keys(inputs).forEach((key) => {
    ItemList[key] = { orig: inputs[key].value, modif: "" };

    if (key === "os") {
      idOs = inputs[key].id;
    }
  });

  ItemList = editPrevious(ItemList);

  if (ItemList.nome.modif === "") {
    document.querySelector(`#preVisualizacao${id}`).innerHTML = "";
    Object.keys(ItemList).forEach((key) => {
      document.querySelector(`#previous-${key}${id}`).innerHTML = "";
    });
  } else {
    document.querySelector(`#preVisualizacao${id}`).innerHTML =
      "Pré-Visualização";
    Object.keys(ItemList).forEach((key) => {
      try {
        const el = document.querySelector(`#previous-${key}${id}`);
        el.innerHTML = ItemList[key].modif;
        if (key === "exec") {
          const nomePrevious = document.querySelector(`#previous-nome${id}`);
          const inpList = document.querySelector(`#formContainer${id}`);
          if (ItemList[key].orig === "sim") {
            nomePrevious.classList.remove("naoExecPrevious");
            nomePrevious.classList.add("execPrevious");
            el.classList.remove("naoExecPrevious");
            el.classList.add("execPrevious");
            inpList.classList.remove("naoExecInp");
            inpList.classList.add("execInp");
          } else if (ItemList[key].orig === "nao") {
            nomePrevious.classList.remove("execPrevious");
            nomePrevious.classList.add("naoExecPrevious");
            el.classList.remove("execPrevious");
            el.classList.add("naoExecPrevious");
            inpList.classList.remove("execInp");
            inpList.classList.add("naoExecInp");
          } else {
            nomePrevious.classList.remove("execPrevious");
            nomePrevious.classList.remove("naoExecPrevious");
            el.classList.remove("execPrevious");
            el.classList.remove("naoExecPrevious");
            inpList.classList.remove("execInp");
            inpList.classList.remove("naoExecInp");
          }
        }
      } catch (error) {
        console.error(error);
      }
    });
  }

  if (ItemList.envio.orig === "nao") {
    document.querySelector(`#${idOs}`).innerHTML = "";
    document.querySelector(`#${idOs}`).disabled = true;
  } else {
    document.querySelector(`#${idOs}`).disabled = false;
  }

  let novoItem = {};
  //console.log(novoItem)
  Object.keys(ItemList).forEach((key) => {
    novoItem[key] = ItemList[key].orig;
  });
  if (id !== "") {
    atualizarItem(id, novoItem);
  }
};
addItemToListPrevious("formInputs");

const getAllOS_part = (status, result, error) => {
  const lista_edit = document.querySelector(`#lista-edit`);

  lista_edit.innerHTML = `
    <div class="control-panel">
      <div>
        <label for="plantao">Plantão</label>
        <input 
          type="text" 
          id="plantao" 
          name="plantao" 
          value="${usuario.plantao}" 
          onchange="mudarPlantao(this)"> 
      </div>

      <div>
        <label for="dia">dia</label>
        <input 
          type="date" 
          id="plantao" 
          name="dia" 
          value="${usuario.dia_relatorio}" 
          onchange="mudarDiaRelatorio(this)"> 
      </div>
      <div class="controlBtns form-actions ">
        <!--<button type="button" onclick="copyListPrevious()">Copiar</button>-->
        <button type="button" onclick="salvarRelatorio()">Salvar</button>
        <button type="button" onclick="limparList()">Limpar</button>
      </div>
    </div>
  `

  addCountItensToLogo("clear");
  if (status === "success") {
    if (result.length > 0) {
      result.forEach((item, index) => {
        codeHtmlItemToList(
          lista_edit,
          item._id,
          item,
          (index + 1).toString().padStart(2, "0")
        );
        addCountItensToLogo("+");
      });
      scrollToBottom();
    } else {
      const codeHtml = `
                <div class="sem-arquivos" id="semArquivos">
                    <p>📭 A lista encontra-se vazia.</p>
                </div>
            `;
      lista_edit.insertAdjacentHTML("beforeend", codeHtml);
    }
  } else {
    alert(
      `Erro ao carregar lista, tente novamente ! \n\nMotivo do erro: ${error}`
    );
    clickMenu("nav-add");
    addCountItensToLogo();
  }
};

const getAllOS = async (callback) => {
  loading("open");
  try {
    const response = await fetch("/getAll");
    const data = await response.json();

    if (data.status === "success") {
      console.log(data.message);
      callback(data.status, data.json);
      loading("close");
    } else {
      callback(data.status, data.message, data.error);
      loading("close");
    }
  } catch (err) {
    console.error(`Erro: ${err}`);
    loading("close");
  }
};

//getAllOS(getAllOS_part)

const codeHtmlItemToList = (lista_edit, id, item, ordem) => {
  let classExec = "";
  let classInpExec = "";
  if (item.exec === "sim") {
    classExec = "execPrevious";
    classInpExec = "execInp";
  } else if (item.exec === "nao") {
    classExec = "naoExecPrevious";
    classInpExec = "naoExecInp";
  } else {
    classExec = "";
    classInpExec = "";
  }

  const codeHtml = `
    <div class="itemList">
        <div class="ordem no-select">${ordem}</div>
        <div class="form-container form-container-list ${classInpExec}" id="formContainer${id}">
            <form id="formInputs${id}" onsubmit="deletarItem(event,'${id}', '${item.nome.toUpperCase()}');">
                <div class="form-group">
                    <label for="nome${id}">Nome</label>
                    <input class="nomePreviousInput" type="text" name="nome" id="nome${id}" required onchange="addItemToListPrevious('formInputs','${id}');">
                </div>
                <div class="form-group flex-direction-row">
                    <div class="form-group">
                        <label for="zona${id}">Zona</label>
                        <input type="text" name="zona" id="zona${id}" onchange="addItemToListPrevious('formInputs','${id}');">
                    </div>
                    <div class="form-group form-group-horario">
                        <label for="horario${id}">Horário</label>
                        <input type="time" name="horario" id="horario${id}" onchange="addItemToListPrevious('formInputs','${id}');">
                    </div>
                </div>
                <div class="form-group flex-direction-row">
                    <fieldset>
                        <legend>Contato</legend>

                        <label>
                            <input type="radio" name="contato" value="sim" id="conattoSim${id}" required onchange="addItemToListPrevious('formInputs','${id}');">
                            SIM
                        </label>

                        <label>
                            <input type="radio" name="contato" value="nao" id="contatoNao${id}" required checked onchange="addItemToListPrevious('formInputs','${id}');">
                            NÃO
                        </label>
                    </fieldset>

                    <fieldset>
                        <legend>Envio de Inspetor</legend>

                        <label>
                            <input type="radio" name="envio" value="sim" id="envioSim${id}" required onchange="addItemToListPrevious('formInputs','${id}');">
                            SIM
                        </label>

                        <label>
                            <input type="radio" name="envio" value="nao" id="envioNao${id}" required checked onchange="addItemToListPrevious('formInputs','${id}');">
                            NÃO
                        </label>
                    </fieldset>

                </div>

                <div class="form-group flex-direction-row">
                    <div class="form-group form-group-os">
                        <label for="os${id}">Ordem de Serviço (OS) </label>
                        <input type="text" name="os" id="os${id}" onchange="addItemToListPrevious('formInputs','${id}');">
                    </div>

                    <div class="from-group">
                        <label for="exec${id}">Executada</label>
                        <select id="exec${id}" class="select no-select" name="exec" onchange="addItemToListPrevious('formInputs','${id}');">
                            <option class="no-select" value="-">-</option>
                            <option class="no-select" value="sim">SIM</option>
                            <option class="no-select" value="nao">NÃO</option>
                        <select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="obs${id}">Observaçao</label>
                    <textarea id="obs${id}" name="obs" onchange="addItemToListPrevious('formInputs','${id}');"></textarea>
                </div>

                <div class="form-actions">
                    <button type="submit">Deletar</button>    
                </div>
            </form>

        </div>

        <div class="previous listaPrevious">
            <h5 id="preVisualizacao${id}" class="no-select preVisualizacaoList">Pré-Visualização</h5>
            <p id="previous-nome${id}" class="previous-nome ${classExec}"></p>
            <p id="previous-zona${id}"></p>
            <p id="previous-horario${id}"></p>
            <p id="previous-contato${id}"></p>
            <p id="previous-envio${id}"></p>
            <p id="previous-os${id}"></p>
            <p id="previous-obs${id}"></p>
            <p id="previous-exec${id}" class="${classExec}"></p>
        </div>
    </div>
    `;
  lista_edit.insertAdjacentHTML("beforeend", codeHtml);

  const nome = document.querySelector(`#nome${id}`);
  const zona = document.querySelector(`#zona${id}`);
  const horario = document.querySelector(`#horario${id}`);
  const os = document.querySelector(`#os${id}`);
  const exec = document.querySelector(`#exec${id}`);
  const obs = document.querySelector(`#obs${id}`);
  const contatoSim = document.querySelector(`#conattoSim${id}`);
  const contatoNao = document.querySelector(`#contatoNao${id}`);
  const envioSim = document.querySelector(`#envioSim${id}`);
  const envioNao = document.querySelector(`#envioNao${id}`);

  nome.value = item.nome;
  zona.value = item.zona;
  horario.value = item.horario;
  os.value = item.os;
  exec.value = item.exec;
  obs.value = item.obs;

  if (item.contato === "sim") {
    contatoSim.checked = true;
  } else {
    contatoNao.checked = true;
  }

  if (item.envio === "sim") {
    envioSim.checked = true;
    os.disabled = false;
  } else {
    envioNao.checked = true;
    os.disabled = true;
  }

  const itemPrevious = convertFromBancoToPrevious(item);

  document.querySelectorAll(".previous").forEach((div) => {
    const elementos = div.querySelectorAll("[id]");
    elementos.forEach((el) => {
      try {
        if (el.id === `previous-nome${id}`) {
          el.innerHTML = itemPrevious.nome.modif;
        } else if (el.id === `previous-zona${id}`) {
          el.innerHTML = itemPrevious.zona.modif;
        } else if (el.id === `previous-horario${id}`) {
          el.innerHTML = itemPrevious.horario.modif;
        } else if (el.id === `previous-contato${id}`) {
          el.innerHTML = itemPrevious.contato.modif;
        } else if (el.id === `previous-envio${id}`) {
          el.innerHTML = itemPrevious.envio.modif;
        } else if (el.id === `previous-os${id}`) {
          el.innerHTML = itemPrevious.os.modif;
        } else if (el.id === `previous-exec${id}`) {
          el.innerHTML = itemPrevious.exec.modif;
        } else if (el.id === `previous-obs${id}`) {
          el.innerHTML = itemPrevious.obs.modif;
        }
      } catch (error) {
        console.error(error);
      }
    });
  });
};

const convertFromBancoToPrevious = (item) => {
  let ItemList = {};
  Object.keys(item).forEach((key) => {
    ItemList[key] = { orig: item[key], modif: "" };

    if (key === "os") {
      idOs = item[key].id;
    }
  });

  return editPrevious(ItemList);
};

const atualizarItem = async (id, novoItem) => {
  try {
    const response = await fetch(`/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(novoItem),
    });

    if (!response.ok) {
      throw new Error(`Erro ao atualizar: ${response.statusText}`);
    }
    getUser()
  } catch (error) {
    loading("open");
    setTimeout(() => {
      alert("❌ Error ao tentar atualizar item");
      console.error(`Erro: ${error}`);
      getAllOS(getAllOS_part);
      loading("close");
    }, 2000);
  }
};

const deletarItem = async (event, id, nome) => {
  event.preventDefault();

  if (!confirm(`Deseja realmente deletar o item ${nome}?`)) return;
  loading("open");

  try {
    const response = await fetch(`/delete/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Erro ao deletar: ${response.statusText}`);
    }

    const data = await response.json();
    getUser()
    console.log(data.message);
    getAllOS(getAllOS_part);
    loading("close");
    addCountItensToLogo("-");
  } catch (error) {
    setTimeout(() => {
      alert("❌ Erro em cancelar item, tente novamente !");
      console.error(`Erro: ${error}`);
      getAllOS(getAllOS_part);
      loading("close");
    }, 2000);
  }
};

const createOS = async (e) => {
  e.preventDefault();
  loading("open");
  const form = e.target;

  const os = {
    nome: form.nome.value,
    zona: form.zona.value,
    horario: form.horario.value,
    contato: form.contato.value,
    envio: form.envio.value,
    os: form.os.value,
    obs: form.obs.value,
  };

  //console.log(os)

  try {
    const response = await fetch("/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(os),
    });

    if (!response.ok) {
      throw new Error(`Erro ao tentar criar item: ${response.statusText}`);
    }

    const data = await response.json();

    alert(data.message);
    console.log(data.message);
    if (data.status === "success") form.reset();
    addItemToListPrevious("formInputs");
    loading("close");

    addCountItensToLogo("+");
  } catch (error) {
    setTimeout(() => {
      alert("❌ Erro ao tentar criar item, tente novamente !");
      console.error(`Erro: ${error}`);
      loading("close");
    });
  }
};

const salvarRelatorio = async () => {
  loading("open");
  try {
    const response = await fetch('/salvar', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dia_plantao: usuario.dia_relatorio,
        nome_plantao: usuario.plantao,
      })
    })

    const result = await response.json()

    if (result.status === 'success') copyListPrevious()
    getUser()

    alert(`${result.message}`)
    loading("close");

  } catch (err) {
    console.error(err)
    loading("close");
  }
}

const copyListPrevious = async () => {
  //loading("open");
  try {
    const response = await fetch("/getAll");
    if (!response.ok) {
      throw new Error(
        `Erro ao tentar copiar relatorio: ${response.statusText}`
      );
    }

    const result = await response.json();
    const list = result.json;

    if (list.length <= 0) {
      alert(
        "Não existe itens no relatório para serem copiados !\nRegistre ocorrências na aba TO ADD."
      );
      //loading("close");
      return;
    }

    const previous = list.map((item) => convertFromBancoToPrevious(item));
    console.log(previous);

    let textDia = ''
    try {
      const [ano, mes, dia] = usuario.dia_relatorio.split('-')
      const dataBR = `${dia}/${mes}/${ano}`;

      textDia = `do dia ${dataBR} - Plantão ${formatName.type_one(usuario.plantao)}`

    } catch (err) {
      console.error(err)
    }

    const fontSizeRest = "12pt";

    let htmlContent = "";
    let plainText = "";

    // LISTAGEM DOS REGISTROS

    htmlContent += `<h2 style="
                            font-family: 'Segoe UI', Roboto, sans-serif; 
                            font-weight: 700; 
                            font-size: 18pt; 
                            margin: 10px 0 20px;
                            color: black;
                        "> Relatório de Acionamentos de Maracanaú ${textDia}</h2>\n\n`;

    plainText += `Relatório de Acionamentos de Maracanaú ${textDia}\n\n\n`;

    previous.forEach((item) => {
      const execOrig = item.exec?.orig;

      let bgColor = "#f7f7f7";
      if (execOrig === "sim") bgColor = "#f2fff4";
      else if (execOrig === "nao") bgColor = "#fff5f5";

      const execColor =
        execOrig === "sim"
          ? "#15552a"
          : execOrig === "nao"
            ? "#661c1c"
            : "#000";

      const cardStyles = `
                background-color: ${bgColor};
                border-radius: 16px;
                padding: 20px;
                margin: 20px 5px 30px;    
                font-family: 'Segoe UI', Roboto, sans-serif;
                font-size: 15px;
                color: black;
                width: fit-content;
                min-width: 400px;
                max-width: 600px;
                line-height: 1.5;
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
            `;

      htmlContent += `<div style="${cardStyles}">`;

      const addLine = (value, fontSize = null, bold = false, color = null) => {
        if (value && value.trim()) {
          htmlContent += `<p style="
                        margin: 6px 0;
                        ${bold ? "font-weight:600;" : ""}
                        ${color ? "color:" + color + ";" : ""}
                        ${fontSize ? "font-size:" + fontSize + ";" : ""}
                        ">${value}</p>`;
          plainText += `${value.replace(/<br\s*\/?>/gi, "\n")}\n`;
        }
      };

      addLine(item.nome?.modif, "16pt", true, execColor);
      addLine(item.zona?.modif, fontSizeRest);
      addLine(item.horario?.modif, fontSizeRest);
      addLine(item.contato?.modif, fontSizeRest);
      addLine(item.envio?.modif, fontSizeRest);
      addLine(item.os?.modif, fontSizeRest);
      addLine(item.obs?.modif, fontSizeRest);
      addLine(item.exec?.modif, fontSizeRest, true, execColor);

      htmlContent += "</div>\n\n";
      plainText += "\n\n";
    });
    // QUADRO DE RESUMO INICIAL
    const resumoStyles = `
            background-color: #e8f0fe;
            border-left: 8px solid #1a73e8;
            border-radius: 12px;
            padding: 16px 20px;
            margin: 20px 5px 30px;    
            font-family: 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            color: #333;
            width: fit-content;
            min-width: 400px;
            max-width: 600px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        `;

    const executados = previous.filter((item) => item.exec?.orig === "sim");
    const nao_executados = previous.filter((item) => item.exec?.orig === "nao");
    const contato_sim = previous.filter((item) => item.contato?.orig === "sim");
    const contato_nao = previous.filter((item) => item.contato?.orig === "nao");
    const envio_sim = previous.filter((item) => item.envio?.orig === "sim");
    const envio_nao = previous.filter((item) => item.envio?.orig === "nao");

    htmlContent += `<div style="${resumoStyles}">
            <p style="margin: 0 0 6px; font-size: ${fontSizeRest};"><strong>Total de registros:</strong> ${previous.length}</p>
            <p style="margin: 0; font-size: ${fontSizeRest};"><strong>Executada: </strong> ${executados.length}</p>
            <p style="margin: 0; font-size: ${fontSizeRest};"><strong>Não Executada: </strong> ${nao_executados.length}</p>
            <p style="margin: 0; font-size: ${fontSizeRest};"><strong>Contato: </strong> ${contato_sim.length}</p>
            <p style="margin: 0; font-size: ${fontSizeRest};"><strong>Sem contato: </strong> ${contato_nao.length}</p>
            <p style="margin: 0; font-size: ${fontSizeRest};"><strong>Envio de inspetor: </strong> ${envio_sim.length}</p>
            <p style="margin: 0; font-size: ${fontSizeRest};"><strong>Sem envio de inspetor: </strong> ${envio_nao.length}</p>
        </div>\n\n`;

    plainText += `Resumo:\n`;
    plainText += `Total de registros: ${previous.length}\n`;
    plainText += `Executada: ${executados.length}\n`;
    plainText += `Não Executada: ${nao_executados.length}\n`;
    plainText += `Contato: ${contato_sim.length}\n`;
    plainText += `Sem contato: ${contato_nao.length}\n`;
    plainText += `Envio de inspetor: ${envio_sim.length}\n`;
    plainText += `Sem envio de inspetor: ${envio_nao.length}\n\n`;

    // LISTAGEM DE OS NÃO EXECUTADA RESUMIDA

    if (nao_executados.length > 0) {
      htmlContent += `<div style="margin: 10px 5px 40px; font-family: 'Segoe UI', Roboto, sans-serif;">
            <p style="font-weight: bold; margin-bottom: 8px; font-weight: 700; font-size: 18pt; ">OS não executadas:</p>
            <ul style="padding-left: 20px; margin: 0;">
        `;

      nao_executados.forEach((item) => {
        const os = item.os?.orig || "X X X X ";
        const nome = item.nome?.modif || item.nome?.orig || "X X X X X X";
        htmlContent += `<li style="margin-bottom: 4px; font-size: ${fontSizeRest};">${os} &nbsp;| ${nome}</li>`;
        plainText += `OS não executada: ${os} - ${nome}\n`;
      });

      htmlContent += `</ul></div>\n\n`;
      plainText += `\n\n`;
    }

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([htmlContent], { type: "text/html" }),
          "text/plain": new Blob([plainText], { type: "text/plain" }),
        }),
      ]);
      //alert("✅ Relatório copiada com sucesso !");
      console.log("✅ Relatório copiada com sucesso !")
      //loading("close");
    } catch (err) {
      //alert("❌ Erro ao copiar: " + err);
      console.error("❌ Erro ao copiar: " + err)
      //loading("close");
    }
  } catch (error) {
    setTimeout(() => {
      //alert("❌ Erro ao tentar copiar relatório !");
      console.log("❌ Erro ao tentar copiar relatório !")
      //loading("close");
    }, 2000);
  }
};

const limparList = async () => {
  let textSave = ''

  if (usuario.save === 'no-salvo') {
    textSave = `\n 
    ❗OBS: Identifiquei que você não salvou a lista.❗\n
    Se apertar em "OK", não vai conseguir recuperar a lista ! \n`

  } else if(usuario.save === "atualizar") {
    textSave = `\n 
    ❗OBS: Identifiquei que você atualizou a lista, mas não salvou ela.❗\n
    Se apertar em "OK", vai perder o restante da lista que você ainda não salvou ! \n`
  }

  if (!confirm(`⚠️ Tem certeza que deseja limpar lista de OS? ⚠️${textSave}`)) return;
  loading("open");

  try {
    const response = await fetch(`/deleteAll`, { method: "DELETE" });

    if (!response.ok) {
      throw new Error("Erro ao deleter lista");
    }
    const data = await response.json();

    console.log(data.message);
    const lista_edit = document.querySelector(`#lista-edit`);
    if (!lista_edit.classList.contains("display-none")) {
      getAllOS(getAllOS_part);
    }
    loading("close");
    addCountItensToLogo("clear");
    getUser()
  } catch (error) {
    setTimeout(() => {
      alert("❌ Erro ao tenter deletar lista, tente novamente !");
      console.error(`Erro: ${error}`);
      loading("close");
    }, 2000);
  }
};

const copy_aux = async (op) => {
  const nome = document.querySelector("#previous-nome");
  const zona = document.querySelector("#previous-zona");
  const horario = document.querySelector("#previous-horario");
  const os = document.querySelector("#previous-os");

  let text = "";
  switch (op) {
    case "nome":
      text = nome.textContent;
      break;
    case "zona":
    case "horario":
      text = `${zona.textContent} / ${horario.textContent}`;
      break;
    case "os":
      text = `${os.textContent} / ${zona.textContent} / ${horario.textContent}`;
      break;
    default:
      break;
  }

  try {
    await navigator.clipboard.writeText(text);
    console.log(`Copiado:\n${text}`);
  } catch (error) {
    console.error("Erro ao copiar aux");
  }
};

const scrollToBottom = () => {
  try {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  } catch (error) {
    console.error("Erro na função scrollToBottom: ", error);
  }
};

const mudarDiaRelatorio = (obj) => {
  usuario.dia_relatorio = obj.value
}

const mudarPlantao = (obj) => {
  usuario.plantao = obj.value
}
