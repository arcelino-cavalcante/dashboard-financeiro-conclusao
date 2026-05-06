// --- Initial Data Structure ---
const defaultData = {
    config: {
        installments: 10,
        installmentValue: 50.00
    },
    students: {
        "turma-a": [
            { id: "a1", name: "ANA BEATRIZ COSTA DA SILVA", paid: [] },
            { id: "a2", name: "ANA MILENA OLIVEIRA DA SILVA", paid: [] },
            { id: "a3", name: "ARTHUR OLIVEIRA SILVA", paid: [] },
            { id: "a4", name: "BEATRIZ COSTA SANTOS", paid: [] },
            { id: "a5", name: "DAVI SANTOS MOREIRA DUARTE", paid: [] },
            { id: "a6", name: "EDVANIO BELO DE BRITO JUNIOR", paid: [] },
            { id: "a7", name: "EVERLLAYNE SANTANA DE FREITAS", paid: [] },
            { id: "a8", name: "GABRIEL SEVERINO CORDEIRO DE FREITAS", paid: [] },
            { id: "a9", name: "JAIANE VITÓRIA FLORENTINO PEIXOTO", paid: [] },
            { id: "a10", name: "JAKSYELLE OLIVEIRA DA SILVA", paid: [] },
            { id: "a11", name: "JOALISSON SILVA SANTOS", paid: [] },
            { id: "a12", name: "JOÃO NÍCOLAS SANTOS DE LIMA", paid: [] },
            { id: "a13", name: "JONATHAN ALEXANDRE CANDIDO DA SILVA", paid: [] },
            { id: "a14", name: "JOSE RAMON MACIEL GOUVEIA", paid: [] },
            { id: "a15", name: "LARA JAMILE CARDOSO DOS SANTOS", paid: [] },
            { id: "a16", name: "LUAN ALEXANDRE BARROS FERREIRA", paid: [] },
            { id: "a17", name: "LUIZ HENRIQUE DA SILVA BARROS", paid: [] },
            { id: "a18", name: "MARIA CECÍLIA SOARES DOS SANTOS", paid: [] },
            { id: "a19", name: "MARIA LUIZA DA SILVA BELO", paid: [] },
            { id: "a20", name: "MIRELLY VITTORIA LINO DA SILVA", paid: [] },
            { id: "a21", name: "NYCOLLY REBECA COSTA DA ROCHA", paid: [] },
            { id: "a22", name: "PEDRO JUAN TORRES DA SILVA", paid: [] },
            { id: "a23", name: "PEDRO SEBASTIÃO CORDEIRO DE FREITAS", paid: [] },
            { id: "a24", name: "RAÍSSA SILVA DOS SANTOS", paid: [] },
            { id: "a25", name: "RENNÊ SOARES DE MELO", paid: [] },
            { id: "a26", name: "SAMUEL HENRIQUE DA SILVA QUEIROZ", paid: [] },
            { id: "a27", name: "SARA VITÓRIA ALVES DA SILVA", paid: [] },
            { id: "a28", name: "STEFANNY REBECA DA SILVA MELO", paid: [] },
            { id: "a29", name: "TALISSON PEREIRA DOS SANTOS", paid: [] }
        ],
        "turma-b": [
            { id: "b1", name: "NYCOLAS GESSIRREL RODRIGUES", paid: [] },
            { id: "b2", name: "ALDEMIR ISAC DA SILVA", paid: [] },
            { id: "b3", name: "ANDRIELE PEREIRA EVARISTO", paid: [] },
            { id: "b4", name: "CAMILA LIMA DA SILVA", paid: [] },
            { id: "b5", name: "CLEBERSON ANDRADE SOARES", paid: [] },
            { id: "b6", name: "EMILLY RODRIGUES DA SILVA", paid: [] },
            { id: "b7", name: "FABIO MIGUEL FERREIRA DA SILVA", paid: [] },
            { id: "b8", name: "ÍGOR MONTEIRO DE SOUZA", paid: [] },
            { id: "b9", name: "JAMERSON VINÍCIUS MUNIZ FERREIRA", paid: [] },
            { id: "b10", name: "JOSÉ VANDERSON DA SILVA PEREIRA", paid: [] },
            { id: "b11", name: "KEMILY SOPHIA FERREIRA SOARES", paid: [] },
            { id: "b12", name: "LAIANE FAUSTINO DE LIMA", paid: [] },
            { id: "b13", name: "LAÍS FAUSTINO DE LIMA", paid: [] },
            { id: "b14", name: "MACLINE SILVA DE BARROS", paid: [] },
            { id: "b15", name: "MÁRCIA RAYANNE FERREIRA DA SILVA", paid: [] },
            { id: "b16", name: "MARIA ANAIR DA SILVA", paid: [] },
            { id: "b17", name: "MARLO NAAMÃ SIQUEIRA DA SILVA", paid: [] },
            { id: "b18", name: "NAUANNY JULIA SOARES DA SILVA", paid: [] },
            { id: "b19", name: "SAMILY VITORIA EVARISTO DA SILVA", paid: [] },
            { id: "b20", name: "SARA SAMPAIO DO SANTOS", paid: [] },
            { id: "b21", name: "THACIANNE JOSEFA CORDEIRO DOS SANTOS CAVALCANTE", paid: [] },
            { id: "b22", name: "VITOR GABRIEL FERREIRA DA SILVA", paid: [] },
            { id: "b23", name: "VITORIA GABRIELI CORDEIRO DA SILVA", paid: [] }
        ]
    },
    transactions: [], // {id, type(income/expense), desc, value, date}
    paymentLists: [] // {id, name, turma, totalParts, partValue, createdAt, payments: { studentId: [partNumbers] }}
};

let appData = {};
const classTabState = {
    'turma-a': 'base',
    'turma-b': 'base'
};

// --- Initialization ---
async function initApp() {
    setupNavigation();
    setupModals();
    setupPaymentListForm();
    
    // Load local settings for GitHub
    loadGithubConfigUI();

    // Try to load data from localStorage or GitHub
    await loadData();
    
    renderApp();
}

async function loadData() {
    // Check if Github is configured
    const ghConf = getGithubConfig();
    let dataLoaded = false;

    if (ghConf && ghConf.token && ghConf.repo) {
        updateSyncStatus('syncing', 'Sincronizando...');
        try {
            if (typeof fetchFromGithub === 'function') {
                const data = await fetchFromGithub(ghConf);
                if (data) {
                    appData = data;
                    dataLoaded = true;
                    updateSyncStatus('synced', 'Sincronizado');
                } else {
                    updateSyncStatus('error', 'Repo Vazio / Será criado ao salvar');
                }
            } else {
                updateSyncStatus('error', 'github-db.js não carregado');
            }
        } catch (e) {
            console.error(e);
            updateSyncStatus('error', 'Erro Github');
        }
    }

    if (!dataLoaded) {
        // Fallback to local storage
        const localData = localStorage.getItem('dashboardData');
        if (localData) {
            appData = JSON.parse(localData);
        } else {
            appData = JSON.parse(JSON.stringify(defaultData)); // Deep copy
        }
        if (!ghConf || !ghConf.token) {
            updateSyncStatus('local', 'Local Storage');
        }
    }

    applyDataCompatibilityFixes();
}

async function saveData() {
    let githubAttempted = false;
    let githubSaved = false;
    
    // Save to local storage
    localStorage.setItem('dashboardData', JSON.stringify(appData));
    
    // Sync with Github if configured
    const ghConf = getGithubConfig();
    if (ghConf && ghConf.token && ghConf.repo) {
        githubAttempted = true;
        updateSyncStatus('syncing', 'Salvando...');
        try {
            if (typeof saveToGithub === 'function') {
                await saveToGithub(ghConf, appData);
                updateSyncStatus('synced', 'Sincronizado');
                githubSaved = true;
            }
        } catch (e) {
            console.error(e);
            updateSyncStatus('error', 'Erro ao Salvar no Github');
        }
    }
    
    renderApp();
    return { githubAttempted, githubSaved };
}

function updateSyncStatus(status, text) {
    const el = document.getElementById('sync-status');
    if (!el) return;
    el.className = 'sync-status ' + status;
    let icon = 'fa-cloud';
    if(status === 'local') icon = 'fa-hdd';
    if(status === 'syncing') icon = 'fa-sync fa-spin';
    if(status === 'synced') icon = 'fa-check-circle';
    if(status === 'error') icon = 'fa-exclamation-triangle';
    
    el.innerHTML = `<i class="fas ${icon}"></i> ${text}`;
}

// --- Navigation ---
function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');
    const pageTitle = document.getElementById('page-title');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            navBtns.forEach(b => b.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));

            // Add active to clicked
            btn.classList.add('active');
            const target = btn.getAttribute('data-target');
            document.getElementById(target).classList.add('active');

            // Update title
            pageTitle.innerText = btn.innerText.trim();
        });
    });
}

// --- Modals ---
function setupModals() {
    document.getElementById('transaction-form').addEventListener('submit', handleTransactionSubmit);
    document.getElementById('payment-list-edit-form').addEventListener('submit', handlePaymentListEditSubmit);
    document.getElementById('github-setup-form').addEventListener('submit', handleGithubSetupSubmit);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const transactionModal = document.getElementById('transaction-modal');
        const paymentListEditModal = document.getElementById('payment-list-edit-modal');
        const githubSetupModal = document.getElementById('github-setup-modal');
        if (e.target === transactionModal) closeTransactionModal();
        if (e.target === paymentListEditModal) closePaymentListEditModal();
        if (e.target === githubSetupModal) closeGithubSetupModal();
    });
}

function setupPaymentListForm() {
    const form = document.getElementById('payment-list-form');
    if (!form) return;

    form.addEventListener('submit', handlePaymentListSubmit);
}

async function manualSaveToGithub() {
    if (!isGithubConfigured()) {
        openGithubSetupModal();
        alert('Configure o GitHub para ativar o envio online.');
        return;
    }

    const result = await saveData();

    if (result.githubAttempted && result.githubSaved) {
        alert('Alterações salvas e enviadas para o GitHub com sucesso!');
        return;
    }

    if (result.githubAttempted && !result.githubSaved) {
        alert('Os dados foram salvos localmente, mas houve erro ao enviar para o GitHub.');
        return;
    }

    alert('Dados salvos localmente. Para enviar ao GitHub, configure o repositório e token em Configurações.');
}

function openTransactionModal(id = null) {
    const modal = document.getElementById('transaction-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('transaction-form');
    
    form.reset();
    document.getElementById('trans-id').value = '';
    document.getElementById('trans-date').valueAsDate = new Date();

    if (id) {
        title.innerText = 'Editar Lançamento';
        const t = appData.transactions.find(x => x.id === id);
        if (t) {
            document.getElementById('trans-id').value = t.id;
            document.getElementById('trans-type').value = t.type;
            document.getElementById('trans-desc').value = t.desc;
            document.getElementById('trans-value').value = t.value;
            document.getElementById('trans-date').value = t.date;
        }
    } else {
        title.innerText = 'Novo Lançamento';
    }

    modal.classList.add('active');
}

function closeTransactionModal() {
    document.getElementById('transaction-modal').classList.remove('active');
}

function openPaymentListEditModal(listId) {
    const list = (appData.paymentLists || []).find(x => x.id === listId);
    if (!list) return;

    document.getElementById('edit-list-id').value = list.id;
    document.getElementById('edit-list-name').value = list.name;
    document.getElementById('edit-list-turma').value = list.turma;
    document.getElementById('edit-list-parts').value = list.totalParts;
    document.getElementById('edit-list-part-value').value = list.partValue;
    document.getElementById('payment-list-edit-modal').classList.add('active');
}

function closePaymentListEditModal() {
    document.getElementById('payment-list-edit-modal').classList.remove('active');
}

function openGithubSetupModal() {
    const ghConf = getGithubConfig();
    document.getElementById('setup-repo').value = ghConf?.repo || '';
    document.getElementById('setup-branch').value = ghConf?.branch || 'main';
    document.getElementById('setup-token').value = ghConf?.token || '';
    document.getElementById('github-setup-modal').classList.add('active');
}

function closeGithubSetupModal() {
    document.getElementById('github-setup-modal').classList.remove('active');
}

async function handleGithubSetupSubmit(e) {
    e.preventDefault();

    const repo = document.getElementById('setup-repo').value.trim();
    const branch = (document.getElementById('setup-branch').value.trim() || 'main');
    const token = document.getElementById('setup-token').value.trim();

    if (!repo || !token) {
        alert('Preencha repositório e token.');
        return;
    }

    persistGithubConfig(repo, branch, token);
    closeGithubSetupModal();
    document.getElementById('github-status-msg').innerHTML = `<span style="color: var(--income-color)"><i class="fas fa-check"></i> Configuração rápida salva.</span>`;
    await loadData();
    renderApp();
    alert('GitHub configurado com sucesso. Agora o botão Salvar já envia para o repositório.');
}

// --- Render Core ---
function renderApp() {
    renderDashboard();
    renderClassSection('turma-a');
    renderClassSection('turma-b');
    renderTransactions();
    renderPaymentLists();
    renderConfig();
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function applyDataCompatibilityFixes() {
    if (!appData.config) appData.config = defaultData.config;
    if (!appData.students) appData.students = defaultData.students;
    if (!appData.transactions) appData.transactions = [];
    if (!appData.paymentLists) appData.paymentLists = [];
    appData.paymentLists = (appData.paymentLists || []).map(normalizePaymentList).filter(Boolean);
}

function getTurmaLabel(turma) {
    return turma === 'turma-a' ? '9º Ano A' : '9º Ano B';
}

function normalizePaymentList(rawList) {
    if (!rawList || !rawList.id || !rawList.name || !rawList.turma) return null;

    const totalParts = Math.max(1, parseInt(rawList.totalParts) || 1);
    const partValue = Math.max(0, parseFloat(rawList.partValue) || 0);
    const payments = {};

    Object.entries(rawList.payments || {}).forEach(([studentId, parts]) => {
        if (!Array.isArray(parts)) return;
        const validParts = Array.from(
            new Set(
                parts
                    .map(p => parseInt(p))
                    .filter(p => Number.isInteger(p) && p >= 1 && p <= totalParts)
            )
        ).sort((a, b) => a - b);
        payments[studentId] = validParts;
    });

    return {
        id: rawList.id,
        name: String(rawList.name),
        turma: rawList.turma === 'turma-b' ? 'turma-b' : 'turma-a',
        totalParts,
        partValue,
        createdAt: rawList.createdAt || new Date().toISOString(),
        payments
    };
}

function calculatePaymentListsMetrics() {
    let totalPaidParts = 0;
    let totalPossibleParts = 0;
    let totalCollected = 0;

    (appData.paymentLists || []).forEach(list => {
        const students = appData.students[list.turma] || [];
        totalPossibleParts += students.length * list.totalParts;

        students.forEach(student => {
            const paidParts = list.payments?.[student.id] || [];
            const paidCount = paidParts.length;
            totalPaidParts += paidCount;
            totalCollected += paidCount * list.partValue;
        });
    });

    return { totalPaidParts, totalPossibleParts, totalCollected };
}

// --- Dashboard ---
function renderDashboard() {
    let installmentsIncome = 0;
    let totalInstallmentsPaid = 0;
    let totalInstallmentsPossible = 0;

    // Calculate from students
    const vParcela = parseFloat(appData.config.installmentValue) || 0;
    const numParcelas = parseInt(appData.config.installments) || 0;

    ['turma-a', 'turma-b'].forEach(turma => {
        const students = appData.students[turma] || [];
        totalInstallmentsPossible += students.length * numParcelas;
        
        students.forEach(s => {
            const paidCount = (s.paid || []).length;
            totalInstallmentsPaid += paidCount;
            installmentsIncome += paidCount * vParcela;
        });
    });

    const listMetrics = calculatePaymentListsMetrics();
    totalInstallmentsPaid += listMetrics.totalPaidParts;
    totalInstallmentsPossible += listMetrics.totalPossibleParts;
    installmentsIncome += listMetrics.totalCollected;

    let extraIncome = 0;
    let totalExpense = 0;

    // Calculate from transactions
    (appData.transactions || []).forEach(t => {
        if (t.type === 'income') extraIncome += parseFloat(t.value);
        if (t.type === 'expense') totalExpense += parseFloat(t.value);
    });

    const totalIncome = installmentsIncome + extraIncome;
    const balance = totalIncome - totalExpense;

    document.getElementById('total-income').innerText = formatCurrency(totalIncome);
    document.getElementById('total-expense').innerText = formatCurrency(totalExpense);
    document.getElementById('total-balance').innerText = formatCurrency(balance);
    document.getElementById('total-installments-count').innerText = `${totalInstallmentsPaid} / ${totalInstallmentsPossible}`;

    // Update progress bars
    updateProgressBar('turma-a', 'progress-a');
    updateProgressBar('turma-b', 'progress-b');
}

function updateProgressBar(turma, elementId) {
    const students = appData.students[turma] || [];
    const numParcelas = parseInt(appData.config.installments) || 0;
    const max = students.length * numParcelas;
    
    let paid = 0;
    students.forEach(s => {
        paid += (s.paid || []).length;
    });

    const pct = max > 0 ? Math.round((paid / max) * 100) : 0;
    const el = document.getElementById(elementId);
    el.style.width = `${pct}%`;
    el.innerText = `${pct}%`;
}

// --- Classes ---
function renderClassSection(turma) {
    const ids = turma === 'turma-a'
        ? { tabs: 'class-tabs-a', head: 'table-head-a', body: 'table-body-a', summary: 'summary-a' }
        : { tabs: 'class-tabs-b', head: 'table-head-b', body: 'table-body-b', summary: 'summary-b' };

    renderClassTabs(turma, ids.tabs);
    renderClassTable(turma, ids.head, ids.body, ids.summary);
}

function getClassTabs(turma) {
    const listTabs = (appData.paymentLists || [])
        .filter(list => list.turma === turma)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(list => ({ id: list.id, label: list.name }));

    return [{ id: 'base', label: 'Mensalidade' }, ...listTabs];
}

function renderClassTabs(turma, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const tabs = getClassTabs(turma);
    const isCurrentValid = tabs.some(tab => tab.id === classTabState[turma]);
    if (!isCurrentValid) classTabState[turma] = 'base';

    container.innerHTML = tabs.map(tab => `
        <button
            class="class-tab-btn ${classTabState[turma] === tab.id ? 'active' : ''}"
            onclick="setClassTab('${turma}', '${tab.id}')"
            type="button"
        >
            ${tab.label}
        </button>
    `).join('');
}

function setClassTab(turma, tabId) {
    classTabState[turma] = tabId;
    renderClassSection(turma);
}

function renderClassTable(turma, headId, bodyId, summaryId) {
    const students = appData.students[turma] || [];
    const activeTabId = classTabState[turma] || 'base';
    const selectedList = activeTabId === 'base'
        ? null
        : (appData.paymentLists || []).find(list => list.id === activeTabId && list.turma === turma);
    const numParcelas = selectedList
        ? selectedList.totalParts
        : (parseInt(appData.config.installments) || 0);
    
    const thead = document.getElementById(headId);
    let ths = '<th>Aluno</th>';
    if (selectedList) ths += '<th>Status</th>';
    for (let i = 1; i <= numParcelas; i++) {
        ths += `<th>Parc. ${i}</th>`;
    }
    thead.innerHTML = ths;

    const tbody = document.getElementById(bodyId);
    let html = '';
    
    let paidInClass = 0;

    students.forEach((s, sIndex) => {
        const paidArr = selectedList ? (selectedList.payments?.[s.id] || []) : (s.paid || []);
        paidInClass += paidArr.length;

        html += `<tr>
            <td>${sIndex + 1}. ${s.name}</td>`;

        if (selectedList) {
            let statusLabel = `<span class="payment-status status-pending">Pendente</span>`;
            if (paidArr.length >= numParcelas) {
                statusLabel = `<span class="payment-status status-paid">Quitado</span>`;
            } else if (paidArr.length > 0) {
                statusLabel = `<span class="payment-status status-partial">Parcial (${paidArr.length}/${numParcelas})</span>`;
            }
            html += `<td>${statusLabel}</td>`;
        }
            
        for (let i = 1; i <= numParcelas; i++) {
            const isPaid = paidArr.includes(i);
            const changeAction = selectedList
                ? `togglePaymentListPart('${selectedList.id}', '${s.id}', ${i})`
                : `toggleInstallment('${turma}', '${s.id}', ${i})`;
            html += `
            <td>
                <label class="custom-checkbox">
                    <input type="checkbox" onchange="${changeAction}" ${isPaid ? 'checked' : ''}>
                    <span class="checkmark"><i class="fas fa-check"></i></span>
                </label>
            </td>`;
        }
        html += `</tr>`;
    });
    
    tbody.innerHTML = html;
    
    const totalPossible = students.length * numParcelas;
    document.getElementById(summaryId).innerText = selectedList
        ? `${selectedList.name}: ${paidInClass}/${totalPossible} Pagas`
        : `${paidInClass}/${totalPossible} Pagas`;
}

function toggleInstallment(turma, studentId, parcelNumber) {
    const student = appData.students[turma].find(s => s.id === studentId);
    if (!student) return;

    if (!student.paid) student.paid = [];
    
    const idx = student.paid.indexOf(parcelNumber);
    if (idx > -1) {
        // Remove
        student.paid.splice(idx, 1);
    } else {
        // Add
        student.paid.push(parcelNumber);
    }
    
    saveData(); // Will trigger save and re-render
}

// --- Financeiro ---
function renderTransactions() {
    const tbody = document.getElementById('transactions-body');
    let html = '';
    
    // Sort by date desc
    const sorted = [...(appData.transactions || [])].sort((a,b) => new Date(b.date) - new Date(a.date));

    if (sorted.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">Nenhum lançamento encontrado.</td></tr>`;
        return;
    }

    sorted.forEach(t => {
        const dateObj = new Date(t.date);
        // Correct timezone issue for display
        dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
        const dateStr = dateObj.toLocaleDateString('pt-BR');
        
        const typeStr = t.type === 'income' ? 'Entrada' : 'Saída';
        const valClass = t.type === 'income' ? 'income' : 'expense';
        
        html += `
        <tr>
            <td>${dateStr}</td>
            <td>${t.desc}</td>
            <td><span class="amount ${valClass}">${typeStr}</span></td>
            <td class="amount ${valClass}">${formatCurrency(t.value)}</td>
            <td>
                <button class="btn-icon" onclick="openTransactionModal('${t.id}')" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" onclick="deleteTransaction('${t.id}')" title="Excluir"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    });
    
    tbody.innerHTML = html;
}

function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('trans-id').value;
    const type = document.getElementById('trans-type').value;
    const desc = document.getElementById('trans-desc').value;
    const value = parseFloat(document.getElementById('trans-value').value);
    const date = document.getElementById('trans-date').value;
    
    if (id) {
        // Edit
        const t = appData.transactions.find(x => x.id === id);
        if (t) {
            t.type = type;
            t.desc = desc;
            t.value = value;
            t.date = date;
        }
    } else {
        // New
        appData.transactions.push({
            id: 't_' + Date.now(),
            type,
            desc,
            value,
            date
        });
    }
    
    closeTransactionModal();
    saveData();
}

function deleteTransaction(id) {
    if(confirm('Tem certeza que deseja excluir este lançamento?')) {
        appData.transactions = appData.transactions.filter(t => t.id !== id);
        saveData();
    }
}

// --- Listas de Pagamento ---
function handlePaymentListSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('list-name').value.trim();
    const turma = document.getElementById('list-turma').value;
    const totalParts = parseInt(document.getElementById('list-parts').value);
    const partValue = parseFloat(document.getElementById('list-part-value').value);

    if (!name) {
        alert('Informe um nome para a lista.');
        return;
    }
    if (!Number.isInteger(totalParts) || totalParts < 1) {
        alert('Informe uma quantidade de parcelas válida.');
        return;
    }
    if (isNaN(partValue) || partValue < 0) {
        alert('Informe um valor de parcela válido.');
        return;
    }

    appData.paymentLists.push({
        id: 'pl_' + Date.now(),
        name,
        turma,
        totalParts,
        partValue,
        createdAt: new Date().toISOString(),
        payments: {}
    });

    e.target.reset();
    document.getElementById('list-parts').value = 1;
    document.getElementById('list-part-value').value = '0.00';
    alert(`Lista "${name}" criada. Ela já aparece na aba da turma ${getTurmaLabel(turma)}.`);
    saveData();
}

function renderPaymentLists() {
    const container = document.getElementById('payment-lists-container');
    if (!container) return;

    const lists = [...(appData.paymentLists || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (lists.length === 0) {
        container.innerHTML = `
            <div class="glass-panel empty-state">
                Nenhuma lista criada ainda. Crie listas para fardas, rifas, viagens ou qualquer outro pagamento.
            </div>
        `;
        return;
    }

    container.innerHTML = lists.map(list => `
        <div class="glass-panel payment-list-card">
            <div class="payment-list-header">
                <div>
                    <h3>${list.name}</h3>
                    <p class="payment-list-meta">
                        Turma: ${getTurmaLabel(list.turma)} | Parcelas: ${list.totalParts} | Valor: ${formatCurrency(list.partValue)}
                    </p>
                    <p class="payment-list-meta">
                        Controle de pagamento disponível na aba da turma correspondente.
                    </p>
                </div>
                <div class="payment-list-actions">
                    <button class="btn btn-secondary" onclick="openPaymentListEditModal('${list.id}')">
                        <i class="fas fa-pen"></i> Editar
                    </button>
                    <button class="btn btn-secondary" onclick="deletePaymentList('${list.id}')">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function handlePaymentListEditSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('edit-list-id').value;
    const name = document.getElementById('edit-list-name').value.trim();
    const turma = document.getElementById('edit-list-turma').value;
    const totalParts = parseInt(document.getElementById('edit-list-parts').value);
    const partValue = parseFloat(document.getElementById('edit-list-part-value').value);

    if (!name) {
        alert('Informe um nome para a lista.');
        return;
    }
    if (!Number.isInteger(totalParts) || totalParts < 1) {
        alert('Informe uma quantidade de parcelas válida.');
        return;
    }
    if (isNaN(partValue) || partValue < 0) {
        alert('Informe um valor de parcela válido.');
        return;
    }

    const list = (appData.paymentLists || []).find(x => x.id === id);
    if (!list) {
        alert('Lista não encontrada.');
        return;
    }

    const oldTurma = list.turma;
    list.name = name;
    list.turma = turma;
    list.totalParts = totalParts;
    list.partValue = partValue;

    if (oldTurma !== turma) {
        list.payments = {};
    } else {
        Object.keys(list.payments || {}).forEach(studentId => {
            list.payments[studentId] = (list.payments[studentId] || [])
                .filter(part => part >= 1 && part <= totalParts)
                .sort((a, b) => a - b);
        });
    }

    closePaymentListEditModal();
    saveData();
}

function togglePaymentListPart(listId, studentId, partNumber) {
    const list = (appData.paymentLists || []).find(x => x.id === listId);
    if (!list) return;

    if (!list.payments) list.payments = {};
    if (!Array.isArray(list.payments[studentId])) list.payments[studentId] = [];

    const idx = list.payments[studentId].indexOf(partNumber);
    if (idx > -1) {
        list.payments[studentId].splice(idx, 1);
    } else {
        list.payments[studentId].push(partNumber);
        list.payments[studentId].sort((a, b) => a - b);
    }

    saveData();
}

function deletePaymentList(listId) {
    if (!confirm('Tem certeza que deseja excluir esta lista de pagamento?')) return;
    appData.paymentLists = (appData.paymentLists || []).filter(list => list.id !== listId);
    saveData();
}

// --- Configurações ---
function renderConfig() {
    document.getElementById('config-installments').value = appData.config.installments || 10;
    document.getElementById('config-value').value = appData.config.installmentValue || 50.00;
}

function saveParcelConfig() {
    const num = parseInt(document.getElementById('config-installments').value);
    const val = parseFloat(document.getElementById('config-value').value);
    
    if (num > 0 && val >= 0) {
        appData.config.installments = num;
        appData.config.installmentValue = val;
        saveData();
        alert('Configurações de parcelas salvas com sucesso!');
    } else {
        alert('Valores inválidos.');
    }
}

function loadGithubConfigUI() {
    const ghConf = getGithubConfig();
    document.getElementById('config-repo').value = ghConf?.repo || '';
    document.getElementById('config-branch').value = ghConf?.branch || 'main';
    document.getElementById('config-token').value = ghConf?.token || '';
}

async function saveGithubConfig() {
    const repo = document.getElementById('config-repo').value.trim();
    const branch = (document.getElementById('config-branch').value.trim() || 'main');
    const token = document.getElementById('config-token').value.trim();
    
    if(!repo || !token) {
        alert("Preencha o repositório e o token para ativar a sincronização.");
        return;
    }
    
    persistGithubConfig(repo, branch, token);
    
    document.getElementById('github-status-msg').innerHTML = `<span style="color: var(--income-color)"><i class="fas fa-check"></i> Configurações do GitHub salvas. Tentando baixar dados...</span>`;
    
    await loadData(); // Re-trigger load to sync
    renderApp();
}

function getGithubConfig() {
    // 1. Tenta usar os dados diretamente do HTML se o usuário preencheu o token
    if (typeof HARDCODED_GITHUB_CONFIG !== 'undefined' &&
        HARDCODED_GITHUB_CONFIG.token && 
        HARDCODED_GITHUB_CONFIG.token !== "SEU_TOKEN_AQUI" &&
        HARDCODED_GITHUB_CONFIG.repo &&
        HARDCODED_GITHUB_CONFIG.repo !== "SEU_USUARIO/SEU_REPOSITORIO") {
        return HARDCODED_GITHUB_CONFIG;
    }

    // 2. Fallback: usa os dados do localStorage (salvos pela interface)
    const raw = localStorage.getItem('ghConfig');
    return raw ? JSON.parse(raw) : null;
}

function isGithubConfigured() {
    const ghConf = getGithubConfig();
    return Boolean(ghConf?.repo && ghConf?.token);
}

function persistGithubConfig(repo, branch, token) {
    localStorage.setItem('ghConfig', JSON.stringify({ repo, branch, token }));
    document.getElementById('config-repo').value = repo;
    document.getElementById('config-branch').value = branch;
    document.getElementById('config-token').value = token;
}

async function syncFromGithub() {
    if (!isGithubConfigured()) {
        openGithubSetupModal();
        alert("Configure e salve o repositório e o token primeiro.");
        return;
    }
    
    document.getElementById('github-status-msg').innerHTML = `<span><i class="fas fa-spinner fa-spin"></i> Baixando dados do GitHub...</span>`;
    await loadData();
    document.getElementById('github-status-msg').innerHTML = `<span style="color: var(--income-color)"><i class="fas fa-check"></i> Sincronizado.</span>`;
}

// --- Backup / Export ---
function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "dashboard_formatura_backup.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const contents = e.target.result;
            const data = JSON.parse(contents);
            
            if (data && data.students && data.config) {
                appData = data;
                applyDataCompatibilityFixes();
                saveData(); // Save to localStorage and potentially Github
                alert("Dados importados com sucesso!");
                document.getElementById('import-file').value = ''; // reset
            } else {
                alert("Arquivo JSON inválido para este sistema.");
            }
        } catch(err) {
            alert("Erro ao ler o arquivo: " + err.message);
        }
    };
    reader.readAsText(file);
}

// Start app
document.addEventListener('DOMContentLoaded', initApp);
