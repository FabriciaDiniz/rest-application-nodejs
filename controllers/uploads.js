var fs = require('fs');

module.exports = function (app) {
    app.post("/upload/imagem", function (req, res) {   
        console.log('recebendo imagem');

        var arquivo = req.headers.filename;

        req.pipe(fs.createWriteStream('files/' + arquivo))
            .on('finish', function(){
                console.log('arquivo escrito');
                res.status(201).send('ok');
            }
        );
    });
};