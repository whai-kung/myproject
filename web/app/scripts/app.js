var app = angular.module('app', 
    ['ui.router', 'snap', 'ngAnimate', 'cgBusy', 'ngCookies', 'appServices', 'ngSanitize', 'ngMap']);

app.server = app_server; // Set the current environment based on detected hostname.

// Configure spinner loader.
app.value('cgBusyDefaults', {message: 'loagind...'});

// Attach Basic Authentication and redirect for 401, 404, or 500 response.
app.factory('httpInterceptor', function ($q, $location, $rootScope, $cookieStore) {
    'use strict';
    return {
        request: function (config) {
            config.headers = (config.headers || {});
            //config.headers.user = $cookieStore.get('user');
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
    $httpProvider.defaults.withCredentials = true;
    delete $httpProvider.defaults.headers.common["X-Requested-With"];

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
        .state('base_login', {
            abstract: true,
            url: '',
            templateUrl: 'views/base_login.html'
        })
        .state('baseHome', {
            abstract: true,
            url: '',
            templateUrl: 'views/baseHome.html'
        })
        .state('login', {
            url: '/login',
            parent: 'base',
            templateUrl: 'views/login.html',
            controller: 'loginController'
        })
        .state('home', {
            url: '/home',
            parent: 'baseHome',
            templateUrl: 'views/home.html',
            controller: 'loginController'
        })
        .state('feed', {
            url: '/feed',
            parent: 'base_login',
            templateUrl: 'views/feed.html',
            controller: 'homeController'
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
app.run(function ($q, $rootScope, $location, $cookieStore, $window, $document, Default, Verify, User, Logout) {
    'use strict';

    $rootScope.Brand = brand; 
    
    $rootScope.init = function() {
        Default.init({},{}, function(data){
            $rootScope.config = data; 
            var config = $rootScope.config;
            console.log(config.oauth, config.common, "rootScope.config");
        });
    }

    // Populate session vars.
    $rootScope.bindingVars = function (callback) {
        try {
            $rootScope.logged_in    = $cookieStore.get('logged_in');
            $rootScope.roles        = $cookieStore.get('roles');
            $rootScope.user         = $cookieStore.get('user');
            return callback(null);
        } catch(e) {
            $rootScope.clearVars(function(){
                return $location.path('/home');
            });
        }
    };

    // Clear sessions vars.
    $rootScope.clearVars = function (callback) {
        $cookieStore.put('penguin_token',   '');
        $cookieStore.put('logged_in',       false);
        $cookieStore.put('roles',           []);
        $cookieStore.put('user',            '');
        $rootScope.bindingVars(callback);
    };
    
    $rootScope.bindingVars($rootScope.init);
    
    $rootScope.verifyCookie = function (callback) {
        Verify.verify({},{}, function(data){
            if(data.data && data.is_correct){
                $cookieStore.put('penguin_token',   data.data['token']);        
                $cookieStore.put('roles',           (data.roles || []));
                $cookieStore.put('user',            (data.data || {}));
                $cookieStore.put('logged_in',       true);
            }
            return $rootScope.bindingVars(callback);
        },function(err){
            return callback(err); 
        }); 
    };

    // Check authentication
    $rootScope.checkAuthen = function (callback) {
        if($rootScope.logged_in) {
            return callback(null, true);
        } else {
            $rootScope.logout();
            return callback(null, false);
        }
    };
    
    // Logout function
    $rootScope.logout = function () {

        Logout.logout(
            {},
            {'token': $cookieStore.get('penguin_token')},
            function (data) {
                $rootScope.clearVars(function(){
                    return $location.path('/home');
                });
            },
            function (err) {
            }
        );
    };


    // Redirect login function
    $rootScope.loginRedirect = function () {
        if ($cookieStore.get('logged_in')) {
            $location.path('/feed');
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
