var app = angular.module('app', 
    ['ui.router', 'snap', 'ngAnimate', 'cgBusy', 'ngCookies', 'appServices', 'ngSanitize']);

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
    'use strict';
    /*
     * Set headers for CORS
     * More info about cross origin resource sharing here: http://enable-cors.org/
     * Make sure server is returning this HTTP header:
     * Access-Control-Allow-Origin: *
    */
    $httpProvider.defaults.useXDomain = true;

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
app.run(function ($rootScope, $location, $cookieStore, $window, Default) {
    'use strict';
    
    // Populate session vars.
    $rootScope.populateVars = function () {
        try {
            $rootScope.logged_in    = $cookieStore.get('logged_in');
            $rootScope.roles        = $cookieStore.get('roles');
            $rootScope.user         = $cookieStore.get('user');
        } catch(e) {
            $rootScope.clearVars();
            $location.path('/home');
        }
    };

    // Clear sessions vars.
    $rootScope.clearVars = function () {
        $cookieStore.put('penguin_auth',    '');
        $cookieStore.put('logged_in',       false);
        $cookieStore.put('roles',           []);
        $cookieStore.put('user',            '');
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

    $rootScope.encrypt = function(msg) {
    
    };

    $rootScope.decrypt = function(msg) {
    
    };

    $rootScope.init = function() {
        Default.init({},{}, function(data){
            $rootScope.config = data; 
            var config = $rootScope.config;
            console.log(config.oauth, config.common, "rootScope.config");
        });
    }
    $rootScope.init();

    // Redirect login function
    $rootScope.loginRedirect = function () {
        /*if ($cookieStore.get('is_admin')) {
            $location.path('/admin/customers');
        } else {
            if ($cookieStore.get('user')) {
                $location.path('/user/' + $cookieStore.get('user._id'));
            } else {
                $rootScope.logout();
            }
        }*/

        if ($cookieStore.get('user')) {
            $location.path('/user/' + $cookieStore.get('user._id'));
        } else {
            $rootScope.logout();
        }
    };

});

// filter
app.filter("message", function(){
    return function(err){
        if(err) return '<div class="' + err.type + '">' + err.message + '</div>';
        return "";
    }
    /*<div class="error">username or password incorrect!!</div>
    <div class="warning">username or password incorrect!!</div>
    <div class="info">username or password incorrect!!</div>
    <div class="success">username or password incorrect!!</div>*/

});

app.filter("hot", function(){
    return function(msg){
        if(msg) return '<p class="font-effect-fire-animation">' + msg + '</p>';
        return "";
    }
});

// directive
app.directive('test', function () {
    return {
        link: function ($scope, element, attrs) {
            element.bind('click', function () {
                element.html('You clicked me!');
            });
            element.bind('mouseenter', function () {
                element.css('background-color', 'yellow');
            });
            element.bind('mouseleave', function () {
                element.css('background-color', 'white');
            });
        }
    };
});
