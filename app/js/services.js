'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('app.services', ['ngCookies'])
    .value('version', '0.1')

    .factory('Auth', ['$http','$rootScope', '$cookieStore', function($http, $rootScope, $cookieStore){

        $rootScope.member = $cookieStore.get('member') || {};


        return {

            getMember: function() {
                if( typeof member == 'undefined') {
                    return $rootScope.member;
                }

                return {id:-1};
            },
            isLoggedIn: function(member) {
                if(member === undefined)
                    member = $rootScope.member;

                return typeof member.id != 'undefined';
            },

            register: function(member, success, error) {
                $http.post('/api/register', member).success(success).error(error);
            },

            login: function(login, password, success, error) {
                $http.post('/api/login', {login:login, password:password}).success(function(answer){
                    if(answer.state == 0) {
                        $rootScope.member = answer.res;
                        success(answer.res);
                    } else {
                        error();
                    }
                }).error(error);
            },

            logout: function(success, error) {
                $http.post('/api/logout').success(function(){
                    $rootScope.member = {};
                    success();
                }).error(error);
            }
        };


    }])
    .factory('Post', ['$http', 'Auth', function($http, Auth){

        return {

            getListForMember: function(memberId, page, callback) {

                $http.get('/post/list/member/'+memberId+'/'+page).success(function(data) {

                    if(data.state == 0) {
                        callback(data.res);
                    } else {
                        toastr.error(data.message);
                        callback([]);
                    }
                });

            },

            getListForHomepage: function(page, callback) {

                var url = '/post/list/global/'+page;

                if(Auth.isLoggedIn()) {
                    url = '/post/list/friends/'+page;
                }

                $http.get(url).success(function(data) {

                    if(data.state == 0) {
                        callback(data.res);
                    } else {
                        toastr.error(data.message);
                        callback([]);
                    }
                });

            },

            get: function(id, callback) {

                $http.get('/post/'+id).success(function(data) {

                    if(data.state == 0) {

                        if(Auth.isLoggedIn() && data.res.member_id == Auth.getMember().id ) {
                            data.res.isOwner = true;
                        } else {
                            data.res.isOwner = false;
                        }

                        callback(data.res);

                    } else {
                        toastr.error(data.message);
                        callback([]);
                    }
                });

            },

            add: function(post, callback) {

                var data = {};

                data.duration = post.duration.getHours()*3600 + post.duration.getMinutes()*60 + post.duration.getSeconds();
                data.message = post.message;
                data.distance = post.distance * 1000;
                if( post.location ) {
                    data.location = post.location.id;
                }

                $http.post('/post/add', data).success( function(ret) {

                    if(ret.state == 0) {
                        callback();
                    } else {
                        toastr.error(ret.message);
                    }

                }).error( function() {
                    toastr.error('[[[There was a problem adding your post. Please try again.]]]');
                });

            },

            delete: function(id, callback) {

                $http({
                    method: 'POST',
                    url: '/post/delete',
                    data : {id:id}
                }).success(function() {
                    toastr.success('[[[Post has been removed]]]');
                    callback();
                });

            }
        };


    }]);