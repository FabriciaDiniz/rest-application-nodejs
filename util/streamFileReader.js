var fs = require('fs');
var arquivo = process.argv[2];

fs.createReadStream(arquivo)
    .pipe(fs.createWriteStream('novo-' + arquivo)) //vai receber como entrada a saída da função na qual ela foi invocada
    .on('finish', function () {
        console.log('arquivo escrito com stream');        
    });

