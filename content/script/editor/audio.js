var AudioHandler = {};

AudioHandler.init = function() {
    AudioHandler.context = new AudioContext();
};

AudioHandler.load = function(src, callback) {
    let request = new XMLHttpRequest();
    request.open('GET', src, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
        AudioHandler.context.decodeAudioData(request.response, function(buffer) {
            callback(buffer);
        });
    };
    request.send();
};

AudioHandler.analyze = function(buffer) {
    let OFFSET = 20000;
    let FREQ = 440;
    let channel_0_data = AudioHandler.analyze_instrument(buffer.getChannelData(0), FREQ, buffer.sampleRate, OFFSET, Math.floor(buffer.sampleRate * 10 / 440));
};

AudioHandler.instrument_data = function(period) {
    this.period = period;
    this.nodes = [];
    this.insert = function(time, amplitude) {
        let node = new AudioHandler.instrument_node(this, General.fit(time, this.period), amplitude);
        this.nodes.push(node);
    };
    this.analyze = function(maximum) {
        this.nodes.sort(function(a, b) {
            return a.time - b.time;
        });

        // Prebuild array
        let an = [];
        let bn = [];
        let n = 0;
        while (n < maximum) {
            an.push(0);
            bn.push(0);
            n = n + 1;
        }

        // Analyse fourier
        let s_time;
        let e_time;
        let s_amp;
        let e_amp;
        let d;
        let t;
        let p2p = Math.PI * 2 / this.period;

        ct = 0;
        while (ct < this.nodes.length) {
            s_amp = this.nodes[ct].amplitude;
            s_time = this.nodes[ct].time;
            if (ct + 1 == this.nodes.length) {
                e_amp = this.nodes[0].amplitude;
                e_time = this.period;
            }
            else {
                e_amp = this.nodes[ct + 1].amplitude;
                e_time = this.nodes[ct + 1].time;
            }
            t = e_time - s_time;

            n = 0;
            while ((n < maximum) && (t > 0)) {
                an[n] = an[n] + (((s_amp * Math.cos(p2p * n * s_time)) + (e_amp * Math.cos(p2p * n * e_time))) * t / 2);
                bn[n] = bn[n] + (((s_amp * Math.sin(p2p * n * s_time)) + (e_amp * Math.sin(p2p * n * e_time))) * t / 2);
                n = n + 1;
            }
            ct = ct + 1;
        }

        n = 1;
        while (n < maximum) {
            an[n] = an[n] * (2 / this.period);
            bn[n] = bn[n] * (2 / this.period);
            n = n + 1;
        }

        console.log(an);
        console.log(bn);

        AudioHandler.play(an, bn, 235.246, 2, 4);
        AudioHandler.play(an, bn, 329.628, 2, 4);
        AudioHandler.play(an, bn, 391.995, 2, 4);

    };
};
AudioHandler.instrument_node = function(instrument, time, amplitude) {
    this.instrument = instrument;
    this.time = time;
    this.amplitude = amplitude;
};

AudioHandler.analyze_instrument = function(channel, frequency, sample_rate, start_position, duration) {
    let p_sample = 1 / sample_rate;
    let instrument = new AudioHandler.instrument_data(1 / frequency);
    let t_sample = 0;
    let count = start_position;

    while (count < start_position + duration) {
        instrument.insert(t_sample, channel[count]);
        t_sample = t_sample + p_sample;
        count = count + 1;
    }
    instrument.analyze(1100);
};

AudioHandler.play = function(real_r, imag_r, freq, duration, fade) {
    let g = AudioHandler;
    g = AudioHandler.context.createGain();
    g.connect(AudioHandler.context.destination);
    g.gain.exponentialRampToValueAtTime(0.0000001, AudioHandler.context.currentTime + fade);

    let o1 = AudioHandler.context.createOscillator();
    let real = new Float32Array(real_r.length);
    let imag = new Float32Array(imag_r.length);
    let i;
    for (i in real_r) { real[i] = real_r[i]; }
    for (i in imag_r) { imag[i] = imag_r[i]; }

    let wave = AudioHandler.context.createPeriodicWave(real, imag, {disableNormalization: true});
    o1.setPeriodicWave(wave);

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
};