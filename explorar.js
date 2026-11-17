// Constate da API e chave usada para o salvamento local dos pokemons favoritos.
const API_URL = "https://pokeapi.co/api/v2/pokemon?limit=151";
const CHAVE_FAVORITOS = "favoritosPokedex";

// Array principal que recebem os dados da API para as informações dos pokemons e variável que precuro os pokemons favoritos, se nada salvo retorna nada.
let listaDePokemon = [];
let favoritos = JSON.parse(localStorage.getItem(CHAVE_FAVORITOS)) || [];

// constantes que procuram elementos no arquivo html para referencia los.
const areaCartoes = document.getElementById("listaPokemon");
const mensagem = document.getElementById("mensagem");
const campoBusca = document.getElementById("campoBusca");
const filtroTipo = document.getElementById("filtroTipo");
const telaPokedex = document.getElementById("telaPokedex");


// async para buscar algum pokemon, para rapidez na busca na api.
async function buscarPokemon() {
    mensagem.textContent = "Carregando..."; //antes de buscar os dados essa mensagem aparece.

    //try para caso de errado alguma linha dentro dele.
    try{
        //requisição dos dados
        const resposta = await fetch(API_URL);

        //se resposta não estiver certa, volta o erro.
        if (!resposta.ok) {
            throw new Error("Erro " + resposta.status);
        }

        //lê o a resposta e converte em objeto javaScrpit e espera o corpo dele chegar. 
        const dados = await resposta.json();
        
        // dados.results só tem name e url → busca o detalhe de cada e coloca em um novo array(map).
        const promessas = dados.results.map((item) => buscarDetalhes(item.url));

        //recebe o array de promessas e devolve o array de resuladp
        listaDePokemon = await Promise.all(promessas);

        //com dados prontos, chama para desenhar os cartões.
        mostrarCartoes(listaDePokemon);
    } catch (erro) {
        // Mensagem para o USUÁRIO, não só no console
        mensagem.textContent = "Não foi possível carregar os Pokémon. Tente recarregar a página.";
    }
}

//recebe parâmetro url para o endereço do pokémon.
async function buscarDetalhes(url) {
    //mesma lógica anterior, faz o get, confere e transforma em objeto.
    const resposta = await fetch(url);
    if (!resposta.ok) {
        throw new Error("Erro " + resposta.status);
    }
    const dados = await resposta.json();

    //aqui retorna um objeto com as especificações do pokemon escolhido, com nome, imagem, sprite, tipos, altura, peso e os status.
    return {
        id: dados.id,
        nome: dados.name,
        imagem: dados.sprites.other["official-artwork"].front_default,
        sprite: dados.sprites.front_default,
        tipos: dados.types.map((t) => t.type.name),
        altura: dados.height / 10, // decímetros → metros
        peso: dados.weight / 10,   // hectogramas → kg

        //Na API, stats vem como [{ base_stat: 35, stat: { name: "hp" } }, ...]. O '.map' transforma cada item em { nome: "hp", valor: 35 }.
        status: dados.stats.map((s) => ({ nome: s.stat.name, valor: s.base_stat }))
    };

}

//Recebe um array como parâmetro. Pode ser a lista completa ou a filtrada pela busca
function mostrarCartoes(lista) {

    //Remove todos os filhos da área de cartões. Sem isso, cada busca adicionaria cartões por cima dos antigos e a lista ficaria duplicada.
    areaCartoes.replaceChildren();

    //confere se a lista de pokemons esta vazia, se sim mostra um aviso, se não limpa a mensagem apagando o “Carregando...” ou alguma mensagem anterior
    if(lista.length === 0) {
        mensagem.textContent = "Nenhum Pokémon encontrado.";
        return;
    }
    mensagem.textContent = "";

    //percorre o array e executa a função uma vez para cada item. Em cada volta, pokemon é um dos objetos criados em buscarDetalhes.
    lista.forEach((pokemon) => {

        // cria uma tag <article> na memória. Ela ainda não aparece na tela. E adiciona a classe CSS, e o resultado fica <article class="cartao">. O estilo do .cartao no style.css passa a valer.
        const cartao = document.createElement("article");
        cartao.classList.add("cartao");

        //pega o endereço da imagem e o texto alternativo da imagem.
        const figura = document.createElement("figure");
        const imagem = document.createElement("img");
        imagem.src = pokemon.imagem;
        imagem.alt = "Ilustração do Pokémon " + pokemon.nome;

        //converte o número 25 em texto "25". O padStart só existe em strings. E completa com zeros à esquerda até ter 3 caracteres.
        const legenda = document.createElement("figcaption");
        legenda.textContent = "#" + String(pokemon.id).padStart(3, "0") + " " + pokemon.nome;

        //coloca um elemento dentro de outro, como último filho. A estrutura fica <figure><img><figcaption></figure>.
        figura.appendChild(imagem);
        figura.appendChild(legenda);

        //junta os itens do array numa string, com o separador escolhido: ["grass", "poison"] → "grass / poison".
        const tipos = document.createElement("p");
        tipos.textContent = "Tipo: " + pokemon.tipos.join(" / ");

        //Cria um <button> de verdade, nunca uma div clicável. type = "button" deixa explícito que ele não envia formulário. O padrão de um <button> é submit.
        const botaoVer = document.createElement("button");
        botaoVer.type = "button";
        botaoVer.classList.add("botao");
        botaoVer.textContent = "Ver na Pokédex";

        //evento para quando clicar no botão realizar a função de monstrar o pokemon
        botaoVer.addEventListener("click", () => mostrarNaPokedex(pokemon));

        //cria um botão de favoritos e atualizar ele.
        const botaoFavorito = document.createElement("button");
        botaoFavorito.type = "button";
        botaoFavorito.classList.add("botao", "botao-favorito");
        atualizarBotaoFavorito(botaoFavorito, pokemon.id);

        //ao clicar adiciona ou remove dois favoritos e salva, depois atualiza a aparência do botão.
        botaoFavorito.addEventListener("click", () => {
            alternarFavorito(pokemon);
            atualizarBotaoFavorito(botaoFavorito, pokemon.id);
        });

        //Monta o cartão com as peças. A última linha coloca o cartão dentro da <section> que já está na página, e só nesse momento ele aparece na tela.
        cartao.appendChild(figura);
        cartao.appendChild(tipos);
        cartao.appendChild(botaoVer);
        cartao.appendChild(botaoFavorito);
        areaCartoes.appendChild(cartao);
    });
}

//cria uma função para aplicar filtros
function aplicarFiltros() {
    //lê o que o usuário digitou, removendo os espaços e convertendo para minúsculas.
    const termo = campoBusca.value.trim().toLowerCase();

    //value da <option> selecionada, ex.: "fire" ou "todos"
    const tipo = filtroTipo.value;

    //percorre um array e cria um novo só com os itens que vão retornar
    const resultado = listaDePokemon.filter((pokemon) => {
        //includes numa string pergunta: “o nome contém esse trecho?”. "pikachu".includes("chu") → true. Se algum termo foir vazio retorna todos do mesmo jeito.
        const nomeBate = pokemon.nome.includes(termo);

        //Passa se “todos” estiver selecionado OU se o array de tipos do Pokémon contiver o tipo escolhido.
        const tipoBate = tipo === "todos" || pokemon.tipos.includes(tipo);

        //O Pokémon só aparece se bater no nome e no tipo.
        return nomeBate && tipoBate;
    });

    //redesenha a tela só com os Pokémon que passaram no filtro.
    mostrarCartoes(resultado);
}

//eventos ficam FORA da função: input dispara a cada tecla e change ao trocar o tipo.
campoBusca.addEventListener("input", aplicarFiltros);
filtroTipo.addEventListener("change", aplicarFiltros);

//.find devolve o primeiro item que satisfaz a condição. Se nenhum satisfizer, devolve undefined.!== undefined converte isso em true ou false: “encontrou alguém com esse id?”.
function ehFavorito(id) {
    return favoritos.find((f) => f.id === id) !== undefined;
}

function alternarFavorito(pokemon) {
    const posicao = favoritos.findIndex((f) => f.id === pokemon.id);

    //Se o Pokémon não estava nos favoritos, push adiciona um objeto no fim do array. Vocês salvam só id, nome, peso e altura, que é o suficiente para a página Ferramentas calcular médias.
    if (posicao === -1) {
        favoritos.push({ id: pokemon.id, nome: pokemon.nome, peso: pokemon.peso, altura: pokemon.altura });
    } else {
        //remove 1 item a partir daquela posição. É o “desmarcar”.
        favoritos.splice(posicao, 1);
    }

    //Salva os dados no navegador e transforma array em texto no armazenamento local.
    localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(favoritos));
}

function atualizarBotaoFavorito(botao, id) {
    //cria tipo um if/else em uma linha: se marcado, usa “★ Favorito”, senão “☆ Favoritar”. classList.toggle("marcado", marcado) com o segundo parâmetro força o estado: true adiciona a classe e false remove. No CSS, .botao-favorito.marcado pode ficar amarelo, por exemplo. Isso cumpre o “classList para favorito marcado
    const marcado = ehFavorito(id);
    botao.textContent = marcado ? "★ Favorito" : "☆ Favoritar";
    botao.classList.toggle("marcado", marcado);
}

//Mostra o Pokémon escolhido na tela verde da Pokédex.
function mostrarNaPokedex(pokemon) {

    //Limpa a tela verde para tirar o Pokémon anterior.
    telaPokedex.replaceChildren();

    //O título é h3 porque está dentro do <aside>, que tem um h2 (“Pokédex”), que fica dentro da página com o h1. A ordem dos títulos é respeitada.
    const titulo = document.createElement("h3");
    titulo.textContent = "#" + String(pokemon.id).padStart(3, "0") + " " + pokemon.nome;

    //Usa o sprite pixelado. A classe .sprite aplica image-rendering: pixelated no CSS, que deixa os pixels nítidos ao ampliar.
    const sprite = document.createElement("img");
    sprite.src = pokemon.sprite;
    sprite.alt = "Sprite do Pokémon " + pokemon.nome;
    sprite.classList.add("sprite");

    //Cria o parágrafo das medidas, já convertidas, e insere as três peças na tela.
    const medidas = document.createElement("p");
    medidas.textContent = "Altura: " + pokemon.altura + " m | Peso: " + pokemon.peso + " kg";

    telaPokedex.appendChild(titulo);
    telaPokedex.appendChild(sprite);
    telaPokedex.appendChild(medidas);

    //Para cada status (hp, attack, defense, special-attack, special-defense, speed), cria um texto e uma barra. <progress> é uma barra nativa do HTML. max = 255 porque esse é o maior valor base possível nos jogos. value define o quanto ela fica cheia. Dá o efeito visual de barras sem precisar de style="".
    pokemon.status.forEach((item) => {
        const rotulo = document.createElement("label");
        rotulo.textContent = item.nome + ": " + item.valor;
        const barra = document.createElement("progress");
        barra.max = 255;
        barra.value = item.valor;
        telaPokedex.appendChild(rotulo);
        telaPokedex.appendChild(barra);
    });
}

buscarPokemon();