const express = require("express"); // requisicao de dependecia
const path = require("path");
const axios = require("axios");
const app = express();

async function buscarDados(endereco) {
  const apiKey = "AIzaSyBDow-0L38r53OTg4sMeJrF-NQ7En5Qhc8";
  const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${endereco}&key=${apiKey}`;

  const requisicao = await axios.get(URL);
  const requisicaoDados = await requisicao.data;
  return requisicaoDados;
}

function retirarLatLng(dados) {
  const nomeend = dados.results[0].formatted_address;
  const lat = dados.results[0].geometry.location.lat;
  const lng = dados.results[0].geometry.location.lng; // buscar de cada endereco
  return { nomeend, lat, lng };
}

function calcularDistancia(end1, end2) {
  const distancia = Math.sqrt(
    (end1.lng - end1.lat) * (end1.lng - end1.lat) +
      (end2.lng - end2.lat) * (end2.lng - end2.lat)
  );
  return distancia;
}

app.use(express.urlencoded());

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
}); // no caminho raiz retorna a pg html

app.post("/enviarenderecos", async function(req, res) {
  const enderecos = req.body.enderecos;
  const enderecosDivididos = enderecos.split(";");

  let resultadoBuscas = [];

  for (let i = 0; i < enderecosDivididos.length; i++) {
    const dados = await buscarDados(enderecosDivididos[i]);
    const dadosDetalhados = retirarLatLng(dados);
    resultadoBuscas.push(dadosDetalhados);
  }
  let listaDistancias = [];

  for (let i = 0; i < resultadoBuscas.length; i++) {
    for (let j = i + 1; j < resultadoBuscas.length; j++) {
      const distancia = calcularDistancia(
        resultadoBuscas[i],
        resultadoBuscas[j]
      );
      listaDistancias.push({
        endereco1: resultadoBuscas[i].nomeend,
        endereco2: resultadoBuscas[j].nomeend,
        distancia: distancia
      });
    }
  }

  let menorDistancia = listaDistancias[0];
  let maiorDistancia = listaDistancias[0];

  for (let i = 1; i < listaDistancias.length; i++) {
    if (listaDistancias[i].distancia < menorDistancia.distancia) {
      menorDistancia = listaDistancias[i];
    }

    if (listaDistancias[i].distancia > maiorDistancia.distancia) {
      maiorDistancia = listaDistancias[i];
    }
  }

  // Dividindo em Funções
  res.send({ menorDistancia, maiorDistancia });
});
app.listen(3000);
