'use strict';

app.controller('LoginCtrl', [
	'$scope',
	'$http',
	//'AuthFactory',
	function ($scope, $http) {

		$scope.googleOauth = function () {
			OAuth.initialize('VQpWdUCqvJVMusQiRHOgoExz274')
			OAuth.popup('google').done(function(result) {
		    console.log(result)
		    // do some stuff with result
		    result.me().done(data => {
		    	console.log(data);
    		});
			});
		}
	}
]);