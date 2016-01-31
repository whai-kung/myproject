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

// Verify Token.
appServices.factory('Verify', ['$resource', function ($resource) {
    'use strict';
    return $resource(
        app_server + '/auth/verify',
        {},
        {
            verify: {
                method  : 'GET',
                isArray : false,
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

// User
appServices.factory('User', ['$resource', function ($resource) {
    'use strict';
    return $resource(
        app_server + '/api/user/:user_id',
        {id: '@user_id'},
        {
            get: {
                method  : 'GET',
                isArray : false,
                transformRequest: function(data){
                    return $.param(data);
                }
            },
            update: {
                method  : 'PUT',
                isArray : false,
            }        
        }
    );
}]);
