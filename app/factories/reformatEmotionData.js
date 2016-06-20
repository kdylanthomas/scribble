'use strict';

app.factory('reformat-emotion-data', function () {
	let reformatEmotionData = data => {
		let reformattedJson = [];
		console.log(data);
		for (let key in data) {
			reformattedJson.push({'emotion': key, 'value': data[key]});
		}
		return reformattedJson;
	}
	return reformatEmotionData;
})