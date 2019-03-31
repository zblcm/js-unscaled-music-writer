var MenuHandler = {};

MenuHandler.MENU_HEIGHT = 40;
MenuHandler.MENU_BUTTON_SIZE = 30;
MenuHandler.MENU_INTERVAL = (MenuHandler.MENU_HEIGHT - MenuHandler.MENU_BUTTON_SIZE) / 2;

MenuHandler.TOOL_DRAW = "DRAW";
MenuHandler.TOOL_SELECT = "SELECT";
MenuHandler.TOOL_BASE = "BASE";

MenuHandler.TIME_PLAY = "PLAY";
MenuHandler.TIME_LEFT = "LEFT";
MenuHandler.TIME_CENTER = "CENTER";

MenuHandler.init = function() {
    MenuHandler.normal_x = new Fraction(1, 16);
    MenuHandler.next_element_offset = 0;
    MenuHandler.button_tools = {};
    MenuHandler.button_times = {};
};

MenuHandler.create_panel = function() {
    let panel = {};
    MenuHandler.panel = panel;
    PanelHandler.panelize(panel);

    panel.position = POINT2_ZERO;
    panel.fillcolor = ColorHandler.COLOR_THEME_2;
    panel.add_on_resize(function() { panel.size = new Point2(DoubleBuff.size.x, MenuHandler.MENU_HEIGHT); });

    // construct content.
    MenuHandler.append_interval();

    // add button.
    let button;
    let adjuster;

    // file buttons.
    button = MenuHandler.append_button();
    button.add_on_draw(MenuHandler.draw_file_new(button));

    button = MenuHandler.append_button();
    button.add_on_draw(MenuHandler.draw_file_open(button));

    button = MenuHandler.append_button();
    button.add_on_draw(MenuHandler.draw_file_save(button));

    MenuHandler.append_interval();

    // file tool buttons.
    button = MenuHandler.append_button();
    MenuHandler.button_tools[MenuHandler.TOOL_DRAW] = button;
    button.add_on_draw(MenuHandler.draw_tool_draw(button));
    button.on_click = function() {MenuHandler.select_tool(MenuHandler.TOOL_DRAW)};

    button = MenuHandler.append_button();
    MenuHandler.button_tools[MenuHandler.TOOL_SELECT] = button;
    button.add_on_draw(MenuHandler.draw_tool_select(button));
    button.on_click = function() {MenuHandler.select_tool(MenuHandler.TOOL_SELECT)};

    button = MenuHandler.append_button();
    MenuHandler.button_tools[MenuHandler.TOOL_BASE] = button;
    button.add_on_draw(MenuHandler.draw_tool_base(button));
    button.on_click = function() {MenuHandler.select_tool(MenuHandler.TOOL_BASE)};

    MenuHandler.append_interval();

    // adjusters.
    adjuster = MenuHandler.append_adjuster();
    adjuster.text_color = ColorHandler.COLOR_EDIT;
    adjuster.on_adjust = function(adjuster) {
        return function() {
            Editor.y_edit_division = adjuster.cur_num;
        }
    }(adjuster);
    adjuster.change_number = function(old, positive) {
        let max = 16;
        let min = 2;
        let a = old;
        if (positive) a = a + 1;
        else a = a - 1;
        if (a > max) return max;
        if (a < min) return min;
        return a;
    };
    adjuster.on_adjust();

    adjuster = MenuHandler.append_adjuster();
    adjuster.text_color = ColorHandler.COLOR_THEME_7;
    adjuster.on_adjust = function(adjuster) {
        return function() {
            Editor.x_edit_division = new Fraction(1, adjuster.cur_num);
        }
    }(adjuster);
    adjuster.change_number = function(old, positive) {
        let list = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 27, 32, 36, 54, 64];
        let index = list.indexOf(old);
        if (positive) index = index + 1;
        else index = index - 1;
        if (index > list.length - 1) index = list.length - 1;
        if (index < 0) index = 0;
        return list[index];
    };
    adjuster.on_adjust();

    MenuHandler.append_interval();

    // time buttons.
    button = MenuHandler.append_button();
    MenuHandler.button_times[MenuHandler.TIME_PLAY] = button;
    button.add_on_draw(MenuHandler.draw_time_play(button));
    button.on_click = function() { MenuHandler.set_time_playing(!AudioHandler.playing); };

    button = MenuHandler.append_button();
    MenuHandler.button_times[MenuHandler.TIME_LEFT] = button;
    button.add_on_draw(MenuHandler.draw_time_left(button));
    button.on_click = function() {
        MenuHandler.set_time_playing(false);
        Editor.play_x = 0;
    };

    button = MenuHandler.append_button();
    button.add_on_draw(MenuHandler.draw_time_center(button));
    MenuHandler.button_times[MenuHandler.TIME_CENTER] = button;
    button.on_click = function() {
        MenuHandler.set_time_playing(false);
        Editor.play_x = Editor.selected_x;
    };

    return panel;
};

MenuHandler.append_interval = function() { MenuHandler.next_element_offset = MenuHandler.next_element_offset + MenuHandler.MENU_INTERVAL; };
MenuHandler.append_button = function() {
    let button = {};
    PanelHandler.panelize(button);
    ButtonHandler.buttonlize(button);
    MenuHandler.panel.add_child(button);

    button.size = new Point2(MenuHandler.MENU_BUTTON_SIZE, MenuHandler.MENU_BUTTON_SIZE);
    button.position = new Point2(MenuHandler.next_element_offset, MenuHandler.MENU_INTERVAL);
    MenuHandler.next_element_offset = MenuHandler.next_element_offset + MenuHandler.MENU_BUTTON_SIZE;

    button.fillcolors[ButtonHandler.BUTTON_STATIC] = ColorHandler.COLOR_THEME_5;
    button.fillcolors[ButtonHandler.BUTTON_HOVER] = ColorHandler.COLOR_THEME_6;
    button.fillcolors[ButtonHandler.BUTTON_PRESS] = ColorHandler.COLOR_THEME_7;
    button.fillcolors[ButtonHandler.BUTTON_ACTIVE] = ColorHandler.COLOR_THEME_4;
    button.change_state(ButtonHandler.BUTTON_STATIC);

    return button;
};

MenuHandler.append_adjuster = function() {
    let adjuster = MenuHandler.append_button();

    adjuster.fillcolors[ButtonHandler.BUTTON_STATIC] = ColorHandler.COLOR_THEME_0;
    adjuster.fillcolors[ButtonHandler.BUTTON_HOVER] = ColorHandler.COLOR_THEME_3;
    adjuster.fillcolors[ButtonHandler.BUTTON_PRESS] = ColorHandler.COLOR_THEME_3;
    adjuster.change_state(ButtonHandler.BUTTON_STATIC);

    adjuster.cur_num = 4;

    adjuster.on_adjust = null;
    adjuster.change_number = function(old, positive) {
        if (positive) return old + 1;
        else return old - 1;
    };
    adjuster.add_mouse_event(function(key, type, special) {
        let inside = adjuster.inside(EventHandler.mouse_position);
        if (key == EventHandler.MOUSE_MIDDLE_BUTTON && type == EventHandler.MOUSE_MOVE && inside) {
            let new_num = adjuster.change_number(adjuster.cur_num, special < 0);
            let old_num = adjuster.cur_num;
            adjuster.cur_num = new_num;
            if (old_num != new_num) adjuster.on_adjust();
        }
    });

    adjuster.text_color = null;
    adjuster.add_on_draw(function(ctxw) {
        if (!adjuster.text_color) return;
        let num = adjuster.cur_num;
        let digits = 0;
        while (num > 0) {
            num = Math.floor(num / 10);
            digits = digits + 1;
        }
        if (digits < 0) digits = 1;

        let area = adjuster.size.mul(0.8);
        let font_size = area.y;
        if (font_size > area.x / digits * 2) font_size = area.x / digits * 2;
        let font_area = new Point2(font_size * digits / 2, font_size);
        let offset = adjuster.size.sub(font_area).div(2);
        TextHandler.draw_in_row(ctxw.ctx, adjuster.position.add(offset), "Arial", font_size, false, adjuster.text_color, null, false, adjuster.cur_num.toString());
    });

    return adjuster;
};

/*******************************\
*                               *
*         menu function         *
*                               *
\*******************************/

MenuHandler.select_tool = function(tool_key) {
    if (Editor.current_tool == tool_key)
        return;
    if (Editor.current_tool == MenuHandler.TOOL_DRAW)
        InstrumentHandler.select_instrument(null);


    Editor.current_tool = null;
    let button;
    for (let i in MenuHandler.button_tools) {
        button = MenuHandler.button_tools[i];
        if (tool_key == i) {
            Editor.clear_selected();
            Editor.referenced_bar = null;
            Editor.current_tool = tool_key;
            button.change_state(ButtonHandler.BUTTON_ACTIVE);
        }
        else
            button.change_state(ButtonHandler.BUTTON_STATIC);
    }
};
MenuHandler.set_time_playing = function(playing) {
    AudioHandler.set_playing(playing);
    let button = MenuHandler.button_times[MenuHandler.TIME_PLAY];
    if (AudioHandler.playing)
        button.fillcolors[ButtonHandler.BUTTON_STATIC] = ColorHandler.COLOR_THEME_4;
    else
        button.fillcolors[ButtonHandler.BUTTON_STATIC] = ColorHandler.COLOR_THEME_5;
};

/*******************************\
*                               *
*          draw things          *
*                               *
\*******************************/

MenuHandler.draw_file_new = function(button) {
    return function(ctxw) {
        ctxw.draw_shape([
            new Point2(button.size.x * 0.25, button.size.y * 0.50),
            new Point2(button.size.x * 0.50, button.size.y * 0.50),
            new Point2(button.size.x * 0.50, button.size.y * 0.25),
            new Point2(button.size.x * 0.75, button.size.y * 0.25),
            new Point2(button.size.x * 0.75, button.size.y * 0.75),
            new Point2(button.size.x * 0.25, button.size.y * 0.75),
            new Point2(button.size.x * 0.25, button.size.y * 0.50),
            new Point2(button.size.x * 0.50, button.size.y * 0.25)
        ].map(function(old) {
            return old.add(button.position);
        }), false, null, ColorHandler.COLOR_THEME_2, 2);
    };
};
MenuHandler.draw_file_open = function(button) {
    return function(ctxw) {
        ctxw.draw_shape([
            new Point2(button.size.x * 0.25, button.size.y * 0.25),
            new Point2(button.size.x * 0.50, button.size.y * 0.25),
            new Point2(button.size.x * 0.50, button.size.y * 0.375),
            new Point2(button.size.x * 0.75, button.size.y * 0.375),
            new Point2(button.size.x * 0.75, button.size.y * 0.75),
            new Point2(button.size.x * 0.25, button.size.y * 0.75)
        ].map(function(old) {
            return old.add(button.position);
        }), true, null, ColorHandler.COLOR_THEME_2, 2);
    };
};
MenuHandler.draw_file_save = function(button) {
    return function(ctxw) {
        ctxw.draw_shape([
            new Point2(button.size.x * 0.375, button.size.y * 0.250),
            new Point2(button.size.x * 0.375, button.size.y * 0.375),
            new Point2(button.size.x * 0.625, button.size.y * 0.375),
            new Point2(button.size.x * 0.625, button.size.y * 0.250),
            new Point2(button.size.x * 0.750, button.size.y * 0.250),
            new Point2(button.size.x * 0.750, button.size.y * 0.750),
            new Point2(button.size.x * 0.250, button.size.y * 0.750),
            new Point2(button.size.x * 0.250, button.size.y * 0.250),
            new Point2(button.size.x * 0.625, button.size.y * 0.250)
        ].map(function(old) {
            return old.add(button.position);
        }), false, null, ColorHandler.COLOR_THEME_2, 2);
    };
};
MenuHandler.draw_tool_draw = function(button) {
    return function(ctxw) {
        let color = ColorHandler.COLOR_THEME_2;
        if (button.state == ButtonHandler.BUTTON_ACTIVE) color = ColorHandler.COLOR_THEME_5;
        ctxw.draw_shape([
            new Point2(button.size.x * 0.6, button.size.y * 0.2),
            new Point2(button.size.x * 0.8, button.size.y * 0.4),
            new Point2(button.size.x * 0.4, button.size.y * 0.8),
            new Point2(button.size.x * 0.2, button.size.y * 0.8),
            new Point2(button.size.x * 0.2, button.size.y * 0.6)
        ].map(function(old) {
            return old.add(button.position);
        }), true, null, color, 2);
    };
};
MenuHandler.draw_tool_select = function(button) {
    return function(ctxw) {
        let points = [];
        let N = 6;
        for (let i = 1; i < N - 1; i ++) points.push(new Point2(button.size.x * i      , button.size.y * 1      ).div(N));
        for (let i = 1; i < N - 1; i ++) points.push(new Point2(button.size.x * (N - 1), button.size.y * i      ).div(N));
        for (let i = 1; i < N - 1; i ++) points.push(new Point2(button.size.x * (N - i), button.size.y * (N - 1)).div(N));
        for (let i = 1; i < N - 1; i ++) points.push(new Point2(button.size.x * 1      , button.size.y * (N - i)).div(N));
        points = points.map(function(old) { return old.add(button.position); });

        let color = ColorHandler.COLOR_THEME_2;
        if (button.state == ButtonHandler.BUTTON_ACTIVE) color = ColorHandler.COLOR_THEME_5;
        for (let i = 0; i < points.length; i++)
            if (i % 2)
                ctxw.draw_line(points[i - 1], points[i], color, 2);
    };
};
MenuHandler.draw_tool_base = function(button) {
    return function(ctxw) {
        let p1 = new Point2(button.size.x * 0.25, button.size.y * 0.5).add(button.position);
        let p2 = new Point2(button.size.x * 0.75, button.size.y * 0.5).add(button.position);
        ctxw.draw_line(p1, p2, ColorHandler.COLOR_BASE, 2);
    };
};

MenuHandler.draw_time_play = function(button) {
    return function(ctxw) {
        if (AudioHandler.playing) {
            ctxw.draw_shape([
                new Point2(button.size.x * 0.2, button.size.y * 0.2),
                new Point2(button.size.x * 0.4, button.size.y * 0.2),
                new Point2(button.size.x * 0.4, button.size.y * 0.8),
                new Point2(button.size.x * 0.2, button.size.y * 0.8)
            ].map(function(old) {
                return old.add(button.position);
            }), true, ColorHandler.COLOR_THEME_5);
            ctxw.draw_shape([
                new Point2(button.size.x * 0.6, button.size.y * 0.2),
                new Point2(button.size.x * 0.8, button.size.y * 0.2),
                new Point2(button.size.x * 0.8, button.size.y * 0.8),
                new Point2(button.size.x * 0.6, button.size.y * 0.8)
            ].map(function(old) {
                return old.add(button.position);
            }), true, ColorHandler.COLOR_THEME_5);
        }
        else
            ctxw.draw_shape([
                new Point2(button.size.x * 0.25, button.size.y * 0.25),
                new Point2(button.size.x * 0.75, button.size.y * 0.50),
                new Point2(button.size.x * 0.25, button.size.y * 0.75)
            ].map(function(old) {
                return old.add(button.position);
            }), true, ColorHandler.COLOR_THEME_2);
    };
};
MenuHandler.draw_time_left = function(button) {
    return function(ctxw) {
        ctxw.draw_shape([
            new Point2(button.size.x * 0.75, button.size.y * 0.25),
            new Point2(button.size.x * 0.75, button.size.y * 0.75),
            new Point2(button.size.x * 0.25, button.size.y * 0.50)
        ].map(function(old) {
            return old.add(button.position);
        }), true, ColorHandler.COLOR_THEME_2);
        ctxw.draw_line(
            button.position.add(new Point2(button.size.x * 0.25, button.size.y * 0.25)),
            button.position.add(new Point2(button.size.x * 0.25, button.size.y * 0.75)),
            ColorHandler.COLOR_THEME_2, 2);
    };
};
MenuHandler.draw_time_center = function(button) {
    return function(ctxw) {
        ctxw.draw_shape([
            new Point2(button.size.x * 0.25, button.size.y * 0.25),
            new Point2(button.size.x * 0.75, button.size.y * 0.75),
            new Point2(button.size.x * 0.75, button.size.y * 0.25),
            new Point2(button.size.x * 0.25, button.size.y * 0.75)
        ].map(function(old) {
            return old.add(button.position);
        }), true, ColorHandler.COLOR_THEME_2);
        ctxw.draw_line(
            button.position.add(new Point2(button.size.x * 0.5, button.size.y * 0.25)),
            button.position.add(new Point2(button.size.x * 0.5, button.size.y * 0.75)),
        ColorHandler.COLOR_THEME_2, 2);
    };
};