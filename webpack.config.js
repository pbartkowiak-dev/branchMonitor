const path = require('path')

module.exports = {
	entry: './src/script/index.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'public')
	}
};