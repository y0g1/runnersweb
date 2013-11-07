'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('app.services', ['ngCookies'])
    .value('version', '0.1')

    .factory('Auth', function($http, $rootScope, $cookieStore){

        $rootScope.member = $cookieStore.get('member') || {};


        console.log($cookieStore.get('member'));
        return {

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

    });