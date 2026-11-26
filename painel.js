const CHAVE_USUARIOS = 'nexum_usuarios';
const CHAVE_SESSAO = 'usuarioLogado';

const NOMES_PERFIL = {
    ALUNO_FREE: 'Aluno Free',
    ALUNO_PREMIUM: 'Aluno Premium',
    CURSINHO: 'Cursinho / Escola Parceira',
    PROFESSOR: 'Professor Particular / Mentor'
};

const form = document.getElementById('form-painel');
const mensagem = document.getElementById('mensagem');
const botaoSalvar = form.querySelector('.btn-salvar');
const botaoExcluir = document.getElementById('btn-excluir');

function lerUsuarios() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
    } catch (erro) {
        return [];
    }
}

function lerSessao() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE_SESSAO));
    } catch (erro) {
        return null;
    }
}

function mostrarMensagem(texto, sucesso) {
    mensagem.textContent = texto;
    mensagem.classList.toggle('sucesso', sucesso);
    mensagem.hidden = false;
}

function atualizarNome(nome) {
    document.getElementById('user-nome-topo').textContent = nome;
    document.getElementById('avatar-letra').textContent = nome.charAt(0).toUpperCase();
    document.getElementById('titulo-boas-vindas').textContent = `Olá, ${nome}!`;
}

function preencherTela(usuario) {
    atualizarNome(usuario.nome);

    const selo = document.getElementById('selo-perfil');
    selo.textContent = `Perfil: ${NOMES_PERFIL[usuario.perfil] || usuario.perfil}`;
    selo.hidden = false;

    document.getElementById('edit-nome').value = usuario.nome;
    document.getElementById('edit-email').value = usuario.email;
}

// Devolve o usuário completo da sessão, ou null se não estiver logado
function buscarUsuarioLogado() {
    const sessao = lerSessao();
    if (!sessao || !sessao.id) return null;
    return lerUsuarios().find(u => u.id === sessao.id) || null;
}

function carregarPainelUsuario() {
    const usuario = buscarUsuarioLogado();

    if (!usuario) {
        localStorage.removeItem(CHAVE_SESSAO);
        window.location.href = 'index.html';
        return;
    }

    preencherTela(usuario);
}

function salvarEdicao(evento) {
    evento.preventDefault();
    mensagem.hidden = true;
    botaoSalvar.disabled = true;

    try {
        const sessao = lerSessao();
        if (!sessao) {
            window.location.href = 'index.html';
            return;
        }

        const nome = document.getElementById('edit-nome').value.trim();
        const email = document.getElementById('edit-email').value.trim().toLowerCase();

        if (!nome || !email) {
            mostrarMensagem('Preencha nome e e-mail.', false);
            return;
        }

        const usuarios = lerUsuarios();

        if (usuarios.some(u => u.email === email && u.id !== sessao.id)) {
            mostrarMensagem('Este e-mail já está em uso por outra conta.', false);
            return;
        }

        const usuario = usuarios.find(u => u.id === sessao.id);
        if (!usuario) {
            window.location.href = 'index.html';
            return;
        }

        usuario.nome = nome;
        usuario.email = email;
        localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));

        // Mantém a sessão em sincronia (as outras telas leem o nome daqui)
        localStorage.setItem(CHAVE_SESSAO, JSON.stringify({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil
        }));

        atualizarNome(nome);
        mostrarMensagem('Alterações salvas com sucesso!', true);
    } catch (erro) {
        mostrarMensagem('Não foi possível salvar no navegador.', false);
    } finally {
        botaoSalvar.disabled = false;
    }
}

function deletarConta() {
    if (!confirm('Tem certeza que deseja excluir sua conta permanentemente?')) {
        return;
    }

    mensagem.hidden = true;
    botaoExcluir.disabled = true;

    try {
        const sessao = lerSessao();

        if (sessao) {
            const restantes = lerUsuarios().filter(u => u.id !== sessao.id);
            localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(restantes));
        }

        localStorage.removeItem(CHAVE_SESSAO);
        window.location.href = 'index.html';
    } catch (erro) {
        mostrarMensagem('Não foi possível excluir a conta.', false);
        botaoExcluir.disabled = false;
    }
}

function sairDoPainel() {
    localStorage.removeItem(CHAVE_SESSAO);
    window.location.href = 'index.html';
}

form.addEventListener('submit', salvarEdicao);
botaoExcluir.addEventListener('click', deletarConta);
document.getElementById('btn-sair').addEventListener('click', sairDoPainel);

carregarPainelUsuario();