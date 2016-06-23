'use strict';

app.factory('authenticate', function ($location) {
	let currentUser = null;
	return {
		getUser: () => localStorage.getItem('currUserId'),
		setUser: (user) => {
			currentUser = user;
			localStorage.setItem('currUserId', user.UserId);
			if (user !== null) $location.path('/journal')
			else $location.path('/login'); // redirect user to journal view once authenticated
		}
	}
});