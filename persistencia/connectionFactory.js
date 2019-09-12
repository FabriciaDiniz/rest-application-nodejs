var mysql  = require('mysql');

const connection =  mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'payfast',
    port: '3306'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected!');
});

module.exports = function() {
    return connection;
};