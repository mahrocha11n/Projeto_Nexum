// Chaves do localStorage (as mesmas em login.js, cadastro.js e painel.js)
const CHAVE_USUARIOS = 'nexum_usuarios';
const CHAVE_SESSAO = 'usuarioLogado'; // as telas do diagnóstico e da árvore já leem esta chave

function lerUsuarios() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
    } catch (erro) {
        return [];
    }
}

const form = document.getElementById('form-login');
const mensagem = document.getElementById('mensagem');
const botao = form.querySelector('button[type="submit"]');

function mostrarMensagem(texto) {
    mensagem.textContent = texto;
    mensagem.hidden = false;
}

form.addEventListener('submit', (evento) => {
    evento.preventDefault();

    mensagem.hidden = true;
    botao.disabled = true;
    botao.textContent = 'Entrando...';

    const email = document.getElementById('email').value.trim().toLowerCase();
    const senha = document.getElementById('senha').value;

    try {
        const usuario = lerUsuarios().find(u => u.email === email && u.senha === senha);

        if (!usuario) {
            mostrarMensagem('E-mail ou senha incorretos.');
            return;
        }

        // Guarda na sessão só o que a tela precisa (sem a senha)
        localStorage.setItem(CHAVE_SESSAO, JSON.stringify({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil
        }));

        window.location.href = 'indexArvore.html';
    } catch (erro) {
        mostrarMensagem('Não foi possível acessar o armazenamento do navegador.');
    } finally {
        botao.disabled = false;
        botao.textContent = 'Entrar na plataforma';
    }
});
