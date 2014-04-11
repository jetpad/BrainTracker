myApp.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise("/");

  $stateProvider
    .state('/', {
      url: '/',
      templateUrl: 'views/main.html',
    })
    .state('contact', {
      url: '/contact',
      templateUrl: 'views/contact.html',
    })
    .state('about', {
      url: '/about',
      templateUrl: 'views/about.html',
    })
    .state('import', {
      url: '/import',
      templateUrl: 'views/import.html',
    })
    .state('results', {
      url: '/results',
      templateUrl: 'views/results.html',
    })
    .state('results.report', {
      url: '/report',
      templateUrl: 'views/results-report.html',
    })
    .state('results.chart', {
      url: '/chart',
       templateUrl: 'views/sessionschart.html',
    })
    .state('results.ptilechart', {
      url: '/ptilechart',
       templateUrl: 'views/sessionsptilechart.html',
    })
    .state('signout', {
      url: '/signout',
      templateUrl: 'views/signout.html',
    })
    .state('test', {
      url: '/test',
      templateUrl: 'views/reaction-number.html',
    })
    .state('testcomplete', {
      url: '/testcomplte',
      templateUrl: 'views/test-complete.html',
    })
    .state('session', {
      url: '/session/:index',
      templateUrl: 'views/session.html',
    })


/*
      when('/session/:index', {
        templateUrl: 'views/session.html',
      }).      
      when('/results/:tab', {
        templateUrl: 'views/results.html',
      }).
*/
  });