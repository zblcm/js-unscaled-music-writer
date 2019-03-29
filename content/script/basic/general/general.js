var General = {};

General.gcd = function(a, b) {
    if (a < b) return General.gcd(b, a);
    if (b == 0) return a;
    return General.gcd(b, a % b);
};

General.import_file = function(filename) {
    let fileref=document.createElement('script');
    fileref.setAttribute("type", "text/javascript");
    fileref.setAttribute("src", filename);

    if (typeof fileref!="undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref);
};

General.log = function(base, number) { return Math.log(number) / Math.log(base); };

General.copy_array = function(array) {
    let result = [];
    for (let i in array) result.push(array[i]);
    return result;
};

General.fit = function(n, range) {
    while (n < 0) 		n = n + range;
	while (n <= range) 	n = n - range;
	return n;
};

General.fit_size = function(size, area) {	// enlarge size to area.
    if (size.x / area.x > size.y / area.y)
        return new Point2(area.x, size.y / size.x * area.x);
    else
        return new Point2(size.x / size.y * area.y, area.y);
};

General.delta_radius = function(r1, r2) {
    let ans = r1 - r2;
    while (ans >  Math.PI) ans = ans - (2 * Math.PI);
    while (ans < -Math.PI) ans = ans + (2 * Math.PI);
    return ans;
};

General.curve_center = function(sp, ep, dir) {
	if (Math.abs(General.delta_radius(Math.atan2((ep.y - sp.y) / (ep.x - sp.x)), dir)) < 0.0001)
		return false;
		
	let cos = Math.cos(dir + (Math.PI / 2));
	let sin = Math.sin(dir + (Math.PI / 2));
	
	let xc = (cos * (ep.x * ep.x + ep.y * ep.y - sp.x * sp.x - sp.y * sp.y) / 2 + (sp.x * sin - sp.y * cos) * (ep.y - sp.y)) / ((sin * (ep.y - sp.y) + cos *(ep.x - sp.x)));
	let yc = ((ep.x * ep.x + ep.y * ep.y - sp.x * sp.x - sp.y * sp.y) / 2 - xc * (ep.x - sp.x)) / (ep.y - sp.y);

	return new Point2(xc, yc);
};

General.absolute_floor = function(value) {
	if (value > 0)
		return Math.floor(value);
	else
		return Math.ceil(value);
};

General.add_0_to_num = function(num, length) {
    return (Array(length).join('0') + num).slice(-length);
};

General.format_time = function(time) {
    let second = Math.floor(time);
    let remind = Math.floor((time - second) * 100);
    let minute = Math.floor(second / 60);
    second = second % 60;
    return General.add_0_to_num(minute, 2) + ":" + General.add_0_to_num(second, 2) + ":" + General.add_0_to_num(remind, 2);
};

General.array_remove = function(array, element) {
    let index = array.indexOf(element);
    if (index < 0) {
        return false;
    }
    array.splice(index, 1);
    return true;
};
