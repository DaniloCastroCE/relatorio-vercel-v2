
# 📚 Guia rápido: Usando o `mongosh`

Este guia ensina o básico do **`mongosh`** — o shell interativo moderno para o MongoDB — com exemplos práticos e comandos comuns.

---

## ✅ 1️⃣ Abrir o `mongosh`

```bash
mongosh
```

Para conectar a uma base específica:

```bash
mongosh "mongodb+srv://SEU_URI"
```

---

## ✅ 2️⃣ Listar bancos de dados

```javascript
show dbs
```

---

## ✅ 3️⃣ Escolher ou criar banco

```javascript
use nomeDoBanco
```

---

## ✅ 4️⃣ Ver coleções do banco atual

```javascript
show collections
```

---

## ✅ 5️⃣ Inserir documento

```javascript
db.minhaColecao.insertOne({ nome: "Danilo", idade: 30 })
```

Múltiplos documentos:

```javascript
db.minhaColecao.insertMany([
  { nome: "Ana", idade: 25 },
  { nome: "Carlos", idade: 40 }
])
```

---

## ✅ 6️⃣ Consultar documentos

Todos:
```javascript
db.minhaColecao.find()
```

Formatado:
```javascript
db.minhaColecao.find().pretty()
```

---

## ✅ 7️⃣ Filtros de consulta

```javascript
db.minhaColecao.find({ idade: { $gt: 30 } })
```

---

## ✅ 8️⃣ Atualizar documentos

```javascript
db.minhaColecao.updateOne(
  { nome: "Danilo" },
  { $set: { idade: 31 } }
)
```

Vários:
```javascript
db.minhaColecao.updateMany(
  { ativo: true },
  { $set: { status: "verificado" } }
)
```

---

## ✅ 9️⃣ Remover documentos

Um:
```javascript
db.minhaColecao.deleteOne({ nome: "Danilo" })
```

Vários:
```javascript
db.minhaColecao.deleteMany({ ativo: false })
```

Deletar todos:
```javascript
db.minhaColecao.deleteMany({})
```

---

## ✅ 🔟 Contar documentos

```javascript
db.minhaColecao.countDocuments()
```

Com filtro:
```javascript
db.minhaColecao.countDocuments({ idade: { $gt: 30 } })
```

---

## ✅ 1️⃣1️⃣ Limpar coleções ou banco

Apagar toda uma coleção:
```javascript
db.minhaColecao.drop()
```

Apagar banco:
```javascript
db.dropDatabase()
```

---

## ✅ 1️⃣2️⃣ Ordenar resultados

```javascript
db.minhaColecao.find().sort({ idade: -1 }) // ordem decrescente
```

---

## ✅ 1️⃣3️⃣ Outros utilitários

### 🔹 Ver índice
```javascript
db.minhaColecao.getIndexes()
```

### 🔹 Criar índice
```javascript
db.minhaColecao.createIndex({ nome: 1 })
```

---

## ✅ 1️⃣4️⃣ Executar múltiplos comandos

```bash
mongosh < script.js
```

Ou com `--eval`:
```bash
mongosh --eval 'print("Oi"); printjson(db.users.find().toArray())'
```

---

## ✅ 1️⃣5️⃣ Print e Debug

Use `print()` para texto:
```javascript
print("Olá mundo")
```

Use `printjson()` para exibir documentos:
```javascript
printjson(db.minhaColecao.findOne())
```

---

## ✅ 1️⃣6️⃣ Dicas de operadores

| Operador | O que faz |
|----------|------------|
| `$gt` | Maior que |
| `$lt` | Menor que |
| `$gte` | Maior ou igual |
| `$lte` | Menor ou igual |
| `$in` | Está em uma lista |
| `$or` | OU lógico |
| `$and` | E lógico |
| `$exists` | Campo existe |
| `$size` | Tamanho do array |
| `$push` | Adiciona item a um array |
| `$pull` | Remove item de um array |

---

## ✅ 1️⃣7️⃣ Exemplos úteis

### 🔹 Remover todos documentos com array vazio
```javascript
db.minhaColecao.deleteMany({ meuArray: { $size: 0 } })
```

### 🔹 Ver estrutura de um documento
```javascript
db.minhaColecao.findOne()
```

---

## ✅ 1️⃣8️⃣ Sair do `mongosh`

```javascript
exit
```

---

## 🚀 Pronto!

Use este guia como referência rápida para comandos essenciais no `mongosh`! 🚀
