// --- Seletores de Elementos do DOM ---
const containerJogo = document.getElementById('container-jogo');
const telaInicial = document.getElementById('tela-inicial');
const tituloCampanha = document.getElementById('titulo-campanha');
const botaoIniciar = document.getElementById('botao-iniciar');
const botaoCarregarMenu = document.getElementById('botao-carregar-menu');

const interfaceJogo = document.getElementById('interface-jogo');
const caixaDialogo = document.getElementById('caixa-dialogo');
const nomePersonagem = document.getElementById('nome-personagem');
const textoDialogo = document.getElementById('texto-dialogo');
const containerEscolhas = document.getElementById('container-escolhas');

// ALTERADO: Seletores para os novos slots de personagem
const palcoPersonagens = document.getElementById('palco-personagens');
const imagemPersonagemEsquerda = document.getElementById('imagem-personagem-esquerda');
const imagemPersonagemDireita = document.getElementById('imagem-personagem-direita');

const musicaFundo = document.getElementById('musica-fundo');

// Modais e Controles
const modalInventario = document.getElementById('modal-inventario');
const modalRelacionamento = document.getElementById('modal-relacionamento');
const modalHistorico = document.getElementById('modal-historico');
const listaItensInventario = document.getElementById('lista-itens-inventario');
const listaRelacionamento = document.getElementById('lista-relacionamento');
const logDialogo = document.getElementById('log-dialogo');

// ALTERADO: Evento de clique movido para o container do palco
palcoPersonagens.addEventListener('click', toggleInterfaceDialogo);

function toggleInterfaceDialogo() {
    caixaDialogo.classList.toggle('escondido');
}

// Botões
document.getElementById('botao-salvar').addEventListener('click', salvarJogo);
document.getElementById('botao-carregar').addEventListener('click', carregarJogo);
document.getElementById('botao-historico').addEventListener('click', () => toggleModal(modalHistorico));
document.getElementById('botao-inventario').addEventListener('click', () => toggleModal(modalInventario));
document.getElementById('botao-relacionamento').addEventListener('click', () => toggleModal(modalRelacionamento));

// --- Variáveis de Estado do Jogo ---
let dadosHistoria;
let cenaAtualId = 1;
let inventario = [];
let relacionamentos = {};
let historicoDialogo = [];
let personagensConhecidos = []; 
let digitando = false;
let intervaloDigitacao;
let musicaAtualTocando = ''; // Rastreia qual música está tocando atualmente
let musicaAnterior = ''; // Rastreia a última música de fundo real (não efeito sonoro)

// --- Inicialização do Jogo ---
fetch('historia.json')
    .then(response => response.json())
    .then(dados => {
        dadosHistoria = dados;
        relacionamentos = { ...dados.pontosRelacionamento };
        tituloCampanha.textContent = dados.nomeCampanha;
        if (localStorage.getItem('saveVisualNovel')) {
            botaoCarregarMenu.style.display = 'block';
        } else {
            botaoCarregarMenu.style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Erro ao carregar a história:', error);
        tituloCampanha.textContent = 'Erro ao carregar história.';
    });

botaoIniciar.addEventListener('click', iniciarJogo);
botaoCarregarMenu.addEventListener('click', carregarJogo);

function iniciarJogo() {
    telaInicial.style.display = 'none';
    interfaceJogo.style.display = 'block';
    // Inicializa com a primeira cena
    exibirCena(1);
}

// --- Funções de Lógica do Jogo ---

// ALTERADO: Função principal de exibição de cena
function exibirCena(id) {
    const cena = dadosHistoria.cenas.find(s => s.id === id);
    if (!cena) {
        console.error(`Cena com id ${id} não encontrada.`);
        return;
    }
    
    cenaAtualId = id;
    fecharTodosModais();

    if (cena.personagem && relacionamentos.hasOwnProperty(cena.personagem) && !personagensConhecidos.includes(cena.personagem)) {
        personagensConhecidos.push(cena.personagem);
    }

    // NOVO: Lógica para buscar e aplicar o cenário
    const infoCenario = dadosHistoria.cenarios.find(c => c.id === cena.cenario);
    if (infoCenario) {
        containerJogo.style.backgroundImage = `url(${infoCenario.imagem})`;
    } else {
        console.error(`Cenário não encontrado: ${cena.cenario}`);
    }

    // Verifica se a música precisa ser trocada (usando variável de rastreamento)
    if (cena.musicaFundo && musicaAtualTocando !== cena.musicaFundo) {
        musicaAtualTocando = cena.musicaFundo;

        // Verifica se é um efeito sonoro (começa com 'som_')
        const isEfeitoSonoro = cena.musicaFundo.includes('som_');

        if (isEfeitoSonoro) {
            // Para efeitos sonoros: remove loop e toca uma vez
            musicaFundo.loop = false;
            musicaFundo.src = cena.musicaFundo;
            musicaFundo.play();

            // Quando o efeito terminar, volta para a música anterior
            musicaFundo.onended = () => {
                if (musicaAnterior && musicaAnterior !== cena.musicaFundo) {
                    musicaAtualTocando = musicaAnterior;
                    musicaFundo.src = musicaAnterior;
                    musicaFundo.loop = true;
                    musicaFundo.play();
                    musicaFundo.onended = null; // Remove o event listener
                }
            };
        } else {
            // Para músicas de fundo: mantém loop e salva como anterior
            musicaAnterior = cena.musicaFundo;
            musicaFundo.loop = true;
            musicaFundo.src = cena.musicaFundo;
            musicaFundo.play();
            musicaFundo.onended = null; // Remove qualquer event listener anterior
        }
    }

    // NOVO: Tocar efeitos sonoros (SFX) se definidos na cena
    tocarEfeitoSonoro(cena.somEfeito);
    
    // NOVO: Lógica para gerenciar personagem principal e secundário
    const infoPrincipal = cena.personagem === 'Narrador' ? null : dadosHistoria.personagens.find(p => p.nome === cena.personagem);
    const infoSecundario = cena.personagemSecundario ? dadosHistoria.personagens.find(p => p.nome === cena.personagemSecundario) : null;

    // Personagem Principal (Esquerda)
    atualizarSlotPersonagem(imagemPersonagemEsquerda, infoPrincipal, false);

    // Personagem Secundário (Direita)
    atualizarSlotPersonagem(imagemPersonagemDireita, infoSecundario, true);

    nomePersonagem.textContent = cena.personagem;
    adicionarAoHistorico(cena.personagem, cena.dialogo);
    exibirDialogoAnimado(cena.dialogo, () => {
        exibirEscolhas(cena.escolhas || []);
        if (cena.fimDeJogo) {
            // Limpa inventário se for uma cena de morte
            if (cena.dialogo.includes('MORTE') || cena.dialogo.includes('morre') || cena.dialogo.includes('morto')) {
                limparInventario();
            }

            const botaoReiniciar = document.createElement('button');
            botaoReiniciar.textContent = 'Jogar Novamente';
            botaoReiniciar.className = 'botao-escolha';
            botaoReiniciar.onclick = () => {
                localStorage.removeItem('saveVisualNovel');
                window.location.reload();
            };
            containerEscolhas.appendChild(botaoReiniciar);
        }
    });

    if (cena.ganhoRelacionamento) {
        Object.keys(cena.ganhoRelacionamento).forEach(char => {
            relacionamentos[char] = (relacionamentos[char] || 0) + cena.ganhoRelacionamento[char];
        });
    }

    atualizarInterfaceInfo();
}

// NOVO: Função auxiliar para atualizar um slot de personagem
function atualizarSlotPersonagem(elementoImg, infoPersonagem, isSecundario) {
    elementoImg.classList.remove('visivel', 'inativo', 'oculto');

    if (infoPersonagem && infoPersonagem.imagem) {
        // Evita recarregar a mesma imagem
        if (elementoImg.src !== infoPersonagem.imagem) {
            elementoImg.src = infoPersonagem.imagem;
        }

        setTimeout(() => {
            elementoImg.classList.add('visivel');
            if (isSecundario) {
                elementoImg.classList.add('inativo');
            }
        }, 50);
    } else {
        elementoImg.src = ''; // Limpa o slot se não houver personagem
        elementoImg.classList.add('oculto'); // Oculta completamente o slot vazio
    }
}


// ... (O resto do arquivo .js permanece o mesmo)
// (funções exibirEscolhas, processarGanhos, verificarCondicao, exibirDialogoAnimado, etc.)
// --- Funções de Lógica do Jogo ---

// Função de exibir escolhas com lógica de ramificação
function exibirEscolhas(escolhas) {
    containerEscolhas.innerHTML = '';
    containerEscolhas.scrollTop = 0; // Garante que o scroll comece no topo
    escolhas.forEach(escolha => {
        const botao = document.createElement('button');
        botao.className = 'botao-escolha';
        botao.textContent = escolha.texto;

        botao.onclick = () => {
            processarGanhos(escolha);

            // Lógica de ramificação
            if (escolha.ramificacoes) {
                let destino = null;
                for (const ramificacao of escolha.ramificacoes) {
                    if (verificarCondicao(ramificacao)) {
                        destino = ramificacao.proximaCena;
                        break; // Usa a primeira condição que for verdadeira
                    }
                }
                exibirCena(destino || escolha.proximaCenaPadrao);
            }
            // Lógica antiga para requisitos que bloqueiam uma ação
            else if (escolha.requisitoRelacionamento) {
                const req = escolha.requisitoRelacionamento;
                if ((relacionamentos[req.personagem] || 0) >= req.pontos) {
                    exibirCena(escolha.proximaCena);
                } else {
                    exibirCena(req.cenaRejeicao);
                }
            } 
            // Caminho padrão
            else {
                exibirCena(escolha.proximaCena);
            }
        };
        containerEscolhas.appendChild(botao);
    });
}

// Função para processar ganhos de uma escolha
function processarGanhos(escolha) {
    if (escolha.ganhoRelacionamento) {
        Object.keys(escolha.ganhoRelacionamento).forEach(char => {
            relacionamentos[char] = (relacionamentos[char] || 0) + escolha.ganhoRelacionamento[char];
            // Adiciona personagem à lista de conhecidos caso ganhe pontos com ele antes de encontrá-lo
            if (!personagensConhecidos.includes(char)) {
                personagensConhecidos.push(char);
            }
        });
    }

    // NOVO: Processar ganhos de itens
    if (escolha.ganhoItem) {
        const itemExistente = inventario.find(item => item.nome === escolha.ganhoItem);
        if (!itemExistente) {
            inventario.push({ nome: escolha.ganhoItem });
            console.log(`Item adicionado ao inventário: ${escolha.ganhoItem}`);
            atualizarInterfaceInfo(); // Atualiza a interface para mostrar o novo item
        }
    }
}

// Função para verificar condições de uma ramificação
function verificarCondicao(ramificacao) {
    switch (ramificacao.tipo) {
        case 'relacionamento':
            return (relacionamentos[ramificacao.personagem] || 0) >= ramificacao.pontos;
        case 'item':
            return inventario.some(item => item.nome === ramificacao.item);
        // Adicionar outros tipos de condição aqui (ex: 'dinheiro', 'status', etc.)
        default:
            return false;
    }
}


// --- Funções de UI e Efeitos ---
function exibirDialogoAnimado(texto, callback) {
    if (digitando) {
        clearTimeout(intervaloDigitacao);
        textoDialogo.innerHTML = texto;
        textoDialogo.scrollTop = 0; // Garante que o scroll comece no topo
        digitando = false;
        if(callback) callback();
        return;
    }

    textoDialogo.innerHTML = '';
    textoDialogo.scrollTop = 0; // Garante que o scroll comece no topo
    containerEscolhas.innerHTML = '';
    let i = 0;
    digitando = true;

    intervaloDigitacao = setInterval(() => {
        if (i < texto.length) {
            textoDialogo.innerHTML += texto.charAt(i);
            i++;
        } else {
            clearInterval(intervaloDigitacao);
            digitando = false;
            if (callback) callback();
        }
    }, 25);

    caixaDialogo.onclick = () => {
        if (digitando) {
            clearInterval(intervaloDigitacao);
            textoDialogo.innerHTML = texto;
            textoDialogo.scrollTop = 0; // Garante que o scroll comece no topo
            digitando = false;
            if (callback) callback();
            caixaDialogo.onclick = null; // Remove o evento após o uso
        }
    };
}


// Atualiza a interface de relacionamentos para mostrar apenas personagens conhecidos
function atualizarInterfaceInfo() {
    listaItensInventario.innerHTML = inventario.length === 0 ? '<li>Vazio</li>' : inventario.map(item => `<li>${item.nome}</li>`).join('');

    // Lógica alterada para mostrar apenas personagens conhecidos
    listaRelacionamento.innerHTML = '';
    if (personagensConhecidos.length === 0) {
        listaRelacionamento.innerHTML = '<li>Ninguém conhecido ainda.</li>';
    } else {
        personagensConhecidos.forEach(char => {
            const li = document.createElement('li');
            li.textContent = `${char}: ${relacionamentos[char]}`;
            listaRelacionamento.appendChild(li);
        });
    }
}

function toggleModal(modal) {
    const display = modal.style.display === 'block' ? 'none' : 'block';
    fecharTodosModais();
    modal.style.display = display;
    if (modal === modalHistorico && display === 'block') {
        atualizarHistorico();
    }
}

function fecharTodosModais() {
    [modalInventario, modalRelacionamento, modalHistorico].forEach(m => m.style.display = 'none');
}

// --- Funções de Efeitos Sonoros (SFX) ---
// Função para tocar efeitos sonoros que não interrompem a música de fundo
function tocarEfeitoSonoro(arquivoSFX) {
    if (arquivoSFX) {
        const audioSFX = new Audio(arquivoSFX);
        audioSFX.volume = 0.7; // Volume um pouco mais baixo que a música de fundo
        audioSFX.play().catch(error => {
            console.log('Erro ao tocar efeito sonoro:', error);
        });
    }
}

// NOVO: Função para limpar inventário (usada em mortes)
function limparInventario() {
    inventario = [];
    atualizarInterfaceInfo();
    console.log('Inventário limpo devido à morte do jogador');
}
function adicionarAoHistorico(personagem, dialogo) {
    historicoDialogo.push({ personagem, dialogo });
}

function atualizarHistorico() {
    logDialogo.innerHTML = historicoDialogo.map(e => `<div class="entrada-log"><span class="log-personagem">${e.personagem}:</span> <span class="log-texto">${e.dialogo}</span></div>`).join('');
    logDialogo.scrollTop = logDialogo.scrollHeight;
}

// --- Sistema de Salvar/Carregar ---
// Inclui personagensConhecidos no save
function salvarJogo() {
    const estadoJogo = {
        cenaAtualId: cenaAtualId,
        inventario: inventario,
        relacionamentos: relacionamentos,
        historicoDialogo: historicoDialogo,
        personagensConhecidos: personagensConhecidos, // Salva a lista de conhecidos
        musicaAtualTocando: musicaAtualTocando, // Salva a música atual
        musicaAnterior: musicaAnterior // Salva a música anterior
    };
    localStorage.setItem('saveVisualNovel', JSON.stringify(estadoJogo));
    alert('Jogo salvo com sucesso!');
    fecharTodosModais();
}

function carregarJogo() {
    const estadoSalvo = localStorage.getItem('saveVisualNovel');
    if (estadoSalvo) {
        const dadosJogo = JSON.parse(estadoSalvo);
        cenaAtualId = dadosJogo.cenaAtualId;
        inventario = dadosJogo.inventario;
        relacionamentos = dadosJogo.relacionamentos;
        historicoDialogo = dadosJogo.historicoDialogo;
        personagensConhecidos = dadosJogo.personagensConhecidos; // Carrega a lista de conhecidos
        musicaAtualTocando = dadosJogo.musicaAtualTocando || ''; // Carrega a música atual
        musicaAnterior = dadosJogo.musicaAnterior || ''; // Carrega a música anterior

        telaInicial.style.display = 'none';
        interfaceJogo.style.display = 'block';
        exibirCena(cenaAtualId);
        alert('Jogo carregado!');
    } else {
        alert('Nenhum jogo salvo encontrado.');
    }
}