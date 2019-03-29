var EventHandler = {};

EventHandler.MOUSE_DOWN = 0;
EventHandler.MOUSE_MOVE = 1;
EventHandler.MOUSE_UP = 2;

EventHandler.MOUSE_LEFT_BUTTON = 0;
EventHandler.MOUSE_MIDDLE_BUTTON = 1;
EventHandler.MOUSE_RIGHT_BUTTON = 2;

EventHandler.currentlyPressedMouseKeys = {};
EventHandler.screen_size = new Point2(1920, 1080);

EventHandler.init = function() {
	EventHandler.canvas = document.createElement("canvas");
	EventHandler.canvas.wrpaer = new Canvas_wraper(EventHandler.canvas);
	EventHandler.canvas.wrpaer.set_size(EventHandler.screen_size);
	// EventHandler.panels = [Adventure.panel];
	EventHandler.panels = [];
	EventHandler.mouse_position = POINT2_ZERO;
};

EventHandler.get_mouse_position = function(event) {
	/*
	let fake_size = EventHandler.canvas.wrpaer.get_size();
	let real_pos = new Point2(event.clientX - DoubleBuff.ctx.canvas.offsetLeft, event.clientY - DoubleBuff.ctx.canvas.offsetTop);
	let real_size = General.fit_size(fake_size, DoubleBuff.size);
	
	let scale_x = fake_size.x / real_size.x;
	let scale_y = fake_size.x / real_size.y;
	let scale = scale_x;
	if (scale_y < scale_x) scale = scale_y;
	
	let fake_pos = real_pos.sub(DoubleBuff.size.div(2)).mul(fake_size.x / real_size.x).add(fake_size.div(2));
	
	return fake_pos;
	*/
	return new Point2(event.clientX - DoubleBuff.ctx.canvas.offsetLeft, event.clientY - DoubleBuff.ctx.canvas.offsetTop);
};

EventHandler.handleMouseDown = function(event) {
	/*
		DoubleBuff.locked = true;
		DoubleBuff.canvas_show.requestPointerLock();
		DoubleBuff.canvas_hide.requestPointerLock();
	*/

    EventHandler.currentlyPressedMouseKeys[event.button] = true;
    EventHandler.mouse_position = EventHandler.get_mouse_position(event);
    if (EventHandler.panels.length > 0)
        EventHandler.panels[EventHandler.panels.length - 1].mouse_event(EventHandler.MOUSE_DOWN, event.button, 0);
};

EventHandler.handleMouseUp = function(event) {
    EventHandler.currentlyPressedMouseKeys[event.button] = false;
    EventHandler.mouse_position = EventHandler.get_mouse_position(event);
    if (EventHandler.panels.length > 0)
        EventHandler.panels[EventHandler.panels.length - 1].mouse_event(EventHandler.MOUSE_UP, event.button, 0);
};

EventHandler.handleMouseMove = function(event) {
    EventHandler.mouse_position = EventHandler.get_mouse_position(event);
    if (EventHandler.panels.length > 0)
        EventHandler.panels[EventHandler.panels.length - 1].mouse_event(EventHandler.MOUSE_MOVE, event.button, 0);
};

EventHandler.handleMouseWheel = function(event) {
    EventHandler.mouse_position = EventHandler.get_mouse_position(event);
    if (EventHandler.panels.length > 0)
        EventHandler.panels[EventHandler.panels.length - 1].mouse_event(EventHandler.MOUSE_MOVE, EventHandler.MOUSE_MIDDLE_BUTTON, event.deltaY);
};

// Other stuff.
EventHandler.on_draw = function(ctxw) {
	/*
	EventHandler.canvas.wrpaer.clear();
	let i;
	for (i in EventHandler.panels)
		EventHandler.panels[i].on_draw(EventHandler.canvas.wrpaer);
		
	let fake_size = EventHandler.canvas.wrpaer.get_size();
	let real_size = General.fit_size(fake_size, DoubleBuff.size);
	let offset = DoubleBuff.size.sub(real_size).div(2);
	DoubleBuff.ctx.setTransform(real_size.x / fake_size.x, 0, 0, real_size.y / fake_size.y, offset.x, offset.y);
	DoubleBuff.ctxw.draw_image(EventHandler.canvas);
	*/

    for (let i in EventHandler.panels) EventHandler.panels[i].on_draw(ctxw);
};