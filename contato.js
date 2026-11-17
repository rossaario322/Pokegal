// API usada para "enviar" a mensagem (POST). O JSONPlaceholder finge que salva, então o histórico fica guardado no localStorage.
const API_CONTATO = "https://jsonplaceholder.typicode.com/posts";
const CHAVE_MENSAGENS = "mensagensContato";

// pega as mensagens salvas no navegador, se não tiver nada começa com o array vazio.
let mensagensEnviadas = JSON.parse(localStorage.getItem(CHAVE_MENSAGENS)) || [];

// elementos do html que vamos usar.
const formulario = document.getElementById("formContato");
const campoNome = document.getElementById("campoNome");
const campoEmail = document.getElementById("campoEmail");
const campoAssunto = document.getElementById("campoAssunto");
const campoTexto = document.getElementById("campoTexto");
const contador = document.getElementById("contador");
const aviso = document.getElementById("aviso");
const listaMensagens = document.getElementById("listaMensagens");

// transforma o array em texto e salva no localStorage.
function salvarMensagens() {
    localStorage.setItem(CHAVE_MENSAGENS, JSON.stringify(mensagensEnviadas));
}

// o id de cada mensagem é o id da última + 1, se não tiver nenhuma começa no 1.
function gerarId() {
    if (mensagensEnviadas.length === 0) {
        return 1;
    }
    return mensagensEnviadas[mensagensEnviadas.length - 1].id + 1;
}

// desenha a lista de mensagens enviadas na tela.
function mostrarMensagens() {
    // limpa a lista antes, para não duplicar as mensagens.
    listaMensagens.replaceChildren();

    if (mensagensEnviadas.length === 0) {
        const vazio = document.createElement("li");
        vazio.textContent = "Nenhuma mensagem enviada ainda.";
        listaMensagens.appendChild(vazio);
        return;
    }

    mensagensEnviadas.forEach((item) => {
        const li = document.createElement("li");

        const assunto = document.createElement("strong");
        assunto.textContent = item.assunto + ": ";

        const texto = document.createElement("span");
        texto.textContent = item.texto + " (" + item.nome + ") ";

        // botão para apagar a mensagem do histórico.
        const botaoApagar = document.createElement("button");
        botaoApagar.type = "button";
        botaoApagar.classList.add("botao");
        botaoApagar.textContent = "Apagar";
        botaoApagar.addEventListener("click", () => apagarMensagem(item.id));

        li.appendChild(assunto);
        li.appendChild(texto);
        li.appendChild(botaoApagar);
        listaMensagens.appendChild(li);
    });
}

// filter cria um array novo sem a mensagem que tem esse id.
function apagarMensagem(id) {
    mensagensEnviadas = mensagensEnviadas.filter((item) => item.id !== id);
    salvarMensagens();
    mostrarMensagens();
}

// contador de caracteres: o evento input dispara a cada tecla digitada.
campoTexto.addEventListener("input", () => {
    const tamanho = campoTexto.value.length;
    contador.textContent = tamanho + "/300";

    // perto do limite o contador fica vermelho.
    if (tamanho > 250) {
        contador.style.color = "red";
    } else {
        contador.style.color = "";
    }
});

formulario.addEventListener("submit", async (event) => {
    // não deixa a página recarregar ao enviar o formulário.
    event.preventDefault();

    const novaMensagem = {
        nome: campoNome.value.trim(),
        email: campoEmail.value.trim(),
        assunto: campoAssunto.value,
        texto: campoTexto.value.trim()
    };

    if (novaMensagem.texto.length < 10) {
        aviso.textContent = "A mensagem precisa ter pelo menos 10 caracteres.";
        return;
    }

    aviso.textContent = "Enviando...";

    try {
        // POST: method, headers e o body em texto (JSON.stringify).
        const resposta = await fetch(API_CONTATO, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novaMensagem)
        });

        if (!resposta.ok) {
            throw new Error("Erro " + resposta.status);
        }

        const dados = await resposta.json();
        console.log("POST", resposta.status, dados);

        novaMensagem.id = gerarId();
        mensagensEnviadas.push(novaMensagem);
        salvarMensagens();
        mostrarMensagens();

        aviso.textContent = "Mensagem enviada! Valeu, " + novaMensagem.nome + "!";
        formulario.reset();
        contador.textContent = "0/300";
        contador.style.color = "";
    } catch (erro) {
        // mensagem para o usuário, não só no console.
        console.error(erro);
        aviso.textContent = "Não foi possível enviar a mensagem. Tente de novo.";
    }
});

mostrarMensagens();
