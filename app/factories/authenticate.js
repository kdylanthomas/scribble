'use strict';

app.factory('authenticate', function ($location) {
	let currentUser = null;
	return {
		getUser: () => currentUser,
		setUser: (user) => {
			currentUser = user;
			$location.path('/journal'); // redirect user to journal view once authenticated
		}
	}
});