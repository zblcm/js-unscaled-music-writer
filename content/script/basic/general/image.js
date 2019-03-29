var ImageHandler = {};

ImageHandler.image_cache = {};
ImageHandler.load = function(filename, onerror) {
	return new Promise(function(resolve, reject) {
		let image = ImageHandler.image_cache[filename];
		if (image) {
			if (image.complete)
				resolve(image);
			else {
				let old_onload = image.onload;
				if (old_onload)
					image.onload = function() {
						old_onload();
						resolve(image);
					};
				else 
					image.onload = function() {
						resolve(image);
					};
			}
		}
		else {
			image = new Image();
			image.onload = function() {
				resolve(image);
			};
			if (onerror) image.onerror = function() {
				onerror();
				resolve(false);
			};
			image.src = filename;
			ImageHandler.image_cache[filename] = image;
		}
	});
};
ImageHandler.get = function(filename) {
	return ImageHandler.image_cache[filename];
};

ImageHandler.create_canvas = function(size) {
    let temp_canvas = document.createElement("canvas");
    temp_canvas.width = size.x;
    temp_canvas.height = size.y;

    return temp_canvas;
};

// Draw an image on a new canvas.
ImageHandler.image_to_canvas = function(image) {
	image.crossOrigin = "Anonymous";
	let width = image.width;
	let height = image.height;
	
	let temp_canvas = document.createElement("canvas");
	temp_canvas.width = width;
	temp_canvas.height = height;
	
	let ctx = temp_canvas.getContext("2d");
	ctx.drawImage(image, 0, 0);
	
	return temp_canvas;
};

// Convert canvas to an image.
ImageHandler.canvas_to_image = function(canvas) {
	let ctx = canvas.getContext("2d");
	let image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
	
	let new_image = new Image();
	new_image.src = canvas.toDataURL();
	return new_image;
};

// Change inplace.
ImageHandler.change_canvas = function(canvas, fn) {
	let ctx = canvas.getContext("2d");
	let image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
	let data = image_data.data;
	
	let color_old;
	let color_new;
	let p = 0;
	let n = data.length;
	while (p < n) {
        let r = ColorHandler.base8_to_percent(data[p + 0]);
        let g = ColorHandler.base8_to_percent(data[p + 1]);
        let b = ColorHandler.base8_to_percent(data[p + 2]);
        let a = ColorHandler.base8_to_percent(data[p + 3]);
		color_old = new Color(r, g, b, a);
		color_new = fn(color_old);
		data[p + 0] = ColorHandler.percent_to_base8(color_new.r);
		data[p + 1] = ColorHandler.percent_to_base8(color_new.g);
		data[p + 2] = ColorHandler.percent_to_base8(color_new.b);
		data[p + 3] = ColorHandler.percent_to_base8(color_new.a);
		p = p + 4;
	}
	ctx.putImageData(image_data, 0, 0);
};

// Return a new image.
ImageHandler.change_image = function(image, fn) {
	let temp_canvas = ImageHandler.image_to_canvas(image);
	ImageHandler.change_canvas(temp_canvas, fn);
	return ImageHandler.canvas_to_image(temp_canvas);
};


ImageHandler.get_image_data_url = function(image) {
	return ImageHandler.image_to_canvas(image).toDataURL();
};

ImageHandler.create_color_multiply_function = function(color) {
	return function(color_old) {
		return color_old.mul(color);
	}
};