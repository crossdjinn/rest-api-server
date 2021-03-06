'use strict';
module.exports = function(app) {
    var fs = require('fs'),
        todoList = require('../controllers/todoListController'),
        availableRoutes = require('express-list-endpoints'),
        config;

    // TODO: separate logic of home
    app.get('/', function (req, res) {
        fs.readFile('package.json', 'utf8', function (err, data) {
            if (err) throw err;
            config = JSON.parse(data);

            res.render(
                'index',
                {
                    name: config.name,
                    version: config.version
            })
        });
    });

    app.get('/routes', function (req, res) {
        res.render(
            'routes',
            {
                routes: availableRoutes(app)
            })
    });

    app.route('/tasks')
        .get(todoList.all)
        .post(todoList.create);

    app.route('/tasks/:id')
        .get(todoList.read)
        .put(todoList.update)
        .delete(todoList.delete);
};