# J. ZYMAR SCHOOL

<!DOCTYPE html>

<html lang="pt">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Gestão Pedagógica - Complexo Escolar Privado J. ZYMAR</title>

    <style>

        :root {

            --primary-color: #1a365d;

            --secondary-color: #2b6cb0;

            --bg-color: #f7fafc;

            --card-bg: #ffffff;

            --text-color: #2d3748;

            --success-color: #2f855a;

            --danger-color: #c53030;

            --warning-color: #d69e2e;

            --border-color: #e2e8f0;

        }



        body {

            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

            background-color: var(--bg-color);

            color: var(--text-color);

            margin: 0;

            padding: 20px;

        }



        .container {

            max-width: 1100px;

            margin: 0 auto;

            background: var(--card-bg);

            padding: 25px;

            border-radius: 8px;

            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

        }



        .header-system {

            display: flex;

            justify-content: space-between;

            align-items: center;

            border-bottom: 2px solid var(--primary-color);

            padding-bottom: 15px;

            margin-bottom: 20px;

        }



        .nav-tabs {

            display: flex;

            gap: 10px;

            margin-bottom: 20px;

            flex-wrap: wrap;

        }



        .nav-tabs button {

            padding: 10px 15px;

            background-color: #edf2f7;

            border: 1px solid var(--border-color);

            border-radius: 5px;

            cursor: pointer;

            font-weight: bold;

        }



        .nav-tabs button.active {

            background-color: var(--primary-color);

            color: white;

        }



        .tab-content {

            display: none;

        }



        .tab-content.active {

            display: block;

        }



        .form-group {

            margin-bottom: 15px;

        }



        label {

            display: block;

            margin-bottom: 5px;

            font-weight: bold;

        }



        select, input {

            width: 100%;

            padding: 10px;

            border: 1px solid var(--border-color);

            border-radius: 4px;

            box-sizing: border-box;

            font-size: 14px;

        }



        .btn {

            padding: 10px 15px;

            border: none;

            border-radius: 4px;

            cursor: pointer;

            font-weight: bold;

            color: white;

        }



        .btn-primary { background-color: var(--secondary-color); }

        .btn-danger { background-color: var(--danger-color); }

        .btn-success { background-color: var(--success-color); }



        .tabela-boletim, .tabela-dados {

            width: 100%;

            border-collapse: collapse;

            margin-top: 15px;

        }



        .tabela-boletim th, .tabela-boletim td,

        .tabela-dados th, .tabela-dados td {

            border: 1px solid var(--border-color);

            padding: 10px;

            text-align: center;

        }



        .tabela-boletim th, .tabela-dados th {

            background-color: var(--primary-color);

            color: white;

        }



        .badge {

            padding: 4px 8px;

            border-radius: 4px;

            font-size: 12px;

            color: white;

        }

        .badge-success { background-color: var(--success-color); }

        .badge-warning { background-color: var(--warning-color); }

        .badge-danger { background-color: var(--danger-color); }



        @media print {

            .no-print { display: none !important; }

            body { padding: 0; }

            .container { box-shadow: none; }

        }

    </style>

</head>

<body>



<div class="container">

    <div class="header-system">

        <div>

            <h2 style="margin:0;">COMPLEXO ESCOLAR PRIVADO J. ZYMAR</h2>

            <small id="userStatus">Sessão não iniciada</small>

        </div>

        <button id="btnLogout" class="btn btn-danger no-print" onclick="logout()" style="display:none;">Sair</button>

    </div>



    <!-- TELA DE LOGIN -->

    <div id="loginSection">

        <h3>Acesso ao Sistema</h3>

        <div class="form-group">

            <label>Utilizador / E-mail:</label>

            <input type="text" id="loginUser" placeholder="Insira o seu e-mail">

        </div>

        <div class="form-group">

            <label>Palavra-passe:</label>

            <input type="password" id="loginPass" placeholder="Insira a sua palavra-passe">

        </div>

        <button class="btn btn-primary" onclick="fazerLogin()">Entrar</button>

    </div>



    <!-- PAINEL PRINCIPAL -->

    <div id="appSection" style="display:none;">

        <div class="nav-tabs no-print">

            <button onclick="mudarAba('boletim')" class="tab-btn active">Boletim de Notas</button>

            <button onclick="mudarAba('notas')" id="tabNotasBtn" class="tab-btn">Lançamento de Notas</button>

            <button onclick="mudarAba('alunos')" id="tabAlunosBtn" class="tab-btn">Gestão de Alunos</button>

            <button onclick="mudarAba('validacao')" id="tabValidacaoBtn" class="tab-btn">Validação & Permissões (ADMIN)</button>

        </div>



        <!-- ABA BOLETIM -->

        <div id="abaBoletim" class="tab-content active">

            <div class="form-group no-print">

                <label for="boletimAlunoSelect">Selecionar Aluno:</label>

                <select id="boletimAlunoSelect" onchange="renderBoletim()"></select>

            </div>

            <div id="boletimConteudo"></div>

        </div>



        <!-- ABA LANÇAMENTO DE NOTAS -->

        <div id="abaNotas" class="tab-content">

            <h3>Lançamento de Avaliações</h3>

            <div id="formNotasContainer">

                <div class="form-group">

                    <label>Aluno:</label>

                    <select id="notaAlunoSelect"></select>

                </div>

                <div class="form-group">

                    <label>Disciplina:</label>

                    <input type="text" id="notaDisciplina" placeholder="Ex: Matemática">

                </div>

                <div style="display: flex; gap: 10px;">

                    <div class="form-group" style="flex:1;">

                        <label>MAC (Avaliação Contínua):</label>

                        <input type="number" id="macVal" min="0" max="20" step="0.1" placeholder="0 a 20">

                    </div>

                    <div class="form-group" style="flex:1;">

                        <label>NPT (Prova Trimestral):</label>

                        <input type="number" id="npVal" min="0" max="20" step="0.1" placeholder="0 a 20">

                    </div>

                </div>

                <div class="form-group">

                    <label>Trimestre a Lançar:</label>

                    <select id="trimestreLancamento">

                        <option value="1">1º Trimestre</option>

                        <option value="2">2º Trimestre</option>

                        <option value="3">3º Trimestre</option>

                    </select>

                </div>

                <button class="btn btn-success" onclick="salvarNota()">Guardar Nota</button>

            </div>

        </div>



        <!-- ABA GESTÃO DE ALUNOS -->

        <div id="abaAlunos" class="tab-content">

            <h3>Lista de Alunos</h3>

            <table class="tabela-dados">

                <thead>

                    <tr>

                        <th>Nome</th>

                        <th>Classe</th>

                        <th>Turma</th>

                        <th class="admin-only">Ações</th>

                    </tr>

                </thead>

                <tbody id="tabelaAlunosBody"></tbody>

            </table>

        </div>



        <!-- ABA VALIDAÇÃO & PERMISSÕES (ADMINS) -->

        <div id="abaValidacao" class="tab-content">

            <h3>Validação de Credenciais & Gestão de Utilizadores</h3>

            <table class="tabela-dados">

                <thead>

                    <tr>

                        <th>Nome / Email</th>

                        <th>Perfil</th>

                        <th>Estado</th>

                        <th>Ações</th>

                    </tr>

                </thead>

                <tbody id="tabelaUsuariosBody"></tbody>

            </table>

        </div>

    </div>

</div>



<script>

    // --- UTILITÁRIOS DE SEGURANÇA E HIGIENIZAÇÃO ---

    function escapeHTML(str) {

        if (!str) return '';

        return String(str)

            .replace(/&/g, "&amp;")

            .replace(/</g, "&lt;")

            .replace(/>/g, "&gt;")

            .replace(/"/g, "&quot;")

            .replace(/'/g, "&#039;");

    }



    function validarNota(valor) {

        if (valor === "" || valor === null || valor === undefined) return null;

        const num = parseFloat(valor);

        if (isNaN(num) || num < 0 || num > 20) return false;

        return num;

    }



    // --- CAMADA DE DADOS (DAL - PREPARADA PARA FIREBASE) ---

    const DBManager = {

        key: 'db_zymar',

        getDB: function() {

            if (!localStorage.getItem(this.key)) {

                const initialData = {

                    usuarios: [

                        { id: "1", email: "Mungongoao33@gmail.com", pass: "Mungongo31", perfil: "CRIADOR", status: "APROVADO" },

                        { id: "2", email: "admin@zymar.com", pass: "admin123", perfil: "ADMINISTRATIVO", status: "APROVADO" }

                    ],

                    alunos: [

                        { id: "101", nome: "João Manuel", classe: "7ª", turma: "A" },

                        { id: "102", nome: "Maria Antónia", classe: "8ª", turma: "B" }

                    ],

                    notas: [

                        { alunoId: "101", disciplina: "Língua Portuguesa", mac1: 14, np1: 12, mac2: 15, np2: 13, mac3: null, np3: null },

                        { alunoId: "101", disciplina: "Matemática", mac1: 8, np1: 9, mac2: null, np2: null, mac3: null, np3: null }

                    ]

                };

                localStorage.setItem(this.key, JSON.stringify(initialData));

            }

            return JSON.parse(localStorage.getItem(this.key));

        },

        saveDB: function(data) {

            localStorage.setItem(this.key, JSON.stringify(data));

        }

    };



    let db = DBManager.getDB();

    let usuarioLogado = null;



    // --- SISTEMA DE AUTENTICAÇÃO E PERMISSÕES ---

    function fazerLogin() {

        const user = document.getElementById('loginUser').value.trim();

        const pass = document.getElementById('loginPass').value.trim();



        const encontrado = db.usuarios.find(u => u.email === user && u.pass === pass);



        if (!encontrado) {

            alert("Credenciais inválidas!");

            return;

        }



        if (encontrado.status !== "APROVADO") {

            alert("A sua conta aguarda validação por um Administrador.");

            return;

        }



        usuarioLogado = encontrado;

        document.getElementById('loginSection').style.display = 'none';

        document.getElementById('appSection').style.display = 'block';

        document.getElementById('btnLogout').style.display = 'block';

        document.getElementById('userStatus').innerHTML = `Sessão: <strong>${escapeHTML(usuarioLogado.email)}</strong> [${escapeHTML(usuarioLogado.perfil)}]`;



        aplicarPermissoes();

        carregarSelects();

        renderAlunos();

    }



    function logout() {

        usuarioLogado = null;

        document.getElementById('loginSection').style.display = 'block';

        document.getElementById('appSection').style.display = 'none';

        document.getElementById('btnLogout').style.display = 'none';

    }



    function aplicarPermissoes() {

        const isCriador = usuarioLogado.perfil === 'CRIADOR';

        const isAdmin = isCriador || usuarioLogado.perfil === 'ADMINISTRATIVO';

        const podeLancarNotas = isCriador || usuarioLogado.perfil === 'PROFESSOR';



        document.getElementById('tabNotasBtn').style.display = podeLancarNotas ? 'inline-block' : 'none';

        document.getElementById('tabValidacaoBtn').style.display = isAdmin ? 'inline-block' : 'none';



        if (isAdmin) renderUsuarios();

    }



    function mudarAba(aba) {

        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));



        if (aba === 'boletim') document.getElementById('abaBoletim').classList.add('active');

        else if (aba === 'notas') document.getElementById('abaNotas').classList.add('active');

        else if (aba === 'alunos') document.getElementById('abaAlunos').classList.add('active');

        else if (aba === 'validacao') document.getElementById('abaValidacao').classList.add('active');

    }



    function carregarSelects() {

        const selectBoletim = document.getElementById('boletimAlunoSelect');

        const selectNotas = document.getElementById('notaAlunoSelect');

        

        selectBoletim.innerHTML = '<option value="">-- Selecione um Aluno --</option>';

        selectNotas.innerHTML = '';



        db.alunos.forEach(a => {

            selectBoletim.innerHTML += `<option value="${a.id}">${escapeHTML(a.nome)} (${escapeHTML(a.classe)} Classe)</option>`;

            selectNotas.innerHTML += `<option value="${a.id}">${escapeHTML(a.nome)}</option>`;

        });

    }



    // --- CÁLCULO E RENDERIZAÇÃO DO BOLETIM (REGRAS AJUSTADAS) ---

    function calcularMT(mac, np) {

        if (mac === null || mac === undefined || np === null || np === undefined) return null;

        return (mac + np) / 2;

    }



    function renderBoletim() {

        const alunoId = document.getElementById('boletimAlunoSelect')?.value;

        const trimestreSelecionado = document.getElementById('boletimTrimestreSelect')?.value || '1';

        const container = document.getElementById('boletimConteudo');

        

        if (!container) return;

        if (!alunoId) {

            container.innerHTML = '<p style="text-align: center; color: #718096;">Selecione um aluno para visualizar o boletim.</p>';

            return;

        }



        const aluno = db.alunos.find(a => a.id === alunoId);

        const notasAluno = db.notas.filter(n => n.alunoId === alunoId);



        let html = `

            <div class="boletim-header">

                <h3>BOLETIM DE NOTAS - COMPLEXO ESCOLAR PRIVADO J. ZYMAR</h3>

                <p><strong>Aluno(a):</strong> ${escapeHTML(aluno.nome)} | <strong>Classe:</strong> ${escapeHTML(aluno.classe)} | <strong>Turma:</strong> ${escapeHTML(aluno.turma)}</p>

                <div class="no-print" style="margin: 15px 0;">

                    <label for="boletimTrimestreSelect"><strong>Selecionar Trimestre:</strong> </label>

                    <select id="boletimTrimestreSelect" onchange="renderBoletim()">

                        <option value="1" ${trimestreSelecionado === '1' ? 'selected' : ''}>I° Trimestre</option>

                        <option value="2" ${trimestreSelecionado === '2' ? 'selected' : ''}>II° Trimestre</option>

                        <option value="3" ${trimestreSelecionado === '3' ? 'selected' : ''}>III° Trimestre (Geral/Final)</option>

                    </select>

                </div>

            </div>

            <table class="tabela-boletim">

                <thead>

                    <tr>

                        <th style="text-align: left;">Disciplina</th>

        `;



        if (trimestreSelecionado === '1') html += `<th>MAC</th><th>NPT</th><th>MT1</th>`;

        else if (trimestreSelecionado === '2') html += `<th>MAC</th><th>NPT</th><th>MT2</th>`;

        else if (trimestreSelecionado === '3') html += `<th>MT1</th><th>MT2</th><th>MT3</th><th>MFD</th><th>Resultado</th>`;



        html += `</tr></thead><tbody>`;



        if (notasAluno.length === 0) {

            const colSpan = trimestreSelecionado === '3' ? 6 : 4;

            html += `<tr><td colspan="${colSpan}">Nenhuma nota registrada.</td></tr>`;

        } else {

            notasAluno.forEach(reg => {

                const mt1 = calcularMT(reg.mac1, reg.np1);

                const mt2 = calcularMT(reg.mac2, reg.np2);

                const mt3 = calcularMT(reg.mac3, reg.np3);



                html += `<tr><td style="text-align: left;"><strong>${escapeHTML(reg.disciplina)}</strong></td>`;



                if (trimestreSelecionado === '1') {

                    const macStr = reg.mac1 !== null && reg.mac1 !== undefined ? reg.mac1.toFixed(1) : '-';

                    const npStr = reg.np1 !== null && reg.np1 !== undefined ? reg.np1.toFixed(1) : '-';

                    const mtStr = mt1 !== null ? `<strong>${mt1.toFixed(1)}</strong>` : '-';

                    html += `<td>${macStr}</td><td>${npStr}</td><td>${mtStr}</td>`;

                } else if (trimestreSelecionado === '2') {

                    const macStr = reg.mac2 !== null && reg.mac2 !== undefined ? reg.mac2.toFixed(1) : '-';

                    const npStr = reg.np2 !== null && reg.np2 !== undefined ? reg.np2.toFixed(1) : '-';

                    const mtStr = mt2 !== null ? `<strong>${mt2.toFixed(1)}</strong>` : '-';

                    html += `<td>${macStr}</td><td>${npStr}</td><td>${mtStr}</td>`;

                } else if (trimestreSelecionado === '3') {

                    const mt1Str = mt1 !== null ? mt1.toFixed(1) : '-';

                    const mt2Str = mt2 !== null ? mt2.toFixed(1) : '-';

                    const mt3Str = mt3 !== null ? mt3.toFixed(1) : '-';



                    // Cálculo da MFD apenas com trimestres válidos

                    let mtsValidas = [mt1, mt2, mt3].filter(v => v !== null);

                    let mfd = mtsValidas.length > 0 ? (mtsValidas.reduce((a, b) => a + b, 0) / mtsValidas.length) : null;

                    let mfdStr = mfd !== null ? `<strong>${mfd.toFixed(1)}</strong>` : '-';



                    let statusClass = 'badge-warning';

                    let statusText = 'Em Curso';



                    if (mfd !== null) {

                        statusClass = mfd >= 10 ? 'badge-success' : 'badge-danger';

                        statusText = mfd >= 10 ? 'Aprovado' : 'Reprovado';

                    }



                    html += `

                        <td>${mt1Str}</td>

                        <td>${mt2Str}</td>

                        <td>${mt3Str}</td>

                        <td>${mfdStr}</td>

                        <td><span class="badge ${statusClass}">${statusText}</span></td>

                    `;

                }

                html += `</tr>`;

            });

        }



        html += `</tbody></table>`;

        container.innerHTML = html;

    }



    // --- GUARDA DE NOTAS E VALIDAÇÃO DE PERMISSÕES ---

    function salvarNota() {

        if (!usuarioLogado || (usuarioLogado.perfil !== 'CRIADOR' && usuarioLogado.perfil !== 'PROFESSOR')) {

            alert("Acesso Negado: O seu perfil não possui permissão para efetuar alterações de notas.");

            return;

        }



        const alunoId = document.getElementById('notaAlunoSelect').value;

        const disciplina = document.getElementById('notaDisciplina').value.trim();

        const tri = document.getElementById('trimestreLancamento').value;

        

        const macValInput = document.getElementById('macVal').value;

        const npValInput = document.getElementById('npVal').value;



        const mac = validarNota(macValInput);

        const np = validarNota(npValInput);



        if (mac === false || np === false) {

            alert("Erro de Validação: As notas devem estar entre 0 e 20.");

            return;

        }



        if (!disciplina) {

            alert("Por favor, preencha o nome da disciplina.");

            return;

        }



        let reg = db.notas.find(n => n.alunoId === alunoId && n.disciplina.toLowerCase() === disciplina.toLowerCase());



        if (!reg) {

            reg = { alunoId, disciplina, mac1: null, np1: null, mac2: null, np2: null, mac3: null, np3: null };

            db.notas.push(reg);

        }



        if (tri === '1') { reg.mac1 = mac; reg.np1 = np; }

        else if (tri === '2') { reg.mac2 = mac; reg.np2 = np; }

        else if (tri === '3') { reg.mac3 = mac; reg.np3 = np; }



        DBManager.saveDB(db);

        alert("Nota gravada com sucesso!");

    }



    // --- GESTÃO DE ALUNOS & UTILIZADORES ---

    function renderAlunos() {

        const tbody = document.getElementById('tabelaAlunosBody');

        tbody.innerHTML = '';

        const isAdmin = usuarioLogado.perfil === 'CRIADOR' || usuarioLogado.perfil === 'ADMINISTRATIVO';



        db.alunos.forEach(a => {

            let tr = `<tr>

                <td>${escapeHTML(a.nome)}</td>

                <td>${escapeHTML(a.classe)}</td>

                <td>${escapeHTML(a.turma)}</td>`;

            

            if (isAdmin) {

                tr += `<td><button class="btn btn-danger" onclick="eliminarAluno('${a.id}')">Eliminar</button></td>`;

            } else {

                tr += `<td>-</td>`;

            }



            tr += `</tr>`;

            tbody.innerHTML += tr;

        });

    }



    function eliminarAluno(id) {

        if (!usuarioLogado || (usuarioLogado.perfil !== 'CRIADOR' && usuarioLogado.perfil !== 'ADMINISTRATIVO')) {

            alert("Sem permissão para eliminar cadastros.");

            return;

        }



        if (confirm("Tem a certeza que deseja eliminar este aluno do sistema?")) {

            db.alunos = db.alunos.filter(a => a.id !== id);

            db.notas = db.notas.filter(n => n.alunoId !== id);

            DBManager.saveDB(db);

            carregarSelects();

            renderAlunos();

        }

    }



    function renderUsuarios() {

        const tbody = document.getElementById('tabelaUsuariosBody');

        tbody.innerHTML = '';



        db.usuarios.forEach(u => {

            let tr = `<tr>

                <td>${escapeHTML(u.email)}</td>

                <td><strong>${escapeHTML(u.perfil)}</strong></td>

                <td><span class="badge ${u.status === 'APROVADO' ? 'badge-success' : 'badge-warning'}">${escapeHTML(u.status)}</span></td>

                <td>`;

            

            if (u.perfil !== 'CRIADOR') {

                if (u.status === 'PENDENTE') {

                    tr += `<button class="btn btn-success" onclick="aprovarUsuario('${u.id}')">Validar</button> `;

                }

                tr += `<button class="btn btn-danger" onclick="eliminarUsuario('${u.id}')">Eliminar</button>`;

            } else {

                tr += `<small>Criador do Sistema</small>`;

            }



            tr += `</td></tr>`;

            tbody.innerHTML += tr;

        });

    }



    function aprovarUsuario(id) {

        const u = db.usuarios.find(user => user.id === id);

        if (u) {

            u.status = 'APROVADO';

            DBManager.saveDB(db);

            renderUsuarios();

        }

    }



    function eliminarUsuario(id) {

        if (confirm("Deseja eliminar este utilizador do sistema?")) {

            db.usuarios = db.usuarios.filter(u => u.id !== id);

            DBManager.saveDB(db);

            renderUsuarios();

        }

    }

</script>

</body>

</html>



Analisa o meu programa e faça me fale no que posso melhorar e acrescentar.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://j-zymar-school.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/eb915162-19ec-4b51-8c97-f14db568e605).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
