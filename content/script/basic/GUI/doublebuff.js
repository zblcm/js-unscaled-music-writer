var DoubleBuff = {};

DoubleBuff.init = function(canvas_0, canvas_1) {
	DoubleBuff.canvas_show = canvas_0;
	DoubleBuff.canvas_hide = canvas_1;
	DoubleBuff.canvas_show.style.visibility = "visible";
	DoubleBuff.canvas_hide.style.visibility = "hidden";
	
	if (!DoubleBuff.canvas_hide.wraper) 
		DoubleBuff.canvas_hide.wraper = new Canvas_wraper(DoubleBuff.canvas_hide);
	if (!DoubleBuff.canvas_show.wraper) 
		DoubleBuff.canvas_show.wraper = new Canvas_wraper(DoubleBuff.canvas_show);
	
	DoubleBuff.ctx = DoubleBuff.canvas_hide.wraper.ctx;
	DoubleBuff.ctxw = DoubleBuff.canvas_hide.wraper;
	
	DoubleBuff.locked = false;
	DoubleBuff.position = new Point2(0, 0);
	DoubleBuff.update_size();
};

DoubleBuff.flip = function() {
	let temp = DoubleBuff.canvas_show;
	DoubleBuff.canvas_show = DoubleBuff.canvas_hide;
	DoubleBuff.canvas_hide = temp;
	DoubleBuff.canvas_show.style.visibility = "visible";
	DoubleBuff.canvas_hide.style.visibility = "hidden";
	
	if (!DoubleBuff.canvas_hide.wraper) 
		DoubleBuff.canvas_hide.wraper = new Canvas_wraper(DoubleBuff.canvas_hide);
	if (!DoubleBuff.canvas_show.wraper) 
		DoubleBuff.canvas_show.wraper = new Canvas_wraper(DoubleBuff.canvas_show);
	
	DoubleBuff.ctx = DoubleBuff.canvas_hide.wraper.ctx;
	DoubleBuff.ctxw = DoubleBuff.canvas_hide.wraper;
	
	DoubleBuff.ctxw.draw_rect(DoubleBuff.position, DoubleBuff.size, ColorHandler.COLOR_DARK, undefined, 0);
};

DoubleBuff.update_size = function() { DoubleBuff.size = new Point2(DoubleBuff.canvas_show.width, DoubleBuff.canvas_show.height); };

DoubleBuff.inside = function(point) { return (point.x >= 0) && (point.x < DoubleBuff.size.x) && (point.y > 0) && (point.y < DoubleBuff.size.y); };

DoubleBuff.resize_to_client = function() {
	let screen_size = new Point2(document.body.clientWidth, document.body.clientHeight);
	DoubleBuff.canvas_hide.wraper.set_size(screen_size);
	DoubleBuff.canvas_show.wraper.set_size(screen_size);
	DoubleBuff.update_size();
	if (DoubleBuff.on_resize)
		DoubleBuff.on_resize();
};