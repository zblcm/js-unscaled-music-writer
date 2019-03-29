var PanelHandler = {};

PanelHandler.panelize = function(panel) {
	if (!panel.size) {
		panel.size = new Point2(40, 20);
	}
	if (!panel.position) {
		panel.position = new Point2(0, 0);
	}
	panel.children = [];
	panel.fillcolor = ColorHandler.COLOR_BLACK;
	panel.strokecolor = undefined;
	
	panel.has_child = function(child) { return panel.children.indexOf(child) >= 0; };
	panel.add_child = function(child) { panel.children.push(child); };
	panel.remove_child = function(child) { panel.children.splice(panel.children.indexOf(child), 1); };
	
	panel.inside = function(abs_pos) {
		let x1 = panel.position.x;
		let x2 = x1 + panel.size.x;
		let y1 = panel.position.y;
		let y2 = y1 + panel.size.y;
		return (abs_pos.x >= x1) && (abs_pos.x <= x2) && (abs_pos.y >= y1) && (abs_pos.y <= y2);
	};
	
	// add event functions
	panel.add_mouse_event = function(targetfunction) {
		let superfunction;
		if (panel.mouse_event) superfunction = panel.mouse_event;
		panel.mouse_event = function(type, key, special) {
			let result;
			if (superfunction) result = superfunction(type, key, special);
			return targetfunction(type, key, special) || result;
		}
	};
    panel.add_on_draw = function(targetfunction) {
        let superfunction;
        if (panel.on_draw) superfunction = panel.on_draw;
        panel.on_draw = function(ctxw) {
            if (superfunction) superfunction(ctxw);
            targetfunction(ctxw);
        }
    };
    panel.add_on_resize = function(targetfunction) {
        let superfunction;
        if (panel.on_resize) superfunction = panel.on_resize;
        panel.on_resize = function(ctxw) {
            targetfunction(ctxw);
            if (superfunction) superfunction(ctxw);
        }
    };
	
	// add event
	panel.add_mouse_event(function(type, key, special) {
		let result = false;
		for (let index in panel.children) {
			let child = panel.children[panel.children.length - index - 1];
			if (child.mouse_event) result = child.mouse_event(type, key, special) || result;
		}
		return result;
	});

    panel.add_on_draw(function(ctxw) {
        ctxw.draw_rect(panel.position, panel.size, panel.fillcolor, panel.strokecolor, 1);

        for (let key in panel.children) {
            let child = panel.children[key];
            if (child.on_draw) child.on_draw(ctxw);
        }
    });

    panel.add_on_resize(function() {
        for (let key in panel.children) {
            let child = panel.children[key];
            if (child.on_resize) child.on_resize();
        }
    });

	
	return panel;
};