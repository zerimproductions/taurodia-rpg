// ============================================================================
// 🌌 BANCO DE DADOS DE CLASSES E ESPECIALIZAÇÕES
// ============================================================================

// Objeto que mapeia quais especializações pertencem a cada classe principal.
// É usado para preencher dinamicamente o menu de seleção (select) HTML.
const specsPorClasse = {
    sobrevivente: [
        { val: "contrabandista", nome: "Contrabandista" },
        { val: "explorador", nome: "Explorador" },
        { val: "viajante", nome: "Viajante" },
        { val: "campista", nome: "Campista" },
        { val: "estudioso", nome: "Estudioso" }
    ],
    guerreiro: [
        { val: "barbaro", nome: "Bárbaro" },
        { val: "besta", nome: "Besta" },
        { val: "esgrimista", nome: "Esgrimista" },
        { val: "cauteloso", nome: "Cauteloso" },
        { val: "tanque", nome: "Tanque" },
        { val: "manipulador", nome: "Manipulador" },
        { val: "agil", nome: "Ágil" }
    ],
    erudito: [
        { val: "estudioso", nome: "Estudioso" },
        { val: "feiticeiro", nome: "Feiticeiro" },
        { val: "mago", nome: "Mago" },
        { val: "paleontologo", nome: "Paleontólogo" },
        { val: "clerigo", nome: "Clérigo" },
        { val: "domino", nome: "Dominó" }
    ]
};

// ============================================================================
// 🛠️ FUNÇÕES DE ATUALIZAÇÃO E INTERFACE (UI)
// ============================================================================

/**
 * Controla o valor de "Resquícios" (sistema de energia/corrupção de 0 a 100).
 * Sincroniza os componentes visuais e altera a cor do texto dinamicamente.
 */
function updateResquicios(val) {
    // Trava o valor para garantir que ele nunca fique menor que 0 nem maior que 100
    val = Math.max(0, Math.min(100, val));
    
    // Atualiza os elementos HTML (o slider visual e a caixinha de texto numérica)
    document.getElementById('resq-slider').value = val;
    document.getElementById('resq-num').value = val;
    
    // Atualiza o texto do rótulo que exibe o valor atual
    const label = document.getElementById('resq-label-val');
    label.innerText = val;

    // --- Lógica de Interpolação de Cores (RGB) ---
    let r, g, b;
    if (val < 50) { 
        // De 0 a 49: O texto vai mudando gradualmente (ex: de branco para amarelo/verde)
        let ratio = val / 50; 
        r = 255; g = 255 * ratio; b = 255 * ratio; 
    } else { 
        // De 50 a 100: O canal azul diminui, tornando a cor mais quente/avermelhada
        let ratio = (val - 50) / 50; 
        r = 255; g = 255; b = 255 * (1 - ratio); 
    }
    // Aplica a cor gerada diretamente no estilo do elemento HTML
    label.style.color = `rgb(${r}, ${g}, ${b})`;

    // Dispara a atualização das especializações e recalcula os status da ficha
    updateSpecOptions(); 
    atualizarStatus();
}

/**
 * Controla a exibição do campo de Especialização baseado nos Resquícios e na Classe.
 */
function updateSpecOptions() {
    const classe = document.getElementById('char-class').value;
    const resq = parseInt(document.getElementById('resq-num').value) || 0;
    const specSelect = document.getElementById('char-spec');
    const specField = document.getElementById('spec-field');

    // REGRA DE SISTEMA: Se os resquícios estiverem entre 26 e 64, o personagem perde a especialização
    if (resq > 25 && resq < 65) {
        specField.style.display = 'none'; // Esconde o campo visualmente
        if (specSelect.value !== "nenhuma") {
            specSelect.value = "nenhuma"; // Reseta o valor interno
            atualizarStatus();            // Recalcula os status perdidos
        }
        return; // Encerra a função mais cedo
    }

    // Se estiver fora da faixa restrita, exibe o campo novamente
    specField.style.display = 'flex'; 
    
    // Salva o que estava selecionado antes para tentar manter a seleção depois
    const previousValue = specSelect.value;
    
    // Limpa o menu limpando o HTML interno e adiciona a opção padrão
    specSelect.innerHTML = '<option value="nenhuma">Nenhuma</option>';
    
    // Se a classe atual existir no banco de dados, injeta as especializações dela no select
    if (specsPorClasse[classe]) {
        specsPorClasse[classe].forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.val;
            opt.innerHTML = s.nome;
            specSelect.appendChild(opt);
        });
    }

    // Se a especialização que estava selecionada antes ainda existir na nova lista, mantém ela
    if ([...specSelect.options].some(opt => opt.value === previousValue)) {
        specSelect.value = previousValue;
    } else {
        specSelect.value = "nenhuma"; // Caso contrário, volta para "Nenhuma"
    }
}

/**
 * Atualiza visualmente o preenchimento das barras de status
 */
function updateBars() {
    const stats = ['hp', 'fm', 'pc'];
    
    stats.forEach(stat => {
        const curr = parseInt(document.getElementById(`curr-${stat}-text`).innerText) || 0;
        const max = parseInt(document.getElementById(`max_${stat}`).innerText) || 1;
        const bar = document.getElementById(`bar-${stat}-fill`);
        
        let percentage = (curr / max) * 100;
        percentage = Math.max(0, Math.min(100, percentage)); 
        
        bar.style.width = percentage + "%";
    });
}

/**
 * Altera o valor atual de um status (hp, fm ou pc) baseado nos botões + e -
 */
function changeStatus(stat, delta) {
    const textElement = document.getElementById(`curr-${stat}-text`);
    const max = parseInt(document.getElementById(`max_${stat}`).innerText) || 1;
    let curr = parseInt(textElement.innerText) || 0;
    
    curr += delta;
    
    // Impede que o valor seja menor que 0 ou ultrapasse o máximo atual da ficha
    if (curr >= 0 && curr <= max) {
        textElement.innerText = curr;
        updateBars();
    }
}

/**
 * Altera o valor de um atributo básico através dos botões de + e -
 * @param {string} attr - O ID do atributo (ex: 'for', 'agi')
 * @param {number} delta - O modificador, geralmente 1 ou -1
 */
function changeAttr(attr, delta) {
    const input = document.getElementById('v-' + attr);
    let val = parseInt(input.value) || 0;

    // 1. Coleta o valor atual de TODOS os atributos antes da alteração
    const forca = parseInt(document.getElementById('v-for').value) || 0;
    const agi = parseInt(document.getElementById('v-agi').value) || 0;
    const vig = parseInt(document.getElementById('v-vig').value) || 0;
    const int = parseInt(document.getElementById('v-int').value) || 0;
    const esp = parseInt(document.getElementById('v-esp').value) || 0;
    const car = parseInt(document.getElementById('v-car').value) || 0;

    // 2. Calcula quantos pontos já foram distribuídos no total
    const pontosGastos = forca + agi + vig + int + esp + car;

    // 3. Validação: Se tentar adicionar (+1) mas não houver pontos disponíveis, cancela a operação
    if (delta === 1 && pontosGastos >= 10) {
        return; // Sai da função sem fazer nada
    }

    // Aplica a alteração pretendida (+1 ou -1)
    val += delta; 
    
    // REGRA DE SISTEMA: Os atributos básicos brutos individuais ainda só podem ir de 0 a 3
    if (val >= 0 && val <= 3) {
        input.value = val;
        
        // 4. Recalcula os pontos gastos agora com o novo valor atualizado
        const novoForca = parseInt(document.getElementById('v-for').value) || 0;
        const novoAgi = parseInt(document.getElementById('v-agi').value) || 0;
        const novoVig = parseInt(document.getElementById('v-vig').value) || 0;
        const novoInt = parseInt(document.getElementById('v-int').value) || 0;
        const novoEsp = parseInt(document.getElementById('v-esp').value) || 0;
        const novoCar = parseInt(document.getElementById('v-car').value) || 0;
        
        const novosPontosGastos = novoForca + novoAgi + novoVig + novoInt + novoEsp + novoCar;
        
        // 5. Atualiza o contador visual de pontos restantes no HTML
        const pontosRestantesElement = document.getElementById('pontos-restantes');
        if (pontosRestantesElement) {
            pontosRestantesElement.innerText = 10 - novosPontosGastos;
        }

        atualizarStatus(); // Recalcula os status derivados da ficha (HP, FM, PC)
    }
}

// ============================================================================
// 🎲 SISTEMA DE ROLAGEM DE DADOS (MECÂNICAS DO RPG)
// ============================================================================

/**
 * Executa o teste especial de Fragmento Mental (Sistema d100 Inverso)
 */
function rollFragmentoMental() {
    const espBase = parseInt(document.getElementById('v-esp').value) || 0;
    const resqVal = parseInt(document.getElementById('resq-num').value);
    let espTotal = espBase;
    
    // REGRA DE RESQUÍCIO: Ter 0 de Resquício dá +1 temporário no atributo Espiritualidade
    if (resqVal === 0) espTotal += 1;

    // Sorteia um número de 1 a 100 (d100)
    const dado = Math.floor(Math.random() * 100) + 1;
    
    // O redutor diminui o resultado final do dado. Quanto maior o atributo, menor o resultado.
    const redutor = espTotal * 10;
    let resultadoFinal = dado - redutor;
    if (resultadoFinal < 1) resultadoFinal = 1; // O menor resultado possível é fixado em 1

    // Tabela de classificação baseada no resultado final (Valores menores = Resultados Melhores)
    let classificacao = "";
    if (resultadoFinal <= 5)       classificacao = "<b>🌌 Perfeito!</b>";
    else if (resultadoFinal <= 20) classificacao = "☄️ Excelente";
    else if (resultadoFinal <= 40) classificacao = "😃 Bom";
    else if (resultadoFinal <= 60) classificacao = "👍 Normal";
    else if (resultadoFinal <= 80) classificacao = "😢 Quase";
    else if (resultadoFinal <= 95) classificacao = "❌ Falha";
    else                           classificacao = "💀 Desastre";

    // Imprime o relatório formatado na interface usando template strings
    const display = document.getElementById('fragmento-display');
    display.style.display = 'block';
    display.innerHTML = `> <strong>FRAGMENTO MENTAL</strong><br>` +
                        `> Dado: ${dado} (d100)<br>` +
                        `> Redutor (ESP ${espTotal}): -${redutor}<br>` +
                        `> Resultado Final: <strong>${resultadoFinal}</strong><br>` +
                        `> Classificação: ${classificacao}<br>` +
                        `<small>(Nesta rolagem, quanto menor o valor, melhor o resultado!)</small>`;
}

/**
 * Rola dados customizáveis (ex: 2d20, 3d6) com regras de Soma, Vantagem ou Desvantagem.
 */
function rollCustomDice() {
    const qty = parseInt(document.getElementById('custom-qty').value) || 1; // Quantidade de dados
    const faces = parseInt(document.getElementById('custom-faces').value) || 20; // Lados do dado
    const mode = document.getElementById('custom-mode').value; // Modo de escolha do resultado
    
    // Roda o laço de repetição (loop) para sortear cada dado individualmente
    let rolls = [];
    for (let i = 0; i < qty; i++) { 
        rolls.push(Math.floor(Math.random() * faces) + 1); 
    }

    let finalResult = 0, label = "";
    
    // Processa os dados de acordo com o modo selecionado
    if (mode === "soma") { 
        finalResult = rolls.reduce((a, b) => a + b, 0); // Soma todos os números da lista
        label = "SOMA"; 
    } else if (mode === "vantagem") { 
        finalResult = Math.max(...rolls); // Filtra e escolhe apenas o maior número sorteado
        label = "VANTAGEM (MAIOR)"; 
    } else { 
        finalResult = Math.min(...rolls); // Desvantagem: pega apenas o menor número sorteado
        label = "DESVANTAGEM (MENOR)"; 
    }

    // Exibe o resultado formatado na tela
    document.getElementById('custom-result-display').innerHTML = 
        `> <strong>${label}</strong>: ${finalResult}\n` +
        `> Dados: [${rolls.join(', ')}] (d${faces})`;
}

/**
 * Calcula o valor líquido/real de um atributo básico somando bônus de classes e especializações.
 * @param {string} id - O ID do atributo básico (ex: 'for', 'agi', 'int')
 */
function getAttrValueGlobal(id) {
    const resq = parseInt(document.getElementById('resq-num').value) || 0;
    const charClass = document.getElementById('char-class').value;
    const charSpec = document.getElementById('char-spec').value;
    let val = parseInt(document.getElementById('v-' + id).value) || 0; // Valor base que vem do input
    
    // --- BÔNUS DE RESQUÍCIO ---
    if (resq === 0 && (id === 'esp' || id === 'vig')) val += 1;   // Pureza total dá bônus físico/espiritual
    if (resq === 100 && (id === 'int' || id === 'car')) val += 1; // Corrupção total expande a mente/presença

    // --- BÔNUS DE CLASSE PRINCIPAL ---
    if (charClass === 'sobrevivente' && id === 'agi') val += 1;
    if (charClass === 'guerreiro' && id === 'for') val += 1;
    if (charClass === 'arqueologo' && id === 'int') val += 1;

    // --- BÔNUS PASSIVOS DE ESPECIALIZAÇÃO ---
    if (charSpec === 'contrabandista' && id === 'agi') val += 1;
    if (charSpec === 'explorador' && id === 'agi') val += 1;
    if (charSpec === 'viajante' && id === 'agi') val += 1;
    if (charSpec === 'campista' && id === 'car') val += 1;
    if (charSpec === 'estudioso' && id === 'int') val += 2;
    
    if (charSpec === 'barbaro') { 
        if(id==='for') val+=1; if(id==='esp') val+=1; if(id==='int') val-=1; // Bárbaro perde inteligência
    }
    if (charSpec === 'besta') { 
        if(id==='for') val+=2; if(id==='int') val-=2; // Besta ganha muita força mas perde muita mente
    }
    if (charSpec === 'esgrimista') { 
        if(id==='int') val+=1; if(id==='agi') val+=1; 
    }
    if (charSpec === 'cauteloso' && id === 'agi') val += 2;
    if (charSpec === 'tanque' && id === 'vig') val += 2;
    if (charSpec === 'manipulador') { 
        if(id==='int') val+=1; if(id==='for') val-=1; if(id==='esp') val-=1; 
    }
    if (charSpec === 'agil') { 
        if(id==='agi') val+=2; if(id==='for') val-=1; 
    }
    if (charSpec === 'feiticeiro' && id === 'esp') val += 2;
    if (charSpec === 'mago') { 
        if(id==='int') val+=1; if(id==='esp') val+=1; 
    }
    if (charSpec === 'paleontologo' && id === 'int') val += 1;
    if (charSpec === 'clerigo') { 
        if(id==='esp') val+=1; if(id==='car') val+=1; 
    }
    if (charSpec === 'domino' && id === 'car') val += 2;

    return val; // Retorna o valor final somado/subtraído
}

/**
 * Recalcula os valores máximos das barras de status e atualiza os limites dos sliders.
 */
function atualizarStatus() {
    const charClass = document.getElementById('char-class').value;
    const charSpec = document.getElementById('char-spec').value;
    const notesField = document.getElementById('notes-text');

    let extraNotes = []; // Array temporário para guardar textos automáticos do sistema

    // Coleta os valores de atributos já calculados com bônus
    const forca = getAttrValueGlobal('for'), agi = getAttrValueGlobal('agi'), int = getAttrValueGlobal('int'), 
          esp = getAttrValueGlobal('esp'), vig = getAttrValueGlobal('vig'), car = getAttrValueGlobal('car');

    // --- FÓRMULAS MATEMÁTICAS DO SISTEMA ---
    let maxHP = ((vig * 10) + (forca * 2));
    let maxFM = (esp * 3) + (int + car) * 8;
    let maxPC = (agi + (int + esp) * 3) * 4;

    // --- ALTERAÇÕES DE STATUS POR CLASSE ---
    if (charClass === 'sobrevivente') { 
        maxFM += 10;
        extraNotes.push("Sobrevivente: vasto conhecimento sobre a natureza");
    }
    if (charClass === 'guerreiro') { 
        maxFM += 5;
        maxHP += 10;
        extraNotes.push("Guerreiro: um cara bom de briga");
    }
    if (charClass === 'arqueologo') {
        maxFM += 5;
        maxPC += 5;
        extraNotes.push("Arqueólogo: pessoa curiosa, grande entusiasta da História do mundo desde os primórdios");
    }

    // --- ALTERAÇÕES DE STATUS POR ESPECIALIZAÇÃO ---
    if (charSpec === 'explorador') maxFM += 5;
    if (charSpec === 'viajante') {
        maxFM += 5;
        maxPC += 5;
        extraNotes.push("Especialização: Viajante: pode viajar entre as 6 Muralhas livremente com autorização dos governantes");
    }
    if (charSpec === 'campista') maxHP -= 5;
    if (charSpec === 'estudioso') maxFM += 5;
    if (charSpec === 'barbaro') {
        maxHP += forca * vig; 
    }
    if (charSpec === 'besta') maxHP += 5;
    if (charSpec === 'esgrimista') maxFM += 5;
    if (charSpec === 'tanque') maxFM += 10;
    if (charSpec === 'agil') maxHP -= 10;
    if (charSpec === 'feiticeiro') { maxFM += 5; maxPC += 10; }
    if (charSpec === 'mago') maxPC += 5;
    if (charSpec === 'paleontologo') {
        extraNotes.push("Especialização: Paleontólogo: Sabe tudo sobre aquelas criaturas fora das Muralhas");
    }
    if (charSpec === 'clerigo') { maxPC += 5; maxFM += 5; }

    // Atualiza os textos dos valores máximos no arquivo HTML
    document.getElementById('max_hp').innerText = maxHP;
    document.getElementById('max_fm').innerText = maxFM;
    document.getElementById('max_pc').innerText = maxPC;

    // Garante que a vida atual não ultrapasse o máximo recalculado
    let currHP = parseInt(document.getElementById('curr-hp-text').innerText) || 0;
    let currFM = parseInt(document.getElementById('curr-fm-text').innerText) || 0;
    let currPC = parseInt(document.getElementById('curr-pc-text').innerText) || 0;

    if (currHP > maxHP) document.getElementById('curr-hp-text').innerText = maxHP;
    if (currFM > maxFM) document.getElementById('curr-fm-text').innerText = maxFM;
    if (currPC > maxPC) document.getElementById('curr-pc-text').innerText = maxPC;

    // --- Limpeza do campo de notas para não duplicar texto toda vez que atualiza ---
    let currentNotes = notesField.value.split('\n').filter(line => 
        !line.startsWith("Sobrevivente:") && 
        !line.startsWith("Guerreiro:") && 
        !line.startsWith("Arqueólogo:") && 
        !line.startsWith("Especialização:")
    );
    
    notesField.value = extraNotes.concat(currentNotes).join('\n');

    updateBars(); 
}

/**
 * Realiza testes de perícias com sistema d100 de soma + mecânicas de Vantagem (múltiplos dados).
 */
function rollSkill() {
    const select = document.getElementById('skill-sel');
    const skillVal = select.value; // Contém as chaves dos atributos associados à perícia (ex: 'int,car')
    const skillName = select.options[select.selectedIndex].getAttribute('data-name') || "Teste";
    const charClass = document.getElementById('char-class').value;
    const charSpec = document.getElementById('char-spec').value;
    const diceBase = 100;

    let numDados = 1; // Por padrão, rola apenas 1 dado de 100 lados

    // --- SISTEMA DE GARGALOS (Vantagens de rolar mais dados e escolher o maior) ---
    if (charClass === 'arqueologo' && skillVal.includes('int')) numDados = 2;
    if (charSpec === 'contrabandista' && skillName === 'Furtividade') numDados = 2;
    if (charSpec === 'esgrimista' && skillName === 'Luta') numDados = 2;
    if (charSpec === 'mago' && skillName === 'Arcanismo') numDados = 2;
    
    if (charSpec === 'cauteloso') {
        if (skillName === 'Furtividade') numDados = 3;
        if (skillName === 'Perseverança') numDados = 2;
    }
    
    if (charSpec === 'manipulador' && (skillName === 'Furtividade' || skillName === 'Diplomacia')) numDados = 3;
    if (charSpec === 'agil' && skillName === 'Esquiva') numDados = 3;
    if (charSpec === 'estudioso' && (skillName === 'Medicina' || skillName === 'História')) numDados = 3;
    if (charSpec === 'feiticeiro' && skillName === 'Misticismo') numDados = 3;
    if (charSpec === 'clerigo' && skillName === 'Medicina') numDados = 3;
    if (charSpec === 'domino' && skillName === 'Sorte') numDados = 3;

    if (charSpec === 'campista') {
        const campLista = ['Procurar', 'Escutar', 'Olfato', 'Sorte', 'Medicina', 'Prestidigitação', 'Instinto'];
        if (campLista.includes(skillName)) numDados = 2;
    }

    // Executa a quantidade de rolagens definida e adiciona na lista
    let rolls = [];
    for (let i = 0; i < numDados; i++) { 
        rolls.push(Math.floor(Math.random() * diceBase) + 1); 
    }
    let roll = Math.max(...rolls); // Escolhe o maior dado dentre os sorteados (Vantagem)

    // Quebra a string de atributos associados (ex: 'int,car' vira ['int', 'car']) e calcula a soma
    const attrKeys = skillVal ? skillVal.split(',') : [];
    let sum = 0;
    attrKeys.forEach(k => { sum += getAttrValueGlobal(k.trim()); });

    // Resultado final é a soma do dado sorteado com os atributos calculados
    let total = (roll + sum);
    let quality = (total / (diceBase + sum)) * 100; // Gera uma porcentagem de eficiência do teste
    let result = "";

    // Tabela de resultados do d100 de Soma (Valores Maiores = Resultados Melhores)
    if (total <= 5)        result = "💀 Desastre";
    else if (total <= 20)  result = "❌ Falha";
    else if (total <= 40)  result = "😢 Quase";
    else if (total <= 50)  result = "👍 Normal";
    else if (total <= 70)  result = "😃 Bom";
    else if (total === 95) result = "☄️ Muito Bom!";
    else                   result = "<b>🌌 Perfeito!</b>";

    // Formata a visualização dos dados se houve mais de um dado sorteado
    const dadosTxt = numDados > 1 ? `[${rolls.join(', ')}] (Melhor: ${roll})` : `${roll}`;
    
    // Imprime o relatório final na tela
    document.getElementById('result-display').innerHTML = 
        `> <strong>${skillName.toUpperCase()}</strong>: ${total} (${quality.toFixed(1)}%)\n` +
        `> Dados: ${dadosTxt} (d100) + ${sum} (Soma Attr)\n` +
        `> Resultado: ${result}`;
}

// ============================================================================
// 💾 SISTEMA DE SALVAMENTO DE DADOS (URL / BASE64)
// ============================================================================

/**
 * Transforma todos os dados da ficha em uma string criptografada em Base64 e salva na URL.
 */
/**
 * Transforma todos os dados da ficha em uma string criptografada em Base64,
 * atualiza a URL, copia o link automaticamente e exibe na caixa azul.
 */
function saveToUrl() {
    const data = {
        cls: document.getElementById('char-class').value,
        spc: document.getElementById('char-spec').value,
        cn: document.getElementById('char-name').value,
        pn: document.getElementById('player-name').value,
        resq: document.getElementById('resq-num').value || "50",
        
        // Captura os valores de texto atuais das barras
        chp: document.getElementById('curr-hp-text').innerText,
        cfm: document.getElementById('curr-fm-text').innerText,
        cpc: document.getElementById('curr-pc-text').innerText,
        
        f: document.getElementById('v-for').value,
        a: document.getElementById('v-agi').value,
        v: document.getElementById('v-vig').value,
        i: document.getElementById('v-int').value,
        e: document.getElementById('v-esp').value,
        c: document.getElementById('v-car').value,
        inv: document.getElementById('inv-text').value,
        bru: document.getElementById('bru-text').value,
        not: document.getElementById('notes-text').value
    };
    
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    const novaUrl = window.location.origin + window.location.pathname + "?sheet=" + encoded;
    window.history.replaceState(null, null, "?sheet=" + encoded);
    
    navigator.clipboard.writeText(novaUrl).then(() => {
        const display = document.getElementById('url-display');
        if(display) {
            display.style.display = 'block';
            display.innerHTML = `> <strong>LINK COPIADO AUTOMATICAMENTE!</strong><br>` +
                                `> Compartilhe sua ficha usando o endereço abaixo:<br>` +
                                `<span style="word-break: break-all; color: #ffffff; text-decoration: underline;">${novaUrl}</span>`;
        }
    }).catch(err => {
        console.error("Erro ao copiar link: ", err);
        const display = document.getElementById('url-display');
        if(display) {
            display.style.display = 'block';
            display.innerHTML = `> <strong>FICHA SINCRONIZADA!</strong><br>` +
                                `> Copie o endereço abaixo para salvar ou compartilhar:<br>` +
                                `<span style="word-break: break-all; color: #ffffff; text-decoration: underline;">${novaUrl}</span>`;
        }
    });
}

/**
 * Função executada automaticamente assim que a página é aberta.
 * Lê a URL procurando dados salvos anteriormente para carregar a ficha do personagem.
 */
window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    const dataStr = params.get('sheet'); // Captura o parâmetro '?sheet='
    
    if (dataStr) {
        try {
            // Realiza o processo inverso: Descriptografa o Base64, reconverte os caracteres e reconstrói o objeto JSON
            const d = JSON.parse(decodeURIComponent(escape(atob(dataStr))));
            
            // 1. Reatribui primeiro os valores básicos e os atributos brutos
            document.getElementById('char-class').value = d.cls || "nenhuma";
            document.getElementById('char-name').value = d.cn || "";
            document.getElementById('player-name').value = d.pn || "";
            document.getElementById('v-for').value = d.f || 0;
            document.getElementById('v-agi').value = d.a || 0;
            document.getElementById('v-vig').value = d.v || 0;
            document.getElementById('v-int').value = d.i || 0;
            document.getElementById('v-esp').value = d.e || 0;
            document.getElementById('v-car').value = d.c || 0;
            document.getElementById('inv-text').value = d.inv || "";
            document.getElementById('bru-text').value = d.bru || "";
            document.getElementById('notes-text').value = d.not || "";
            
            // 2. Sincroniza o valor dos resquícios salvos
            const resqVal = d.resq !== undefined ? d.resq : 50;
            document.getElementById('resq-slider').value = resqVal;
            document.getElementById('resq-num').value = resqVal;
            document.getElementById('resq-label-val').innerText = resqVal;
            
            // Altera a cor do label baseada no valor restaurado
            let r, g, b;
            if (resqVal < 50) { 
                let ratio = resqVal / 50; 
                r = 255; g = 255 * ratio; b = 255 * ratio; 
            } else { 
                let ratio = (resqVal - 50) / 50; 
                r = 255; g = 255; b = 255 * (1 - ratio); 
            }
            document.getElementById('resq-label-val').style.color = `rgb(${r}, ${g}, ${b})`;

            // 3. Atualiza as especializações disponíveis no select antes de injetar o valor salvo
            updateSpecOptions();
            document.getElementById('char-spec').value = d.spc || "nenhuma";
            
            // 4. Calcula os status máximos baseando-se em tudo o que foi carregado acima
            atualizarStatus();
            
            // 5. Por fim, injeta os valores de status atuais (impedindo que sejam resetados para zero)
            document.getElementById('curr-hp-text').innerText = d.chp !== undefined ? d.chp : 0;
            document.getElementById('curr-fm-text').innerText = d.cfm !== undefined ? d.cfm : 0;
            document.getElementById('curr-pc-text').innerText = d.cpc !== undefined ? d.cpc : 0;
            
            // Atualiza o preenchimento visual das barras
            updateBars();

        } catch(e) { 
            console.error("Erro ao carregar dados salvos da URL.", e); 
            updateResquicios(50);
            atualizarStatus();
        }
    } else { 
        // Se for uma página nova sem parâmetros, inicia a ficha limpa com resquícios em 50
        updateResquicios(50); 
        atualizarStatus();
    }
};