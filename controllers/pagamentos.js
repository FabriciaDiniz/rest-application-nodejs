module.exports = function (app) {

    const PAGAMENTO_CRIADO = "CRIADO";
    const PAGAMENTO_CONFIRMADO = "CONFIRMADO";
    const PAGAMENTO_CANCELADO = "CANCELADO";

    app.get('/pagamentos', function (req, res) {
        console.log('Recebida requisicao de teste na porta 3000.');
        res.status(200).end('OK.');
    });

    app.post('/pagamentos/pagamento', function (req, res) {

        req.assert("forma_de_pagamento", "Forma de pagamento é obrigatória.")
            .notEmpty();
        req.assert("valor", "Valor é obrigatório e deve ser um decimal.")
            .notEmpty().isFloat();
        req.assert("moeda", "Moeda é obrigatória e deve ter 3 caracteres")
            .notEmpty().len(3, 3);

        //resgata os erros de validação
        var erros = req.validationErrors();

        if (erros) {
            console.log("Erros de validação encontrados");
            res.status(400).end(erros);
            return;
        }

        var pagamento = req.body["pagamento"];
        console.log('processando pagamento...');

        pagamento.status = PAGAMENTO_CRIADO;
        pagamento.date = new Date();

        var connection = app.persistencia.connectionFactory();
        var pagamentoDao = new app.persistencia.PagamentoDao(connection); //pra q cada thread tenha um pagamentoDao

        pagamentoDao.salva(pagamento, function (erro, resultado) {
            if (erro) {
                console.log('Erro ao inserir no banco:' + erro);
                res.status(500).send(erro);
            } else {
                console.log('pagamento criado: ' + result);
                pagamento.id = resultado.insertId;

                if (pagamento.forma_de_pagamento == 'cartao') {
                    var cartao = req.body["cartao"];
                    console.log(cartao);

                    var clienteCartoes = new app.servicos.clienteCartoes();

                    clienteCartoes.autoriza(cartao,
                        function (exception, request, response, retorno) {
                            if (exception) {
                                console.log(exception);
                                res.status(400).send(exception);
                                return;
                            }
                            console.log(retorno);

                            res.location('/pagamentos/pagamento/' +
                                pagamento.id);

                            var response = {
                                dados_do_pagamanto: pagamento,
                                cartao: retorno,
                                links: [
                                    {
                                        href: "http://localhost:3000/pagamentos/pagamento/"
                                            + pagamento.id,
                                        rel: "confirmar",
                                        method: "PUT"
                                    },
                                    {
                                        href: "http://localhost:3000/pagamentos/pagamento/"
                                            + pagamento.id,
                                        rel: "cancelar",
                                        method: "DELETE"
                                    }
                                ]
                            };

                            res.status(201).json(response);
                            return;
                        });

                } else {
                    //forma de pagamento não é cartão
                    res.location('/pagamentos/pagamento/' +
                        pagamento.id);

                    var response = {
                        dados_do_pagamanto: pagamento,
                        links: [
                            {
                                href: "http://localhost:3000/pagamentos/pagamento/"
                                    + pagamento.id,
                                rel: "confirmar",
                                method: "PUT"
                            },
                            {
                                href: "http://localhost:3000/pagamentos/pagamento/"
                                    + pagamento.id,
                                rel: "cancelar",
                                method: "DELETE"
                            }
                        ]
                    };
                    res.status(201).json(response);
                }
            }
        });
    });

    
    app.put('/pagamentos/pagamento/:id', function (req, res) {

        var pagamento = {};
        var id = req.params.id;

        pagamento.id = id;
        pagamento.status = PAGAMENTO_CONFIRMADO;

        var connection = app.persistencia.connectionFactory();
        var pagamentoDao = new app.persistencia.PagamentoDao(connection);

        pagamentoDao.atualiza(pagamento, erro => {
            if (erro) {
                res.status(500).send(erro);
                return;
            }
            console.log('pagamento criado');
            res.send(pagamento);
        });
    });

    app.delete('/pagamentos/pagamento/:id', function (req, res) {
        var pagamento = {};
        var id = req.params.id;

        pagamento.id = id;
        pagamento.status = PAGAMENTO_CANCELADO;

        var connection = app.persistencia.connectionFactory();
        var pagamentoDao = new app.persistencia.PagamentoDao(connection);

        pagamentoDao.atualiza(pagamento, erro => {
            if (erro) {
                res.status(500).send(erro);
                return;
            }
            console.log('pagamento cancelado');
            res.status(204).send(pagamento);
        });
    });
};