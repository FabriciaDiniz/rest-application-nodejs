const express = require('express');
const consign = require('consign');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');

module.exports = function () {
    const app = express();

    //middleware do body parser
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json);

    //middleware de validação dos dados de requisições
    app.use(expressValidator());

    consign()
        .include('controllers')
        .then('persistencia')
        .then('servicos')
        .into(app);

    return app;
};