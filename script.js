// Modo escuro: liga/desliga a classe "escuro" no body e guarda a escolha no localStorage
const botaoTema = document.getElementById("botaoTema");

function aplicarTema(escuro) {
    document.body.classList.toggle("escuro", escuro);
    botaoTema.textContent = escuro ? "Modo claro" : "Modo escuro";
    localStorage.setItem("tema", escuro ? "escuro" : "claro");
}

// ao abrir a página, usa o tema que ficou salvo da última vez
aplicarTema(localStorage.getItem("tema") === "escuro");

botaoTema.addEventListener("click", function () {
    aplicarTema(!document.body.classList.contains("escuro"));
});
