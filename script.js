family_members = [];

MAX_SAUDE = 13
MID_SAUDE = 7
MIN_SAUDE = 3

translator_tipo_renda = {
    tipo_vinculo_00: [23, "Servidor efetivo"],
    tipo_vinculo_01: [23, "Aposentado"],
    tipo_vinculo_02: [23, "Rendimentos"],
    tipo_vinculo_03: [14.72, "Servidor temporário/comissão"],
    tipo_vinculo_04: [14.72, "Microempreendedor"],
    tipo_vinculo_05: [14.72, "Trabalho formal"],
    tipo_vinculo_06: [14.72, "PA formal"],
    tipo_vinculo_07: [14.72, "Pensão por morte"],
    tipo_vinculo_08: [14.72, "Pensão por morte"],
    tipo_vinculo_09: [10.12, "INSS"],
    tipo_vinculo_10: [10.12, "Estágio"],
    tipo_vinculo_11: [10.12, "Bolsa Acadêmica"],
    tipo_vinculo_12: [10.12, "Bolsa pós-graduação"],
    tipo_vinculo_13: [10.12, "Bolsa PNAES"],
    tipo_vinculo_14: [2.76, "PA informal"],
    tipo_vinculo_15: [4.6, "Assistência Social"],
    tipo_vinculo_16: [4.6, "Autônomo"],
    tipo_vinculo_17: [2.76, "Poupança"],
    tipo_vinculo_18: [2.76, "Seguro-desemprego"],
    tipo_vinculo_19: [0, "Sem renda"]
}


translator_saude = {
    saude_00: [MAX_SAUDE, "Sem agravo"],
    saude_01: [MID_SAUDE, "Doença crônica"],
    saude_02: [MIN_SAUDE, "Doença grave"],
    saude_03: [MIN_SAUDE, "Deficiência"]
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
        //renda_idade_peso = get_idade_peso(idade);
        saude = get_selected_op('saude', translator_saude);
        saude_score = get_selected_op('saude', translator_saude, output_score=true);
        //saude_peso = get_saude_peso(saude_score, idade);
        saude_vector = get_saude_vector(saude_score, idade);
        renda_vector = get_renda_vector(renda_score, idade);

        new_info = {
            nome: nome,
            dn: dn,
            idade: calculate_age(dn),
            renda: renda,
            renda_score: renda_score,
            //renda_idade_peso: renda_idade_peso,
            saude: saude,
            saude_score: saude_score,
            //saude_peso: saude_peso,
            saude_vector: saude_vector,
            renda_vector: renda_vector
        }

        family_members.push(new_info);
        print_info();
        clear_fields();
    } else {
        alert("É necessário preencher todos os campos do formuláio")
    }
};


/*
function get_idade_peso(idade) {
    renda_idade_peso = 0

    if ( idade < 5 ) {
        renda_idade_peso = 2.0

    } else if ( idade >= 5 && idade < 12 ) {
        renda_idade_peso = 1.5

    } else if ( idade >= 12 && idade < 18 ) {
        renda_idade_peso = 1.0

    } else if ( idade >= 18 && idade < 60 && renda_score == 0 ) {
        renda_idade_peso = 0.3
    
    } else if ( idade >= 60 && renda_score == 0 ) {
        renda_idade_peso = 0.7
    
    } else {
        renda_idade_peso = 0.0
    };

    return renda_idade_peso

};*/


/*
function get_saude_peso(saude_score, idade) {
    saude_peso = 0

    if ( idade < 16 ) {
        saude_peso = 0.2

    } else if ( saude_score == MAX_SAUDE ){
        saude_peso = 0.0
    
    } else if ( saude_score == MID_SAUDE ) {
        saude_peso = 1.2

    } else if ( saude_score == MIN_SAUDE ) { 
        saude_peso = 1.5
    }

    return saude_peso
};*/


function resultant_vector(arr) {
    x = 0;
    y = 0;

    for ( idx in arr ) {
        x += arr[idx][0];
        y += arr[idx][1];
    }

    return [x,y]
};


function get_global_saude_vector() {

};


function calculate_dgtx(family_members) {
    numerador = 0;
    denominador = 0;
    
    for ( idx in family_members ) {
        pessoa = family_members[idx];

        denominador += 1
        
        if ( pessoa.saude_score == MIN_SAUDE ) {
            numerador += 1
        }
    }
    return (numerador/denominador) * 3;
};


function calculate_dctx(family_members) {
    numerador = 0;
    denominador = 0;
    
    for ( idx in family_members ) {
        pessoa = family_members[idx];

        denominador += 1
        
        if ( pessoa.saude_score == MID_SAUDE ) {
            numerador += 1
        }
    }
    return (numerador/denominador) * 2;
};


function calculate_tx_com_renda(family_members) {
    numerador = 0;
    denominador = 0;
    
    for ( idx in family_members ) {
        pessoa = family_members[idx];

        denominador += 1
        
        if ( pessoa.renda_score !== 0 ) {
            numerador += 1
        }
    }
    return (numerador/denominador);
};



function get_renda_vector(renda_score, idade, ) {
    // renda_vector = [x,y]
    // estabilidade_de_renda => y
    // dependencia => x

    x = dependencia_by_age_group(idade);

    if ( renda_score == 23 ) {
        y = 5
    } else if ( renda_score == 14.72 ) {
        y = 3.2
    } else if ( renda_score == 10.12 ) {
        y = 2.2
    } else if ( renda_score == 4.6 ) {
        y = 1
    } else if ( renda_score == 2.76 ) {
        y = 0.6
    } else if ( renda_score == 0 ) {
        y = 0
    }
    alert(x)
    alert(y)
    return [x,y];
};


function get_saude_vector(saude_score, idade) {
    // saude_vector = [x,y]
    // autonomia => y
    // risco do agravo => x

    y = autonomia_by_age_group(idade);
    
    if ( saude_score == MAX_SAUDE ){
        x = 0

    } else if ( saude_score == MID_SAUDE ) {
        x = 1 

    } else if ( saude_score == MIN_SAUDE ) { 
        x = 2 
    }
    return [x,y];
};


function vector_size(vector) {
    return Math.sqrt((vector[0] * vector[0]) + (vector[1] * vector[1]));
};


function coseno_vector(vector) {
    return vector[0] / vector_size(vector);
};



function autonomia_by_age_group(idade) {
    if ( idade < 3 ) {
        return -1;
    } else if ( idade < 8 ) {
        return -0.5;
    } else if ( idade < 12 ) {
        return -0.3;
    } else if ( idade < 18 ) {
        return 0;
    } else if ( idade < 60 ) {
        return 2;
    } else {
        return 1;
    }
};


function dependencia_by_age_group(idade) {
    if ( idade < 3 ) {
        return 3;
    } else if ( idade < 8 ) {
        return 2;
    } else if ( idade < 12 ) {
        return 1;
    } else if ( idade < 18 ) {
        return 0.7;
    } else if ( idade < 60 ) {
        return 0;
    } else {
        return 0.5;
    }
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

    if ( selected_ops.length > 1 ) {
        alert("Mais de uma opção selecionada");
        alert(selected_ops);
    } else {
        for ( index in selected_ops) {
            output += translator[selected_ops[index]][1] + '; ';
            scores.push(translator[selected_ops[index]][0])
        };
    }
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


function saude_denominator(arr) {
    output = 0;
    cronic_term = 0;
    grave_term = 0;
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
    //peso_conforme_a_idade_do_dependente = []
    pontuacao_conforme_a_situacao_de_saude = []
    //peso_conforme_a_condicao_de_saude_dos_cuidadores = []
    saude_vectors = []
    renda_vectors = []

    output = "";

    scores_saude = "";
    scores_renda = "";
    pesos_renda = "";
    pesos_cuidadores = "";


    for ( index in family_members ) {
        pessoa = family_members[index]

        pontuacao_conforme_natureza_da_renda.push(parseFloat(pessoa.renda_score));
        scores_renda += pessoa.renda_score.toString() + " ";
        //pesos_renda += pessoa.renda_idade_peso.toString() + " ";
        pontuacao_conforme_a_situacao_de_saude.push(parseFloat(pessoa.saude_score));
        scores_saude += pessoa.saude_score.toString() + " ";
        //pesos_cuidadores += pessoa.saude_peso.toString()+ " ";

        saude_vectors.push(pessoa.saude_vector)
        renda_vectors.push(pessoa.renda_vector)

        
        //Inclusão seletiva dos pesos conforme a situação de dependência
        /*
        if ( pessoa.idade < 18 ) {
            peso_conforme_a_idade_do_dependente.push(parseFloat(pessoa.renda_idade_peso));

        } else if ( pessoa.renda_score == 0 ) {
            peso_conforme_a_idade_do_dependente.push(parseFloat(pessoa.renda_idade_peso));

        };*/

        
        //Inclusão seletiva dos pesos de cuidadores conforme o critério de idade
        //peso_conforme_a_condicao_de_saude_dos_cuidadores.push(parseFloat(pessoa.saude_peso))

    };

    
    global_saude_vector_x = calculate_dctx(family_members) + calculate_dgtx(family_members);
    global_saude_vector_y = 0.5;
    global_saude_vector = [global_saude_vector_x, global_saude_vector_y]
    saude_vectors.push(global_saude_vector)
    vetor_resultante_saude = resultant_vector(saude_vectors);
    coseno_do_vetor_resultante_saude_mais_um = 1.0 + coseno_vector(vetor_resultante_saude);
    media_ponderada_score_saude = media(pontuacao_conforme_a_situacao_de_saude)
    resultado_score_familiar_saude = media_ponderada_score_saude / coseno_do_vetor_resultante_saude_mais_um

    global_renda_vector_x = calculate_tx_com_renda(family_members) * (-1)
    global_renda_vector_y = 0.1;
    global_renda_vector = [global_renda_vector_x, global_renda_vector_y]
    renda_vectors.push(global_renda_vector)
    alert(renda_vectors)
    vetor_resultante_renda = resultant_vector(renda_vectors);
    coseno_do_vetor_resultante_renda_mais_um = 1.0 + coseno_vector(vetor_resultante_renda);
    media_ponderada_natureza_renda = media(pontuacao_conforme_natureza_da_renda)
    resultado_score_familiar_renda = media_ponderada_natureza_renda / coseno_do_vetor_resultante_renda_mais_um

    //sigma_peso_dependentes = 1.0 + somar(peso_conforme_a_idade_do_dependente)
    //media_ponderada_peso_dependentes = 1.0 + media(peso_conforme_a_idade_do_dependente)
    //resultado_score_familiar_renda = media_ponderada_natureza_renda / (sigma_peso_dependentes / fator_de_correcao_denominador)
    //resultado_score_familiar_renda2 = media_ponderada_natureza_renda / (media_ponderada_peso_dependentes / fator_de_correcao_denominador)
    
    //sigma_peso_cuidadores = 1.0 + somar(peso_conforme_a_condicao_de_saude_dos_cuidadores)
    //media_ponderada_peso_cuidadores = 1.0 + media(peso_conforme_a_condicao_de_saude_dos_cuidadores)
    //resultado_score_familiar_saude = media_ponderada_score_saude / ((sigma_peso_cuidadores) / fator_de_correcao_denominador)
    //resultado_score_familiar_saude2 = media_ponderada_score_saude / ((media_ponderada_peso_cuidadores) / fator_de_correcao_denominador)
    //resultado_score_familiar_saude3 = media_ponderada_score_saude / coseno_do_vetor_resultante_saude_mais_um
    //resultado_score_familiar_saude4 = MAX_SAUDE * (1 - coseno_do_vetor_resultante_saude)
    
    score_total = Math.floor((resultado_score_familiar_renda + resultado_score_familiar_saude) * 100)

    output += "<h3>Detalhamento da pontuação</h3>"

    output += "<b style='color: blue'>Pontuação por integrante familiar conforme natureza renda: </b>" + scores_renda.toString() +"<br>"
    output += "<b style='color: blue'>Media ponderada da natureza de renda: </b>" + media_ponderada_natureza_renda.toString() +"<br>"
    //output += "<b style='color: blue'>Pesos por integrante familiar conforme tipo de dependente: </b>" + pesos_renda.toString() +"<br>"
    //output += "<b style='color: blue'>Soma peso dos dependentes + 1: </b>" + sigma_peso_dependentes.toString() +"<br>"
    //output += "<b style='color: blue'>Média ponderada do peso dos dependentes + 1: </b>" + media_ponderada_peso_dependentes.toString() +"<br>"
    output += "<b style='color: blue'>Cosseno do vetor resultante para peso dos cuidadores + 1: </b>" + coseno_do_vetor_resultante_renda_mais_um.toString() +"<br>"
    output += "<b style='color: blue'>Score relativo à natureza de renda (MP1/Sigma+1): </b>" + resultado_score_familiar_renda.toString() +"<br><br>"
    //output += "<b style='color: blue'>Score relativo à natureza de renda (MP1/MP2+1): </b>" + resultado_score_familiar_renda2.toString() +"<br><br>"



    output += "<b style='color: red'>Pontuação por integrante familiar conforme situação de saúde: </b>" + scores_saude.toString() +"<br>"
    output += "<b style='color: red'>Media ponderada da situação de saúde e cuidados: </b>" + media_ponderada_score_saude.toString() +"<br>"
    //output += "<b style='color: red'>Pesos por integrante familiar conforme a saúde dos cuidadores: </b>" + pesos_cuidadores.toString() +"<br>"
    //output += "<b style='color: red'>Soma do peso relativo à saúde dos cuidadores + 1: </b>" + sigma_peso_cuidadores.toString() +"<br>"
    //output += "<b style='color: red'>Média ponderada do peso dos cuidadores + 1: </b>" + media_ponderada_peso_cuidadores.toString() +"<br>"
    output += "<b style='color: red'>Cosseno do vetor resultante para peso dos cuidadores + 1: </b>" + coseno_do_vetor_resultante_saude_mais_um.toString() +"<br>"
    output += "<b style='color: red'>Score relativo à situação de saúde (MP1/Cos+1): </b>" + resultado_score_familiar_saude.toString() +"<br><br>"
    //output += "<b style='color: red'>Score relativo à situação de saúde (MAX * Cos): </b>" + resultado_score_familiar_saude4.toString() +"<br>"
    //output += "<b style='color: red'>Score relativo à situação de saúde (MP1/Sigma+1): </b>" + resultado_score_familiar_saude.toString() +"<br>"
    //output += "<b style='color: red'>Score relativo à situação de saúde (MP1/MP2+1): </b>" + resultado_score_familiar_saude2.toString() +"<br><br>"

    output += "<h3>Pontuação total: " + score_total.toString() +"</h3>"

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
