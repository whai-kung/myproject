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
        Login.signin( {},
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
app.controller('signupController', function($scope, _, $location, $cookieStore, Login, Map) {
    'use strict';

    var options;

    $scope.user = {};
    $scope.user.username = "user@mail.com";
    $scope.user.password = "password";
 
    $scope.user.profile = {};
    $scope.user.profile.languages = [];
    $scope.language = { 
        obj: {},
        name: "",
        level: ""
    }

    $scope.user.profile.location = {
        "lat" : 0,
        "lng" : 0
    };

    $scope.getLanguages(function(err, languages){
        if(!err){
            $scope.languages = languages;
        }
    });

    $scope.addLanguage = function(){
        if(!_.isEmpty($scope.language.obj) && $scope.language.level){
            $scope.user.profile.languages.push($scope.language);    
            removeObj($scope.languages, 'key', $scope.language.name);
            $scope.language = { 
                obj: {},
                name: "",
                level: ""
            } 
            $scope.validate = true;
        }else{
            var message = 'Language and Level are required';
            alertMessage(message, 'warning');
        }
    }
    $scope.removeLanguage = function(key){
        $scope.user.profile.languages.forEach(function(v, i){
            if(v.name === key){
                $scope.languages.push(v.obj);
            }
        }); 
        $scope.languages = _.sortBy($scope.languages, function(o) { 
            return o.key; 
        })
        removeObj($scope.user.profile.languages, 'name', key);
        $scope.validate = ($scope.user.profile.languages.length > 0);
    }

    function success(pos) {
        var crd = pos.coords;
        $scope.load = Map.getAddress ( {},
            {
                lat: crd.latitude,
                lng: crd.longitude
            },
            function (data) {
                $scope.user.profile.location = $scope.getAddress(data.results[0].address_components);
                $scope.user.profile.location['lat'] = crd.latitude;
                $scope.user.profile.location['lng'] = crd.longitude;
            },
            function (err) {
                alertMessage("Can not load your current location!");
            }
        );
    }

    function error(err) {
        console.warn('ERROR(' + err.code + '): ' + err.message);
    }

    options = {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0
    };

    navigator.geolocation.watchPosition(success, error, options);

    // Redirect already logged in.
    if ($scope.logged_in) {
        $scope.loginRedirect();
        return;
    }

    $scope.nextStep = false;
    $scope.validate = false
    $scope.submit = function() {
        if( $scope.validate() ){
            console.log($scope.user, 'success');
        }
        /*console.log($scope.user, "scope");
        Login.signup( {},
            {
                user: $scope.user
            },
            function (data) {
                alertMessage(data.message, 'success');
                console.log(data, 'success');
            },
            function (err) {
                alertMessage(err.message);
            }
        );*/
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
