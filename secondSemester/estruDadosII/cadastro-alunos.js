const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const filaLinhas = [];
const filaEspera = [];

rl.on("line", (linha) => {
  if (filaEspera.length > 0) {
    filaEspera.shift()(linha);
  } else {
    filaLinhas.push(linha);
  }
});

function perguntar(pergunta) {
  process.stdout.write(pergunta);
  return new Promise((resolve) => {
    if (filaLinhas.length > 0) {
      resolve(filaLinhas.shift());
    } else {
      filaEspera.push(resolve);
    }
  });
}

let alunos = [];


// REGRA DE NEGÓCIO

function calcularResultado(media) {
  return media >= 6.0 ? "Aprovado" : "Reprovado";
}


// BUSCA SEQUENCIAL - usada para checar RA duplicado no cadastro

function buscaSequencial(lista, ra) {
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].ra === ra) return i;
  }
  return -1;
}


// BUSCA BINÁRIA - exige lista previamente ordenada por RA

function buscaBinaria(listaOrdenadaPorRA, ra) {
  let inicio = 0;
  let fim = listaOrdenadaPorRA.length - 1;

  while (inicio <= fim) {
    const meio = Math.floor((inicio + fim) / 2);
    if (listaOrdenadaPorRA[meio].ra === ra) {
      return meio;
    } else if (listaOrdenadaPorRA[meio].ra < ra) {
      inicio = meio + 1;
    } else {
      fim = meio - 1;
    }
  }
  return -1;
}


// ALGORITMOS DE ORDENAÇÃO

// Bubble Sort

function bubbleSort(lista, comparar) {
  const arr = [...lista];
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      if (comparar(arr[j], arr[j + 1]) > 0) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}

// Selection Sort

function selectionSort(lista, comparar) {
  const arr = [...lista];
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let indiceEscolhido = i;
    for (let j = i + 1; j < n; j++) {
      if (comparar(arr[j], arr[indiceEscolhido]) < 0) {
        indiceEscolhido = j;
      }
    }
    if (indiceEscolhido !== i) {
      const temp = arr[i];
      arr[i] = arr[indiceEscolhido];
      arr[indiceEscolhido] = temp;
    }
  }
  return arr;
}

// Merge Sort
function mergeSort(lista, comparar) {
  if (lista.length <= 1) return lista;

  const meio = Math.floor(lista.length / 2);
  const esquerda = mergeSort(lista.slice(0, meio), comparar);
  const direita = mergeSort(lista.slice(meio), comparar);

  return intercalar(esquerda, direita, comparar);
}

function intercalar(esquerda, direita, comparar) {
  const resultado = [];
  let i = 0;
  let j = 0;

  while (i < esquerda.length && j < direita.length) {
    if (comparar(esquerda[i], direita[j]) <= 0) {
      resultado.push(esquerda[i++]);
    } else {
      resultado.push(direita[j++]);
    }
  }
  while (i < esquerda.length) resultado.push(esquerda[i++]);
  while (j < direita.length) resultado.push(direita[j++]);

  return resultado;
}

// Funções de comparação
const comparaNomeAsc = (a, b) => a.nome.localeCompare(b.nome, "pt-BR");
const comparaRAAsc = (a, b) => (a.ra < b.ra ? -1 : a.ra > b.ra ? 1 : 0);
const comparaRADesc = (a, b) => comparaRAAsc(b, a);

// CADASTRO DE ALUNOS

async function cadastrarAluno() {
  console.log("\n=== Cadastro de Aluno ===");

  const nome = (await perguntar("Nome: ")).trim();

  let ra = (await perguntar("RA: ")).trim();
  if (buscaSequencial(alunos, ra) !== -1) {
    console.log(`>> RA "${ra}" já cadastrado. Cadastro cancelado.\n`);
    return;
  }

  const idade = parseInt(await perguntar("Idade: "), 10);
  const sexo = (await perguntar("Sexo (M/F): ")).trim().toUpperCase();
  const mediaTexto = (await perguntar("Média (0 a 10): ")).replace(",", ".");
  const media = parseFloat(mediaTexto);

  if (!nome || !ra || isNaN(idade) || isNaN(media)) {
    console.log(">> Dados inválidos. Cadastro cancelado.\n");
    return;
  }

  const aluno = {
    nome,
    ra,
    idade,
    sexo,
    media,
    resultado: calcularResultado(media),
  };

  alunos.push(aluno);
  console.log(`>> Aluno "${aluno.nome}" cadastrado com sucesso!\n`);
}

// RELATÓRIOS

function exibirRelatorio(titulo, lista) {
  console.log(`\n===== ${titulo} =====`);
  if (lista.length === 0) {
    console.log("Nenhum aluno encontrado.\n");
    return;
  }
  lista.forEach((aluno, idx) => {
    console.log(`\nAluno ${idx + 1}`);
    console.log(`Nome......: ${aluno.nome}`);
    console.log(`RA........: ${aluno.ra}`);
    console.log(`Idade.....: ${aluno.idade}`);
    console.log(`Sexo......: ${aluno.sexo}`);
    console.log(`Média.....: ${aluno.media.toFixed(1)}`);
    console.log(`Resultado.: ${aluno.resultado}`);
  });
  console.log("");
}

function relatorioNomeCrescente() {
  const ordenado = mergeSort(alunos, comparaNomeAsc);
  exibirRelatorio("Relatório de Alunos - Nome Crescente (Merge Sort)", ordenado);
}

function relatorioRADecrescente() {
  const ordenado = selectionSort(alunos, comparaRADesc);
  exibirRelatorio("Relatório de Alunos - RA Decrescente (Selection Sort)", ordenado);
}

function relatorioAprovadosNomeCrescente() {
  const aprovados = alunos.filter((a) => a.resultado === "Aprovado");
  const ordenado = bubbleSort(aprovados, comparaNomeAsc);
  exibirRelatorio(
    "Relatório de Alunos Aprovados - Nome Crescente (Bubble Sort)",
    ordenado
  );
}

async function buscarAlunoPorRA() {
  if (alunos.length === 0) {
    console.log("\nNenhum aluno cadastrado.\n");
    return;
  }
  const ra = (await perguntar("\nDigite o RA a ser buscado: ")).trim();
  const ordenadoPorRA = mergeSort(alunos, comparaRAAsc);
  const indice = buscaBinaria(ordenadoPorRA, ra);

  if (indice === -1) {
    console.log(`>> Aluno com RA "${ra}" não encontrado.\n`);
  } else {
    exibirRelatorio("Aluno Encontrado (Busca Binária)", [ordenadoPorRA[indice]]);
  }
}

// MENU PRINCIPAL

async function menu() {
  let opcao;
  do {
    console.log("=================================================");
    console.log(" CADASTRO DE ALUNOS - FACULDADE");
    console.log("=================================================");
    console.log("1 - Cadastrar Alunos");
    console.log("2 - Relatório de Alunos em ordem crescente por Nome");
    console.log("3 - Relatório de Alunos em ordem decrescente por RA");
    console.log("4 - Relatório de Alunos Aprovados em ordem crescente por Nome");
    console.log("5 - Buscar Aluno por RA (Busca Binária)");
    console.log("0 - Sair");
    console.log("=================================================");

    opcao = (await perguntar("Escolha uma opção: ")).trim();

    switch (opcao) {
      case "1":
        await cadastrarAluno();
        break;
      case "2":
        relatorioNomeCrescente();
        break;
      case "3":
        relatorioRADecrescente();
        break;
      case "4":
        relatorioAprovadosNomeCrescente();
        break;
      case "5":
        await buscarAlunoPorRA();
        break;
      case "0":
        console.log("\nEncerrando o programa...");
        break;
      default:
        console.log(">> Opção inválida!\n");
    }
  } while (opcao !== "0");

  rl.close();
}

menu();
