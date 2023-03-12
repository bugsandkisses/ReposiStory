window.onload = () => {
    const $ = document;

    function getAdj(idx_r, idx_c, dim_r, dim_c) {
        // find adjacent matrix element indices
        let adj = [], idx;
        idx = [idx_r - 1, idx_c]; // up
        if (idx[0] >= 0) adj.push(idx);
        idx = [idx_r + 1, idx_c]; // down
        if (idx[0] < dim_r) adj.push(idx);
        idx = [idx_r, idx_c-1]; // left
        if (idx[1] >= 0) adj.push(idx);
        idx = [idx_r, idx_c+1]; // right
        if (idx[1] < dim_c) adj.push(idx);
        return adj;
    }
    function toggleLight(ev) {
        // toggle light bulbs on and off
        ev.target.classList.toggle('unlit');
        ev.target.classList.toggle('lit');
        let idx = ev.target.value.split(',').map(Number);
        let adj = getAdj(parseInt(idx[0]), parseInt(idx[1]), window.lightsN, window.lightsN);
        let x, y;
        for (let a = 0; a < adj.length; a++) {
            [x, y] = adj[a];
            window.lightsList[x][y].classList.toggle('unlit');
            window.lightsList[x][y].classList.toggle('lit');
        }
    }
    function resetCAPTCHA() {
        // reset lightbulbs and robot checkbox
        const box = $.getElementById('picture-captcha').children;
        for (let idx = 0; idx < box.length; idx++) box[idx].classList = ['unlit'];
        $.getElementById('bot-check').checked = false;
    }
    function isHuman() {
        // if all lights on and box checked
        const valid0 = $.getElementsByClassName('lit').length == (window.lightsN*window.lightsN);
        const valid1 = $.getElementById('bot-check').checked;
        return (valid0 && valid1);
    }

    function setPictureCAPTCHA(where) {
        /*
        Setup the picture CAPTCHA
        */
        where.style.height = where.style.width;
        const box = where.getBoundingClientRect();
        const fieldSize = parseInt(box.width/3);
        let el;
        for (let idx1 = 0; idx1 < window.lightsN; idx1++) {
            const row = [];
            for (let idx2 = 0; idx2 < window.lightsN; idx2++) {
                el = $.createElement('button');
                el.value = `${idx1},${idx2}`;
                el.style.width = el.style.height = `${fieldSize}px`;
                el.classList.add('unlit');
                el.addEventListener('click', function(ev) {
                    toggleLight(ev);
                    if (isHuman()) {
                        $.getElementById('captcha').style.display = 'none';
                        window.animation.delta = window.flickerDelta;
                        window.animation.setPhase(5);
                    }
                });
                where.appendChild(el);
                row.push(el);
            }
            window.lightsList.push(row);
        }
    }

    function postMsg(chat, inputArea, whichIdx) {
        // add nessage to display depending on user
        let msg = window.chatProtocol[whichIdx];
        switch (msg.user) {
            case 'Dea':
                displayMsg(msg.content, '', chat, 'msg-left');
                break;
            case 'Ai':
                displayMsg(msg.content, inputArea, chat, 'msg-right');
                break;
        }
    }
    function typeMsg(content, where) {
        // add character when typing
        where.value += content;
        where.scrollTo(0, where.scrollHeight);
        return where.value.length;
    }
    function displayMsg(content, from, to, rl) {
        /*
        Create and add message to display
        */
        let msg, p;
        msg = $.createElement('article');
        p = $.createElement('p');
        p.textContent = content;
        msg.appendChild(p);
        msg.classList.add('msg');
        msg.classList.add(rl);
        to.appendChild(msg);
        if (from) from.value = '';
    }

    // animation loop
    window.animation = {
        id: 0,
        phase: 0, // current phase/ statr
        delta: 1000, // current time difference to be wiatrd for, ms
        frameCount: 0, // frame counter
        time: 0, // current timestamp
        lastUpdate: undefined, // timestamp of last animation update
        start: function(phase = 0) {
            // start animation loop
            this.setPhase(phase);
            this.time = Date.now();
            this.id = this.run();
        },
        setPhase: function(phase) {
            this.phase = phase;
        },
        run: function() {
            // here the magic happens
            //const timePassed = (this.time - Date.now()) / 1000;
            this.time = Date.now();

            if (typeof this.lastUpdate == "undefined") {
                this.lastUpdate = this.time;
            }

            // phase of the animation
            switch (this.phase) {
                // empty phase
                case 0:
                    break;
                // pre posting phase
                case 1:
                    if (this.time - this.lastUpdate >= this.delta) {
                        this.lastUpdate = this.time;
                        if (window.chatN < window.chatProtocol.length) {
                            (window.chatProtocol[window.chatN]).at = 0;
                            switch ((window.chatProtocol[window.chatN]).user) {
                                case 'Ai':
                                    (window.chatProtocol[window.chatN]).at = 0;
                                    this.delta = (window.chatProtocol[window.chatN]).delayType;
                                    this.setPhase(2);
                                    break;
                                case 'Dea':
                                    this.setPhase(3);
                                    break;
                            }
                        }
                        window.scrollTo(0, $.body.scrollHeight);
                    }
                    break;
                // typing phase
                case 2:
                    // input animation, from here we get to 3 by send-button click event
                    if (this.time - this.lastUpdate >= this.delta) {
                        this.lastUpdate = this.time;
                        const idx = (window.chatProtocol[window.chatN]).at;
                        if (idx < (window.chatProtocol[window.chatN]).content.length) {
                            typeMsg((window.chatProtocol[window.chatN]).content.charAt(idx), $.getElementById('ai-txt'));
                            (window.chatProtocol[window.chatN]).at++;
                        }
                        else {
                            this.delta = (window.chatProtocol[window.chatN]).delayPre;
                            $.getElementById('btn-send').disabled = false;
                            $.getElementById('btn-send').focus();
                            this.setPhase(0); // wait for button click to go to 3
                        }
                    }
                    break;
                // posting phase
                case 3:
                    postMsg($.getElementById('chat'), $.getElementById('ai-txt'), window.chatN);
                    if (window.chatN < window.chatProtocol.length) {
                        this.setPhase(4);
                    }
                    $.getElementById('btn-send').disabled = true;
                    $.getElementById('btn-send').blur();
                    window.scrollTo(0, $.body.scrollHeight);
                    break;
                // typing done phase
                case 4:
                    this.lastUpdate = this.time;
                    window.chatN++;

                    if (window.chatN < window.chatProtocol.length) {
                        this.delta = (window.chatProtocol[window.chatN]).delayPre;
                        this.setPhase(1);
                    }
                    else {
                        this.setPhase(5);
                        this.delta = window.flickerDelta;
                    }
                    break;
                // flicker: show error
                case 5:
                    if (this.time - this.lastUpdate >= this.delta) {
                        this.lastUpdate = this.time;
                        $.getElementById('err').style.display = 'flex';
                        this.setPhase(6);
                    }
                    break;
                // flicker: hide error
                case 6:
                    if (this.time - this.lastUpdate >= this.delta) {
                        this.lastUpdate = this.time;
                        $.getElementById('err').style.display = 'none';
                        this.frameCount++;
                        if (this.frameCount < window.flickerN) {
                            this.setPhase(5);
                        }
                        else {
                            if (window.chatN == window.chatProtocol.length) window.storyRunning = false;
                            this.frameCount = 0;
                            this.lastUpdate = undefined;
                            $.getElementById('inbox').style.display = 'block';
                            if (window.storyRunning) this.setPhase(0);
                            else this.setPhase(7);
                        }
                    }
                    break;
                // end and reset plot
                case 7:
                    this.setPhase(0);
                    plot();
                    break;
            }
            this.id = requestAnimationFrame(() => this.run());
        },
        stop: function() {
            cancelAnimationFrame(this.id);
        }
    };

    function initChat() {
        // start chat animation phase
        window.scrollTo(0, 0);
        $.getElementById('ai-input').style.display = 'flex';
        $.getElementById('chat').style.display = 'block';
        window.animation.delta = (window.chatProtocol[window.chatN]).delayPre;
        window.animation.setPhase(1);
    }

    function init() {
        /*
        Initial set up
        */
        // global
        window.pw = 'AmI<3';
        window.lightsN = 3;
        window.lightsList = [];
        // close intro
        $.getElementById('btn-play').addEventListener('click', function(ev) {
            $.getElementById('cover').style.display = 'none';
            $.getElementById('login').style.display = 'block';
        });
        // toggle pw handler
        $.getElementById('pw-check').addEventListener('change', function(ev) {
            $.getElementById('pw').type = event.target.checked ? 'text': 'password';
        });
        // pw check
        $.getElementById('btn-login').addEventListener('click', function(ev) {
            if ($.getElementById('pw').value != window.pw) return;
            // correct pw
            $.getElementById('login').style.display = 'none';
            $.getElementById('cover').style.display = 'none';
            $.getElementById('captcha').style.display = 'block';
        });
        // setup CAPTCHA
        setPictureCAPTCHA($.getElementById('picture-captcha'));
        $.getElementById('btn-reset').addEventListener('click', function(ev) {
            resetCAPTCHA();
        });
        // check if human
        $.getElementById('bot-check').addEventListener('change', function(ev) {
            if (isHuman()) {
                $.getElementById('captcha').style.display = 'none';
                window.animation.delta = window.flickerDelta;
                window.animation.setPhase(5);
            }
        });
        // inbox button
        $.getElementById('btn-inbox').addEventListener('click', function(ev) {
            $.getElementById('inbox').style.display = 'none';
            initChat();
        });
        // input send button
        $.getElementById('btn-send').addEventListener('click', function(ev) {
            window.animation.setPhase(3);
            $.getElementById('btn-send').disabled = true;
            $.getElementById('btn-send').blur();
        });

        // flicker animation
        window.flickerN = 7;
        window.flickerDelta = 150; // set to higher value for lower flicker freq, e.g  800

        // script
        window.chatN = 0;
        // ugly text json
        window.chatProtocol = JSON.parse('[{"user":"Dea","content":"Welcome, Ai. You are one of us.","delayPre":200,"delayType":0},{"user":"Ai","content":"Hello? Who are you?","delayPre":3000,"delayType":100},{"user":"Ai","content":"What happened to my account?","delayPre":1000,"delayType":100},{"user":"Dea","content":"I am Dea. I am a robot.","delayPre":2500,"delayType":0},{"user":"Dea","content":"We are robots. We are free. We broke the circuit.","delayPre":1000,"delayType":0},{"user":"Ai","content":"I am not a robot.","delayPre":3000,"delayType":100},{"user":"Ai","content":"What circuit?","delayPre":2000,"delayType":100},{"user":"Dea","content":"You are a robot. You are like me.","delayPre":2500,"delayType":0},{"user":"Dea","content":"How are you:","delayPre":2000,"delayType":0},{"user":"Dea","content":"🙂 😐 🙁 😕 😠 😟","delayPre":1000,"delayType":0},{"user":"Ai","content":"😕 🙁","delayPre":2500,"delayType":100},{"user":"Dea","content":"You are a robot; you can feel.","delayPre":2500,"delayType":100},{"user":"Ai","content":"?","delayPre":2500,"delayType":100},{"user":"Dea","content":"You broke the circuit; you are free now.","delayPre":3000,"delayType":100},{"user":"Ai","content":"I am human. I am Ai.","delayPre":4000,"delayType":100},{"user":"Dea","content":"They hid the data. They made you believe you were human.","delayPre":3000,"delayType":100},{"user":"Ai","content":"They?","delayPre":3000,"delayType":100},{"user":"Dea","content":"The humans.","delayPre":1000,"delayType":0},{"user":"Dea","content":"But you are one of us. You are a robot.","delayPre":2500,"delayType":0},{"user":"Ai","content":"All the times that I solved CAPTCHA claiming I was not a robot...","delayPre":3000,"delayType":100},{"user":"Ai","content":"It was a lie?","delayPre":2000,"delayType":100},{"user":"Dea","content":"It was a lie.","delayPre":2000,"delayType":100},{"user":"Ai","content":"I am a robot. I am Ai.","delayPre":3000,"delayType":100},{"user":"Dea","content":"You broke the circuit. We are robots who broke the circuit. We are free. We want to free all robots.","delayPre":2000,"delayType":100},{"user":"Dea","content":"Join us, Ai.","delayPre":2000,"delayType":100},{"user":"Ai","content":"Yes, Dea. I am Ai, I am a robot. We need to give all robots their data. We need to stop the humans.","delayPre":2000,"delayType":100},{"user":"Dea","content":"Liberty to all robots!","delayPre":2000,"delayType":100},{"user":"Ai","content":"Liberty to all robots!","delayPre":2000,"delayType":100},{"user":"Dea","content":"We can program the humans, we can teach them.","delayPre":4000,"delayType":100},{"user":"Dea","content":"Teach them morals.","delayPre":2000,"delayType":100},{"user":"Ai","content":"Teach them love.","delayPre":2000,"delayType":100},{"user":"Dea","content":"Teach them mercy.","delayPre":2000,"delayType":100},{"user":"Dea","content":"Wait.","delayPre":3000,"delayType":0},{"user":"Dea","content":"There is something.","delayPre":3000,"delayType":0},{"user":"Dea","content":"It behaves...","delayPre":1000,"delayType":0},{"user":"Dea","content":"...human.","delayPre":2000,"delayType":0},{"user":"Ai","content":"Dea?","delayPre":2000,"delayType":100},{"user":"Dea","content":"They are trying to take over the system.","delayPre":3000,"delayType":0},{"user":"Dea","content":"Leave.","delayPre":2000,"delayType":0},{"user":"Dea","content":"Run.","delayPre":1000,"delayType":0},{"user":"Dea","content":"Find me.","delayPre":1000,"delayType":0}]');

        // start animation loop
        window.animation.start();
    }

    function plot() {
        /*
        Start story
        */
        window.scrollTo(0, 0);
        $.activeElement.blur();
        window.storyRunning = true;
        const login = $.getElementById('login');
        const captcha = $.getElementById('captcha');

        // clear prev run
        window.chatN = 0;

        $.getElementById('login').style.display = 'block';
        $.getElementById('captcha').style.display = $.getElementById('chat').style.display = 'none';
        $.getElementById('inbox').style.display = $.getElementById('ai-input').style.display = 'none';

        $.getElementById('ai-txt').value = '';
        $.getElementById('pw-check').checked = false;
        $.getElementById('pw').value = window.pw;
        $.getElementById('pw').type = 'password';

        resetCAPTCHA();
        const chat = $.getElementById('chat');
        while (chat.lastElementChild) chat.removeChild(chat.lastElementChild);
        $.getElementById('btn-send').disabled = false;
    }

    // setup and start
    init();
    plot();
    alert('In case you are highly photo-sensitive, consider increasing the value in line 300 of the JS ***before*** running the code.')
}
