var Ticker = {};

Ticker.init = function() {
	Ticker.init_time = new Date().getTime() / 1000.0;
    Ticker.curr_time = Ticker.init_time;
};

Ticker.tick = function() {
	let new_time = new Date().getTime() / 1000.0;
	let delta_time = new_time - Ticker.curr_time;
	Ticker.curr_time = new_time;
	return delta_time
};

Ticker.time = function() {
	return (new Date().getTime() / 1000.0) - Ticker.init_time;
};