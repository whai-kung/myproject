var appServices = angular.module('appServices', ['ngResource']);

// set Default
appServices.factory('Default', ['$resource', function($resource) {
    'use strict';
    return $resource(
        app_server + '/api/init',
        {},
        {
            init: {
                method  : 'GET',
                isArray : false
            } 
        }
    );
}]);

// Login.
appServices.factory('Login', ['$resource', function ($resource) {
    'use strict';
    var a = {a:1,b:2,c:3}
    return $resource(
        app_server + '/auth/signin',
        {},
        {
            login: {
                method  : 'POST',
                isArray : false,
                headers : {
                    'Content-Type' : 'application/x-www-form-urlencoded'
                },
                transformRequest: function(data){
                    return $.param(data);
                }
            }
        }
    );
}]);

// Logout.
appServices.factory('Logout', ['$resource', function ($resource) {
    'use strict';
    return $resource(
        app_server + '/auth/signout',
        {},
        {
            logout: {
                method  : 'GET',
                isArray : false
            }
        }
    );
}]);


