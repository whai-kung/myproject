// home
app.controller('loginController', function($scope, $location, $cookieStore, Login) {
    'use strict';

    $scope.user = {};
    $scope.user.username = "user@mail.com";
    $scope.user.password = "password";
   
    // Redirect already logged in.
    if ($scope.logged_in) {
        $scope.loginRedirect();
        return;
    }

    $scope.submit = function() {
        console.log($scope, "scope");
        Login.login( {},
            {
                app_id      : $scope.config.oauth.app_id,
                username    : $scope.user.username,
                password    : $scope.user.password
            },
            function (data) {
                if(data.code){
                    alertMessage(data.message); 
                }else{
                    alertMessage(data.message, 'success');
                    $scope.verifyCookie($scope.loginRedirect);
                }
            },
            function (err) {
                alertMessage(err.message);
            }
        );
    }

});
app.controller('signupController', function($rootScope, $scope, _, $location, $cookieStore, Login) {
    'use strict';

    $scope.user = {};
    $scope.user.username = "user@mail.com";
    $scope.user.password = "password";
 
    $scope.user.languages = [];
    $scope.language = { 
        obj: {},
        name: "",
        level: ""
    }

    $rootScope.getLanguages(function(err, languages){
        if(!err){
            $scope.languages = languages;
        }
    });

    $scope.addLanguage = function(){
        if(!_.isEmpty($scope.language.obj) && $scope.language.level){
            $scope.user.languages.push($scope.language);    
            removeObj($scope.languages, 'key', $scope.language.name);
            $scope.language = { 
                obj: {},
                name: "",
                level: ""
            } 
        }else{
            var message = 'Language and Level are required';
            alertMessage(message, 'warning');
        }
    }
    $scope.removeLanguage = function(key){
        $scope.languages.forEach(function(v, i){
            if(v.name === key){
                $scope.languages.push(v.obj);
            }
        }); 
        _.sortBy($scope.languages, function(o) { return o.key; })
        removeObj($scope.user.languages, 'name', key);
    }

    // Redirect already logged in.
    if ($scope.logged_in) {
        $scope.loginRedirect();
        return;
    }

    $scope.nextStep = false;
    $scope.submit = function() {
        console.log($scope, "scope");
        Login.login( {},
            {
                app_id      : $scope.config.oauth.app_id,
                username    : $scope.user.username,
                password    : $scope.user.password
            },
            function (data) {
                if(data.code){
                    alertMessage(data.message); 
                }else{
                    alertMessage(data.message, 'success');
                    $scope.verifyCookie($scope.loginRedirect);
                }
            },
            function (err) {
                alertMessage(err.message);
            }
        );
    }

});


// feed
app.controller('homeController', function($scope, $location) {
    'use strict';

    // Redirect already logged in.
    $scope.checkAuthen(function(err, result){
        if(!result) return;               
    });
    
    var marker, map;
    $scope.$on('mapInitialized', function(evt, evtMap) {
        map = evtMap;
        marker = map.markers[0];
        console.log(marker.position.lat(), marker.position.lng(), 'marker');
    });
});

// Maps
app.controller('mapController', function(NgMap, $scope, $window) {
    
    $scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyCbjRbBOAgumSEQiOLCDjU3IdGLLIL1blE";
    NgMap.getMap().then(function(map) {
        console.log(map.getCenter());
        console.log('markers', map.markers);
        console.log('shapes', map.shapes);
    });
    
    var marker, map;
    $scope.$on('mapInitialized', function(evt, evtMap) {
        map = evtMap;
        marker = map.markers[0];
        if(marker.position.lat() != 0 && marker.position.lng() != 0){
            $scope.user.location = [marker.position.lat(), marker.position.lng()];
        }
        console.log(marker.position.lat(), marker.position.lng(), $scope.user, 'marker');
    });
    
    $scope.placeMarker = function(e) {

        /*var marker = new google.maps.Marker({position: e.latLng, map: map});
        $window.alert("position: " + e.latLng);

        map.panTo(e.latLng);*/
    }

    $scope.click = function(event) {
        map.setZoom(15);
        map.setCenter(marker.getPosition());
        console.log(marker.getPosition(),'position');
    }
    
});

// User
app.controller('userController', function(NgMap, $scope, $window){

    // Update location
    $scope.updateLocation = function (location) {
        User.update(
            {
                id: $scope.user._id
            },
            {
            },
            function (data){
                console.log(data); 
            },
            function (err) {}
        );
    };
});

app.controller('DashboardCtrl', function($scope, $state) {
    'use strict';

    $scope.$state = $state;
});
