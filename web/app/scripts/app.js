var app = angular.module('app', 
    ['ui.router', 'snap', 'ngAnimate', 'cgBusy', 'ngCookies', 'appServices']);

app.server = app_server; // Set the current environment based on detected hostname.

// Configure spinner loader.
app.value('cgBusyDefaults', {message: 'loagind...'});

// Attach Basic Authentication and redirect for 401, 404, or 500 response.
app.factory('httpInterceptor', function ($q, $location, $rootScope, $cookieStore) {
    'use strict';
    return {
        request: function (config) {
            config.headers = (config.headers || {});
            config.headers.penguin_access_token = $cookieStore.get('penguin_access_token');
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

// Routes
app.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
    
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    // Inject authInterceptor.
    $httpProvider.interceptors.push('httpInterceptor');

    $urlRouterProvider.when('/dashboard', '/dashboard/overview');
    $urlRouterProvider.otherwise('/home');

    $stateProvider
        .state('base', {
            abstract: true,
            url: '',
            templateUrl: 'views/base.html'
        })
        .state('home', {
            url: '/home',
            parent: 'base',
            templateUrl: 'views/home.html',
            controller: 'loginController'
        })
        .state('dashboard', {
            url: '/dashboard',
            parent: 'base',
            templateUrl: 'views/dashboard.html',
            controller: 'DashboardCtrl'
        })
        .state('overview', {
            url: '/overview',
            parent: 'dashboard',
            templateUrl: 'views/dashboard/overview.html'
        })
        .state('reports', {
            url: '/reports',
            parent: 'dashboard',
            templateUrl: 'views/dashboard/reports.html'
        });
});


// Global vars and functions.
app.run(function ($rootScope, $location, $cookieStore, $window, Logout) {
    'use strict';
    
    // Populate session vars.
    $rootScope.populateVars = function () {
        try {
            $rootScope.logged_in     = $cookieStore.get('logged_in');
            $rootScope.is_admin      = $cookieStore.get('is_admin');
            $rootScope.roles         = $cookieStore.get('roles');
            $rootScope.username      = $cookieStore.get('username');
        } catch(e) {
            $rootScope.clearVars();
            $location.path('/login');
        }
    };

    // Clear sessions vars.
    $rootScope.clearVars = function () {
        $cookieStore.put('auth',          '');
        $cookieStore.put('logged_in',     false);
        $cookieStore.put('is_admin',      false);
        $cookieStore.put('roles',         []);
        $cookieStore.put('username',      '');
        $rootScope.populateVars();
    };
    
    $rootScope.populateVars();
    
    // Logout function
    $rootScope.logout = function () {

        Logout.logout(
            {},
            {'username': $cookieStore.get('username')},
            function (data) {
                $rootScope.clearVars();
                $location.path('/');
            },
            function (err) {
            }
        );
    };
});

