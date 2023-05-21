const replaceAll = (str, find, replace) => str.replace(new RegExp(find, 'g'), replace);

module.exports = {
	replaceAll
}