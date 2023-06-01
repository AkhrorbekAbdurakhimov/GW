const fs = require('fs');
const path = require('path');

const replaceAll = (str, find, replace) => str.replace(new RegExp(find, 'g'), replace);

const saveBase64Image = (base64) => {
	const timestamp = Date.now();
	const filename = `image_${timestamp}.png`;
	const filePath = path.join(process.cwd(), 'public', 'images', filename)

	const base64WithoutPrefix = base64
		.replace(/^data:image\/jpeg;base64,/, '')
		.replace(/^data:image\/png;base64,/, '');;

	const buffer = Buffer.from(base64WithoutPrefix, 'base64');

	fs.writeFileSync(filePath, buffer);

	return filename;
}

module.exports = {
	replaceAll,
	saveBase64Image
}