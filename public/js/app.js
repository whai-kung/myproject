var app = angular.module('app', ['ngRoute', 'ngAnimate', 'cgBusy', 'ngCookies']);

app.server = app_server; // Set the current environment based on detected hostname.

// Configure spinner loader.
app.value('cgBusyDefaults', {
    message:'loading...',
    backdrop: false,
    templateUrl: 'loading.html',
    delay: 300,
    minDuration: 400,
    wrapperClass: 'my-class my-class2'
});

// Attach Basic Authentication and redirect for 401, 404, or 500 response.
app.factory('httpInterceptor', function ($q, $location, $rootScope, $cookieStore) {
    'use strict';
    return {
        request: function (config) {
            config.headers = (config.headers || {});
            config.headers.Authorization = 'Basic ' + $cookieStore.get('auth');
            /* If-Modified-Since GET on collection returns incorrect 304 after item deletion.
             * This is a Python-Eve Bug. https://github.com/nicolaiarocci/eve/issues/334
             * config.headers['If-Modified-Since'] = 'Thu, 01 Feb 1970 00:00:00 GMT'; */
            return config;
        },
        responseError: function (res) { // Redirect to /login if rejected.
            if (res.status === 400) {
                $location.path('/400');
            } else if (res.status === 401) {
                $rootScope.clearVars();
                $location.path('/');
            } else if (res.status === 404) {
                $location.path('/404');
            } else if (res.status === 500) {
                $location.path('/500');
            }
            return $q.reject(res);
        }
    };
});


app.config(function($routeProvider, $httpProvider) {
    'use strict';
    /*
     * Set headers for CORS
     * More info about cross origin resource sharing here: http://enable-cors.org/
     * Make sure server is returning this HTTP header:
     * Access-Control-Allow-Origin: *
    */
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    // Inject authInterceptor.
    $httpProvider.interceptors.push('httpInterceptor');
    
    $httpProvider.defaults.timeout = 5000;
    
    $routeProvider
    	.when('/', {
    		templateUrl: 'home.html',
            controller: 'mainController'
    	})
    	.when('/about', {
    		templateUrl: 'page-about.html',
            controller: 'aboutController'
    	})
    	.when('/contact', {
    		templateUrl: 'page-contact.html',
            controller: 'contactController'
    	});
});

app.controller('mainController', function($scope) {
    $scope.pageClass = 'page-home';
});

app.controller('aboutController', function($scope) {
    $scope.pageClass = 'page-about';
});

app.controller('contactController', function($scope) {
    $scope.pageClass = 'page-contact';
});

