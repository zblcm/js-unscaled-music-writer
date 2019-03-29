var Editor = {};

Editor.LEFT_RULER_WIDTH = 60;
Editor.TOP_RULER_HEIGHT = 20;

Editor.X_UNIT_SIZE_MIN = 40;
Editor.X_UNIT_SIZE_MAX = 1280;
Editor.Y_UNIT_SIZE_MIN = 40;
Editor.Y_UNIT_SIZE_MAX = 1280;
Editor.UNIT_SCALE_LENGTH = 200;

Editor.init = function() {
    Editor.notes = [];
    Editor.current_time = 0;

    Editor.current_x = 0;
    Editor.current_y = 0;
    Editor.x_unit_size = 320;
    Editor.y_unit_size = 320;
    Editor.total_x = 0;
    Editor.total_y = 10;
    Editor.bars = [];

    Editor.press_st_pos = null;
    Editor.press_ed_pos = null;
    Editor.selecting = false;
    Editor.y_dividers = [];

    Editor.create_bar();
    Editor.create_bar();
    Editor.create_bar();
    Editor.create_bar();
    Editor.create_bar();

    Editor.imagine_size = new Point2(100, 100);
};
Editor.create_content_panel = function() {
    let panel = {};
    Editor.content_panel = panel;
    PanelHandler.panelize(panel);

    // canvas
    Editor.canvas = document.createElement("canvas");
    Editor.canvas.wraper = new Canvas_wraper(Editor.canvas);

    panel.add_on_draw(function(ctxw) {
        Editor.canvas.wraper.clear();
        panel.draw_content(Editor.canvas.wraper);
        ctxw.draw_image(Editor.canvas, panel.position);
    });
    panel.add_mouse_event(Editor.content_mouse_event);

    Editor.panel.add_on_resize(function() { Editor.canvas.wraper.set_size(panel.size); });

    panel.draw_content = Editor.content_draw;

    Editor.abs_to_unit_x = function(x) { return Editor.draw_to_unit_x(x - panel.position.x); };
    Editor.abs_to_unit_y = function(y) { return Editor.draw_to_unit_y(y - panel.position.y); };
    Editor.unit_to_abs_x = function(x) { return Editor.unit_to_draw_x(x) + panel.position.x; };
    Editor.unit_to_abs_y = function(y) { return Editor.unit_to_draw_y(y) + panel.position.y; };
    Editor.abs_to_unit = function(p) { return Editor.draw_to_unit(p.sub(panel.position)); };
    Editor.unit_to_abs = function(p) { return Editor.unit_to_draw(p).add(panel.position); };

    Editor.draw_to_unit_x = function(x) { return (x / Editor.x_unit_size) + Editor.current_x; };
    Editor.draw_to_unit_y = function(y) { return ((panel.size.y - y) / Editor.y_unit_size) + Editor.current_y;};
    Editor.unit_to_draw_x = function(x) { return (x - Editor.current_x) * Editor.x_unit_size; };
    Editor.unit_to_draw_y = function(y) { return panel.size.y - ((y - Editor.current_y) * Editor.y_unit_size); };
    Editor.draw_to_unit = function(p) { return new Point2(Editor.draw_to_unit_x(p.x), Editor.draw_to_unit_y(p.y)); };
    Editor.unit_to_draw = function(p) { return new Point2(Editor.unit_to_draw_x(p.x), Editor.unit_to_draw_y(p.y)); };

    return panel;
};
Editor.create_panel = function() {
    // create
    Editor.panel = {};
    Editor.x_ruler_panel = {};
    Editor.y_ruler_panel = {};

    PanelHandler.panelize(Editor.panel);
    PanelHandler.panelize(Editor.x_ruler_panel);
    PanelHandler.panelize(Editor.y_ruler_panel);

    Editor.create_content_panel();
    Editor.x_scroll_bar = ScrollHandler.new_scroll(true);
    Editor.y_scroll_bar = ScrollHandler.new_scroll(false);
    Editor.x_scale_panel = ScrollHandler.new_scale(true, false);
    Editor.y_scale_panel = ScrollHandler.new_scale(false, false);

    // relationship
    Editor.panel.add_child(Editor.content_panel);
    Editor.panel.add_child(Editor.x_ruler_panel);
    Editor.panel.add_child(Editor.y_ruler_panel);
    Editor.panel.add_child(Editor.x_scroll_bar);
    Editor.panel.add_child(Editor.y_scroll_bar);
    Editor.panel.add_child(Editor.x_scale_panel);
    Editor.panel.add_child(Editor.y_scale_panel);

    // position and size.
    Editor.panel.position = new Point2(InstrumentHandler.CONTAINER_WIDTH, MenuHandler.MENU_HEIGHT);
    Editor.content_panel.position = new Point2(Editor.panel.position.x + Editor.LEFT_RULER_WIDTH, Editor.panel.position.y + Editor.TOP_RULER_HEIGHT);
    Editor.x_ruler_panel.position = new Point2(Editor.content_panel.position.x, Editor.panel.position.y);
    Editor.y_ruler_panel.position = new Point2(Editor.panel.position.x, Editor.content_panel.position.y);
    Editor.x_scale_panel.size = new Point2(Editor.UNIT_SCALE_LENGTH, ScrollHandler.WIDTH);
    Editor.y_scale_panel.size = new Point2(ScrollHandler.WIDTH, Editor.UNIT_SCALE_LENGTH);

    Editor.panel.add_on_resize(function() {
        Editor.panel.size = new Point2(DoubleBuff.size.x - InstrumentHandler.CONTAINER_WIDTH, DoubleBuff.size.y - MenuHandler.MENU_HEIGHT);
        Editor.content_panel.size = new Point2(Editor.panel.size.x - ScrollHandler.WIDTH - Editor.LEFT_RULER_WIDTH, Editor.panel.size.y - ScrollHandler.WIDTH - Editor.TOP_RULER_HEIGHT);
        Editor.x_ruler_panel.size = new Point2(Editor.content_panel.size.x, Editor.TOP_RULER_HEIGHT);
        Editor.y_ruler_panel.size = new Point2(Editor.LEFT_RULER_WIDTH, Editor.content_panel.size.y);
        Editor.x_scroll_bar.position = new Point2(Editor.content_panel.position.x, DoubleBuff.size.y - ScrollHandler.WIDTH);
        Editor.y_scroll_bar.position = new Point2(DoubleBuff.size.x - ScrollHandler.WIDTH, Editor.content_panel.position.y);
        Editor.x_scale_panel.position = new Point2(DoubleBuff.size.x - Editor.UNIT_SCALE_LENGTH - ScrollHandler.WIDTH, Editor.x_scroll_bar.position.y);
        Editor.y_scale_panel.position = new Point2(Editor.y_scroll_bar.position.x, DoubleBuff.size.y - Editor.UNIT_SCALE_LENGTH - ScrollHandler.WIDTH);

        Editor.x_scroll_bar.update_size(Editor.imagine_size.x, Editor.content_panel.size.x, Editor.content_panel.size.x - Editor.UNIT_SCALE_LENGTH);
        Editor.y_scroll_bar.update_size(Editor.imagine_size.y, Editor.content_panel.size.y, Editor.content_panel.size.y - Editor.UNIT_SCALE_LENGTH);
    });

    // color
    Editor.set_panel_color = function() {
        Editor.panel.fillcolor = ColorHandler.COLOR_THEME_2;
        Editor.content_panel.fillcolor = ColorHandler.COLOR_THEME_0;
        Editor.x_ruler_panel.fillcolor = ColorHandler.COLOR_THEME_4;
        Editor.y_ruler_panel.fillcolor = ColorHandler.COLOR_THEME_4;
        Editor.x_scroll_bar.fillcolor = ColorHandler.COLOR_THEME_4;
        Editor.y_scroll_bar.fillcolor = ColorHandler.COLOR_THEME_4;
        Editor.x_scale_panel.fillcolors[ButtonHandler.BUTTON_STATIC] = ColorHandler.COLOR_THEME_3;
        Editor.y_scale_panel.fillcolors[ButtonHandler.BUTTON_STATIC] = ColorHandler.COLOR_THEME_3;
        Editor.x_scroll_bar.drager.fillcolors[ButtonHandler.BUTTON_STATIC] = ColorHandler.COLOR_THEME_5;
        Editor.y_scroll_bar.drager.fillcolors[ButtonHandler.BUTTON_STATIC] = ColorHandler.COLOR_THEME_5;
        Editor.x_scroll_bar.drager.fillcolors[ButtonHandler.BUTTON_HOVER] = ColorHandler.COLOR_THEME_6;
        Editor.y_scroll_bar.drager.fillcolors[ButtonHandler.BUTTON_HOVER] = ColorHandler.COLOR_THEME_6;
        Editor.x_scroll_bar.drager.fillcolors[ButtonHandler.BUTTON_PRESS] = ColorHandler.COLOR_THEME_7;
        Editor.y_scroll_bar.drager.fillcolors[ButtonHandler.BUTTON_PRESS] = ColorHandler.COLOR_THEME_7;

        Editor.x_scale_panel.change_state([ButtonHandler.BUTTON_STATIC]);
        Editor.y_scale_panel.change_state([ButtonHandler.BUTTON_STATIC]);
        Editor.x_scroll_bar.drager.change_state([ButtonHandler.BUTTON_STATIC]);
        Editor.y_scroll_bar.drager.change_state([ButtonHandler.BUTTON_STATIC]);
    };

    // scrollbar function
    Editor.x_scroll_bar.on_scroll = function(ratio) {
        let ratio_plus = ratio / (1 + (Editor.content_panel.size.x / (Editor.imagine_size.x - Editor.content_panel.size.x)));
        Editor.current_x = ratio_plus * Editor.total_x;
    };
    Editor.y_scroll_bar.on_scroll = function(ratio) {
        let ratio_plus = (1 - ratio) / (1 + (Editor.content_panel.size.y / (Editor.imagine_size.y - Editor.content_panel.size.y)));
        Editor.current_y = ratio_plus * Editor.total_y;
    };

    // scale functions
    Editor.x_scale_panel.on_scale = function() {
        Editor.x_unit_size = Editor.X_UNIT_SIZE_MIN * Math.pow(Math.E, (Math.log(Editor.X_UNIT_SIZE_MAX / Editor.X_UNIT_SIZE_MIN) * Editor.x_scale_panel.current_ratio));
        Editor.update_canvas_size();
    };
    Editor.y_scale_panel.on_scale = function() {
        Editor.y_unit_size = Editor.Y_UNIT_SIZE_MIN * Math.pow(Math.E, (Math.log(Editor.Y_UNIT_SIZE_MAX / Editor.Y_UNIT_SIZE_MIN) * Editor.y_scale_panel.current_ratio));
        Editor.update_canvas_size();
    };
    Editor.x_scale_panel.add_on_draw(function(ctxw) {
        let x = Editor.x_scale_panel.position.x + (Editor.x_scale_panel.current_ratio * Editor.x_scale_panel.size.x);
        ctxw.draw_line(new Point2(x, Editor.x_scale_panel.position.y), new Point2(x, Editor.x_scale_panel.position.y + Editor.x_scale_panel.size.y), ColorHandler.COLOR_THEME_7, 1);
    });
    Editor.y_scale_panel.add_on_draw(function(ctxw) {
        let y = Editor.y_scale_panel.position.y + (Editor.y_scale_panel.current_ratio * Editor.y_scale_panel.size.y);
        ctxw.draw_line(new Point2(Editor.y_scale_panel.position.x, y), new Point2(Editor.y_scale_panel.position.x + Editor.y_scale_panel.size.x, y), ColorHandler.COLOR_THEME_7, 1);
    });
    Editor.update_canvas_size = function() {
        Editor.imagine_size = new Point2(Editor.x_unit_size * Editor.total_x, Editor.y_unit_size * Editor.total_y);
        Editor.x_scroll_bar.update_size(Editor.imagine_size.x, Editor.content_panel.size.x, Editor.x_scroll_bar.size.x);
        Editor.y_scroll_bar.update_size(Editor.imagine_size.y, Editor.content_panel.size.y, Editor.y_scroll_bar.size.y);
    };

    Editor.set_panel_color();

    return Editor.panel;
};

Editor.create_bar = function() {
    let bar = {};

    bar.notes = [];
    bar.selected = false;
    bar.base = new Fraction(1, 1);  // 默认base. 1/2 < base <= 1

    bar.update_index = function() { bar.index = Editor.bars.indexOf(bar); };

    bar.should_draw = function() {
        let bar_sx = Editor.unit_to_draw_x(bar.index);
        let bar_ex = Editor.unit_to_draw_x(bar.index + 1);
        let panel_sx = 0;
        let panel_ex = Editor.content_panel.size.x;
        return bar_ex > panel_sx && bar_sx < panel_ex;
    };

    bar.inside = function(p) {
        let sx = Editor.unit_to_abs_x(bar.index);
        let ex = Editor.unit_to_abs_x(bar.index + 1);

        return Editor.content_panel.inside(p) && (p.x > sx) && (p.x < ex);
    };

    bar.draw_content = function(ctxw) {
        let canvas_size = ctxw.get_size();
        let x, y;
        let sx, ex, sy, ey;

        if (bar.should_draw()) {
            sx = Editor.unit_to_draw_x(bar.index);
            ex = Editor.unit_to_draw_x(bar.index + 1);

            // draw frame.
            let fill_color = null;
            if (bar.selected) fill_color = null;
            sy = Editor.unit_to_draw_y(0);
            ey = Editor.unit_to_draw_y(Editor.total_y);
            if (y > Editor.content_panel.size.y) y = Editor.content_panel.size.y;
            ctxw.draw_line(new Point2(ex, sy), new Point2(ex, ey), ColorHandler.COLOR_THEME_7, 1);

            // draw vertical units.
            let i_max = Math.round(Editor.x_edit_division.inv().to_float());
            for (let i = 1; i < i_max; i++) {
                x = Editor.unit_to_draw_x(bar.index + (i / i_max));
                ctxw.draw_line(new Point2(x, sy), new Point2(x, ey), ColorHandler.COLOR_THEME_4, 0.5);
            }

            // draw green base.
            let base_value = General.log(2, bar.base.to_float());

            for (let t = base_value; t < Editor.total_y; t ++) {
                // draw green line.
                y = Editor.unit_to_draw_y(t);
                ctxw.draw_line(new Point2(sx, y), new Point2(ex, y), ColorHandler.COLOR_BASE_DARK, 0.5);

                // draw yellow line.
                for (let d = 1; d < Editor.y_edit_division; d ++) {
                    let t_add = General.log(2, (d + Editor.y_edit_division) / Editor.y_edit_division);
                    let y = Editor.unit_to_draw_y(t + t_add);
                    ctxw.draw_line(new Point2(sx, y), new Point2(ex, y), ColorHandler.COLOR_EDIT_BASE_DARK, 0.5);
                }
            }
        }

        // draw notes.
        for (let i in bar.notes) notes[i].draw_content(ctxw);
    };

    // put bar into the bars array.
    Editor.bars.push(bar);
    bar.update_index();
    Editor.total_x = Editor.bars.length;

    return bar;
};

Editor.content_mouse_event = function(type, key, special) {
    let inside = Editor.content_panel.inside(EventHandler.mouse_position);

    // record mouse press.
    if ((inside) && (key == EventHandler.MOUSE_LEFT_BUTTON) && (type == EventHandler.MOUSE_DOWN)) {
        Editor.press_st_pos = Editor.abs_to_unit(EventHandler.mouse_position);
        Editor.press_ed_pos = Editor.abs_to_unit(EventHandler.mouse_position);
    }
    if (type == EventHandler.MOUSE_MOVE) {
        if (Editor.press_st_pos)
            Editor.press_ed_pos = Editor.abs_to_unit(EventHandler.mouse_position);
    }
    if ((key == EventHandler.MOUSE_LEFT_BUTTON) && (type == EventHandler.MOUSE_UP)) {
        if (Editor.press_st_pos) {
            Editor.press_ed_pos = Editor.abs_to_unit(EventHandler.mouse_position);
            Editor.press_st_pos = null;
        }
    }

    // handle selection
    if (Editor.current_tool == MenuHandler.TOOL_SELECT) {
        // cancel selection.
        if ((inside) && (key == EventHandler.MOUSE_RIGHT_BUTTON) && (type == EventHandler.MOUSE_UP)) {
            for (let i in Editor.bars) {
                let bar = Editor.bars[i];
                bar.selected = false;
                // TODO:: unselect notes.
            }
        }

        // handle select start.
        if ((inside) && (key == EventHandler.MOUSE_LEFT_BUTTON) && (type == EventHandler.MOUSE_DOWN)) {
            // TODO:: judge select single note first.
            Editor.selecting = true;
        }
        if ((key == EventHandler.MOUSE_LEFT_BUTTON) && (type == EventHandler.MOUSE_UP)) {
            if (Editor.selecting)
                Editor.selecting = false;
        }

    }
};

Editor.content_draw = function(ctxw) {
    // draw bars.
    for (let i in Editor.bars) Editor.bars[i].draw_content(ctxw);

    // draw notes.
    for (let i in Editor.bars)
        for (let j in Editor.bars[i].notes)
            Editor.bars[i].notes.draw_content(ctxw);

    // draw selection.
    if (Editor.selecting) {
        let t;
        let x1 = Editor.unit_to_draw_x(Editor.press_st_pos.x);
        let x2 = Editor.unit_to_draw_x(Editor.press_ed_pos.x);
        let y1 = Editor.unit_to_draw_y(Editor.press_st_pos.y);
        let y2 = Editor.unit_to_draw_y(Editor.press_ed_pos.y);
        if (x1 > x2) { t = x1; x1 = x2; x2 = t; }
        if (y1 > y2) { t = y1; y1 = y2; y2 = t; }
        ctxw.draw_rect(new Point2(x1, y1), new Point2(x2 - x1, y2 - y1), null, ColorHandler.COLOR_THEME_7, 1);
    }
};