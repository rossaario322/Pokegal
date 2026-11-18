// ===== CALCULADORA =====

// As 4 operações.
function somar(a, b) {
    return a + b;
}

function subtrair(a, b) {
    return a - b;
}

function multiplicar(a, b) {
    return a * b;
}

function dividir(a, b) {
    // sem esse if, dividir por zero daria Infinity
    if (b === 0) {
        return "Não dá para dividir por zero!";
    }
    return a / b;
}

// Callback: recebe a operação (outra função) como parâmetro.
function calcular(a, b, operacao) {
    return operacao(a, b);
}

const campoNum1 = document.getElementById("num1");
const campoNum2 = document.getElementById("num2");
const resultado = document.getElementById("resultado");

// Pega os números digitados e mostra o resultado da operação.
function mostrarResultado(operacao) {
    const a = Number(campoNum1.value);
    const b = Number(campoNum2.value);
    resultado.textContent = "Resultado: " + calcular(a, b, operacao);
}

// Um botão para cada operação (função anônima no addEventListener).
document.getElementById("btnSomar").addEventListener("click", function () {
    mostrarResultado(somar);
});

document.getElementById("btnSubtrair").addEventListener("click", function () {
    mostrarResultado(subtrair);
});

document.getElementById("btnMultiplicar").addEventListener("click", function () {
    mostrarResultado(multiplicar);
});

document.getElementById("btnDividir").addEventListener("click", function () {
    mostrarResultado(dividir);
});

// ===== FAVORITOS =====

// Favoritos salvos na página Explorar.
const favoritos = JSON.parse(localStorage.getItem("favoritosPokedex")) || [];

// Média de um array de números (arrow function).
const calcularMedia = (numeros) => {
    let soma = 0;
    numeros.forEach((numero) => {
        soma += numero;
    });
    return soma / numeros.length;
};

// Devolve só os favoritos com mais de 10 kg.
function filtrarPesados(lista) {
    return lista.filter((pokemon) => pokemon.peso > 10);
}

const mediaPeso = document.getElementById("mediaPeso");
const listaPesados = document.getElementById("listaPesados");

if (favoritos.length === 0) {
    mediaPeso.textContent = "Você ainda não tem favoritos. Marque alguns na página Explorar.";
} else {
    const pesos = favoritos.map((pokemon) => pokemon.peso);
    mediaPeso.textContent = "Peso médio dos seus " + favoritos.length + " favoritos: " + calcularMedia(pesos).toFixed(1) + " kg";

    const pesados = filtrarPesados(favoritos);

    if (pesados.length === 0) {
        listaPesados.textContent = "Nenhum favorito com mais de 10 kg.";
    }

    pesados.forEach((pokemon) => {
        const item = document.createElement("li");
        item.textContent = pokemon.nome + ": " + pokemon.peso + " kg";
        listaPesados.appendChild(item);
    });
}
