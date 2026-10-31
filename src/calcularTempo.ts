/* calcular tempo de avaliação */
export default function calcularTempo(data: string) {
  const agora = new Date();
  const dataPost = new Date(data);

  const diferenca = agora.getTime() - dataPost.getTime();
  if (Number.isNaN(dataPost.getTime()) || diferenca < 0) return "agora";

  const minutos = Math.floor(diferenca / 60000);

  if (minutos < 1) {
    return "agora";
  }

  if (minutos < 60) {
    return minutos === 1 ? "1 minuto" : `${minutos} minutos`;
  }

  const horas = Math.floor(minutos / 60);

  if (horas < 24) {
    return horas === 1 ? "1 hora" : `${horas} horas`;
  }

  const dias = Math.floor(horas / 24);

  return dias === 1 ? "1 dia" : `${dias} dias`;
}
