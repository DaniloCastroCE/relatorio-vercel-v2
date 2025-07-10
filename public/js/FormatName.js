class FormatName {
  type_one(nome) {
    const preposicoes = ["de", "da", "do", "das", "dos"];
    return nome
      .toLowerCase()
      .split(" ")
      .map((palavra, index) => {
        if (preposicoes.includes(palavra) && index !== 0) {
          return palavra;
        }
        return palavra.charAt(0).toUpperCase() + palavra.slice(1);
      })
      .join(" ");
  }
}
