
# 📚 Guia Rápido MongoDB

## ✅ O que é MongoDB
- **MongoDB** é um banco de dados **NoSQL**, orientado a documentos, que armazena dados em formato **JSON/BSON**.
- É ótimo para trabalhar com dados flexíveis, escaláveis e sem esquema fixo.

## ⚙️ Principais comandos do MongoDB

> Você pode usar estes comandos no **Mongo Shell**, **mongosh** ou em scripts Node.js (via `mongoose` ou `mongodb` driver).

### 🔹 1. Verificar se o MongoDB está instalado e ver versão

**No terminal:**
```bash
mongod --version
# ou
mongosh --version
```

**No shell conectado:**
```js
db.version()
```

### 🔹 2. Erro comum: ECONNREFUSED

Se ao rodar `mongosh` você ver:
```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

**Significa que o servidor MongoDB (`mongod`) não está rodando.**

👉 **Solução:**
- Verificar se está rodando:
  ```bash
  ps aux | grep mongod
  ```
- Iniciar o serviço (Ubuntu/Linux):
  ```bash
  sudo systemctl start mongod
  sudo systemctl status mongod
  sudo systemctl enable mongod
  ```
- Ou iniciar manualmente:
  ```bash
  mongod --config /etc/mongod.conf
  ```

Depois, execute `mongosh` novamente.

### 🔹 3. Conectar
```bash
mongosh
# ou conectar a um cluster Atlas
mongosh "mongodb+srv://<username>:<password>@<cluster-url>/"
```

### 🔹 4. Mostrar bancos de dados
```js
show dbs
```

### 🔹 5. Criar banco de dados
Mongo cria o banco quando você insere algo nele:
```js
use minhaBaseDeDados
```

### 🔹 6. Mostrar coleções
```js
show collections
# ou
db.getCollectionNames()
```

### 🔹 7. Criar coleção
```js
db.createCollection("usuarios")
```

### 🔹 8. Inserir documentos
**Um único documento:**
```js
db.usuarios.insertOne({
  nome: "Danilo",
  idade: 30,
  ativo: true
})
```

**Vários documentos:**
```js
db.usuarios.insertMany([
  { nome: "Maria", idade: 25 },
  { nome: "João", idade: 40 }
])
```

### 🔹 9. Buscar documentos
```js
db.usuarios.find()
```

**Filtrar:**
```js
db.usuarios.find({ nome: "Danilo" })
```

### 🔹 10. Atualizar documentos
**Um documento:**
```js
db.usuarios.updateOne(
  { nome: "Danilo" },
  { $set: { idade: 31 } }
)
```

**Vários documentos:**
```js
db.usuarios.updateMany(
  { ativo: true },
  { $set: { status: "ativo" } }
)
```

### 🔹 11. Deletar documentos
**Um documento:**
```js
db.usuarios.deleteOne({ nome: "Danilo" })
```

**Vários documentos:**
```js
db.usuarios.deleteMany({ ativo: false })
```

### 🔹 12. Deletar várias coleções escolhidas
```js
db.collection1.drop()
db.collection2.drop()
db.collection3.drop()
```
Ou programaticamente:
```js
["colecao1", "colecao2", "colecao3"].forEach(function(nome) {
  db[nome].drop();
});
```

### 🔹 13. Ordenar resultados
```js
db.usuarios.find().sort({ idade: -1 })
```

### 🔹 14. Contar documentos
```js
db.usuarios.countDocuments()
```

### 🔹 15. Indexar
```js
db.usuarios.createIndex({ nome: 1 })
```

### 🔹 16. Ver estatísticas
```js
db.stats()
```

### 🔹 17. Drop database
```js
db.dropDatabase()
```

### 🔹 18. Remover item de um array (`$pull`)

**Exemplo:**
```js
db.temps.updateOne(
  { _id: ObjectId("64e123abc123abc123abc123") },
  { $pull: { itens: ObjectId("64e456def456def456def456") } }
)
```
> **Descrição:** Remove do array `itens` o valor igual ao `ObjectId` informado.

---

### 🔹 19. `$push` - Adicionar item a um array

```js
db.temps.updateOne(
  { _id: ObjectId("64e123abc123abc123abc123") },
  { $push: { itens: ObjectId("64e789ghi789ghi789ghi789") } }
)
```
> **Descrição:** Adiciona um novo valor ao final do array `itens`.

---

### 🔹 20. `$addToSet` - Adicionar item **sem duplicar**

```js
db.temps.updateOne(
  { _id: ObjectId("64e123abc123abc123abc123") },
  { $addToSet: { itens: ObjectId("64e789ghi789ghi789ghi789") } }
)
```
> **Descrição:** Adiciona o valor **somente se ele não existir** no array.

---

### 🔹 21. `$unset` - Remover campo

```js
db.usuarios.updateOne(
  { nome: "Danilo" },
  { $unset: { idade: "" } }
)
```
> **Descrição:** Remove o campo `idade` do documento.

---

### 🔹 22. `$inc` - Incrementar valor

```js
db.usuarios.updateOne(
  { nome: "Danilo" },
  { $inc: { idade: 1 } }
)
```
> **Descrição:** Incrementa o campo `idade` em +1.

---

### 🔹 23. `$rename` - Renomear campo

```js
db.usuarios.updateOne(
  { nome: "Danilo" },
  { $rename: { "idade": "anos" } }
)
```
> **Descrição:** Renomeia o campo `idade` para `anos`.

---

### 🔹 24. `$set` com `updateOne` - Atualizar campo

```js
db.usuarios.updateOne(
  { nome: "Danilo" },
  { $set: { ativo: false } }
)
```
> **Descrição:** Atualiza (ou cria) o campo `ativo` com o valor `false`.

---

### 🔹 25. Excluir campo de todos os documentos

```js
db.usuarios.updateMany(
  {},
  { $unset: { idade: "" } }
)
```
> **Descrição:** Remove o campo `idade` de todos os documentos na coleção.


### 🔹 26. Exemplos práticos do `deleteMany`

**Deletar por status:**  
```js
db.usuarios.deleteMany({ status: "inativo" })
```  
> Apaga todos os usuários com `status` igual a `"inativo"`.

---

**Deletar por data (antes de uma data específica):**  
```js
db.logs.deleteMany({ createdAt: { $lt: new Date("2024-01-01") } })
```  
> Remove todos os logs criados antes de 1º de janeiro de 2024.

---

**Deletar por múltiplos filtros:**  
```js
db.pedidos.deleteMany({ status: "cancelado", pago: false })
```  
> Remove pedidos cancelados e não pagos.

---

**Deletar onde campo é `null`:**  
```js
db.usuarios.deleteMany({ email: null })
```  
> Remove usuários sem email cadastrado.

---

**Deletar documentos sem campo (`$exists`):**  
```js
db.produtos.deleteMany({ preco: { $exists: false } })
```  
> Remove produtos que não têm o campo `preco`.

---

**Deletar usando regex:**  
```js
db.usuarios.deleteMany({ email: /@teste\.com$/ })
```  
> Remove usuários com email terminando em `@teste.com`.

---

**Deletar todos (zerar a coleção):**  
```js
db.usuarios.deleteMany({})
```  
> Remove todos os documentos, mantendo a coleção vazia.

## 🔗 Links úteis
- 📘 **Documentação Oficial:**  
  [https://www.mongodb.com/docs/](https://www.mongodb.com/docs/)

- 🇧🇷 **Documentação em Português (não oficial):**  
  [https://www.mongodb.com/pt-br](https://www.mongodb.com/pt-br)

- 📌 **Guia do MongoDB Atlas:**  
  [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

- 💡 **Comandos MongoDB resumidos:**  
  [https://docs.mongodb.com/manual/reference/command/](https://docs.mongodb.com/manual/reference/command/)

## 🚀 Dicas finais
✅ Use o MongoDB Atlas para ter um cluster gratuito.  
✅ Faça **backups regulares**.  
✅ Evite esquemas muito soltos para não virar bagunça.  
✅ Use `mongoose` se estiver em projetos **Node.js**.
