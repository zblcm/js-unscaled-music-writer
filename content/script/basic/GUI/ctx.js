var Canvas_wraper = function(canvas) {
	this.canvas = canvas;
	this.ctx = this.canvas.getContext("2d");
	this.ctx.imageSmoothingEnabled = false;
	
	this.get_size = function() { return new Point2(this.canvas.width, this.canvas.height); };
	this.set_size = function(size) {
		this.canvas.width = size.x;
		this.canvas.height = size.y;
		this.ctx = this.canvas.getContext("2d");
	};

    this.clear = function() { this.set_size(this.get_size()); };
    this.fill = function(color) { this.draw_rect(POINT2_ZERO, this.get_size(), color); };
	this.draw_rect = function(position, size, fill_color, stroke_color, stroke_width) {
		if (fill_color) {
			this.ctx.fillStyle = fill_color.to_style();
			this.ctx.fillRect(Math.round(position.x), Math.round(position.y), Math.round(size.x), Math.round(size.y));
		}
		if (stroke_color) {
			this.ctx.lineWidth = stroke_width;
			this.ctx.strokeStyle = stroke_color.to_style();
			this.ctx.strokeRect(Math.round(position.x), Math.round(position.y), Math.round(size.x), Math.round(size.y));
		}
	};
    this.draw_circle = function(position, radius, fill_color, stroke_color, stroke_width) {
        this.draw_arc(position, radius, 0, Math.PI * 2, true, fill_color, stroke_color, stroke_width);
    };
	this.draw_arc = function(position, radius, start, end, clockwise, fill_color, stroke_color, stroke_width) {
		
		this.ctx.beginPath();
		this.ctx.arc(Math.round(position.x), Math.round(position.y), radius, start, end, clockwise);
		this.ctx.closePath();
		
		if (fill_color) {
			this.ctx.fillStyle = fill_color.to_style();
			this.ctx.fill();
		}
		if (stroke_color) {
			this.ctx.lineWidth = stroke_width;
			this.ctx.strokeStyle = stroke_color.to_style();
			this.ctx.stroke();
		}
		
	};
	this.draw_shape = function(points, close, fill_color, stroke_color, stroke_width) {
		this.ctx.beginPath();
		this.ctx.moveTo(points[0].x, points[0].y);
		for (let index = 1; index < points.length; index ++) {
			this.ctx.lineTo(points[index].x, points[index].y);
		}
		if (close) {
			this.ctx.closePath();
		}

		if (fill_color) {
			this.ctx.fillStyle = fill_color.to_style();
			this.ctx.fill();

		}
		if (stroke_color) {
			this.ctx.lineWidth = stroke_width;
			this.ctx.strokeStyle = stroke_color.to_style();
			this.ctx.stroke();
		}
	};
    this.draw_line = function(sp, ep, color, width) {
        this.ctx.beginPath();
        this.ctx.moveTo(sp.x, sp.y);
        this.ctx.lineTo(ep.x, ep.y);
        if (color) {
            this.ctx.lineWidth = width;
            this.ctx.strokeStyle = color.to_style();
            this.ctx.stroke();
		}
    };
    this.draw_image = function(image, position, size, image_position, image_size) {
        if (position && size && image_position && image_size) {
            this.ctx.drawImage(image, Math.round(image_position.x), Math.round(image_position.y), Math.round(image_size.x), Math.round(image_size.y), Math.round(position.x), Math.round(position.y), Math.round(size.x), Math.round(size.y));
            return;
        }
        if (position && size) {
            this.ctx.drawImage(image, Math.round(position.x), Math.round(position.y), Math.round(size.x), Math.round(size.y));
            return;
        }
        if (position) {
            this.ctx.drawImage(image, Math.round(position.x), Math.round(position.y));
            return;
        }
        this.ctx.drawImage(image, 0, 0);
    };
	this.fill = function(color) {
		this.ctx.fillStyle = color.to_style();
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	};
	this.set_pixel = function(position, color) {
		position = position.floor();
		let image_data = this.ctx.createImageData(1, 1);
		image_data.data[0] = color.r;
		image_data.data[1] = color.g;
		image_data.data[2] = color.b;
		image_data.data[3] = ColorHandler.percent_to_base8(color.a);
		// image_data.data = [color.r, color.g, color.b, ColorHandler.percent_to_base8(color.a)];
		this.ctx.putImageData(image_data, position.x, position.y);
	};
	this.get_pixel = function(position) {
		position = position.floor();
		let image_data = this.ctx.getImageData(position.x, position.y, 1, 1);
		return new Color(image_data.data[0], image_data.data[1], image_data.data[2], ColorHandler.base8_to_percent(image_data.data[3]));
	};
	this.draw_line_pixelwise = function(sp, ep, color, width) {
		sp = sp.floor();
		ep = ep.floor();
		let line = Line2_pp(sp, ep);
		let vertical;
		
		if (line.B == 0) {
			vertical = true;
		}
		else {
			vertical = (Math.abs(line.A / line.B) > 1);
		}
		
		let x;
		let y;
		let sc;
		let ec;
		let condition;
		let change;
		
		if (vertical) {
			if (sp.y < ep.y) {
				condition = function() {return y <= ep.y};
				change = function() {y++};
			}
			else {
				condition = function() {return y >= ep.y};
				change = function() {y--};
			}
			for (y = sp.y; condition(); change()) {
				x = line.get_x(y);
				sc = Math.ceil(x - (width / 2));
				ec = Math.floor(x + (width / 2));
				for (x = sc; x <= ec; x ++) {
					this.set_pixel(new Point2(x, y), color);
				}
			}
		}
		else {
			if (sp.x < ep.x) {
				condition = function() {return x <= ep.x};
				change = function() {x++};
			}
			else {
				condition = function() {return x >= ep.x};
				change = function() {x--};
			}
			for (x = sp.x; condition(); change()) {
				y = line.get_y(x);
				sc = Math.ceil(y - (width / 2));
				ec = Math.floor(y + (width / 2));
				for (y = sc; y <= ec; y ++) {
					// console.log(x + ", " + y);
					this.set_pixel(new Point2(x, y), color);
				}
			}
		}
	};
	this.pour = function(position, color) {
		position = position.floor();
		let self_color = this.get_pixel(position);
		if (self_color.equals(color)) {
			return;
		}
		this.set_pixel(position, color);
		// console.log("poured " + position.str() + ": " + self_color.str() + "->" + color.str());
		
		if ((position.x > 0) && (this.get_pixel(position.add(new Point2(-1, 0))).equals(self_color))) {
			this.pour(position.add(new Point2(-1, 0)), color);
		}
		if ((position.x < this.get_size().x - 1) && (this.get_pixel(position.add(new Point2(1, 0))).equals(self_color))) {
			this.pour(position.add(new Point2(1, 0)), color);
		}
		if ((position.y > 0) && (this.get_pixel(position.add(new Point2(0, -1))).equals(self_color))) {
			this.pour(position.add(new Point2(0, -1)), color);
		}
		if ((position.y < this.get_size().y - 1) && (this.get_pixel(position.add(new Point2(0, 1))).equals(self_color))) {
			this.pour(position.add(new Point2(0, 1)), color);
		}
	};
	
	this.clone_size = function() {
		let new_canvas = document.createElement("canvas");
		new_canvas.wraper = new Canvas_wraper(new_canvas);
		new_canvas.wraper.set_size(this.get_size());
		return new_canvas.wraper;
	};
	this.clone = function() {
		let new_wraper = this.clone_size();
		new_wraper.draw_image(this.canvas, new Point2(0, 0));
		return new_wraper;
	}
};