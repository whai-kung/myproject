'use strict';

angular.module('app')
    .controller('loginController', function($scope, $location, Default) {

        Default.init({},{}, function(data){alert(data);});
        $scope.submit = function() {
            $location.path('/dashboard');
            return false;
        }

    });
