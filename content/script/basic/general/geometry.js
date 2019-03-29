var Point2 = function(x, y) {
    this.x = x;
    this.y = y;

    this.add = function(point) { return new Point2(this.x + point.x, this.y + point.y); };
    this.sub = function(point) { return new Point2(this.x - point.x, this.y - point.y); };
    this.mul = function(scale) { return new Point2(this.x * scale, this.y * scale); };
    this.div = function(scale) { return new Point2(this.x / scale, this.y / scale); };
    this.dot = function(point) { return (this.x * point.x) + (this.y * point.y); };
    this.clone = function() { return new Point2(this.x, this.y); };
    this.length = function() { return Math.sqrt(this.dot(this)); };
    this.rotate = function(radius) {
        let new_x = this.x * Math.cos(radius) - this.y * Math.sin(radius);
        let new_y = this.y * Math.cos(radius) + this.x * Math.sin(radius);
        return new Point2(new_x, new_y);
    };
    this.unit = function() {
        let len = this.length();
        if (len == 0) return new Point2(0, 0);
        else return this.div(this.length());
    };
    this.linear_plugin = function(point, ratio) { return this.mul(ratio).add(point.mul(1 - ratio)); };
    this.round = function() { return new Point2(Math.round(this.x), Math.round(this.y)); };
    this.floor = function() { return new Point2(Math.floor(this.x), Math.floor(this.y)); };
    this.pack = function() {
        let dict = {};
        dict["x"] = this.x;
        dict["y"] = this.y;
        return dict;
    };
    this.toString = function() { return "(" + this.x + ", " + this.y + ")"; };
    this.radius = function() { return Math.atan2(this.y, this.x); };
    this.limit_in = function(area) {
        let ratio_x = area.x / this.x;
        let ratio_y = area.y / this.y;
        let divider = 1;
        if (ratio_x < divider) { divider = ratio_x; }
        if (ratio_y < divider) { divider = ratio_y; }
        return this.mul(divider);
    };
};
var POINT2_ZERO = new Point2(0, 0);
var Rect2 = function(o1, o2) {
    if (o1.x > o2.x) {this.maxx = o1.x; this.minx = o2.x;}
    else {this.maxx = o2.x; this.minx = o1.x;}
    if (o1.y > o2.y) {this.maxy = o1.y; this.miny = o2.y;}
    else {this.maxy = o2.y; this.miny = o1.y;}

    this.inside = function(p) { return (p.x >= this.minx) && (p.x <= this.maxx) && (p.y >= this.miny) && (p.y <= this.maxy); };
    this.clone = function(r) { return new Rect2(new Point2(this.minx, this.miny), new Point2(this.maxx, this.maxy)); }
};

var Line2 = function(A, B, C) {
    this.A = A;
    this.B = B;
    this.C = C;

    this.sub = function(point) { return this.A * point.x + this.B * point.y + this.C; };
    this.cross = function(line) {
        let A1 = this.A;
        let B1 = this.B;
        let C1 = this.C;
        let A2 = line.A;
        let B2 = line.B;
        let C2 = line.C;
        let x = (B1 * C2 - B2 * C1)/(B2 * A1 - B1 * A2);
        let y = (A1 * C2 - A2 * C1)/(A2 * B1 - A1 * B2);
        return new Point2(x, y);
    };
    this.clone = function() { return new Line2(this.A, this.B, this.C); };
    this.dis_p = function(point) { return Math.abs(this.sub(point)) / Math.pow(this.A * this.A + this.B * this.B, 0.5); };
    this.dis_l = function(line) { return Math.abs(this.C - line.C) / Math.pow(this.A * this.A + this.B * this.B, 0.5); };
    this.get_x = function(y) { return (this.C + (this.B * y)) / (this.A) * (-1); };
    this.get_y = function(x) { return (this.C + (this.A * x)) / (this.B) * (-1); };
};

var Line2_pp = function(p1, p2) {
    let A = p2.y - p1.y;
    let B = p1.x - p2.x;
    let C = p1.y * p2.x - p1.x * p2.y;
    return new Line2(A, B, C);
};

var Triangle2 = function(p1, p2, p3) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.l1 = Line2_pp(p2, p3);
    this.l2 = Line2_pp(p1, p3);
    this.l3 = Line2_pp(p1, p2);

    this.inside = function(point) {
        let b1 = (this.l1.sub(this.p1) * this.l1.sub(point) > 0);
        let b2 = (this.l2.sub(this.p2) * this.l2.sub(point) > 0);
        let b3 = (this.l3.sub(this.p3) * this.l3.sub(point) > 0);
        return (b1 && b2 && b3);
    };
    this.clone = function() { return new Triangle(this.p1, this.p2, this.p3); };
};

var Point3 = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.add = function(point) { return new Point3(this.x + point.x, this.y + point.y, this.z + point.z); };
    this.sub = function(point) { return new Point3(this.x - point.x, this.y - point.y, this.z - point.z); };
    this.mul = function(scale) { return new Point3(this.x * scale, this.y * scale, this.z * scale); };
    this.div = function(scale) { return new Point3(this.x / scale, this.y / scale, this.z / scale); };
    this.dot = function(point) { return (this.x * point.x) + (this.y * point.y) + (this.z * point.z); };
    this.cross = function(point) {
        let new_x = this.y * point.z - this.z * point.y;
        let new_y = this.z * point.x - this.x * point.z;
        let new_z = this.x * point.y - this.y * point.x;
        return new Point3(new_x, new_y, new_z);
    };
    this.clone = function() { return new Point3(this.x, this.y, this.z); };
    this.length = function() { return Math.sqrt(this.dot(this)); };
    this.delta_radius = function(point) {
        let u = this.dot(point);
        let d = this.length() * point.length();
        if (d == 0) return 0;
        return Math.acos(u / d);
    };
    this.rotate_around = function(axis, radius) {
        axis = axis.unit();
        let q = new Quaternion(Math.cos(radius / 2), Math.sin(radius / 2) * axis.x, Math.sin(radius / 2) * axis.y, Math.sin(radius / 2) * axis.z);
        let p = q.conjugate();
        let a = new Quaternion(0, this.x, this.y, this.z);
        let b = q.grassmann(a).grassmann(p);
        return new Point3(b.y, b.z, b.w);
    };
    this.rotate_to = function(target, radius) {
        let delta = this.delta_radius(target);
        if (delta <= radius) return target.clone();
        let axis = this.cross(target).unit();
        return this.rotate_around(axis, radius);
    };
    this.rotate_y = function(radius) {
        let new_x = this.x * Math.cos(radius) - this.z * Math.sin(radius);
        let new_z = this.z * Math.cos(radius) + this.x * Math.sin(radius);
        return new Point3(new_x, this.y, new_z);
    };
    this.rotate_z = function(radius) {
        let new_x = this.x * Math.cos(radius) - this.y * Math.sin(radius);
        let new_y = this.y * Math.cos(radius) + this.x * Math.sin(radius);
        return new Point3(new_x, new_y, this.z);
    };
    this.unit = function() {
        let len = this.length();
        if (len == 0) return new Point3(0, 0, 0);
        else return this.div(this.length());
    };
    this.linear_plugin = function(point, ratio) { return this.mul(ratio).add(point.mul(1 - ratio)); };
    this.linear_plugin_rotate = function(point, ratio) {
        let radius = this.delta_radius(point);
        let axis = this.cross(point).unit();
        return this.rotate(axis, radius * (1 - ratio));
    };
    this.pack = function() {
        let dict = {};
        dict["x"] = this.x;
        dict["y"] = this.y;
        dict["z"] = this.z;
        return dict;
    };
    this.toString = function() { return "(" + this.x + ", " + this.y + ", " + this.z + ")"; };
    this.round = function() { return new Point3(Math.round(this.x), Math.round(this.y), Math.round(this.z)); };
    this.floor = function() { return new Point3(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z)); };
};

var Quaternion = function(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;

    this.add = function(quaternion) { return new Quaternion(this.x + quaternion.x, this.y + quaternion.y, this.z + quaternion.z, this.w + quaternion.w); };
    this.sub = function(quaternion) { return new Quaternion(this.x - quaternion.x, this.y - quaternion.y, this.z - quaternion.z, this.w - quaternion.w); };
    this.mul = function(scale) { return new Quaternion(this.x * scale, this.y * scale, this.z * scale, this.w * scale); };
    this.div = function(scale) { return new Quaternion(this.x / scale, this.y / scale, this.z / scale, this.w / scale); };
    this.dot = function(quaternion) { return (this.x * quaternion.x) + (this.y * quaternion.y) + (this.z * quaternion.z) + (this.w * quaternion.w); };
    this.grassmann = function(quaternion) {
        let x1 = this.x;
        let y1 = this.y;
        let z1 = this.z;
        let w1 = this.w;
        let x2 = quaternion.x;
        let y2 = quaternion.y;
        let z2 = quaternion.z;
        let w2 = quaternion.w;
        let x = (x1 * x2) - (y1 * y2) - (z1 * z2) - (w1 * w2);
        let y = (x1 * y2) + (y1 * x2) + (z1 * w2) - (w1 * z2);
        let z = (x1 * z2) - (y1 * w2) + (z1 * x2) + (w1 * y2);
        let w = (x1 * w2) + (y1 * z2) - (z1 * y2) + (w1 * x2);
        return new Quaternion(x, y, z, w);
    };
    this.conjugate = function() { return new Quaternion(this.x, -this.y, -this.z, -this.w); };
    this.length = function() { return Math.sqrt(this.dot(this)); };
};

var circle_contact_square = function(center, radius, ltp, rbp) {
    // Judge sides.
    if ((center.x >= ltp.x) && (center.x <= rbp.x) && (center.y >= ltp.y - radius) && (center.y <= rbp.y + radius)) return true;
    if ((center.y >= ltp.y) && (center.y <= rbp.y) && (center.x >= ltp.x - radius) && (center.x <= rbp.x + radius)) return true;

    // Judge 4 points.
    if (center.sub(ltp).length() <= radius) return true;
    if (center.sub(rbp).length() <= radius) return true;
    if (center.sub(new Point2(ltp.x, rbp.y)).length() <= radius) return true;
    if (center.sub(new Point2(rbp.x, ltp.y)).length() <= radius) return true;
    return false;
};