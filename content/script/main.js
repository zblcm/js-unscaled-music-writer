let MainHandler = {};

MainHandler.SIZE_LEFT_X = 40;
MainHandler.SIZE_TOP_BAR_Y = 40;
MainHandler.SIZE_CHORD_BAR_Y = 40;
MainHandler.PITCH_NUM = 108;

MainHandler.single_pitch_y = 40;
MainHandler.single_bar_x = 40;

MainHandler.init = function() {
	MainHandler.construct_panel = function() {
		let panel = {};
		panel.position = new Point2(0, 0);
		PanelHandler.panelize(panel);
		panel.on_resize = function(size) {
			MainHandler.size = size;
			panel.size = size;
			
		}
	};
};