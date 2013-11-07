'use strict';

/* Controllers */

angular.module('app.controllers', []).
    controller('HomeCtrl', ['$scope', '$http', 'Auth', function($scope, $http, Auth) {

        var url = '/post/list/global/1';

        if(Auth.isLoggedIn()) {
            url = '/post/list/friends/1';
        }

        $http.get(url).success(function(data) {

            if(data.state == 0) {
                $scope.latestPosts = data.res;
            } else {
                ///TODO: error handling
            }
        });

        $http.get('/events/upcoming/short').success(function(data) {

            if(data.state == 0) {
                $scope.upcomingRuns = data.res;
            } else {
                ///TODO: error handling
            }
        });

        $scope.getTowns = function(value) {
            return $http.get('/api/location/'+value).then(function(response){ return response.data; });
        };

    }]).
    controller('SignUpCtrl', [function() {
        console.log('aaa');
    }]).
    controller('SignOutCtrl', ['$scope', 'Auth', '$location', function($scope, Auth, $location) {

        Auth.logout( function() {
            toastr.success('[[[Signed out]]]');
            $location.path("home");
        }, function() {
            $location.path("home");
        });

    }]).
    controller('SignInCtrl', ['$scope', 'Auth', '$location', function($scope, Auth, $location) {
        if(Auth.isLoggedIn()) {
            $location.path("home");
        }

        $scope.login = function() {
            Auth.login($scope.member.login, $scope.member.password, function(member) {
                toastr.success('[[[Signed in]]]');
                $location.path("home");
            }, function() {
                toastr.error('[[[Wrong email or password]]]');
            })

        }
    }]).
    controller('EventsUpcomingCtrl', ['$scope', '$http', function($scope, $http) {

        $http.post('/events/upcoming').success(function(data) {

            if(data.state == 0) {
                $scope.upcomingRuns = data.res;
            } else {
                ///TODO: error handling
            }
        });
    }]).
    controller('EventsCreateCtrl', ['$scope', 'Auth', '$location', function($scope, Auth, $location) {

        toastr.info('Be aware, that this feature is not ready, yet.');

        $scope.createEvent = function() {
            toastr.error('Well, it`s not implemented yet. Sorry.');
        }
    }]);