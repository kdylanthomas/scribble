'use strict';

app.controller('NavCtrl', [
	'$scope', 
	'$location',
	'authenticate',
	function ($scope, $location, authenticate) {
		$scope.logout = function () {
			authenticate.setUser(null);
		}
	}
]);
