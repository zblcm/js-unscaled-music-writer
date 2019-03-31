var ButtonHandler = {};
ButtonHandler.BUTTON_STATIC = "S";
ButtonHandler.BUTTON_HOVER = "H";
ButtonHandler.BUTTON_PRESS = "P";
ButtonHandler.BUTTON_ACTIVE = "A";

ButtonHandler.buttonlize = function(button) {
	button.inside = function(abs_pos) {
		let x1 = button.position.x;
		let x2 = x1 + button.size.x;
		let y1 = button.position.y;
		let y2 = y1 + button.size.y;
		return (abs_pos.x >= x1) && (abs_pos.x <= x2) && (abs_pos.y >= y1) && (abs_pos.y <= y2);
	};

    button.fillcolors = {};
    button.strokecolors = {};
	
	button.on_click = function() {
		// console.log("clicked!");
	};
	button.on_hover = function() {
		// console.log("clicked!");
	};
	button.on_hover_end = function() {
		// console.log("clicked!");
	};
	button.draging = false;
    button.on_drag = function() {
        // console.log("draged!");
    };
    button.on_drag_start = function() {
        // console.log("draged!");
    };
	button.on_drag_end = function() {
		// console.log("drag end!");
	};
	
	button.change_state = function(state) {
		if (button.state == ButtonHandler.BUTTON_STATIC && state != ButtonHandler.BUTTON_STATIC) button.on_hover();
		if (button.state != ButtonHandler.BUTTON_STATIC && state == ButtonHandler.BUTTON_STATIC) button.on_hover_end();
        if (button.fillcolors[state]) button.fillcolor = button.fillcolors[state];
        if (button.strokecolors[state]) button.strokecolor = button.strokecolors[state];
		button.state = state;
	};
	
	button.drag_offset = null;
	button.mouse_event = function(type, key, special) {
		if (button.state == ButtonHandler.BUTTON_ACTIVE) return;
		let inside = button.inside(EventHandler.mouse_position);
		if (key == EventHandler.MOUSE_BUTTON_LEFT) {
			if (type == EventHandler.EVENT_MOUSE_DOWN) {
				if (inside)
					button.change_state(ButtonHandler.BUTTON_PRESS);
			}
			if (type == EventHandler.EVENT_MOUSE_UP) {
				if (button.state == ButtonHandler.BUTTON_PRESS) {
					if (inside)
						button.on_click();
					if (button.draging) {
                        button.draging = false;
						button.on_drag_end();
                        button.drag_offset = null;
					}
				}
                if (button.state != ButtonHandler.BUTTON_ACTIVE)
                	button.change_state(ButtonHandler.BUTTON_STATIC);
			}
		}
        if (type == EventHandler.EVENT_MOUSE_MOVE) {
            if (button.state == ButtonHandler.BUTTON_PRESS) {
            	if (!button.draging) {
                    button.drag_offset = EventHandler.mouse_position.sub(button.position);
                    button.draging = true;
                    button.on_drag_start();
                }
                if (button.draging) button.on_drag();
            }
        }
		
		// change state
		if ((inside) && (button.state == ButtonHandler.BUTTON_STATIC)) button.change_state(ButtonHandler.BUTTON_HOVER);
		if ((!inside) && (button.state == ButtonHandler.BUTTON_HOVER)) button.change_state(ButtonHandler.BUTTON_STATIC);
		/*
		if ((inside) || (button.state == ButtonHandler.BUTTON_PRESS)) {
			EventHandler.event_handled = true;
		}
		return (inside) || (button.state == ButtonHandler.BUTTON_PRESS);
		*/
	};
	
	button.change_state(ButtonHandler.BUTTON_STATIC);
};

ButtonHandler.new_drager = function() {
	let drager = {};
	PanelHandler.panelize(drager);
	ButtonHandler.buttonlize(drager);

	drager.set_line = function(p1, p2) {
        drager.st_position = p1.clone();
        drager.ed_position = p2.clone();
        drager.line = Line2_pp(drager.st_position, drager.ed_position);
        // drager.set_position(0);
	};
	
	drager.percent_to_position = function(percent) {
		return drager.ed_position.linear_plugin(drager.st_position, percent);
	};
	drager.position_to_percent = function(point) {
		let l1 = point.sub(drager.st_position).length();
		let l2 = drager.line.dis_p(point);
		let l3 = Math.pow((l1 * l1) - (l2 * l2), 0.5);
        if (((l1 * l1) - (l2 * l2) < 0.00001) && (isNaN(l3))) l3 = 0;
		let answer = l3 / drager.st_position.sub(drager.ed_position).length();
		let l4 = point.sub(drager.ed_position).length();
		let l5 = drager.st_position.sub(drager.ed_position).length();
        // console.log(l1, l2, l3, answer);
        // console.log(l1, l2, (l1 * l1) - (l2 * l2), Math.pow((l1 * l1) - (l2 * l2), 0.5));
		if (((l1 * l1) + (l5 * l5) - (l4 * l4)) < 0) return answer * (-1);
		else return answer;
	};
    drager.set_percent = function(percent) { drager.position = drager.percent_to_position(percent) };
    drager.get_percent = function() { return drager.position_to_percent(drager.position); };

	drager.drag_callback = undefined;
	drager.on_drag = function() {
		let percent = drager.position_to_percent(EventHandler.mouse_position.sub(drager.drag_offset));
		if (percent < 0) percent = 0;
		if (percent > 1) percent = 1;
		// console.log(percent);
        drager.set_percent(percent);
		if (drager.drag_callback) drager.drag_callback();
	};
	
	return drager;
};

ButtonHandler.create_add_draw = function(panel) {
	panel.add_on_draw(
		function (ctxw) {
			let points = [];
			points.push(panel.position.add(new Point2(6, 12)));
			points.push(panel.position.add(new Point2(12, 12)));
			points.push(panel.position.add(new Point2(12, 6)));
			points.push(panel.position.add(new Point2(18, 6)));
			points.push(panel.position.add(new Point2(18, 12)));
			points.push(panel.position.add(new Point2(24, 12)));
			points.push(panel.position.add(new Point2(24, 18)));
			points.push(panel.position.add(new Point2(18, 18)));
			points.push(panel.position.add(new Point2(18, 24)));
			points.push(panel.position.add(new Point2(12, 24)));
			points.push(panel.position.add(new Point2(12, 18)));
			points.push(panel.position.add(new Point2(6, 18)));
			ctxw.draw_shape(points, true, panel.strokecolor, undefined, 0);
		}
	);
};