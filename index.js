const _ = require('lodash');
const rp = require('request-promise');
const { generate } = require("randomstring");

const num = 100;
const esp = 50;
const tamBatch = 1000;

function ger_placa() {
    let placaLet = generate({ length: 3, charset: 'alphabetic' }).toLowerCase();
    let placaNum = generate({ length: 4, charset: 'numeric' });
    return 'qfs9083';
    return placaLet + '' + placaNum;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var options = {
    method: 'POST',
    uri: 'http://wsdetran.pb.gov.br/DT_DUT_Cliente/ConsultaDUT',
    form: {
        Button: 'Enviar',
        display: 'web',
        placa: null,
        redirect: 'Enviar'
    },
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
};

async function getCarros() {
    let carros = [[], []];

    while (carros[0].length < num) {
        let novaPlaca;
        let batch = [[], []];
        while (batch[0].length < Math.min(num - carros[0].length, tamBatch)) {
            novaPlaca = ger_placa();
            if (!carros[0].includes(novaPlaca) && !batch[0].includes(novaPlaca)) {
                options.form.placa = novaPlaca;
                batch[0].push(novaPlaca);
                batch[1].push(rp(options));
                //await sleep(esp);
            }
        }

        console.log('Fazendo requests');

        await Promise.all(batch[1]).then(resp => {
            for (let i = 0; i < resp.length; i++) {
                if (!resp[i].includes('Licenciamento: <b>    </b>') && !resp[i].includes('<h3>Placa Não Cadastrada')) {
                    console.log(`${batch[0][i]} achado`);
                    carros[0].push(batch[0][i]);
                    carros[1].push(resp[i].split('Licenciamento:')[1]);
                }
            }

            console.log('Batch feito');
        }).catch(err => console.log(err));
    }

    return carros;
}

getCarros().then((a) => {
    console.log(...a);
}).catch(console.error);