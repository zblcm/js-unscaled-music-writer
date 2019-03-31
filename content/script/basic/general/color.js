var Color = function(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;

    this.to_style = function() {
        let r = ColorHandler.percent_to_base8(this.r);
        let g = ColorHandler.percent_to_base8(this.g);
        let b = ColorHandler.percent_to_base8(this.b);
        return "rgba(" + r + ", " + g + ", " + b + ", " + this.a + ")";
    };
    this.to_style_transp = function(a) {
        let r = ColorHandler.percent_to_base8(this.r);
        let g = ColorHandler.percent_to_base8(this.g);
        let b = ColorHandler.percent_to_base8(this.b);
        return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
    };
    this.delta = function(color) {
        return Math.abs(this.r - color.r) + Math.abs(this.g - color.g) + Math.abs(this.b - color.b);
    };
    this.equals = function(color) {
        let rc = (ColorHandler.percent_to_base8(this.r - color.r) == 0);
        let gc = (ColorHandler.percent_to_base8(this.g - color.g) == 0);
        let bc = (ColorHandler.percent_to_base8(this.b - color.b) == 0);
        let ac = (ColorHandler.percent_to_base8(this.a - color.a) == 0);
        return rc && gc && bc && ac;
    };
    this.clone = function() {
        return new Color(this.r, this.g, this.b, this.a);
    };
    this.transp = function(ratio) {
        return new Color(this.r, this.g, this.b, this.a * ratio);
    };
    this.linear_plugin = function(color, ratio) {
        let r = (this.r * ratio) + (color.r * (1 - ratio));
        let g = (this.g * ratio) + (color.g * (1 - ratio));
        let b = (this.b * ratio) + (color.b * (1 - ratio));
        let a = (this.a * ratio) + (color.a * (1 - ratio));
        return new Color(r, g, b, a);
    };
    this.str = function() {
        return "(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
    };
    this.mul = function(color) {
        let r = this.r * color.r;
        let g = this.g * color.g;
        let b = this.b * color.b;
        let a = this.a * color.a;
        return new Color(r, g, b, a);
    };

    this.H = function() {
        let R = this.r;
        let G = this.g;
        let B = this.b;
        let d = Math.pow(Math.pow(R - G, 2) + ((R - B) * (G - B)), 0.5) * 2;
        if (d == 0) {
            return 0;
        }
        let temp = (R - G + R - B) / d;
        if (temp > 1) {
            temp = 1;
        }
        if (temp < -1) {
            temp = -1;
        }
        let theta = Math.acos(temp);
        if (G >= B) {
            return theta;
        }
        else {
            return (2 * Math.PI) - theta;
        }
    };
    this.S = function() {
        let R = this.r;
        let G = this.g;
        let B = this.b;
        if (R + G + B == 0) {
            return 0;
        }
        let min = R;
        if (G < min) {
            min = G;
        }
        if (B < min) {
            min = B;
        }
        return 1 - (3 * min / (R + G + B));
    };
    this.I = function() {
        let R = this.r;
        let G = this.g;
        let B = this.b;
        return (R + G + B) / 3;
    };
};

var ColorHandler = {};

ColorHandler.color_HSIA = function(H, S, I, A) {
    let R;
    let G;
    let B;
    let h;

    if ((H >= Math.PI * (0 / 3)) && (H < Math.PI * (2 / 3))) {
        h = H - (Math.PI * (0 / 3));
        B = I * (1 - S);
        R = I * (1 + (S * Math.cos(h) / Math.cos((Math.PI * (1 / 3)) - h)));
        G = (3 * I) - B - R;
    }

    if ((H >= Math.PI * (2 / 3)) && (H < Math.PI * (4 / 3))) {
        h = H - (Math.PI * (2 / 3));
        R = I * (1 - S);
        G = I * (1 + (S * Math.cos(h) / Math.cos((Math.PI * (1 / 3)) - h)));
        B = (3 * I) - R - G;
    }

    if ((H >= Math.PI * (4 / 3)) && (H < Math.PI * (6 / 3))) {
        h = H - (Math.PI * (4 / 3));
        G = I * (1 - S);
        B = I * (1 + (S * Math.cos(h) / Math.cos((Math.PI * (1 / 3)) - h)));
        R = (3 * I) - G - B;
    }

    return new Color(R, G, B, A);
};

ColorHandler.percent_to_base8 = function(percent) {
    let value = Math.round(percent * 255);
    if (value < 0) {
        value = 0;
    }
    if (value > 255) {
        value = 255;
    }
    return value;

};
ColorHandler.base8_to_percent = function(base8) {
    let value = base8 / 255;
    if (value < 0) {
        value = 0;
    }
    if (value > 1) {
        value = 1;
    }
    return value;
};

ColorHandler.random = function() {
    return new Color(Math.random(), Math.random(), Math.random(), Math.random());
};

ColorHandler.COLOR_BLACK = new Color(0, 0, 0, 1);
ColorHandler.COLOR_WHITE = new Color(1, 1, 1, 1);
ColorHandler.COLOR_THEME_0 = new Color(0.04, 0.04, 0.06, 1.0);
ColorHandler.COLOR_THEME_1 = new Color(0.1, 0.1, 0.2, 1.0);
ColorHandler.COLOR_THEME_2 = new Color(0.2, 0.2, 0.3, 1.0);
ColorHandler.COLOR_THEME_3 = new Color(0.3, 0.3, 0.4, 1.0);
ColorHandler.COLOR_THEME_4 = new Color(0.4, 0.4, 0.6, 1.0);
ColorHandler.COLOR_THEME_5 = new Color(0.6, 0.6, 0.8, 1.0);
ColorHandler.COLOR_THEME_6 = new Color(0.7, 0.7, 0.9, 1.0);
ColorHandler.COLOR_THEME_7 = new Color(0.8, 0.8, 1.0, 1.0);

ColorHandler.COLOR_BASE = new Color(0.2, 1.0, 0.2, 1);
ColorHandler.COLOR_BASE_DARK = new Color(0.2, 0.6, 0.2, 1);
ColorHandler.COLOR_EDIT_BASE = new Color(1.0, 1.0, 0.2, 1);
ColorHandler.COLOR_EDIT_BASE_DARK = new Color(0.6, 0.6, 0.2, 1);
ColorHandler.COLOR_TIME = new Color(1.0, 0.0, 0.0, 1);