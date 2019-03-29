var TextHandler = {};

TextHandler.is_single_character = function(code) {
	return code < 128;
};
	
TextHandler.draw_in_area = function(ctx, offset, area, font, size, bold, fillcolor, strokecolor, strokewidth, content) {
	if (bold) ctx.font = "bold " + size.toString() + "px " + font;
	else ctx.font = size.toString() + "px " + font;
	if (fillcolor) ctx.fillStyle = fillcolor.to_style();
	if (strokecolor) {
		ctx.strokeStyle = strokecolor.to_style();
		ctx.lineWidth = strokewidth;
	}
	
	let sx;
	let sy;
	let cs = 0;
	let cx = 0;
	let cy = size * (-0.125);
	let ix;

	sx = size * 0.50;
	sy = size * 1.0;
	
	while (cs < content.length) {
		if (TextHandler.is_single_character(content.charCodeAt(cs))) {
			if (bold) ctx.font = "bold " + size.toString() + "px " + font;
			else ctx.font = size.toString() + "px " + font;
			ix = sx;
		}
		else {
			if (bold) ctx.font = "bold " + size.toString() + "px " + font;
			else ctx.font = size.toString() + "px " + font;
			ix = sx * 2;
		}
		if ((area) && (cx + ix > area.x)) {
			cy = cy + sy;
			cx = 0;
			if (cy + sy > area.y) {
				return false;
			}
		}
		if (strokecolor) ctx.strokeText(content.charAt(cs), offset.x + cx, offset.y + cy + sy);
		if (fillcolor) ctx.fillText(content.charAt(cs), offset.x + cx, offset.y + cy + sy);
		cx = cx + ix;
		cs = cs + 1;
	}
	
	return true;
};

TextHandler.draw_in_row = function(ctx, offset, font, size, bold, fillcolor, strokecolor, strokewidth, content) {
	if (bold) ctx.font = "bold " + size.toString() + "px " + font;
	else ctx.font = size.toString() + "px " + font;
	
	if (fillcolor) ctx.fillStyle = fillcolor.to_style();
	if (strokecolor) {
		ctx.strokeStyle = strokecolor.to_style();
		ctx.lineWidth = strokewidth;
	}
	
	let sx;
	let sy;
	let cs = 0;
	let cx = 0;
    let cy = size * (-0.125);
	let ix;

	sx = size * 0.50;
	sy = size * 1.0;
	
	while (cs < content.length) {
		if (TextHandler.is_single_character(content.charCodeAt(cs))) {
			if (bold) ctx.font = "bold " + size.toString() + "px " + font;
			else ctx.font = size.toString() + "px " + font;
			ix = sx;
		}
		else {
			if (bold) ctx.font = "bold " + size.toString() + "px " + font;
			else ctx.font = size.toString() + "px " + font;
			ix = sx * 2;
		}
		if (strokecolor) ctx.strokeText(content.charAt(cs), offset.x + cx, offset.y + cy + sy);
		if (fillcolor) ctx.fillText(content.charAt(cs), offset.x + cx, offset.y + cy + sy);
		cx = cx + ix;
		cs = cs + 1;
	}
	
	return true;
};

TextHandler.measure_size_judge = function(size, area, content) {
	let sx;
	let sy;
	let cs = 0;
	let cx = 0;
	let cy = 0;
	let ix;
	
	sx = size * 0.50;
	sy = size * 1.0;
	
	if (sy > area.y || sx > area.x) return false;
	while (cs < content.length) {
		if (TextHandler.is_single_character(content.charCodeAt(cs)))
			ix = sx;
		else
			ix = sx * 2;
		if (cx + ix > area.x) {
			cy = cy + sy;
			cx = 0;
			if (cy + sy > area.y) return false;
		}
		cx = cx + ix;
		cs = cs + 1;
	}
	return true;
};

TextHandler.measure_size = function(area, content) {
	let min_size = 1;
	let max_size = area.y * 5;
	let mid_size;
	
	while (true) {
		mid_size = Math.round((min_size + max_size) / 2);
		if ((mid_size == min_size) || (mid_size == max_size)) return min_size;
		if (TextHandler.measure_size_judge(mid_size, area, content))
			min_size = mid_size;
		else
			max_size = mid_size;
	}
};

TextHandler.meansure_width = function(size, content) {
	let cs = 0;
	let cx = 0;
	let sx;
	let sy;
	
	sx = size * 0.50;
	sy = size * 1.0;
	
	while (cs < content.length) {
		if (TextHandler.is_single_character(content.charCodeAt(cs)))
			ix = sx;
		else
			ix = sx * 2;
		cx = cx + ix;
		cs = cs + 1;
	}
	
	return new Point2(cx, sy);
};
TextHandler.measure_height = function(size, width, content) {
	let sx;
	let sy;
	let cs = 0;
	let cx = 0;
	let cy = 0;
	let ix;
	
	sx = size * 0.50;
	sy = size * 1.0;
	
	while (cs < content.length) {
		if (TextHandler.is_single_character(content.charCodeAt(cs)))
			ix = sx;
		else
			ix = sx * 2;
		if (cx + ix > width) {
			cy = cy + sy;
			cx = 0;
		}
		cx = cx + ix;
		cs = cs + 1;
	}
	return cy + sy;
};