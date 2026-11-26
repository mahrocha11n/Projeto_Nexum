const gabaritoDiagnostico = {
    q_mat: "A",
    q_fis: "B",
    q_qui: "C"
};

function carregarTelaDiagnostico() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado")) || {
        nome: "Aluno Teste"
    };

    document.getElementById("user-nome-topo").innerText = usuarioLogado.nome;
    document.getElementById("avatar-letra").innerText = usuarioLogado.nome.charAt(0).toUpperCase();
}

function enviarDiagnostico(event) {
    event.preventDefault();

    const dadosForm = new FormData(event.target);
    const respMat = dadosForm.get("q_mat");
    const respFis = dadosForm.get("q_fis");
    const respQui = dadosForm.get("q_qui");

    const acertouMat = respMat === gabaritoDiagnostico.q_mat;
    const acertouFis = respFis === gabaritoDiagnostico.q_fis;
    const acertouQui = respQui === gabaritoDiagnostico.q_qui;

    // Monta a estrutura da árvore respeitando os pré-requisitos (Mat -> Fis -> Qui)
    const arvoreMontada = [
        {
            id: 1,
            nome: "Matemática",
            preRequisitoId: null,
            maestria: acertouMat ? 100 : 0,
            status: acertouMat ? "CONCLUIDO" : "DISPONIVEL"
        },
        {
            id: 2,
            nome: "Física",
            preRequisitoId: 1,
            maestria: acertouFis ? 100 : 0,
            status: !acertouMat ? "BLOQUEADO" : (acertouFis ? "CONCLUIDO" : "DISPONIVEL")
        },
        {
            id: 3,
            nome: "Química",
            preRequisitoId: 2,
            maestria: acertouQui ? 100 : 0,
            status: (!acertouMat || !acertouFis) ? "BLOQUEADO" : (acertouQui ? "CONCLUIDO" : "DISPONIVEL")
        }
    ];

try {
    localStorage.setItem("arvore_nexum", JSON.stringify(arvoreMontada));
} catch (e) {
    alert("Seu navegador bloqueou o armazenamento local. Abra o site por um servidor (Live Server ou GitHub Pages) e fora de aba anônima.");
    console.error(e);
    return;
}
window.location.href = "indexArvore.html";
}


function resetarDiagnosticoTeste() {
    document.getElementById("form-diagnostico").reset();
    try {
        localStorage.removeItem("arvore_nexum");
    } catch (e) {}
}
