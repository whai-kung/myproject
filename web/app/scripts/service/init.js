var appServices = angular.module('appServices', ['ngResource']);

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


