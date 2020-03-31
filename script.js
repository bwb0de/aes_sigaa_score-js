family_members = [];

translator_tipo_renda = {
    tipo_vinculo_00: [25, "Servidor efetivo"],
    tipo_vinculo_01: [25, "Aposentado"],
    tipo_vinculo_02: [25, "Rendimentos"],
    tipo_vinculo_03: [16, "Servidor temporário/comissão"],
    tipo_vinculo_04: [16, "Microempreendedor"],
    tipo_vinculo_05: [16, "Trabalho formal"],
    tipo_vinculo_06: [16, "PA formal"],
    tipo_vinculo_07: [16, "Pensão por morte"],
    tipo_vinculo_08: [16, "Pensão por morte"],
    tipo_vinculo_09: [11, "INSS"],
    tipo_vinculo_10: [11, "Estágio"],
    tipo_vinculo_11: [11, "Bolsa Acadêmica"],
    tipo_vinculo_12: [11, "Bolsa pós-graduação"],
    tipo_vinculo_13: [11, "Bolsa PNAES"],
    tipo_vinculo_14: [3, "PA informal"],
    tipo_vinculo_15: [5, "Assistência Social"],
    tipo_vinculo_16: [5, "Autônomo"],
    tipo_vinculo_17: [3, "Poupança"],
    tipo_vinculo_18: [3, "Seguro-desemprego"],
    tipo_vinculo_19: [0, "Sem renda"]
}

translator_saude = {
    saude_00: [15, "Sem agravo"],
    saude_01: [7, "Doença crônica"],
    saude_02: [1, "Doença grave"],
    saude_03: [1, "Deficiência"]
}


function push_family_member() {
    nome = document.getElementById('nome').value;
    dn = document.getElementById('dn').value;
    renda = get_selected_op('renda', translator_tipo_renda);
    renda_score = get_selected_op('renda', translator_tipo_renda, output_score=true);
    saude = get_selected_op('saude', translator_saude);
    saude_score = get_selected_op('saude', translator_saude, output_score=true);

    new_info = {
        nome: nome,
        dn: dn,
        idade: calculate_age(dn),
        renda: renda,
        renda_score: renda_score,
        saude: saude,
        saude_score: saude_score
    }

    family_members.push(new_info);
    print_info();
    clear_fields();
};

function load_family_members() {
    output = "<h3>Grupo familiar</h3>";
    output += "<table style='width: 100%'>";
    output += "<tr><td style='width: 20%;'><b>Nome</b></td>";
    output += "<td style='width: 20%'><b>Nascimento</b></td>";
    output += "<td style='width: 10%'><b>Idade</b></td>";
    output += "<td style='width: 30%'><b>Renda</b></td>";
    output += "<td style='width: 20%'><b>Saúde</b></td></tr>";
    
    for ( index in family_members) {
        p = family_members[index]
        output += `<tr style='padding: 10px;'><td>${p.nome}</td><td>${p.dn}</td><td>${p.idade}</td><td>${p.renda}</td><td>${p.saude}</td></tr>`
    };
    output += "</table><br>";
    output += "<b>Score (natureza vínculo empregatício + saúde): " + make_score(family_members).toString() + "</b>";
    return output
};


function print_info() {
    document.getElementById('info').innerHTML = load_family_members();
}


function clear_fields() {
    document.getElementById('nome').value = "";
    document.getElementById('dn').value = "";
    clear_radio_selection('renda');
    clear_radio_selection('saude');

};


function clear_radio_selection(class_name) {
    grupo_ops = document.getElementsByClassName(class_name)
    for ( index in grupo_ops ) {
        grupo_ops[index].checked = false;
    };
};



function get_selected_op(class_name, translator, output_score=false) {
    grupo_ops = document.getElementsByClassName(class_name);
    selected_ops = [];
    scores = []
    output = "";
    
    for ( index in grupo_ops ) {
        if ( grupo_ops[index].checked ) {
            selected_ops.push(grupo_ops[index].id);
        };
    };

    for ( index in selected_ops) {
        output += translator[selected_ops[index]][1] + '; ';
        scores.push(translator[selected_ops[index]][0])
    };

    if ( output_score == false ) {
        return output;
    } else {
        return Math.max(...scores)
    }
    
};


function calculate_age(dn) {
    //requires moment JS from: https://momentjs.com/
    dia = dn.split('/')[0]; 
    mes = dn.split('/')[1]; 
    ano = dn.split('/')[2];

    data = `${ano}-${mes}-${dia}`;

    const now = moment(new Date());
    const past = moment(data);
    const duration = moment.duration(now.diff(past));
    
    return parseInt(duration.asYears());
};


function media(arr) {
    denominador = arr.length
    soma = somar(arr)
    return soma / denominador

}

function somar(arr) {
    output = 0
    for ( index in arr ) {
        output += arr[index]
    };

    return output
};


function make_score(family_members) {

    score_renda_familia = []
    dependentes = []
    score_saude_cuidadores = []
    peso_agravos_saude = []

    for ( index in family_members ) {
        p = family_members[index]

        score_renda_familia.push(parseFloat(p.renda_score));

        if ( p.idade < 5 ) {
            dependentes.push(2.0)

        } else if ( p.idade >= 5 && p.idade < 12 ) {
            dependentes.push(1.5)

        } else if ( p.idade >= 12 && p.idade < 18 ) {
            dependentes.push(1.0)

        } else if ( p.idade >= 18 && p.renda_score == 0 ) {
            dependentes.push(0.3)
        };

        if ( p.idade > 16 ) {
            score_saude_cuidadores.push(parseFloat(p.saude_score))
        };

        if ( p.saude_score == 7 ){
            peso_agravos_saude.push(parseFloat(1.0));
        
        } else if ( p.saude_score == 1 ) {
            peso_agravos_saude.push(parseFloat(1.5));
        };
    };

    resultado_score_familiar_renda = media(score_renda_familia) / (1.0 + somar(dependentes))
    resultado_score_familiar_saude = media(score_saude_cuidadores) / (1.0 + somar(peso_agravos_saude))

    return Math.floor((resultado_score_familiar_renda + resultado_score_familiar_saude) * 100)
};