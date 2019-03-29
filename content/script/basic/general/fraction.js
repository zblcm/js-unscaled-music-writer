var Fraction = function(u, d, is_negative) {
	this.u = u;
	this.d = d;
	if (this.d === undefined) this.d = 1;
    // console.log("fraction", this.u, this.d);
	this.is_negative = (is_negative == true);
	
	this.fix = function() {
		if (this.u < 0) {
			this.u = -this.u;
			this.is_negative = !this.is_negative;
		}
		if (this.d < 0) {
			this.d = -this.d;
			this.is_negative = !this.is_negative;
		}
		if (this.d == 0 || this.u == 0) return;
        let c = General.gcd(this.u, this.d);
		this.u = this.u / c;
		this.d = this.d / c;
	};
	
	this.toString = function() {
		let s = "";
		if (this.u == 0) return "0";
		if (this.is_negative) s = s + "-";
		if (this.d == 0) s = s + "inf";
		else s = s + this.u.toString() + "/" + this.d.toString();
		return s;
	};
	
	this.copy = function() {return new Fraction(this.u, this.d, this.is_negative); };
	this.neg = function() {return new Fraction(this.u, this.d, !this.is_negative); };
	this.inv = function() {return new Fraction(this.d, this.u, this.is_negative); };
	this.add = function(that) {
		if (this.d == 0 && that.d != 0) return this.copy();
		if (this.d != 0 && that.d == 0) return that.copy();
        let fu, gu, cu, cd, cn;
		if (this.d == 0 && that.d == 0) {
			cd = 0;
			fu = this.u;
			gu = that.u;
			if (this.is_negative) fu = -fu;
			if (that.is_negative) gu = -gu;
			cu = fu + gu;
			cn = (cu < 0);
			if (cn) cu = -cu;
			return new Fraction(cu, cd, cn);
		}
		if (this.d != 0 && that.d != 0) {
            let c = General.gcd(this.d, that.d);
			cd = this.d * that.d / c;
			fu = this.u * that.d / c;
			gu = that.u * this.d / c;
			if (this.is_negative) fu = -fu;
			if (that.is_negative) gu = -gu;
			cu = fu + gu;
			cn = (cu < 0);
			if (cn) cu = -cu;
			return new Fraction(cu, cd, cn);
		}
	};
	this.sub = function(that) {return this.add(that.neg()); };
	this.mul = function(that) {return new Fraction(this.u * that.u, this.d * that.d, this.is_negative != that.is_negative); };
	this.div = function(that) {return this.mul(that.inv()); };
	this.to_float = function() {
		let num = this.u / this.d;
		if (this.is_negative) num = -num;
		return num;
	};
	// this.equals = function(that) {return (this.d == that.d) && (((this.d == 0) && (((this.u == 0) && (that.u == 0)) || ((this.u * that.u != 0) && (this.is_negative == that.is_negative)))) || ((this.u == that.u) && (this.is_negative == that.is_negative)));}
	
	// functions used to help compare.
	this.is_zero = function() {return (this.u == 0) && (this.d != 0); };
	this.less_than_zero = function() {return (this.u > 0) && (this.is_negative); };
	this.more_than_zero = function() {return (this.u > 0) && (!this.is_negative); };
	
	this.equals = function(that) {return this.sub(that).is_zero(); };
	
	// more than, more equal, less than, less equal
	this.mt = function(that) {return this.sub(that).more_than_zero(); };
	this.lt = function(that) {return this.sub(that).less_than_zero(); };
	this.meq = function(that) {
		let delta = this.sub(that);
		return delta.is_zero() || delta.more_than_zero();
	};
	this.leq = function(that) {
        let delta = this.sub(that);
		return delta.is_zero() || delta.less_than_zero();
	};
	
	this.fix();
};