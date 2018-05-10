const _ = require('lodash');
const rp = require('request-promise');
const { generate } = require("randomstring");
const { gen_plates } = require('./gen_plates');

const waitTime = 50;
const batchSize = 100;

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

async function getNCars(n, plates) {
    let cars = [[], []];

    while (true) { //(cars[0].length < n) {
        let batch = [[], []];
        while (batch[0].length < Math.min(n - cars[0].length, batchSize)) {
            let plate = plates.next();
            if (!plate)
                return cars;

            for (let i = 0; i < 100; i++)
                plates.next();
            

            options.form.placa = plate[0] + plate[1];

            batch[0].push(plate);
            batch[1].push(rp(options));

            await sleep(waitTime);
        }

        await Promise.all(batch[1]).then(resp => {
            for (let i = 0; i < resp.length; i++) {
                if (!resp[i].includes('Licenciamento: <b>    </b>')
                    && !resp[i].includes('<h3>Placa Não Cadastrada')) {

                    console.error(`-----------------------------------------------------${batch[0][i]} found`);
                    cars[0].push(batch[0][i]);
                    cars[1].push(resp[i].split('Licenciamento:')[1]);
                }
            }
        }).catch(err => console.log(err));

        await sleep(waitTime * 10);

        //console.log('Batch done');
        console.log(`Currently at ${batch[0][0][0]}-${batch[0][0][1]}`)
    }

    return cars;
}

let plates = gen_plates();
getNCars(1, plates).then((a) => {
    a[0].forEach(console.log);
}).catch(console.error);