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
      when('/import', {
        templateUrl: 'views/import.html',
      }).      
      when('/report', {
        templateUrl: 'views/session-report.html',
        controller: 'SessionsReportControl'
      }).      
      when('/chart', {
        templateUrl: 'views/sessions-chart.html',
        controller: 'SessionsChartControl'
      }).      
      when('/results', {
        templateUrl: 'views/results.html',
      }).      
      when('/testreport', {
        templateUrl: 'views/testreport.html',
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
      when('/testcomplete', {
        templateUrl: 'views/test-complete.html',
      }).
      otherwise({
        redirectTo: '/'
      });

    // use the HTML5 History API
  //  $locationProvider.html5Mode(true);
  });