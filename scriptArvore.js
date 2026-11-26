function mostrarAviso(mensagem) {
    const toast = document.getElementById("toast-nexum");
    if (!toast) return;
    toast.innerText = mensagem;
    toast.classList.remove("hidden");
    clearTimeout(window.timerToast);
    window.timerToast = setTimeout(() => {
        toast.classList.add("hidden");
    }, 3500);
}

function carregarArvore() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado")) || {
        nome: "Aluno Teste"
    };

    document.getElementById("user-nome-topo").innerText = usuarioLogado.nome;
    document.getElementById("avatar-letra").innerText = usuarioLogado.nome.charAt(0).toUpperCase();

    let arvoreSalva = JSON.parse(localStorage.getItem("arvore_nexum"));

    // Se acessar direto sem ter feito o diagnóstico, redireciona para indexform.html
    if (!arvoreSalva || arvoreSalva.length === 0) {
        mostrarAviso("Você ainda não realizou o diagnóstico inicial. Redirecionando...");
        setTimeout(() => {
            window.location.href = "indexform.html";
        }, 1200);
        return;
    }

    renderizarArvore(arvoreSalva);
}

function renderizarArvore(arvore) {
    const container = document.getElementById("trilha-container");
    container.innerHTML = "";

    // 1. DESENHA A ÁRVORE VISUAL EM SVG (Raiz -> Galhos -> Nós)
    // Coordenadas fixas responsivas dentro do viewBox 680x360 para ficar com formato orgânico de árvore
    const posicoes = [
        { x: 340, y: 290 }, // Nó 1 (Base/Tronco: Matemática)
        { x: 200, y: 175 }, // Nó 2 (Galho Esquerdo: Física)
        { x: 480, y: 115 }  // Nó 3 (Galho Direito Superior: Química)
    ];

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 680 350");
    svg.setAttribute("class", "arvore-svg-palco");

    // Base do solo (combinando com o ícone da Nexum)
    const solo = document.createElementNS(svgNS, "line");
    solo.setAttribute("x1", "270");
    solo.setAttribute("y1", "335");
    solo.setAttribute("x2", "410");
    solo.setAttribute("y2", "335");
    solo.setAttribute("stroke", "#cbd5e1");
    solo.setAttribute("stroke-width", "6");
    solo.setAttribute("stroke-linecap", "round");
    svg.appendChild(solo);

    // Desenha os galhos curvos conectando cada nó ao seu pré-requisito
    arvore.forEach((no, index) => {
        const posAtual = posicoes[index] || { x: 340, y: 290 - index * 90 };

        if (no.preRequisitoId) {
            const indexPai = arvore.findIndex(item => item.id === no.preRequisitoId);
            const posPai = posicoes[indexPai] || { x: 340, y: 290 };

            const galho = document.createElementNS(svgNS, "path");
            // Curva Bézier suave simulando galho orgânico
            const meioY = (posPai.y + posAtual.y) / 2;
            const d = `M ${posPai.x} ${posPai.y} C ${posPai.x} ${meioY}, ${posAtual.x} ${meioY}, ${posAtual.x} ${posAtual.y}`;

            galho.setAttribute("d", d);
            let classeGalho = "galho-linha";
            if (no.status === "CONCLUIDO") classeGalho += " ativo";
            else if (no.status === "DISPONIVEL") classeGalho += " disponivel";

            galho.setAttribute("class", classeGalho);
            svg.appendChild(galho);
        }
    });

    // Desenha os nós (círculos/folhas) por cima dos galhos
    arvore.forEach((no, index) => {
        const pos = posicoes[index] || { x: 340, y: 290 - index * 90 };
        const classeStatus = no.status.toLowerCase();

        const cores = {
            concluido: { fundo: "#dcfce7", borda: "#22c55e", texto: "#166534", icone: "✓" },
            disponivel: { fundo: "#eef2ff", borda: "#6366f1", texto: "#3730a3", icone: "▶" },
            bloqueado: { fundo: "#f3f4f6", borda: "#9ca3af", texto: "#6b7280", icone: "🔒" }
        };
        const estilo = cores[classeStatus] || cores.bloqueado;

        const grupo = document.createElementNS(svgNS, "g");
        grupo.setAttribute("class", `no-grupo ${classeStatus}`);
        grupo.onclick = () => clicarNoArvore(no, arvore);

        // Círculo externo do nó
        const circulo = document.createElementNS(svgNS, "circle");
        circulo.setAttribute("cx", pos.x);
        circulo.setAttribute("cy", pos.y);
        circulo.setAttribute("r", "34");
        circulo.setAttribute("fill", estilo.fundo);
        circulo.setAttribute("stroke", estilo.borda);
        circulo.setAttribute("stroke-width", "4");
        circulo.setAttribute("class", "no-circulo-externo");
        grupo.appendChild(circulo);

        // Ícone central (✓, ▶ ou 🔒)
        const textoIcone = document.createElementNS(svgNS, "text");
        textoIcone.setAttribute("x", pos.x);
        textoIcone.setAttribute("y", pos.y + 6);
        textoIcone.setAttribute("text-anchor", "middle");
        textoIcone.setAttribute("font-size", "18");
        textoIcone.setAttribute("font-weight", "bold");
        textoIcone.setAttribute("fill", estilo.texto);
        textoIcone.textContent = estilo.icone;
        grupo.appendChild(textoIcone);

        // Etiqueta com o nome da matéria abaixo/ao lado do nó
        const labelFundo = document.createElementNS(svgNS, "rect");
        labelFundo.setAttribute("x", pos.x - 58);
        labelFundo.setAttribute("y", pos.y + 42);
        labelFundo.setAttribute("width", "116");
        labelFundo.setAttribute("height", "24");
        labelFundo.setAttribute("rx", "12");
        labelFundo.setAttribute("fill", "#ffffff");
        labelFundo.setAttribute("stroke", estilo.borda);
        labelFundo.setAttribute("stroke-width", "1.5");
        grupo.appendChild(labelFundo);

        const textoNome = document.createElementNS(svgNS, "text");
        textoNome.setAttribute("x", pos.x);
        textoNome.setAttribute("y", pos.y + 58);
        textoNome.setAttribute("text-anchor", "middle");
        textoNome.setAttribute("font-size", "12");
        textoNome.setAttribute("font-weight", "bold");
        textoNome.setAttribute("fill", "#111827");
        textoNome.textContent = `${index + 1}. ${no.nome}`;
        grupo.appendChild(textoNome);

        svg.appendChild(grupo);
    });

    container.appendChild(svg);

    // 2. RENDERIZA OS CARDS DE DETALHE LOGO ABAIXO
    const gridCards = document.createElement("div");
    gridCards.className = "resumo-nos-grid";

    arvore.forEach((no, index) => {
        const classeStatus = no.status.toLowerCase();
        const textoStatus = formatarTextoStatus(no.status);

        const cardNo = document.createElement("div");
        cardNo.className = `no-arvore ${classeStatus}`;
        cardNo.onclick = () => clicarNoArvore(no, arvore);

        let botaoAcao = "";
        if (no.status === "DISPONIVEL") {
            botaoAcao = `<button type="button" class="btn-estudar">Iniciar Estudo</button>`;
        } else if (no.status === "CONCLUIDO") {
            botaoAcao = `<span style="font-size: 12px; color: #166534; font-weight: bold;">Dominado ✓</span>`;
        } else {
            botaoAcao = `<span style="font-size: 12px; color: #6b7280;">Bloqueado</span>`;
        }

        cardNo.innerHTML = `
            <div class="no-info">
                <h3>${index + 1}. ${no.nome}</h3>
                <p>Maestria inicial: <strong>${no.maestria}%</strong></p>
            </div>
            <div class="no-acao">
                <span class="badge ${classeStatus}">${textoStatus}</span>
                ${botaoAcao}
            </div>
        `;

        gridCards.appendChild(cardNo);
    });

    container.appendChild(gridCards);
}

function clicarNoArvore(no, arvore) {
    if (no.status === "BLOQUEADO") {
        const preReq = arvore.find(item => item.id === no.preRequisitoId);
        const nomePreReq = preReq ? preReq.nome : "anterior";
        mostrarAviso(`Conteúdo bloqueado! Conclua primeiro o tópico "${nomePreReq}".`);
        return;
    }

    if (no.status === "DISPONIVEL") {
        mostrarAviso(`Abrindo módulo de estudos de ${no.nome}...`);
    } else if (no.status === "CONCLUIDO") {
        mostrarAviso(`Você já dominou ${no.nome} no diagnóstico! Pode revisar quando quiser.`);
    }
}

function formatarTextoStatus(status) {
    if (status === "CONCLUIDO") return "Concluído";
    if (status === "DISPONIVEL") return "Disponível";
    return "Bloqueado";
}

function refazerDiagnostico() {
    localStorage.removeItem("arvore_nexum");
    window.location.href = "indexform.html";
}

function seuPerfil() {
    window.location.href = "perfil.html";
}
