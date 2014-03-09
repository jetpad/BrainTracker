myApp.config(function($routeProvider, $locationProvider) {

    $routeProvider.
      when('/', {
       templateUrl: 'views/main.html',
      }).
      when('/contact', {
        templateUrl: 'views/contact.html',
      }).
      when('/about', {
        templateUrl: 'views/about.html',
      }).      
      when('/signout', {
        templateUrl: 'views/signout.html',
      }).
      when('/results', {
        templateUrl: 'views/results.html',
      }).
      when('/test', {
        templateUrl: 'views/reaction-number.html',
     //   resolve:  {
     //       authenticate: mainCtrl.authenticate
     //   }
      }).
      otherwise({
        redirectTo: '/'
      });

    // use the HTML5 History API
  //  $locationProvider.html5Mode(true);
  });