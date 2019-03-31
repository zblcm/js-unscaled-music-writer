var EventHandler = {};

EventHandler.EVENT_MOUSE_DOWN = 0;
EventHandler.EVENT_MOUSE_MOVE = 1;
EventHandler.EVENT_MOUSE_UP = 2;
EventHandler.EVENT_KEY_DOWN = 3;
EventHandler.EVENT_KEY_UP = 4;

EventHandler.MOUSE_BUTTON_LEFT = 0;
EventHandler.MOUSE_BUTTON_MIDDLE = 1;
EventHandler.MOUSE_BUTTON_RIGHT = 2;

EventHandler.KEY_SPACE = 32;
EventHandler.KEY_DELETE = 46;

EventHandler.currentlyPressedMouseKeys = {};
EventHandler.screen_size = new Point2(1920, 1080);

EventHandler.init = function() {
	EventHandler.canvas = document.createElement("canvas");
	EventHandler.canvas.wrpaer = new Canvas_wraper(EventHandler.canvas);
	EventHandler.canvas.wrpaer.set_size(EventHandler.screen_size);
	// EventHandler.panels = [Adventure.panel];
	EventHandler.panels = [];
	EventHandler.mouse_position = POINT2_ZERO;
    EventHandler.pressed_keys = {};
};

EventHandler.handleKeyDown = function(event) {
    EventHandler.pressed_keys[event.keyCode] = true;
    let special = {
    	alt:	event.altKey,
		ctrl:	event.ctrlKey
	};
    if (EventHandler.panels.length > 0)
        EventHandler.panels[EventHandler.panels.length - 1].mouse_event(EventHandler.EVENT_KEY_DOWN, event.keyCode, special);
};
EventHandler.handleKeyUp = function(event) {
    EventHandler.pressed_keys[event.keyCode] = false;
    let special = {
        alt:	event.altKey,
        ctrl:	event.ctrlKey
    };
    if (EventHandler.panels.length > 0)
        EventHandler.panels[EventHandler.panels.length - 1].mouse_event(EventHandler.EVENT_KEY_UP, event.keyCode, special);
};

EventHandler.get_mouse_position = function(event) {
	/*
	// 固定比例画布
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
		// 禁用系统鼠标 显示自定义鼠标
		DoubleBuff.locked = true;
		DoubleBuff.canvas_show.requestPointerLock();
		DoubleBuff.canvas_hide.requestPointerLock();
	*/

    EventHandler.currentlyPressedMouseKeys[event.button] = true;
    EventHandler.mouse_position = EventHandler.get_mouse_position(event);
    if (EventHandler.panels.length > 0)
        EventHandler.panels[EventHandler.panels.length - 1].mouse_event(EventHandler.EVENT_MOUSE_DOWN, event.button, 0);
};

EventHandler.handleMouseUp = function(event) {
    EventHandler.currentlyPressedMouseKeys[event.button] = false;
    EventHandler.mouse_position = EventHandler.get_mouse_position(event);
    if (EventHandler.panels.length > 0)
        EventHandler.panels[EventHandler.panels.length - 1].mouse_event(EventHandler.EVENT_MOUSE_UP, event.button, 0);
};

EventHandler.handleMouseMove = function(event) {
    EventHandler.mouse_position = EventHandler.get_mouse_position(event);
    if (EventHandler.panels.length > 0)
        EventHandler.panels[EventHandler.panels.length - 1].mouse_event(EventHandler.EVENT_MOUSE_MOVE, event.button, 0);
};

EventHandler.handleMouseWheel = function(event) {
    EventHandler.mouse_position = EventHandler.get_mouse_position(event);
    if (EventHandler.panels.length > 0)
        EventHandler.panels[EventHandler.panels.length - 1].mouse_event(EventHandler.EVENT_MOUSE_MOVE, EventHandler.MOUSE_BUTTON_MIDDLE, event.deltaY);	// 鼠标的deltaY每次100
};

// Other stuff.
EventHandler.on_draw = function(ctxw) {
	/*
	// 固定比例画布
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