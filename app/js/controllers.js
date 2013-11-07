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
                toastr.error(data.message);
            }
        });

        $http.get('/events/upcoming/short').success(function(data) {

            if(data.state == 0) {
                $scope.upcomingRuns = data.res;
            } else {
                toastr.error(data.message);
            }
        });


        var resetPost = function() {
            $scope.post = {
                duration : new Date(0,0,0,0,0,0,0),
                message : '',
                location : null,
                distance: ''
            };
        }

        resetPost();



        $scope.getTowns = function(value) {
            return $http.get('/api/location/'+value).then(function(response){ return response.data; });
        };

        $scope.showFullForm = function() {
            $('.hp-post-details').addClass('active');
            $('.hp-post-message').addClass('active');
        };

        $scope.cancelPost = function() {
            $('.hp-post-details').removeClass('active');
            $('.hp-post-message').removeClass('active');

            resetPost();
        };

        $scope.addPost = function(post) {


            //console.log($scope.post);
            var data = {};

            data.duration = post.duration.getHours()*3600 + post.duration.getMinutes()*60 + post.duration.getSeconds();
            data.message = post.message;
            data.distance = post.distance * 1000;
            if( post.location ) {
                data.location = post.location.id;
            }


            $http.post('/post/add', data).success( function(ret) {

                if(ret.state == 0) {
                    var url = '/post/list/global/1';

                    if(Auth.isLoggedIn()) {
                        url = '/post/list/friends/1';
                    }

                    $http.get(url).success(function(data) {
                        if(data.state == 0) {
                            $scope.latestPosts = data.res;
                            toastr.success('[[[Post has been added succesfully]]]');
                        } else {
                            toastr.error(data.message);
                        }
                    });
                    resetPost();
                } else {
                    toastr.error(ret.message);
                }

            }).error( function() {
                    toastr.error('[[[There was a problem adding your post. Please try again.]]]');
            });

            console.log(data);

//            if(success) {
//
//            }
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
                toastr.error(data.message);
            }
        });
    }]).
    controller('EventsCreateCtrl', ['$scope', 'Auth', '$location', function($scope, Auth, $location) {

        toastr.info('Be aware, that this feature is not ready, yet.');

        $scope.createEvent = function() {
            toastr.error('Well, it`s not implemented yet. Sorry.');
        }
    }]);