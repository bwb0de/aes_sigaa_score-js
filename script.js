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
    saude_02: [0, "Doença grave"],
    saude_03: [0, "Deficiência"]
}


function check_form() {
    //Verifica se todas questões foram preechidas
    if ( document.getElementById("dn").value == "" ) {
        return 0;
    
    } else if ( document.getElementById("nome").value == "" ) {
        return 0;
    } 
    
    if ( check_if_checked("renda") == 0 ) {
        return 0;
    }
    
    if ( check_if_checked("saude") == 0 ) {
        return 0;
    }
    
    return 1
}



function push_family_member() {

    if ( check_form() ) {
        nome = document.getElementById('nome').value;
        dn = document.getElementById('dn').value;
        idade = calculate_age(dn);
        renda = get_selected_op('renda', translator_tipo_renda);
        renda_score = get_selected_op('renda', translator_tipo_renda, output_score=true);
        renda_idade_peso = get_idade_peso(idade);
        saude = get_selected_op('saude', translator_saude);
        saude_score = get_selected_op('saude', translator_saude, output_score=true);
        saude_peso = get_saude_peso(saude_score);

        new_info = {
            nome: nome,
            dn: dn,
            idade: calculate_age(dn),
            renda: renda,
            renda_score: renda_score,
            renda_idade_peso: renda_idade_peso,
            saude: saude,
            saude_score: saude_score,
            saude_peso: saude_peso
        }

        family_members.push(new_info);
        print_info();
        clear_fields();
    } else {
        alert("É necessário preencher todos os campos do formuláio")
    }
};


function get_idade_peso(idade) {
    renda_idade_peso = 0

    if ( idade < 5 ) {
        renda_idade_peso = 2.0

    } else if ( idade >= 5 && idade < 12 ) {
        renda_idade_peso = 1.5

    } else if ( idade >= 12 && idade < 18 ) {
        renda_idade_peso = 1.0

    } else if ( idade >= 18 && renda_score == 0 ) {
        renda_idade_peso = 0.3
    
    } else {
        renda_idade_peso = 0.0
    };

    return renda_idade_peso

};


function get_saude_peso(saude_score) {
    saude_peso = 0

    if ( saude_score == 15 ){
        saude_peso = 0.0
    
    } else if ( saude_score == 7 ) {
        saude_peso = 1.0

    } else if ( saude_score == 0 ) {
        saude_peso = 1.5
    }

    return saude_peso
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
    output += make_score(family_members).toString();
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


function check_if_checked(class_name) {
    grupo_ops = document.getElementsByClassName(class_name);
    for ( index in grupo_ops ) {
        if ( grupo_ops[index].checked == true ) {
            return 1;
        }
    };
    return 0;
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

    pontuacao_conforme_natureza_da_renda = []
    peso_conforme_a_idade_do_dependente = []
    pontuacao_conforme_a_situacao_de_saude = []
    peso_conforme_a_condicao_de_saude_dos_cuidadores = []


    for ( index in family_members ) {
        pessoa = family_members[index]

        pontuacao_conforme_natureza_da_renda.push(parseFloat(pessoa.renda_score));
        pontuacao_conforme_a_situacao_de_saude.push(parseFloat(pessoa.saude_score));
        
        
        //Inclusão seletiva dos pesos conforme a situação de dependência
        if ( pessoa.idade < 18 ) {
            peso_conforme_a_idade_do_dependente.push(parseFloat(pessoa.renda_idade_peso));

        } else if ( pessoa.renda_score == 0 ) {
            peso_conforme_a_idade_do_dependente.push(parseFloat(pessoa.renda_idade_peso));

        };

        
        //Inclusão seletiva dos pesos de cuidadores conforme o critério de idade
        if ( pessoa.idade > 16 ) {
            peso_conforme_a_condicao_de_saude_dos_cuidadores.push(parseFloat(pessoa.saude_peso))
        };
    };

    media_ponderada_natureza_renda = media(pontuacao_conforme_natureza_da_renda)
    resultado_score_familiar_renda = media_ponderada_natureza_renda / (1.0 + somar(peso_conforme_a_idade_do_dependente))
    
    media_ponderada_score_saude = media(pontuacao_conforme_a_situacao_de_saude)
    resultado_score_familiar_saude = media_ponderada_score_saude / (1.0 + somar(peso_conforme_a_condicao_de_saude_dos_cuidadores))
    
    score_total = Math.floor((resultado_score_familiar_renda + resultado_score_familiar_saude) * 100)

    output = "<h3>Detalhamento da pontuação</h3>"
    output += "<b style='color: blue'>Media ponderada da natureza de renda: </b>" + media_ponderada_natureza_renda.toString() +"<br>"
    output += "<b style='color: blue'>Score relativo à natureza de renda: </b>" + resultado_score_familiar_renda.toString() +"<br><br>"

    output += "<b style='color: red'>Media ponderada da situação de saúde e cuidados: </b>" + media_ponderada_score_saude.toString() +"<br>"
    output += "<b style='color: red'>Score relativo à situação de saúde: </b>" + resultado_score_familiar_saude.toString() +"<br><br>"

    output += "<h3>Score total: " + score_total.toString() +"</h3>"

    return output
};




function dt_mask() {
    if ( document.getElementById("dn").value.length == 2 ) {
        document.getElementById("dn").value += "/";
    } else if ( document.getElementById("dn").value.length == 5 ) {
        document.getElementById("dn").value += "/";
    } else {
        document.getElementById("dn").value = document.getElementById("dn").value.replace(/[a-z]/i, "");
        document.getElementById("dn").value = document.getElementById("dn").value.replace(/\/\//i, "/");
    }
};
