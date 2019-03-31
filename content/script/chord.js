let ChordHandler = {};
ChordHandler.chords = [];
ChordHandler.MAX_CHORD_NUM = 28;
ChordHandler.editing_chord = undefined;

// chord type.
ChordHandler.TYPE_UNKNOW = -1;
ChordHandler.TYPE_EMPTY = -2;

ChordHandler.TYPE_MAJOR = 0;
ChordHandler.TYPE_MINOR = 1;
ChordHandler.TYPE_ARGUMENTED = 2;
ChordHandler.TYPE_DIMISHED = 3;
ChordHandler.TYPE_SUS_4 = 4;

ChordHandler.TYPE_MAJOR_7 = 10;
ChordHandler.TYPE_DOMINATE_7 = 11;
ChordHandler.TYPE_MINOR_7 = 12;
ChordHandler.TYPE_HALF_DIMISHED_7 = 13;
ChordHandler.TYPE_FULL_DIMISHED_7 = 14;

ChordHandler.WORKING_TYPES = [
	ChordHandler.TYPE_MAJOR,
	ChordHandler.TYPE_MINOR,
	ChordHandler.TYPE_ARGUMENTED,
	ChordHandler.TYPE_DIMISHED,
	ChordHandler.TYPE_SUS_4,
	ChordHandler.TYPE_MAJOR_7,
	ChordHandler.TYPE_DOMINATE_7,
	ChordHandler.TYPE_MINOR_7,
	ChordHandler.TYPE_HALF_DIMISHED_7,
	ChordHandler.TYPE_FULL_DIMISHED_7
];

// chord text.
ChordHandler.TEXT = {};
ChordHandler.TEXT[ChordHandler.TYPE_UNKNOW] = "?";
ChordHandler.TEXT[ChordHandler.TYPE_EMPTY] = " ";

ChordHandler.TEXT[ChordHandler.TYPE_MAJOR] = "M";
ChordHandler.TEXT[ChordHandler.TYPE_MINOR] = "m";
ChordHandler.TEXT[ChordHandler.TYPE_ARGUMENTED] = "+";
ChordHandler.TEXT[ChordHandler.TYPE_DIMISHED] = "\u25CB";
ChordHandler.TEXT[ChordHandler.TYPE_SUS_4] = "s4";

ChordHandler.TEXT[ChordHandler.TYPE_MAJOR_7] = "M7";
ChordHandler.TEXT[ChordHandler.TYPE_DOMINATE_7] = "7";
ChordHandler.TEXT[ChordHandler.TYPE_MINOR_7] = "m7";
ChordHandler.TEXT[ChordHandler.TYPE_HALF_DIMISHED_7] = "\u00D8";
ChordHandler.TEXT[ChordHandler.TYPE_FULL_DIMISHED_7] = "\u25CB7";

// chord pitch table.
ChordHandler.TABLE = {};
ChordHandler.TABLE[ChordHandler.TYPE_MAJOR] = [true, false, false, false, true, false, false, true, false, false, false, false];
ChordHandler.TABLE[ChordHandler.TYPE_MINOR] = [true, false, false, true, false, false, false, true, false, false, false, false];
ChordHandler.TABLE[ChordHandler.TYPE_ARGUMENTED] = [true, false, false, false, true, false, false, false, true, false, false, false];
ChordHandler.TABLE[ChordHandler.TYPE_DIMISHED] = [true, false, false, true, false, false, true, false, false, false, false, false];
ChordHandler.TABLE[ChordHandler.TYPE_SUS_4] = [true, false, false, false, false, true, false, true, false, false, false, false];

ChordHandler.TABLE[ChordHandler.TYPE_MAJOR_7] = [true, false, false, false, true, false, false, true, false, false, false, true];
ChordHandler.TABLE[ChordHandler.TYPE_DOMINATE_7] = [true, false, false, false, true, false, false, true, false, false, true, false];
ChordHandler.TABLE[ChordHandler.TYPE_MINOR_7] = [true, false, false, true, false, false, false, true, false, false, true, false];
ChordHandler.TABLE[ChordHandler.TYPE_HALF_DIMISHED_7] = [true, false, false, true, false, false, true, false, false, false, true, false];
ChordHandler.TABLE[ChordHandler.TYPE_FULL_DIMISHED_7] = [true, false, false, true, false, false, true, false, false, true, false, false];

ChordHandler.Chord = function(start, length) {
	let chord = {};
	PanelHandler.panelize(chord);
	chord.in_chord_pitches = [false, false, false, false, false, false, false, false, false, false, false, false];
	chord.text = " ";
	chord.base = -1;
	chord.type = " ";
	chord.selected = false;
	
	chord.construct_panel = function() {
		let panel = {};
		
		panel.update_size = function() {
			panel.size = new Point2(chord.length.to_float() * MainHandler.single_bar_x, MainHandler.SIZE_CHORD_BAR_Y);
		}
		panel.update_position = function() {
			panel.position = new Point2(MainHandler.SIZE_LEFT_X, MainHandler.size,y - MainHandler.SIZE_CHORD_BAR_Y);
		}
		panel.add_on_draw(function(ctx) {
			if (ChordHandler.editing_chord == chord) {
				ctx.fillStyle = new Color(255, 0, 0, 0.25).to_style();
				ctx.fillRect(panel.position.x ,panel.position.y, panel.size.x, panel.size.y);
			}
			let x_offset = 14 - (chord.text.length * 3);
			
			ctx.font = 10 + "px consola";
			ctx.fillStyle = new Color(0, 0, 0, 1).to_style();
			ctx.fillText(chord.text.toString(), panel.position.x + x_offset, panel.position.y + 20);
		});
		panel.update_color = function() {
			if (chord.selected) {
				chord.fillcolor = ColorHandler.COLOR_SELECTED_PANEL;
				chord.strokecolor = ColorHandler.COLOR_SELECTED_FRAME;
			}
			else {
				chord.fillcolor = ColorHandler.COLOR_PANEL;
				chord.strokecolor = ColorHandler.COLOR_FRAME;
			}
		}
		panel.add_mouse_event(function(type, key, special) {
			if ((type == EventHandler.EVENT_MOUSE_DOWN) && (panel.inside(EventHandler.mouse_position))) {
				if (key == EventHandler.MOUSE_BUTTON_LEFT) {
					if (ChordHandler.get_selected_chords().indexOf(chord) < 0) {
						ChordHandler.clear_selected_chords();
						
					}
					panel.update_color();
				}
				if (key == EventHandler.MOUSE_BUTTON_RIGHT) {
					EventHandler.pop_panel = ChordHandler.chord_editor_panel;
					ChordHandler.editing_chord = chord;
				}
			}
			
		});
		
		return panel;
	}
	
	chord.calculate_base_and_type = function() {
		let check = function(table, shift) {
			let index = 0;
			while (index < 12) {
				if (table[General.fit_range(index - shift, 12)] != chord.in_chord_pitches[index]) {
					return false;
				}
				index = index + 1;
			}
			return true;
		}
		let find = function(table) {
			let index = 0;
			while (index < 12) {
				if (check(table, index)) {
					return index;
				}
				index = index + 1;
			}
			return -1;
		}
		
		// Base is absolute base.
		let index;
		let type;
		for (index in ChordHandler.WORKING_TYPES) {
			chord.type = ChordHandler.WORKING_TYPES[index];
			chord.base = find(ChordHandler.TABLE[chord.type]);
			if (chord.base >= 0) {
				return;
			}
		}
		
		index = 0;
		while (index < 12) {
			if (chord.in_chord_pitches[index]) {
				chord.type = ChordHandler.TYPE_UNKNOW;
				return;
			}
			index = index + 1;
		}
		
		chord.type = ChordHandler.TYPE_EMPTY;
		return;
	}
	
	chord.calculate_chord_text = function() {
		let num;
		
		if (chord.type < 0)
			return ChordHandler.TEXT[chord.type];
		
		num = StaffHandler.get_scale_index(chord.base);
		if (num > 0)
			return num.toString() + ChordHandler.TEXT[chord.type];

		num = StaffHandler.get_scale_index(General.fit_range(chord.base - 1, 12));
		if (num > 0)
			return num.toString() + "#" + ChordHandler.TEXT[chord.type];

		return "E"; // Error
	}
	
	chord.update_color();
	
	return chord;
}

ChordHandler.clear_all = function() {
	let index = 0;
	while (index < ChordHandler.chords.length) {
		let chord = ChordHandler.chords[index];
		chord.clear();
		index = index + 1;
	}
}

ChordHandler.init = function() {
	ChordHandler.panel = PanelHandler.panelize({});
	ChordHandler.panel.position = new Point2(0, DoubleBuff.max_y - StaffHandler.CHORD_HRIGHT);
	ChordHandler.size = new Point2(DoubleBuff.max_x, StaffHandler.CHORD_HRIGHT);
	
	let index = 0;
	let chord;
	while (index < 28) {
		chord = ChordHandler.Chord(index);
		ChordHandler.chords.push(chord);
		ChordHandler.panel.add_child(chord);
		chord.construct_notes();
		chord.update_position();
		index = index + 1;
	}
	
	PanelHandler.ancient.add_child(ChordHandler.panel);
}

ChordHandler.construct_chord_editor = function() {
	let panel = {};
	panel.center = new Point2(DoubleBuff.max_x / 2, DoubleBuff.max_y / 2);
	panel.radius = 200;
	panel.inside = function(point) {
		return point.sub(panel.center).length() < panel.radius;
	}
	
	panel.on_draw = function(ctx) {
		
		let index;
		let start_radius;
		let unit_radius;
		let center_radius;
		let num;
		let edge_position;
		let text_center;
		
		// Draw Basic Circle.
		ctx.beginPath();
		ctx.arc(panel.center.x, panel.center.y , panel.radius, 0, 2 * Math.PI);
		ctx.fillStyle = new Color(255, 255, 223, 1).to_style();
		ctx.fill();
		
		// Draw red part and text.
		start_radius = -(2 * Math.PI / 4);
		unit_radius = 2 * Math.PI / 12;
		index = 0;
		while (index < 12) {
			num = StaffHandler.get_scale_index(index);
			center_radius = start_radius + (unit_radius * index);
			if (num > 0) {
				ctx.beginPath();
				ctx.arc(panel.center.x, panel.center.y , panel.radius, center_radius - (unit_radius / 2), center_radius + (unit_radius / 2));
				ctx.lineTo(panel.center.x, panel.center.y);
				ctx.closePath();
				ctx.fillStyle = new Color(255, 0, 0, 0.25).to_style();
				ctx.fill();
				text_center = panel.center.add(new Point2(130 * Math.cos(center_radius), 130 * Math.sin(center_radius)));
				
				ctx.font = 30 + "px consola";
				ctx.fillStyle = new Color(0, 0, 0, 1).to_style();
				ctx.fillText(num.toString(), text_center.x - 10, text_center.y + 10);
			}
			index = index + 1;
		}
		
		// Draw out circle.
		start_radius = -(2 * Math.PI / 4);
		unit_radius = 2 * Math.PI / 12;
		index = 0;
		while (index < 12) {
			center_radius = start_radius + (unit_radius * index);
			if (ChordHandler.editing_chord.in_chord_pitches[index]) {
				ctx.beginPath();
				ctx.arc(panel.center.x, panel.center.y , panel.radius, center_radius - (unit_radius / 2), center_radius + (unit_radius / 2), false);
				ctx.arc(panel.center.x, panel.center.y , 170, center_radius + (unit_radius / 2), center_radius - (unit_radius / 2), true);
				ctx.closePath();
				ctx.fillStyle = new Color(0, 255, 255, 0.5).to_style();
				ctx.fill();
			}
			index = index + 1;
		}
		
		// Draw Basic Circle line.
		ctx.beginPath();
		ctx.arc(panel.center.x, panel.center.y , panel.radius, 0, 2 * Math.PI);
		ctx.lineWidth = 1;
		ctx.strokeStyle = new Color(0, 0, 0, 1).to_style();
		ctx.stroke();
		
		// Draw Lines.
		start_radius = -(2 * Math.PI / 4);
		unit_radius = 2 * Math.PI / 12;
		index = 0;
		while (index < 12) {
			num = StaffHandler.inscale_numbers.indexOf(index);
			center_radius = start_radius + (unit_radius * index);
			ctx.beginPath();
			ctx.moveTo(panel.center.x, panel.center.y);
			edge_position = panel.center.add(new Point2(panel.radius * Math.cos(center_radius  - (unit_radius / 2)), panel.radius * Math.sin(center_radius - (unit_radius / 2))));
			ctx.lineTo(edge_position.x, edge_position.y);
			ctx.lineWidth = 1;
			ctx.strokeStyle = new Color(0, 0, 0, 1).to_style();
			ctx.stroke();
			
			index = index + 1;
		}
	}
	
	panel.mouse_event = function(type, key, special) {
		let index;
		if (type == EventHandler.EVENT_MOUSE_DOWN) {
			if (panel.inside(EventHandler.mouse_position)) {
				if (key == EventHandler.MOUSE_BUTTON_LEFT) {
					index = panel.get_positional_index(EventHandler.mouse_position);
					ChordHandler.editing_chord.in_chord_pitches[index] = !ChordHandler.editing_chord.in_chord_pitches[index];
					ChordHandler.editing_chord.calculate_base_and_type();
					ChordHandler.editing_chord.text = ChordHandler.editing_chord.calculate_chord_text();
				}
			}
			else {
				if (EventHandler.pop_panel == panel) {
					EventHandler.pop_panel = undefined;
				}
				ChordHandler.editing_chord = undefined;
			}
		}
		
	}
	panel.get_positional_index = function(position) {
		let rel_pos = position.sub(panel.center);
		let radius = rel_pos.radius();
		
		let start_radius = -(2 * Math.PI / 4);
		let unit_radius = 2 * Math.PI / 12;
		let ans_radius = rel_pos.radius() - start_radius + (unit_radius / 2);
		if (ans_radius < 0) {
			ans_radius = ans_radius + (2 * Math.PI);
		}
		return Math.floor(ans_radius / (2 * Math.PI) * 12);
	}
	
	ChordHandler.chord_editor_panel = panel;
}