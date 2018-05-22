const rp = require('request-promise');
const { genAllPlates, genPlatesRange } = require('./gen_plates');

const waitTime = 25;
const batchSize = 50;

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

async function getNCars(plates, n) {
    n = n || plates.length;

    let cars = [[], []];

    while (cars[0].length < n) {
        let batch = [[], []];
        while (batch[0].length < Math.min(n - cars[0].length, batchSize)) {
            for (let i = 0; i < 100; i++)
                plates.next();

            let plate = plates.next();

            options.form.placa = plate[0] + plate[1];

            batch[0].push(plate);
            batch[1].push(rp(options));

            await sleep(waitTime);
        }

        await Promise.all(batch[1]).then(resp => {
            for (let i = 0; i < resp.length; i++) {
                if (!resp[i].includes('Licenciamento: <b>    </b>')
                    && !resp[i].includes('<h3>Placa Não Cadastrada')) {

                    cars[0].push(batch[0][i]);
                    cars[1].push(resp[i].split('Licenciamento:')[1]);

                    console.error(`${batch[0][i][0]}-${batch[0][i][1]} was found`)
                }
            }
        }).catch(err => console.log(err));

        await sleep(waitTime * 10);
    }

    return cars;
}

let plates = genPlatesRange('MMN', 'MOW');
getNCars(plates, 1).then(a => {
    a[0].forEach((v, i, l) => console.log(v[0] + '-' + v[1]));
}).catch(console.error);