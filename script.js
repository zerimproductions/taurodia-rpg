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
    arqueologo: [
        { val: "estudioso", nome: "Estudioso" },
        { val: "feiticeiro", nome: "Feiticeiro" },
        { val: "mago", nome: "Mago" },
        { val: "paleontologo", nome: "Paleontólogo" },
        { val: "clerigo", nome: "Clérigo" },
        { val: "domino", nome: "Dominó" }
    ]
};

function updateResquicios(val) {
    val = Math.max(0, Math.min(100, val));
    document.getElementById('resq-slider').value = val;
    document.getElementById('resq-num').value = val;
    
    const label = document.getElementById('resq-label-val');
    label.innerText = val;

    let r, g, b;
    if (val < 50) { 
        let ratio = val / 50; 
        r = 255; g = 255 * ratio; b = 255 * ratio; 
    } else { 
        let ratio = (val - 50) / 50; 
        r = 255; g = 255; b = 255 * (1 - ratio); 
    }
    label.style.color = `rgb(${r}, ${g}, ${b})`;

    updateSpecOptions(); 
    atualizarStatus();
}

function updateSpecOptions() {
    const classe = document.getElementById('char-class').value;
    const resq = parseInt(document.getElementById('resq-num').value) || 0;
    const specSelect = document.getElementById('char-spec');
    const specField = document.getElementById('spec-field');

    if (resq > 25 && resq < 65) {
        specField.style.display = 'none'; 
        if (specSelect.value !== "nenhuma") {
            specSelect.value = "nenhuma";
            atualizarStatus();
        }
        return; 
    }

    specField.style.display = 'flex'; 
    const previousValue = specSelect.value;
    specSelect.innerHTML = '<option value="nenhuma">Nenhuma</option>';
    
    if (specsPorClasse[classe]) {
        specsPorClasse[classe].forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.val;
            opt.innerHTML = s.nome;
            specSelect.appendChild(opt);
        });
    }

    if ([...specSelect.options].some(opt => opt.value === previousValue)) {
        specSelect.value = previousValue;
    } else {
        specSelect.value = "nenhuma";
    }
}

function updateBars() {
    const stats = ['hp', 'fm', 'pc'];
    stats.forEach(stat => {
        const curr = parseInt(document.getElementById(`curr-${stat}`).value) || 0;
        const max = parseInt(document.getElementById(`max_${stat}`).innerText) || 1;
        const bar = document.getElementById(`bar-${stat}-fill`);
        
        let percentage = (curr / max) * 100;
        percentage = Math.max(0, Math.min(100, percentage)); 
        bar.style.width = percentage + "%";
    });
}

// Alterado os limites de 1 e 5 para 0 e 3
function changeAttr(attr, delta) {
    const input = document.getElementById('v-' + attr);
    let val = parseInt(input.value) || 0;
    val += delta;
    if (val >= 0 && val <= 3) {
        input.value = val;
        atualizarStatus();
    }
}

function rollFragmentoMental() {
    const espBase = parseInt(document.getElementById('v-esp').value) || 0;
    const resqVal = parseInt(document.getElementById('resq-num').value);
    let espTotal = espBase;
    if (resqVal === 0) espTotal += 1;

    const dado = Math.floor(Math.random() * 100) + 1;
    // O redutor se baseia puramente no valor final do atributo agora
    const redutor = espTotal * 10;
    let resultadoFinal = dado - redutor;
    if (resultadoFinal < 1) resultadoFinal = 1;

    let classificacao = "";
    if (resultadoFinal <= 5) classificacao = "<b>🌌 Perfeito!</b>";
    else if (resultadoFinal <= 20) classificacao = "<b>☄️ Excelente</b>";
    else if (resultadoFinal <= 40) classificacao = "😃 Bom";
    else if (resultadoFinal <= 60) classificacao = "👍 Normal";
    else if (resultadoFinal <= 80) classificacao = "🟦 Simples";
    else if (resultadoFinal <= 95) classificacao = "❌ Falha";
    else classificacao = "💀 Desastre";

    const display = document.getElementById('fragmento-display');
    display.style.display = 'block';
    display.innerHTML = `> <strong>FRAGMENTO MENTAL</strong><br>` +
                        `> Dado: ${dado} (d100)<br>` +
                        `> Redutor (ESP ${espTotal}): -${redutor}<br>` +
                        `> Resultado Final: <strong>${resultadoFinal}</strong><br>` +
                        `> Classificação: ${classificacao}<br>` +
                        `<small>(Nesta rolagem, quanto menor o valor, melhor o resultado!)</small>`;
}

function rollCustomDice() {
    const qty = parseInt(document.getElementById('custom-qty').value) || 1;
    const faces = parseInt(document.getElementById('custom-faces').value) || 20;
    const mode = document.getElementById('custom-mode').value;
    let rolls = [];
    for (let i = 0; i < qty; i++) { rolls.push(Math.floor(Math.random() * faces) + 1); }

    let finalResult = 0, label = "";
    if (mode === "soma") { finalResult = rolls.reduce((a, b) => a + b, 0); label = "SOMA"; }
    else if (mode === "vantagem") { finalResult = Math.max(...rolls); label = "VANTAGEM (MAIOR)"; }
    else { finalResult = Math.min(...rolls); label = "DESVANTAGEM (MENOR)"; }

    document.getElementById('custom-result-display').innerHTML = 
        `> <strong>${label}</strong>: ${finalResult}\n` +
        `> Dados: [${rolls.join(', ')}] (d${faces})`;
}

// Escopo global para coletar os atributos já calculados com bônus
function getAttrValueGlobal(id) {
    const resq = parseInt(document.getElementById('resq-num').value) || 0;
    const charClass = document.getElementById('char-class').value;
    const charSpec = document.getElementById('char-spec').value;
    let val = parseInt(document.getElementById('v-' + id).value) || 0;
    
    if (resq === 0 && (id === 'esp' || id === 'vig')) val += 1;
    if (resq === 100 && (id === 'int' || id === 'car')) val += 1;
    
    if (charClass === 'sobrevivente' && id === 'agi') val += 1;
    if (charClass === 'guerreiro' && id === 'for') val += 1;
    if (charClass === 'arqueologo' && id === 'int') val += 1;

    if (charSpec === 'contrabandista' && id === 'agi') val += 1;
    if (charSpec === 'explorador' && id === 'agi') val += 1;
    if (charSpec === 'viajante' && id === 'agi') val += 1;
    if (charSpec === 'campista' && id === 'car') val += 1;
    if (charSpec === 'estudioso' && id === 'int') val += 2;
    if (charSpec === 'barbaro') { if(id==='for') val+=1; if(id==='esp') val+=1; if(id==='int') val-=1; }
    if (charSpec === 'besta') { if(id==='for') val+=2; if(id==='int') val-=2; }
    if (charSpec === 'esgrimista') { if(id==='int') val+=1; if(id==='agi') val+=1; }
    if (charSpec === 'cauteloso' && id === 'agi') val += 2;
    if (charSpec === 'tanque' && id === 'vig') val += 2;
    if (charSpec === 'manipulador') { if(id==='int') val+=1; if(id==='for') val-=1; if(id==='esp') val-=1; }
    if (charSpec === 'agil') { if(id==='agi') val+=2; if(id==='for') val-=1; }
    if (charSpec === 'feiticeiro' && id === 'esp') val += 2;
    if (charSpec === 'mago') { if(id==='int') val+=1; if(id==='esp') val+=1; }
    if (charSpec === 'paleontologo' && id === 'int') val += 1;
    if (charSpec === 'clerigo') { if(id==='esp') val+=1; if(id==='car') val+=1; }
    if (charSpec === 'domino' && id === 'car') val += 2;

    return val;
}

function atualizarStatus() {
    const charClass = document.getElementById('char-class').value;
    const charSpec = document.getElementById('char-spec').value;
    const notesField = document.getElementById('notes-text');

    let extraNotes = [];

    const forca = getAttrValueGlobal('for'), agi = getAttrValueGlobal('agi'), int = getAttrValueGlobal('int'), 
          esp = getAttrValueGlobal('esp'), vig = getAttrValueGlobal('vig'), car = getAttrValueGlobal('car');

    let maxHP = ((vig * 12) + (forca * 8));
    let maxFM = (esp * 3) + (int + car) * 8;
    let maxPC = (agi + (int + esp * 4)) * 4;

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
    };
    if (charSpec === 'besta') maxHP += 5;
    if (charSpec === 'esgrimista') maxFM += 5;
    if (charSpec === 'tanque') maxFM += 10;
    if (charSpec === 'agil') maxHP -= 10;
    if (charSpec === 'feiticeiro') { maxFM += 5; maxPC += 10; }
    if (charSpec === 'mago') maxPC += 5;
    if (charSpec === 'paleontologo') {
        extraNotes.push("Especialização: Paleontólogo: sabe tudo sobre aquelas criaturas fora das Muralhas");
    }
    if (charSpec === 'clerigo') { maxPC += 5; maxFM += 5; }

    document.getElementById('max_hp').innerText = maxHP;
    document.getElementById('max_fm').innerText = maxFM;
    document.getElementById('max_pc').innerText = maxPC;

    let currentNotes = notesField.value.split('\n').filter(line => !line.startsWith("Sobrevivente:") && !line.startsWith("Guerreiro:") && !line.startsWith("Arqueólogo:") && !line.startsWith("Especialização:"));
    notesField.value = extraNotes.concat(currentNotes).join('\n');

    updateBars();
}

function rollSkill() {
    const select = document.getElementById('skill-sel');
    const skillVal = select.value; 
    const skillName = select.options[select.selectedIndex].getAttribute('data-name') || "Teste";
    const charClass = document.getElementById('char-class').value;
    const charSpec = document.getElementById('char-spec').value;
    const diceBase = 100;

    let numDados = 1;

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

    let rolls = [];
    for (let i = 0; i < numDados; i++) { rolls.push(Math.floor(Math.random() * diceBase) + 1); }
    let roll = Math.max(...rolls);

    const attrKeys = skillVal ? skillVal.split(',') : [];
    let sum = 0;
    // Como a base real agora inicia em 0, adicionamos o valor líquido do atributo diretamente, sem subtrair 1.
    attrKeys.forEach(k => { sum += getAttrValueGlobal(k.trim()); });

    let total = (roll + sum);
    let quality = (total / (diceBase + sum)) * 100;
    let result = "";

    if (total <= 5)        result = "💀 Desastre";
    else if (total <= 20)  result = "❌ Falha";
    else if (total <= 40)  result = "😢 Quase";
    else if (total <= 50)  result = "👍 Normal";
    else if (total <= 70)  result = "😃 Bom";
    else if (total === 95) result = "☄️ Muito Bom!";
    else                   result = "<b>🌌 Perfeito!</b>";

    const dadosTxt = numDados > 1 ? `[${rolls.join(', ')}] (Melhor: ${roll})` : `${roll}`;
    
    document.getElementById('result-display').innerHTML = 
        `> <strong>${skillName.toUpperCase()}</strong>: ${total} (${quality.toFixed(1)}%)\n` +
        `> Dados: ${dadosTxt} (d100) + ${sum} (Soma Attr)\n` +
        `> Resultado: ${result}`;
}

function saveToUrl() {
    const data = {
        cls: document.getElementById('char-class').value,
        spc: document.getElementById('char-spec').value,
        cn: document.getElementById('char-name').value,
        pn: document.getElementById('player-name').value,
        resq: document.getElementById('resq-num').value,
        chp: document.getElementById('curr-hp').value,
        cfm: document.getElementById('curr-fm').value,
        cpc: document.getElementById('curr-pc').value,
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
    window.history.replaceState(null, null, "?sheet=" + encoded);
    alert("Ficha sincronizada com a URL!");
}

window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    const dataStr = params.get('sheet');
    if (dataStr) {
        try {
            const d = JSON.parse(decodeURIComponent(escape(atob(dataStr))));
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
            
            updateResquicios(d.resq || 50);
            
            document.getElementById('char-spec').value = d.spc || "nenhuma";
            document.getElementById('curr-hp').value = d.chp || 0;
            document.getElementById('curr-fm').value = d.cfm || 0;
            document.getElementById('curr-pc').value = d.cpc || 0;
        } catch(e) { 
            console.error("Erro ao carregar dados salvos da URL."); 
            updateResquicios(50);
        }
    } else { 
        updateResquicios(50); 
    }
    atualizarStatus();
};