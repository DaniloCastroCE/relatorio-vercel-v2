
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
