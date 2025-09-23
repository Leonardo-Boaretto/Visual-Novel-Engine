# Visual Novel Engine Focada em JSON

Uma engine de Visual Novel minimalista e poderosa, criada para ser 100% controlada por um único arquivo `JSON`. A ideia central é separar completamente a lógica da história, permitindo que escritores e desenvolvedores criem narrativas complexas sem precisar alterar o código-fonte (HTML, CSS, JS).

\---

## ✨ Funcionalidades Principais

  * **📖 História Guiada por JSON:** Toda a campanha, personagens, diálogos, escolhas e ramificações são definidos no arquivo `historia.json`.
  * **🧠 Lógica de Ramificação Avançada:** Crie escolhas que levam a destinos diferentes com base no relacionamento do jogador ou nos itens que ele possui.
  * **❤️ Sistema de Relacionamento:** Acompanhe os pontos de relacionamento com diferentes personagens para desbloquear cenas ou finais secretos.
  * **🎒 Sistema de Inventário Simples:** O jogador pode coletar itens que podem ser usados como requisitos para certas escolhas (lógica pronta, basta adicionar itens ao JSON).
  * **💾 Salvar e Carregar:** Permite que os jogadores salvem seu progresso no armazenamento local do navegador e continuem de onde pararam.
  * **📜 Histórico de Diálogos:** Os jogadores podem rever as conversas passadas a qualquer momento.
  * **🎨 Customizável:** A aparência da engine pode ser completamente alterada através do arquivo `estilos.css`.
  * **🎭 Sprites de Personagens e 🎵 Música de Fundo:** Defina imagens para os personagens e trilhas sonoras para cada cena, tudo via JSON.
  * **🎬 Efeito de Digitação:** Diálogos animados para uma experiência mais imersiva.

## 🔧 Estrutura do Projeto

O projeto é composto por quatro arquivos principais:

  * `index.html`: A estrutura base da página. Geralmente, você não precisará editá-lo.
  * `estilos.css`: O arquivo de estilização. Edite-o para mudar cores, fontes, animações e o layout geral da sua Visual Novel.
  * `roteiro.js`: O coração da engine. Ele lê o arquivo JSON e controla toda a lógica do jogo. Você não precisa mexer aqui para criar sua história.
  * `historia.json`: **Este é o arquivo mais importante.** É aqui que você vai escrever sua história, criar os personagens, diálogos e escolhas.

## 🚀 Como Usar

1.  **Baixe o Projeto:** Clone ou faça o download deste repositório.
2.  **Edite a História:** Abra o arquivo `historia.json` e comece a criar sua narrativa. Use o guia abaixo como referência completa.
3.  **Adicione seus Recursos:** Coloque suas imagens de fundo, sprites de personagens e arquivos de música na mesma pasta ou forneça links para eles no JSON.
4.  **Abra no Navegador:** Abra o arquivo `index.html` em qualquer navegador moderno para jogar e testar sua criação.

## 📖 O Guia Definitivo do `historia.json`

Este arquivo é o roteiro do seu jogo. Ele é dividido em seções principais que trabalham juntas.

### Estrutura Raiz

```json
{
  "nomeCampanha": "O Título da Sua História",
  "personagens": [ ... ],
  "cenarios": [ ... ],
  "itens": [ ... ],
  "pontosRelacionamento": { ... },
  "cenas": [ ... ]
}
```

  * `nomeCampanha`: O título que aparece na tela inicial.
  * `personagens`: Um array onde você cadastra todos os personagens.
  * `itens`: Um array para cadastrar os itens do seu jogo (atualmente não usado na história de exemplo, mas a lógica está pronta).
  * `pontosRelacionamento`: Um objeto para definir os personagens com quem o jogador pode ter um relacionamento e seus pontos iniciais.
  * `cenarios`: Um array para cadastrar todos os cenários (planos de fundo) do seu jogo.
  * `cenas`: O array que contém cada passo da sua história.

-----

### O Objeto `personagens`

Aqui você centraliza as informações de cada personagem.

```json
"personagens": [
  { "nome": "Narrador" },
  { "nome": "Pato de Topete", "imagem": "https://www.serebii.net/pokemon/art/912.png" },
  { "nome": "Pato de Óculos", "imagem": "https://i.pinimg.com/originals/76/17/33/761733cb0e649b2bfc60198c7fff3dc5.png" }
]
```

  * `nome`: O nome do personagem. **Importante:** Este nome deve ser exatamente o mesmo usado nas cenas e no sistema de relacionamento.
  * `imagem`: (Opcional) O link (URL) ou caminho local para a imagem (sprite) do personagem. A engine buscará essa imagem sempre que o personagem falar.

-----

### O Objeto `cenarios` 

Para organizar melhor seus recursos visuais, você pode pré-cadastrar todos os seus cenários aqui.

```json
"cenarios": [
  { "id": "sala_de_aula", "imagem": "https://i.imgur.com/link_para_sua_imagem.jpeg" },
  { "id": "corredor", "imagem": "https://i.imgur.com/outro_link.jpeg" }
]
```

  * `id`: Um nome **único** para identificar o cenário.
  * `imagem`: O link (URL) ou caminho local para a imagem de fundo.

-----

### O Objeto `cenas`

Cada objeto neste array é uma "página" da sua história.

```json
"cenas": [
  {
    "id": 1,
    "cenario": "sala_de_aula",
    "musicaFundo": "musica_calma.mp3",
    "personagem": "Pato de Topete",
    "personagemSecundario": "Pato de Óculos",
    "dialogo": "Este é o texto que o personagem vai dizer.",
    "escolhas": [ ... ],
    "fimDeJogo": false
  }
]
```

  * `id`: Um número **único** para identificar a cena.
  * `cenario`: (Opcional) O `id` do cenário a ser exibido, conforme cadastrado na seção `cenarios`.
  * `musicaFundo`: (Opcional) O caminho para o arquivo de áudio que tocará durante a cena.
  * `personagem`: O nome do personagem principal que está falando. Ele aparecerá em destaque.
  * `personagemSecundario`: (Opcional) O nome de um segundo personagem na cena. Ele aparecerá na direita, com uma leve opacidade para indicar que não é o foco.
  * `dialogo`: O texto que será exibido na caixa de diálogo.
  * `escolhas`: Um array de objetos, onde cada objeto é uma opção para o jogador.
  * `fimDeJogo`: (Opcional) Se definido como `true`, o jogo termina aqui e exibe um botão para "Jogar Novamente".

-----

### Anatomia de uma `escolha`

As escolhas são a parte mais poderosa da engine. Existem 3 tipos principais de escolhas.

#### 1\. Escolha Simples

A forma mais básica: um texto que leva a uma próxima cena.

```json
"escolhas": [
  { "texto": "Continuar...", "proximaCena": 2 }
]
```

  * `texto`: O que aparece no botão de escolha.
  * `proximaCena`: O `id` da cena para a qual o jogo deve pular.

#### 2\. Escolha com Requisito (Sucesso ou Falha)

Essa escolha leva a um destino se o jogador cumprir um requisito, ou a uma "cena de rejeição" se não cumprir.

```json
"escolhas": [
  {
    "texto": "Votar no Pato de Topete",
    "proximaCena": 8,
    "requisitoRelacionamento": {
      "personagem": "Pato de Topete",
      "pontos": 2,
      "cenaRejeicao": 9
    }
  }
]
```

  * `requisitoRelacionamento`:
      * `personagem`: O personagem cujo relacionamento será verificado.
      * `pontos`: O número mínimo de pontos necessários.
      * `cenaRejeicao`: O `id` da cena para onde o jogador é enviado se **não** tiver os pontos necessários.

#### 3\. Escolha com Ramificação (Múltiplos Destinos)

Esta é a lógica mais avançada. A mesma escolha pode levar a vários lugares diferentes, com base em uma lista de condições. A engine testa as condições na ordem em que aparecem e usa a primeira que for verdadeira.

```json
"escolhas": [
  {
    "texto": "Correr para o banheiro!",
    "ramificacoes": [
      { "tipo": "relacionamento", "personagem": "Pato de Topete", "pontos": 2, "proximaCena": 13 },
      { "tipo": "item", "item": "Passe VIP", "proximaCena": 14 }
    ],
    "proximaCenaPadrao": 12
  }
]
```

  * `ramificacoes`: Um array de condições.
      * `tipo`: O tipo de verificação. Pode ser `"relacionamento"` ou `"item"`.
      * **Se `tipo` for `"relacionamento"`:**
          * `personagem`: O personagem a ser verificado.
          * `pontos`: O mínimo de pontos necessários.
      * **Se `tipo` for `"item"`:**
          * `item`: O nome do item que o jogador precisa ter no inventário.
      * `proximaCena`: O `id` da cena para onde ir se **esta condição específica for verdadeira**.
  * `proximaCenaPadrao`: O `id` da cena para onde ir se **nenhuma das condições** em `ramificacoes` for atendida.

> **Dica:** Você também pode adicionar um objeto `ganhoRelacionamento` a qualquer escolha para dar pontos ao jogador quando ele a selecionar. Ex: `"ganhoRelacionamento": { "Pato de Óculos": 1 }`

## 🎨 Customização Avançada

Quer deixar a Visual Novel com a sua cara? Abra o arquivo `estilos.css`. Dentro dele, você encontrará variáveis e seletores bem documentados para alterar:

  * Cores primárias (`--cor-primaria`)
  * Fontes (`--fonte-titulo`, `--fonte-corpo`)
  * Estilos da caixa de diálogo (`#caixa-dialogo`)
  * Aparência dos botões (`.botao-escolha`)

Sinta-se livre para experimentar e adaptar o visual ao tema da sua história.

## 🤝 Como Contribuir

Contribuições são sempre bem-vindas\! Se você tem uma ideia para uma nova funcionalidade ou encontrou um bug:

1.  Faça um **Fork** do repositório.
2.  Crie uma nova **Branch** (`git checkout -b feature/nova-funcionalidade`).
3.  Faça suas alterações e **Commit** (`git commit -m 'Adiciona nova funcionalidade'`).
4.  Faça o **Push** para a Branch (`git push origin feature/nova-funcionalidade`).
5.  Abra um **Pull Request**.

