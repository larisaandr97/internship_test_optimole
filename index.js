const sharp = require('sharp');
const fs = require('fs');
const sizeOf = require('image-size');

exports.handler = async function (event) {

	// creating directory with name 'optimized', if it doesn't exist yet
	var dirName = './optimized';
	if (!fs.existsSync(dirName)) {
		fs.mkdirSync(dirName);
	}

	// decoding optimole key passed by event
	let encodedKey = event['optimoleKey'];
	let decodedKey = atob(encodedKey);

	// create output object
	var finalObject = new Object();
	finalObject['pass'] = decodedKey;
	finalObject['optimized'] = [];

	// open directory where images are saved
	const dir = fs.opendirSync('images')
	let dirent
	const files = [];

	// storing file name from directory in array
	while ((dirent = dir.readSync()) !== null) {
		//console.log(dirent.name)
		files.push(dirent.name);
	}
	dir.closeSync()

	files.forEach(image => {

		// creating object to add to final array
		var obj = new Object();
		obj['filePath'] = 'optimized/' + image;

		// get original size of image
		var dimensions = sizeOf('images/' + image);

		// compute procentage of how much smaller the resulted image is
		let area = dimensions.width * dimensions.height;
		obj.procent = Math.round(
			(Math.abs(area - 250000) / area) * 100);

		finalObject.optimized.push(obj);

		// resize image
		sharp('images/' + image)
			.resize({
				fit: sharp.fit.contain,
				width: 500,
				height: 500
			})
			.flatten({ background: { r: 255, g: 255, b: 255 } })
			.toBuffer()
			.then(data => {
				fs.writeFileSync('optimized/' + image, data);
			})
			.catch(err => {
				console.log(err);
			});

	})

	console.log(finalObject);
	return finalObject;
};

