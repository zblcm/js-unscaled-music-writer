var InstrumentHandler = {};
InstrumentHandler.CONTAINER_WIDTH = 265;
InstrumentHandler.CONTAINER_PADDING = 15;
InstrumentHandler.ELEMENT_HEIGHT = 20;
InstrumentHandler.ELEMENT_INTERVAL = 5;
InstrumentHandler.SINE_SINTRUMENT = "SINE";

InstrumentHandler.init = function() {
    InstrumentHandler.instruments = [];
    InstrumentHandler.canvas = document.createElement("canvas");
    InstrumentHandler.canvas.wraper = new Canvas_wraper(InstrumentHandler.canvas);
    InstrumentHandler.offset_y = 0;
};


InstrumentHandler.create_container = function() {
    let create_panel = function() {
        let panel = {};
        InstrumentHandler.panel = panel;
        PanelHandler.panelize(panel);

        panel.position = new Point2(0, MenuHandler.MENU_HEIGHT);
        panel.fillcolor = ColorHandler.COLOR_THEME_2;

        panel.add_on_resize(function() {
            panel.size = new Point2(InstrumentHandler.CONTAINER_WIDTH, DoubleBuff.size.y - MenuHandler.MENU_HEIGHT);
            InstrumentHandler.scroll_bar.update_size();
            InstrumentHandler.content_panel.size = new Point2(InstrumentHandler.CONTAINER_WIDTH - ScrollHandler.WIDTH - (3 * InstrumentHandler.CONTAINER_PADDING), DoubleBuff.size.y - MenuHandler.MENU_HEIGHT - (2 * InstrumentHandler.CONTAINER_PADDING));
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
            if (inside || (type != EventHandler.MOUSE_DOWN)) {
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

        scroll_bar.position = new Point2(InstrumentHandler.CONTAINER_WIDTH - ScrollHandler.WIDTH - InstrumentHandler.CONTAINER_PADDING, MenuHandler.MENU_HEIGHT + InstrumentHandler.CONTAINER_PADDING);
        scroll_bar.fillcolor = ColorHandler.COLOR_THEME_4;
        scroll_bar.drager.fillcolors[ButtonHandler.BUTTON_STATIC] = ColorHandler.COLOR_THEME_5;
        scroll_bar.drager.fillcolors[ButtonHandler.BUTTON_HOVER] = ColorHandler.COLOR_THEME_6;
        scroll_bar.drager.fillcolors[ButtonHandler.BUTTON_PRESS] = ColorHandler.COLOR_THEME_7;

        scroll_bar.on_scroll = function(ratio) {
            InstrumentHandler.offset_y = ratio * (InstrumentHandler.imagine_size_y - InstrumentHandler.content_panel.size.y);
            InstrumentHandler.update_instrument_panels(false);
        };
    };

    create_panel();
    create_content();
    create_scroll_bar();

    InstrumentHandler.update_instrument_panels = function(resize) {
        let accumulate_y = 0;
        for (let i in InstrumentHandler.instruments) {
            let instrument = InstrumentHandler.instruments[i];
            instrument.panel.position = new Point2(InstrumentHandler.content_panel.position.x, InstrumentHandler.content_panel.position.y + accumulate_y - InstrumentHandler.offset_y);
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

    if (instrument.source == InstrumentHandler.SINE_SINTRUMENT)
        instrument.name = "Sine Wave";
    else
        instrument.name = "File";
    instrument.color = new Color(1, 0.5, 0.5, 1);

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

        panel.draw_content = function(ctxw) {
            ctxw.draw_rect(InstrumentHandler.abs_to_draw(panel.position), panel.size, panel.fillcolor);
        };

        panel.add_mouse_event(function(type, key, special) {

        });

        panel.set_expand = function(expand) {
            panel.expanded = expand;
            if (panel.expanded) panel.size = new Point2(InstrumentHandler.content_panel.size.x, 100);
            else panel.size = new Point2(InstrumentHandler.content_panel.size.x, (InstrumentHandler.ELEMENT_INTERVAL * 2) + InstrumentHandler.ELEMENT_HEIGHT);

            InstrumentHandler.update_instrument_panels(true);
        };

        panel.on_click = function() {
            InstrumentHandler.select_instrument(instrument);
        };

        panel.change_state(ButtonHandler.BUTTON_STATIC);

        return panel;
    };

    instrument.create_play_function = function() {
        // Sine Wave.
        if (instrument.source == InstrumentHandler.SINE_SINTRUMENT) {
            instrument.play = function(frequency, amplitude, duration, fade) {
                let g = AudioHandler.context.createGain();
                g.connect(AudioHandler.context.destination);
                g.gain.value = amplitude;
                if (fade) g.gain.exponentialRampToValueAtTime(fade, AudioHandler.context.currentTime + duration);

                let o1 = AudioHandler.context.createOscillator();
                o1.type = 'sine';
                o1.frequency.value = frequency;
                o1.connect(g);
                o1.start(0);

                let k = function (g, duration) {
                    return function() {
                        setTimeout(function(){
                            g.disconnect();
                        }, duration * 1000);
                    }
                }(g, duration)();

                return {
                    oscillator: o1,
                    gain:       g,
                    time_event: k
                };
            }
        }
        // Instrument from file.
        else {

        }
    };

    instrument.set_select = function(selected) {
        if (selected)
            instrument.panel.change_state(ButtonHandler.BUTTON_ACTIVE);
        else
            instrument.panel.change_state(ButtonHandler.BUTTON_STATIC);

    };

    instrument.create_panel();
    instrument.create_play_function();

    InstrumentHandler.instruments.push(instrument);
    instrument.panel.set_expand(false);

    return instrument;
};

InstrumentHandler.select_instrument = function(instrument) {
    InstrumentHandler.active_instrument = instrument;
    for (let i in InstrumentHandler.instruments)
        InstrumentHandler.instruments[i].set_select(InstrumentHandler.instruments[i] == instrument);
};