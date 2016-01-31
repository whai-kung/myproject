"use strict";

var mongoose    = require('mongoose'),
    bcrypt      = require('bcrypt'),
    config      = require('../config').config;

var Schema      = mongoose.Schema,
    ObjectID    = mongoose.Types.ObjectId;

var userEmail = new Schema({
    email: {
        type: String,
        required: true, 
        validate: {
            validator: function(email) {
                var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
                return emailRegex.test(email); // Assuming email has a text attribute
            },
            message: '{VALUE} is not an Email'
        }
    },
    type: {type: String, required: true}
});

var userSchema = new Schema({
    username: {
        type: String, 
        required: true, 
        index: { unique: true },
        validate: {
            validator: function(email) {
                var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
                return emailRegex.test(email); // Assuming email has a text attribute
            },
            message: '{VALUE} is not an Email'
        }
    },
    email: [userEmail],
    password: {type: String, select: false},
    firstname: {type: String, required: true},
    lastname: {type: String},
    gender: {type: String, required: true},
    avatar: {type: String},
    location: {type: [Number]}, // [Long, Lat]
    friends: {type: Schema.Types.ObjectId, ref: 'User'},
    lastActivity_at: {type: Date, default: Date.now},
    loginAttempts: { type: Number, required: true, default: 0, select: false},
    lockUntil: { type: Number, select: false},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now, select: false}
});

userSchema.pre('save', function(callback){
    var user = this;
    var now = new Date();
    this.updated_at = now;
    if(!this.created_at) {
        this.created_at = now
    }
    
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return callback();
   
    // if no password
    if (!user.password) return callback();
    
    // generate a salt
    bcrypt.genSalt(config.database.security.salt_factor, function(err, salt) {
        if (err) return callback(err);

        // hash the password along with our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return callback(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            callback();
        });
    });
});

// expose enum on the model, and provide an internal convenience reference 
var reasons = userSchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};

userSchema.virtual('isLocked').get(function() {
    // check for a future lockUntil timestamp
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Create a virtual field for id.
userSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};

userSchema.methods.incLoginAttempts = function(callback) {
    // if we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.update({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        }, callback);
    }
    // otherwise we're incrementing
    var updates = { $inc: { loginAttempts: 1 } };
    // lock the account if we've reached max attempts and it's not locked already
    if (this.loginAttempts + 1 >= config.database.security.max_login && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + config.database.security.lock_time };
    }
    return this.update(updates, callback);
};

function getEmail(emails){
    for(var i=0 ; i< emails.length ; i ++)
    {
        if(emails[i].type == "primary"){
            return emails[i].email;
        }
    }
}

userSchema.methods.getEmail = function() {
    return getEmail(this.email);
}

userSchema.methods.getFriendInfo = function() {
    return {
        firstname: this.firstname,
        lastname: this.lastname,
        lastActivity_at: this.lastActivity_at,
        email: this.getEmail(),
        gender: this.gender,
        avatar: this.avatar
    };
}

userSchema.methods.toJSON = function() {
    var obj = this.toObject()
    if(obj.password) delete obj.password;
    if(obj.loginAttempts !== null) delete obj.loginAttempts;
    delete obj.__v;
    return obj
}

userSchema.statics.findById = function(user_id, callback){
    var User = this;
    User.findOne({ _id: new ObjectID(user_id) }, function(err, user){
        if(err) return callback(err);
        callback(err, user); 
    });
};

userSchema.statics.createNewUser = function(userModel, callback){
    // check duplicate
    var User = this;
    User.findOne({ username: userModel.username },  function(err, user) {
        if(user){
            var err = new Error('This username already registed.');
            return callback(err); 
        }else{
            var user = new User({
                username: userModel.username,
                password: userModel.password,
                firstname: userModel.firstname || userModel.username,
                gender: userModel.gender,
                email: {
                    email: userModel.username,
                    type: "primary"
                }
            });
            user.save(function(err, user, count) {
                if(err) return callback(err);
                callback(err, user, count);
            }); 
        }
    });
};

userSchema.statics.getAuthenticated = function(username, password, callback) {
    this.findOne({ username: username },"+password +loginAttempts +lockUntil",  function(err, user) {
        if (err) return callback(err);

        // make sure the user exists
        if (!user) {
            return callback(null, null, reasons.NOT_FOUND);
        }

        // check if the account is currently locked
        if (user.isLocked) {
            // just increment login attempts if account is already locked
            return user.incLoginAttempts(function(err) {
                if (err) return callback(err);
                return callback(null, null, reasons.MAX_ATTEMPTS);
            });
        }

        // matching password
        user.comparePassword(password, function(err, isMatch) {
            if (err) return callback(err);

            // check if the password was a match
            if (isMatch) {
                // if there's no lock or failed attempts, just return the user
                if (!user.loginAttempts && !user.lockUntil){
                    user.lastActivity_at = Date.now();
                    user.save();
                    return callback(null, user);
                }

                // reset attempts and lock info
                var updates = {
                    $set: { loginAttempts: 0, lastActivity_at: Date.now() },
                    $unset: { lockUntil: 0 }
                };
                return user.update(updates, function(err, model){
                    callback(err, user)
                });
            }

            // password is incorrect, so increment login attempts before responding
            user.incLoginAttempts(function(err) {
                if (err) return callback(err);
                return callback(null, null, reasons.PASSWORD_INCORRECT);
            });
        });
    });
};
// Ensure virtual fields are serialised.
//userSchema.set('toObject', {virtuals: true});
//userSchema.set('toJSON', {virtuals: true});

userSchema.index({'lastactivity_at': -1, 'location': '2dsphere', 'firstname': 1});
var User = mongoose.model('User', userSchema);

module.exports = User;
