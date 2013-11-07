'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('app', [
  'ngRoute',
  'app.filters',
  'app.services',
  'app.directives',
  'app.controllers',
  'ui.bootstrap'
]).

config(['$routeProvider', '$locationProvider', '$sceProvider', function($routeProvider, $locationProvider, $sceProvider) {
    $routeProvider.when('/home', {templateUrl: 'r/partials/home.html', controller: 'HomeCtrl'});
    $routeProvider.when('/sign-in', {templateUrl: 'r/partials/sign-in.html', controller: 'SignInCtrl'});
    $routeProvider.when('/sign-out', {templateUrl: 'r/partials/sign-in.html', controller: 'SignOutCtrl'});
    $routeProvider.when('/sign-up', {templateUrl: 'r/partials/sign-up.html', controller: 'SignUpCtrl'});

    $routeProvider.when('/events/upcoming', {templateUrl: 'r/partials/events-upcoming.html', controller: 'EventsUpcomingCtrl'});
    $routeProvider.when('/events/create', {templateUrl: 'r/partials/events-create.html', controller: 'EventsCreateCtrl'});


    $routeProvider.otherwise({redirectTo: '/home'});
    $sceProvider.enabled(false);
}]);

app.run(function($rootScope, $http) {

});