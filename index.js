const app = require('./config/custom-express')();

//Subindo o servidor
app.listen(3000, function () {
    console.log('Servidor rodando na porta 3000');  
});

module.exports = app;