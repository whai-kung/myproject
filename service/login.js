"use strict";

module.exports = {
    // The current id counter
    id: 0,
    // An array with all todos
    todos: [],

    // Tries to get a single Todo by its id.
    // Throws an error if none can be found.
    getTodo: function(id) {
        var todos = this.todos;

        for(var i = 0; i < todos.length; i++) {
            if(todos[i].id === parseInt(id, 10)) {
                return todos[i];
            }
        }

        // If we didn't return yet we can throw an error
        //throw new Error('Could not find Todo');
    },

    // Return all Todos
    find: function(params, callback) {
        callback(null, this.todos);
    },

    // Returns a single Todo by id
    get: function(id, params, callback) {
        try {
            callback(null, this.getTodo(id));
        } catch(error) {
            callback(error);
        }
    },

    // Create a new Todo
    create: function(data, params, callback) {
        // Increment the global ID counter and
        // use it as the Todos id
        data.id = this.id++;
        this.todos.push(data);
        callback(null, data);
    },

    // Update (replace) an existing Todo with new data
    update: function(id, data, params, callback) {
        try {
            var todo = this.getTodo(id);
            var index = this.todos.indexOf(todo);

            data.id = todo.id;
            // Replace all the data
            this.todos[index] = data;
            callback(null, data);
        } catch(error) {
            callback(error);
        }
    },

    // Extend the data of an existing Todo
    patch: function(id, data, params, callback) {
        try {
            var todo = this.getTodo(id);

            // Extend the existing Todo with the new data
            Object.keys(data).forEach(function(key) {
                if(key !== 'id') {
                    todo[key] = data[key];
                }
            });

            callback(null, todo);
        } catch(error) {
            callback(error);
        }
    },

    // Remove an existing Todo by id
    remove: function(id, params, callback) {
        try {
            var todo = this.getTodo(id);
            var index = this.todos.indexOf(todo);

            // Splice it out of our Todo list
            this.todos.splice(index, 1);
            callback(null, todo);
        } catch(error) {
            callback(error);
        }
    }
}
