const setDateNowInputBrazil = () => {
  const now = new Date();
  const options = {
    timeZone: 'America/Fortaleza',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };

  const formatter = new Intl.DateTimeFormat('pt-BR', options);
  const [day, month, year] = formatter.format(now).split('/');

  const dataFortaleza = `${year}-${month}-${day}`;
  console.log(dataFortaleza)
  return dataFortaleza;
}

module.exports = {
  setDateNowInputBrazil
}