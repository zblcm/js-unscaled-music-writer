let StaffHandler = {};

StaffHandler.init = function() {
	StaffHandler.construct_panel = function() {
		let panel = {};
		PanelHandler.panelize(panel);
		panel.position = new Point2(0, 0);
		
		panel.canvas = document.createElement("canvas");
		panel.canvas.wrpaer = new Canvas_wraper(EventHandler.canvas);
		
		panel.update_size = function() {
			let size = new Point2(ChordHandler.get_last_time() * MainHandler.single_bar_x, MainHandler.PITCH_NUM * MainHandler.single_pitch_y);
			
			panel.canvas.wrpaer.set_size(EventHandler.screen_size);
		}
	};
	
}