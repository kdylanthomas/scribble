'use strict';

app.factory('authenticate', function ($location) {
	let currentUser = null;
	return {
		getUser: () => currentUser,
		setUser: (user) => {
			currentUser = user;
			if (user !== null) $location.path('/journal')
			else $location.path('/login'); // redirect user to journal view once authenticated
		}
	}
});