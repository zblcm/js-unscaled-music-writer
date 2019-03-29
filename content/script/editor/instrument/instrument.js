var InstrumentHandler = {};
InstrumentHandler.CONTAINER_WIDTH = 250;
InstrumentHandler.SINE_SINTRUMENT = "SINE";

InstrumentHandler.instruments = [];
InstrumentHandler.create_container = function() {
    let panel = {};
    InstrumentHandler.panel = panel;
    PanelHandler.panelize(panel);
    panel.fillcolor = ColorHandler.COLOR_THEME_2;
    panel.add_on_resize(function() {
        panel.position = new Point2(0, MenuHandler.MENU_HEIGHT);
        panel.size = new Point2(InstrumentHandler.CONTAINER_WIDTH, DoubleBuff.size.y - MenuHandler.MENU_HEIGHT);
    });
    return panel;
};

InstrumentHandler.new_instrument = function(source) {
    let instrument = {};
    instrument.source = source;

    instrument.create_panel = function() {
        let panel = {};
        instrument.panel = panel;
        panel.instrument = instrument;
        PanelHandler.panelize(panel);

        panel.fillcolor = ColorHandler.COLOR_THEME_2;
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
                o1.frequency.value = freq;
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

    instrument.create_panel();
    instrument.create_play_function();

    return instrument;
};