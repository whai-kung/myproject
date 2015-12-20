var appServices = angular.module('appServices', ['ngResource']);

// Login.
appServices.factory('Login', ['$resource', function ($resource) {
    'use strict';
    return $resource(
        app_server + '/login',
        {},
        {
            login: {
                method  : 'POST',
                isArray : false
            }
        }
    );
}]);

// Logout.
appServices.factory('Logout', ['$resource', function ($resource) {
    'use strict';
    return $resource(
        app_server + '/logout',
        {},
        {
            logout: {
                method  : 'POST',
                isArray : false
            }
        }
    );
}]);


