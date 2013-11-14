'use strict';

/* Controllers */

angular.module('app.controllers', []).

    controller('HomeCtrl', ['$scope', '$http', 'Auth', 'Post', 'Town', function($scope, $http, Auth, Post, Town) {

        /**
         * ==================== POSTS =========================
         */

        var resetPostForm = function() {
                $scope.post = {
                    duration : new Date(0,0,0,0,0,0,0),
                    message : '',
                    location : null,
                    distance: ''
                };
            },
            removePostFromScope = function(id) {
                var latestPosts = $scope.latestPosts;
                $scope.latestPosts = [];
                angular.forEach( latestPosts, function(post) {
                    if(post.id != id) $scope.latestPosts.push(post);
                });
            };

        resetPostForm();

        $scope.loadPostsPage = function (page) {
            Post.getListForHomepage(page, function(data) {
                $scope.latestPosts = data;
            });
        };

        $scope.loadPostsPage(1);

        $scope.deletePost = function(id) { Post.delete(id, function() { removePostFromScope(id); }); };

        $scope.addPost = function(post) {

            console.log(post);

            Post.add(post, function() {
                toastr.success('[[[Post has been added successfully]]]');
                resetPostForm();
                $('.hp-post-details').removeClass('active');
                $('.hp-post-message').removeClass('active');
                $scope.loadPostsPage(1);
            });

        };

        $scope.cancelPost = function() {
            $('.hp-post-details').removeClass('active');
            $('.hp-post-message').removeClass('active');

            resetPostForm();
        };

        $scope.showFullForm = function() {
            $('.hp-post-details').addClass('active');
            $('.hp-post-message').addClass('active');
        };

        /**
         * ==================== EVENTS =========================
         */

        $http.get('/events/upcoming/short').success(function(data) {

            if(data.state == 0) {
                $scope.upcomingRuns = data.res;
            } else {
                toastr.error(data.message);
            }
        });

        /**
         * ==================== TOWNS =========================
         */

        $scope.getTowns = Town.getList;

    }]).

    controller('ProfilePageCtrl', ['$scope', '$routeParams', 'Post', function($scope, $routeParams, Post) {
        var memberId = parseInt($routeParams.member_id);
        if(parseInt(memberId) == 0) {
            return false;
        }

        var removePostFromScope = function(id) {
            var latestPosts = $scope.latestPosts;
            $scope.latestPosts = [];
            angular.forEach( latestPosts, function(post) {
                if(post.id != id) $scope.latestPosts.push(post);
            });
        };

        $scope.loadPostsPage = function(page) {
            Post.getListForMember(memberId, page, function(data) {
                $scope.posts = data;
            });
        };

        $scope.loadPostsPage(1);

        $scope.deletePost = function(id) {
            Post.delete(id, function() {
                removePostFromScope(id);
            });
        };

    }]).

    controller('PostShowCtrl', ['$scope', '$routeParams', 'Post', function($scope, $routeParams, Post) {

        var id = parseInt($routeParams.post_id);

        if(id == 0) {
            return false;
        }

        Post.get(id, function(data) {
            $scope.post = data;
        });

        $scope.deletePost = function(id) {
            Post.delete(id, function() {
                location.href='#/';
            });
        };

    }]).

    controller('PostEditCtrl', ['$scope', '$routeParams', 'Post', 'Town', function($scope, $routeParams, Post, Town) {

        var id = parseInt($routeParams.post_id);

        if(id == 0) {
            return false;
        }

        Post.get(id, function(data) {

            data.location = {
                id: data.location_id,
                town: data.town+', '+data.country_name
            };

            data.distance = (data.distance / 1000).toFixed(3);

            var seconds = data.duration;
            data.duration = new Date(0, 0, 0, Math.floor(seconds/3600), (seconds % 3600 / 60), seconds % 60, 0);

            $scope.post = data;
        });

        $scope.savePost = function(post) {
            Post.save(post, function() {
                toastr.success('[[[Post has been added updated]]]');
                location.href='#/post/'+id;
            });
        };


        $scope.getTowns = Town.getList;

    }]).

    controller('SignUpCtrl', [function() {

        toastr.error('Be aware that registering is now working yet.');

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
                $scope.member.password = '';
                $('#inputPassword3').focus();
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
            toastr.error('Well, it`s not implemented yet. Told you.');
        }
    }]);

