"use strict";

module.exports = {
    // models/user.js
    var mongoose = require('mongoose'),
        Schema = mongoose.Schema;

    var TodoSchema = Schema({
        title: {type: String, required: true},
        description: {type: String},
        dueDate: {type: Date, 'default': Date.now},
        complete: {type: Boolean, 'default': false, index: true}
    });

    TodoSchema.methods.isComplete = function() {
        return this.complete;
    }

    // Create a virtual field for id.
    TodoSchema.virtual('id').get(function(){
        return this._id.toHexString();
    });
    // Ensure virtual fields are serialised.
    TodoSchema.set('toJSON', {virtuals: true});
    TodoSchema.set('toObject', {virtuals: true});

    TodoSchema.index({'dueDate': -1, background: true});
}
