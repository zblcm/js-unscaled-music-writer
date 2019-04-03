var InstrumentHandler = {};
InstrumentHandler.ELEMENT_WIDTH = 250;
InstrumentHandler.CONTAINER_PADDING = 15;
InstrumentHandler.ELEMENT_HEIGHT = 20;
InstrumentHandler.ELEMENT_INTERVAL = 5;

InstrumentHandler.DEFAULT_INSTRUMENTS = {};
InstrumentHandler.DEFAULT_INSTRUMENTS.SINE      = "SINE";
InstrumentHandler.DEFAULT_INSTRUMENTS.SQUARE    = "SQUARE";
InstrumentHandler.DEFAULT_INSTRUMENTS.SAWTOOTH  = "SAWTOOTH";
InstrumentHandler.DEFAULT_INSTRUMENTS.TRIANGLE  = "TRIANGLE";

InstrumentHandler.default_instrument_oscillator_types = {};
InstrumentHandler.default_instrument_oscillator_types[InstrumentHandler.DEFAULT_INSTRUMENTS.SINE]       = "sine";
InstrumentHandler.default_instrument_oscillator_types[InstrumentHandler.DEFAULT_INSTRUMENTS.SQUARE]     = "square";
InstrumentHandler.default_instrument_oscillator_types[InstrumentHandler.DEFAULT_INSTRUMENTS.SAWTOOTH]   = "sawtooth";
InstrumentHandler.default_instrument_oscillator_types[InstrumentHandler.DEFAULT_INSTRUMENTS.TRIANGLE]   = "triangle";

InstrumentHandler.default_instrument_names = {};
InstrumentHandler.default_instrument_names[InstrumentHandler.DEFAULT_INSTRUMENTS.SINE]       = "正弦波";
InstrumentHandler.default_instrument_names[InstrumentHandler.DEFAULT_INSTRUMENTS.SQUARE]     = "方形波";
InstrumentHandler.default_instrument_names[InstrumentHandler.DEFAULT_INSTRUMENTS.SAWTOOTH]   = "单调波";
InstrumentHandler.default_instrument_names[InstrumentHandler.DEFAULT_INSTRUMENTS.TRIANGLE]   = "三角波";

InstrumentHandler.init = function() {
    InstrumentHandler.CONTAINER_WIDTH = InstrumentHandler.ELEMENT_WIDTH + (3 * InstrumentHandler.CONTAINER_PADDING) + ScrollHandler.WIDTH;
    InstrumentHandler.instruments = [];
    InstrumentHandler.canvas = document.createElement("canvas");
    InstrumentHandler.canvas.wraper = new Canvas_wraper(InstrumentHandler.canvas);
    InstrumentHandler.offset_y = 0;
    InstrumentHandler.active_instrument = null;
};

InstrumentHandler.create_container = function() {
    let create_panel = function() {
        let panel = {};
        InstrumentHandler.panel = panel;
        PanelHandler.panelize(panel);

        panel.position = new Point2(0, MenuHandler.MENU_HEIGHT);
        panel.fillcolor = ColorHandler.COLOR_THEME_2;

        panel.add_on_resize(function() {
            panel.size = new Point2(InstrumentHandler.ELEMENT_WIDTH + ScrollHandler.WIDTH + (3 * InstrumentHandler.CONTAINER_PADDING), DoubleBuff.size.y - MenuHandler.MENU_HEIGHT);
            InstrumentHandler.scroll_bar.update_size();
            InstrumentHandler.content_panel.size = new Point2(InstrumentHandler.ELEMENT_WIDTH, DoubleBuff.size.y - MenuHandler.MENU_HEIGHT - (2 * InstrumentHandler.CONTAINER_PADDING));
            InstrumentHandler.scroll_bar.update_size(InstrumentHandler.imagine_size_y, InstrumentHandler.content_panel.size.y, InstrumentHandler.content_panel.size.y);
        });

        return panel;
    };

    let create_content = function() {
        let content = {};
        InstrumentHandler.content_panel = content;
        InstrumentHandler.panel.add_child(content);
        PanelHandler.panelize(content);

        content.position = new Point2(InstrumentHandler.CONTAINER_PADDING, MenuHandler.MENU_HEIGHT + InstrumentHandler.CONTAINER_PADDING);
        content.fillcolor = null;

        content.add_on_draw(function(ctxw) {
            InstrumentHandler.canvas.wraper.clear();
            content.draw_content(InstrumentHandler.canvas.wraper);
            ctxw.draw_image(InstrumentHandler.canvas, content.position);
        });

        content.draw_content = function(ctxw) {
            for (let i in InstrumentHandler.instruments)
                InstrumentHandler.instruments[i].panel.draw_content(ctxw);
        };

        content.add_mouse_event(function(type, key, special) {
            let inside = content.inside(EventHandler.mouse_position);
            if (inside || (type != EventHandler.EVENT_MOUSE_DOWN)) {
                for (let i in InstrumentHandler.instruments)
                    InstrumentHandler.instruments[i].panel.mouse_event(type, key, special);
            }
        });

        content.add_on_resize(function() { InstrumentHandler.canvas.wraper.set_size(content.size); });
    };

    let create_scroll_bar = function() {
        let scroll_bar = ScrollHandler.new_scroll(false);
        InstrumentHandler.scroll_bar = scroll_bar;
        InstrumentHandler.panel.add_child(scroll_bar);

        scroll_bar.position = new Point2(InstrumentHandler.ELEMENT_WIDTH + (2 * InstrumentHandler.CONTAINER_PADDING), MenuHandler.MENU_HEIGHT + InstrumentHandler.CONTAINER_PADDING);
        scroll_bar.fillcolor = ColorHandler.COLOR_THEME_4;
        scroll_bar.drager.fillcolors[ButtonHandler.BUTTON_STATIC] = ColorHandler.COLOR_THEME_5;
        scroll_bar.drager.fillcolors[ButtonHandler.BUTTON_HOVER] = ColorHandler.COLOR_THEME_6;
        scroll_bar.drager.fillcolors[ButtonHandler.BUTTON_PRESS] = ColorHandler.COLOR_THEME_7;

        scroll_bar.on_scroll = function(ratio) {
            InstrumentHandler.offset_y = ratio * (InstrumentHandler.imagine_size_y - InstrumentHandler.content_panel.size.y);
            InstrumentHandler.update_instrument_panels(false);
        };

        scroll_bar.drager.change_state([ButtonHandler.BUTTON_STATIC]);
    };

    create_panel();
    create_content();
    create_scroll_bar();

    InstrumentHandler.update_instrument_panels = function(resize) {
        let accumulate_y = 0;
        for (let i in InstrumentHandler.instruments) {
            let instrument = InstrumentHandler.instruments[i];
            instrument.panel.position = new Point2(InstrumentHandler.content_panel.position.x, InstrumentHandler.content_panel.position.y + accumulate_y - InstrumentHandler.offset_y);
            instrument.panel.on_update_position();
            accumulate_y = accumulate_y + instrument.panel.size.y + InstrumentHandler.CONTAINER_PADDING;
        }
        if (resize) {
            InstrumentHandler.imagine_size_y = accumulate_y - InstrumentHandler.CONTAINER_PADDING;
            if (InstrumentHandler.imagine_size_y < 0) InstrumentHandler.imagine_size_y = 0;
            InstrumentHandler.scroll_bar.update_size(InstrumentHandler.imagine_size_y, InstrumentHandler.content_panel.size.y, InstrumentHandler.scroll_bar.size.y);
        }
    };

    InstrumentHandler.abs_to_draw = function(p) { return p.sub(InstrumentHandler.content_panel.position); }
};

InstrumentHandler.new_instrument = function(source) {
    let instrument = {};
    instrument.source = source;
    instrument.selected = false;

    instrument.is_default = function() {
        for (let i in InstrumentHandler.DEFAULT_INSTRUMENTS)
            if (InstrumentHandler.DEFAULT_INSTRUMENTS[i] == instrument.source)
                return true;
        return false;
    };

    if (instrument.is_default())
        instrument.name = InstrumentHandler.default_instrument_names[instrument.source];
    else
        instrument.name = "File";
    instrument.color = new Color(Math.random(), Math.random(), Math.random(), 1);

    instrument.create_panel = function() {
        let panel = {};
        instrument.panel = panel;
        panel.instrument = instrument;

        PanelHandler.panelize(panel);
        ButtonHandler.buttonlize(panel);

        panel.expanded = false;
        panel.fillcolors[ButtonHandler.BUTTON_STATIC] = ColorHandler.COLOR_THEME_5;
        panel.fillcolors[ButtonHandler.BUTTON_HOVER] = ColorHandler.COLOR_THEME_6;
        panel.fillcolors[ButtonHandler.BUTTON_PRESS] = ColorHandler.COLOR_THEME_7;
        panel.fillcolors[ButtonHandler.BUTTON_ACTIVE] = ColorHandler.COLOR_THEME_4;

        let old_inside = panel.inside;
        panel.inside = function(p) {
            if (panel.color_button.inside(p)) return false;
            if (instrument.panel.delete_button && panel.delete_button.inside(p)) return false;
            return old_inside(p);
        };

        panel.on_update_position = function() {
            instrument.panel.color_button.update_position();
            if (instrument.panel.delete_button) instrument.panel.delete_button.update_position();
        };

        panel.draw_content = function(ctxw) {
            ctxw.draw_rect(InstrumentHandler.abs_to_draw(panel.position), panel.size, panel.fillcolor);
            TextHandler.draw_in_row(
                ctxw.ctx,
                InstrumentHandler.abs_to_draw(panel.position).add(new Point2((InstrumentHandler.ELEMENT_INTERVAL * 2) + InstrumentHandler.ELEMENT_HEIGHT, InstrumentHandler.ELEMENT_INTERVAL)),
                "幼圆",
                InstrumentHandler.ELEMENT_HEIGHT,
                false,
                ColorHandler.COLOR_THEME_2,
                null,
                false,
                instrument.name
            );
            instrument.panel.color_button.draw_content(ctxw);
            if (instrument.panel.delete_button) instrument.panel.delete_button.draw_content(ctxw);
        };

        panel.add_mouse_event(function(type, key, special) {
            instrument.panel.color_button.mouse_event(type, key, special);
            if (instrument.panel.delete_button) instrument.panel.delete_button.mouse_event(type, key, special);
        });

        panel.set_expand = function(expand) {
            panel.expanded = expand;
            if (panel.expanded) panel.size = new Point2(InstrumentHandler.content_panel.size.x, 100);
            else panel.size = new Point2(InstrumentHandler.content_panel.size.x, (InstrumentHandler.ELEMENT_INTERVAL * 2) + InstrumentHandler.ELEMENT_HEIGHT);

            InstrumentHandler.update_instrument_panels(true);
        };

        panel.on_click = function() { InstrumentHandler.select_instrument(instrument); };

        panel.change_state(ButtonHandler.BUTTON_STATIC);

        return panel;
    };

    instrument.create_buttons = function () {
        let create_color_button = function() {
            let button = {};
            instrument.panel.color_button = button;
            PanelHandler.panelize(button);
            ButtonHandler.buttonlize(button);

            button.radius = InstrumentHandler.ELEMENT_HEIGHT / 2;

            button.update_position = function() {
                button.position = instrument.panel.position.add(new Point2(InstrumentHandler.ELEMENT_INTERVAL + button.radius, InstrumentHandler.ELEMENT_INTERVAL + button.radius));
            };

            button.draw_content = function(ctxw) { ctxw.draw_circle(InstrumentHandler.abs_to_draw(button.position), button.radius, instrument.color); };

            return button;
        };

        let create_delete_button = function() {
            let button = {};
            instrument.panel.delete_button = button;
            PanelHandler.panelize(button);
            ButtonHandler.buttonlize(button);

            button.fillcolors[ButtonHandler.BUTTON_HOVER] = ColorHandler.COLOR_THEME_6;
            button.fillcolors[ButtonHandler.BUTTON_PRESS] = ColorHandler.COLOR_THEME_7;
            button.radius = InstrumentHandler.ELEMENT_HEIGHT / 2;

            button.inside = function (p) { return p.sub(button.position).length() < button.radius };

            button.update_position = function() {
                button.position = new Point2(instrument.panel.position.x + instrument.panel.size.x - (3 * (InstrumentHandler.ELEMENT_HEIGHT + InstrumentHandler.ELEMENT_INTERVAL)) + button.radius, instrument.panel.position.y + InstrumentHandler.ELEMENT_INTERVAL + button.radius);
            };

            button.draw_content = function(ctxw) {
                ctxw.draw_circle(InstrumentHandler.abs_to_draw(button.position), button.radius, button.fillcolor);

                let WIDTH = 2;
                let LENGTH = button.radius / 2;
                ctxw.draw_shape([
                    new Point2(- WIDTH, 0),
                    new Point2(- LENGTH, - LENGTH + WIDTH),
                    new Point2(- LENGTH + WIDTH, - LENGTH),
                    new Point2(0, - WIDTH),
                    new Point2(  LENGTH - WIDTH, - LENGTH),
                    new Point2(  LENGTH, - LENGTH + WIDTH),
                    new Point2(  WIDTH, 0),
                    new Point2(  LENGTH,   LENGTH - WIDTH),
                    new Point2(  LENGTH - WIDTH, + LENGTH),
                    new Point2(0,   WIDTH),
                    new Point2(- LENGTH + WIDTH,   LENGTH),
                    new Point2(- LENGTH,   LENGTH - WIDTH),
                ].map(function(p) {
                    return InstrumentHandler.abs_to_draw(p.add(button.position));
                }), true, new Color(1, 0, 0, 1));
            };
            button.on_click = function() { instrument.remove(); };

            button.change_state(ButtonHandler.BUTTON_STATIC);

            return button;
        };

        let create_expand_button = function() {
        };

        create_color_button();
        if (!instrument.is_default())
            create_delete_button();
    };

    instrument.create_play_function = function() {
        // Sine Wave.
        if (instrument.is_default()) {
            instrument.play = function() {
                let g = AudioHandler.context.createGain();
                g.connect(AudioHandler.context.destination);

                let o1 = AudioHandler.context.createOscillator();
                o1.type = InstrumentHandler.default_instrument_oscillator_types[instrument.source];
                o1.connect(g);

                return {
                    o_node: o1,
                    g_node: g
                };
            }
        }
        // Instrument from file.
        else {

        }
    };

    instrument.set_select = function(selected) {
        let button_static_color;
        if (selected) {
            instrument.panel.change_state(ButtonHandler.BUTTON_ACTIVE);
            button_static_color = ColorHandler.COLOR_THEME_5;
        }
        else {
            instrument.panel.change_state(ButtonHandler.BUTTON_STATIC);
            button_static_color = ColorHandler.COLOR_THEME_4;
        }
        if (instrument.panel.delete_button) {
            instrument.panel.delete_button.fillcolors[ButtonHandler.BUTTON_STATIC] = button_static_color;
            instrument.panel.delete_button.change_state(instrument.panel.delete_button.state);
        }
    };

    instrument.remove = function() {
        General.array_remove(InstrumentHandler.instruments, instrument);
        if (InstrumentHandler.active_instrument == instrument)
            InstrumentHandler.select_instrument(null);
        InstrumentHandler.update_instrument_panels(true);
    };

    instrument.create_panel();
    instrument.create_buttons();
    instrument.create_play_function();

    InstrumentHandler.instruments.push(instrument);
    instrument.panel.set_expand(false);
    instrument.set_select(false);

    return instrument;
};

InstrumentHandler.select_instrument = function(instrument) {
    InstrumentHandler.active_instrument = instrument;
    if (instrument) MenuHandler.select_tool(MenuHandler.TOOL_DRAW);
    for (let i in InstrumentHandler.instruments)
        InstrumentHandler.instruments[i].set_select(InstrumentHandler.instruments[i] == instrument);
};