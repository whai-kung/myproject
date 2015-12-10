"use strict";

var el = $('#todos');
var socket = io();
var app = feathers().configure(feathers.socketio(socket));
var todos = app.service('todos');


function getElement(todo) {
    return el.find('[data-id="' + todo.id + '"]')
}

function addTodo(todo) {
    var html = '<li class="page-header checkbox" data-id="' + todo.id + '">' +
        '<label><input type="checkbox" name="done">' +
        todo.text +
        '</label><a href="javascript://" class="pull-right delete">' +
        '<span class="glyphicon glyphicon-remove"></span>' +
        '</a></li>';

    el.find('.todos').append(html);
    updateTodo(todo);
}

function removeTodo(todo) {
    getElement(todo).remove();
}

function updateTodo(todo) {
    var element = getElement(todo);
    var checkbox = element.find('[name="done"]').removeAttr('disabled');

    element.toggleClass('done', todo.complete);
    checkbox.prop('checked', todo.complete);
}

todos.on('updated', updateTodo);
todos.on('removed', removeTodo);
todos.on('created', addTodo);

todos.find(function(error, todos) {
    todos.forEach(addTodo);
});

el.on('submit', 'form', function (ev) {
    var field = $(this).find('[name="description"]');

    todos.create({
        text: field.val(),
        complete: false
    });

    field.val('');
    ev.preventDefault();
});

el.on('click', '.delete', function (ev) {
    var id = $(this).parents('li').data('id');
    todos.remove(id);
    ev.preventDefault();
});

el.on('click', '[name="done"]', function(ev) {
    var id = $(this).parents('li').data('id');

    $(this).attr('disabled', 'disabled');

    todos.update(id, {
        complete: $(this).is(':checked')
    });
});
