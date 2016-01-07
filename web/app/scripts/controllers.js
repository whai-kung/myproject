app.controller('loginController', function($scope, $location, $cookieStore, $rootScope, $cookies, Login) {
    'use strict';

    $scope.user = {};
    $scope.user.username = "user@mail.com";
    $scope.user.password = "password";

    // Redirect already logged in.
    if ($cookieStore.get('logged_in')) {
        $rootScope.loginRedirect();
        return;
    }

    $scope.submit = function() {
        Login.login( {},
            {
                app_id      : $rootScope.config.oauth.app_id,
                username    : $scope.user.username,
                password    : $scope.user.password
            },
            function (data) {
                var result = {
                    message : data.message,
                    type    : data.code? "error" : "success"
                };
                console.log(data, $cookies, "success");
                $scope.result = result; 
            },
            function (err) {
                var result = {
                    message : err.message,
                    type    : "error"
                };
                $scope.result = err.message;
            }
        );
        return false;
    }

});

app.controller('DashboardCtrl', function($scope, $state) {
    'use strict';

    $scope.$state = $state;
});
