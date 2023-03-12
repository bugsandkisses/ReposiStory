window.onload = () => {

    // typewriter object
    const typewriter = {obj: {}};
    typewriter.obj.box = document.getElementById("text-box");
    typewriter.obj.hidden = typewriter.obj.box.children[0];
    typewriter.create = function() {
        // make visible element
        this.obj.visible = document.createElement("article");
        this.obj.box.appendChild(this.obj.visible);
        // get text
        this.text = this.obj.hidden.textContent.substring(1);
        // hide (placeholder)
        this.obj.hidden.style.visibility = "hidden";
        // positioning
        this.obj.box.style.position = "relative";
        this.obj.visible.style.position = "absolute";
        this.obj.visible.style.top = "0";
    }
    typewriter.cursorPos = 0;
    typewriter.addChar = function() {
        if (this.cursorPos < this.text.length) {
            let letter = this.text[this.cursorPos];
            if (letter == "\n") {
                let br = document.createElement("br");
                this.obj.visible.append(br);// += "<br>";
            }
            else {
                this.obj.visible.append(letter);
            }
        }
    }
    typewriter.reset = function() {
        this.cursorPos = 0;
        this.text = this.obj.hidden.textContent;
        this.obj.visible.textContent = "";
        this.obj.visible.style.opacity = 1;
    }
    typewriter.f = 7; // frames
    typewriter.create();



    // clock object
    const clock = {};
    clock.obj = {
        h: document.getElementById("hand-hour"),
        m: document.getElementById("hand-min"),
        s: document.getElementById("hand-sec")
    };
    clock.hour = 0, clock.minute = 0, clock.second = 0;
    clock.updateTime = function(hour, minute, second) {
        this.hour = hour * (360 / 12);
        this.minute = minute * (360 / 60) ;
        this.second = second * (360 / 60) ;
    }
    clock.transform = function() {
        // transform clock hand groups
        this.obj.h.setAttribute("transform", `rotate(${this.hour})`);
        this.obj.m.setAttribute("transform", `rotate(${this.minute})`);
        this.obj.s.setAttribute("transform", `rotate(${this.second})`);
    }



    // fish object
    const fish = {};
    fish.obj = document.getElementById("fish");
    fish.x = 0, fish.y = 0, fish.scale = 1, fish.direction = 1;
    fish.opacity = 1;
    fish.lowerLimX = -75;
    fish.upperLimX = 75;
    fish.setActive = function(rendered) {
        // visibility
        if (rendered) {
            this.obj.setAttribute("visibility", "visible");
            this.opacity = 1;
            this.obj.setAttribute("opacity", this.opacity);
        }
        else {
            this.obj.setAttribute("visibility", "hidden");
        }
    };
    fish.update = function(opacityChange=0) {
        if (this.x >= this.upperLimX) {
            this.direction = -1;
            //this.scale = 0.9;
        }
        else if (fish.x <= this.lowerLimX){
            this.direction = 1;
            //this.scale = 1;
        }
        this.x += this.direction;
        this.opacity += opacityChange;
        this.opacity = this.opacity < 0 ? 0: this.opacity > 1 ? 1: this.opacity;
    }
    fish.transform = function() {
        // transform fish group
        this.obj.setAttribute("transform", `translate(${this.x}) scale(${this.scale, this.direction*this.scale})`);
        this.obj.setAttribute("opacity", this.opacity);
    }



    // shadow object
    const fishShadow = {};
    fishShadow.obj = document.getElementById("fish-shadow");
    fishShadow.x = 0, fishShadow.y = -20, fishShadow.scale = 3, fishShadow.direction = 1;
    fishShadow.lowerLimX = -200;
    fishShadow.upperLimX = 200;
    fishShadow.setActive = function(rendered) {
        // visibility
        if (rendered) {
            this.obj.setAttribute("visibility", "visible");
        }
        else {
            this.obj.setAttribute("visibility", "hidden");
        }
    };
    fishShadow.update = function() {
        if (this.x >= this.upperLimX) {
            this.direction = -1;
        }
        else if (fish.x <= this.lowerLimX){
            this.direction = 1;
        }
        this.x += this.direction;
    }
    fishShadow.transform = function() {
        // transform fish group
        this.obj.setAttribute("transform", `translate(${this.x}, ${this.y}) scale(${this.scale, this.direction*this.scale})`);
    }
    fishShadow.setActive(false);



    // animation handler
    const animation = {};
    animation.id = 0, animation.phase = 0, animation.lastUpdate;
    animation.start = function(phase = 0) {
        this.setPhase(phase);
        this.id = this.run();
    }
    animation.setPhase = function(phase) {
        this.phase = phase;

        switch(this.phase) {
            case 0:
                // floating circles
                typewriter.reset();
                fish.setActive(true);
                fishShadow.setActive(false);
                break;
            case 1:
                // fading into the shadows
                break;
            case 2:
                // leaving traces
                fish.setActive(false);
            case 3:
                // moving shadows
                fishShadow.setActive(true);
                fishShadow.x = fishShadow.upperLimX; fishShadow.direction = -1;
                fishShadow.transform();
                break;
            case 4:
                // the space
                fishShadow.setActive(false);
                break;
        }
    }
    animation.run = function() {
        if (typeof this.lastUpdate == "undefined") this.lastUpdate = this.id;

        // always update clock
        const date = new Date();
        clock.updateTime(date.getHours() % 12, date.getMinutes(), date.getSeconds());
        clock.transform();

        switch (this.phase) {
            case 0:
                // floating circles
                fish.update();
                fish.transform();
                break;
            case 1:
                // fading into the shadows
                if ((this.id - this.lastUpdate) >= typewriter.f) {
                    typewriter.addChar();
                    typewriter.cursorPos++;
                    fish.update((1 / typewriter.text.length)*(-1));
                    this.lastUpdate = this.id;
                } else {
                    fish.update();
                }
                fish.transform();
                if ((fish.opacity == 0) || (typewriter.cursorPos == (typewriter.text.length - 1))) {
                    this.setPhase(2);
                }
                break;
            case 2:
                // leaving traces
                if ((this.id - this.lastUpdate) >= typewriter.f) {
                    typewriter.obj.visible.style.opacity -= 0.01
                    this.lastUpdate = this.id;
                    if (typewriter.obj.visible.style.opacity <= 0) {
                        this.setPhase(3);
                    }
                }
                break;
            case 3:
                // moving shadows
                fishShadow.update();
                fishShadow.transform();
                if (fishShadow.x <= (fishShadow.lowerLimX)) {
                    this.setPhase(4);
                }
                break;
        }

        this.id = requestAnimationFrame(() => this.run());
    }



    // set dimensions
    const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const vmin = height < width ? height: width;
    const vmax = height < width ? width: height;
    const fishbowl = document.getElementById("fishbowl");
    fishbowl.setAttribute("height", parseInt(vmin*0.5));
    fishbowl.setAttribute("width", parseInt(vmin*0.5));
    // set shadow dimensions
    const shadow = document.getElementById("shadow");
    shadow.setAttribute("height", parseInt(vmax));
    shadow.setAttribute("width", parseInt(vmax));



    // init
    fishbowl.addEventListener("click", function() {
        if ((animation.phase != 0)) {
            animation.setPhase(0); // clean up
        }
        else {
            animation.setPhase(0); // clean up
            animation.setPhase(1); // start fading
        }
    });

    document.getElementById("btn").addEventListener("click", function() {
        let info = document.getElementById("info");
        info.style.display =
  (info.style.display == 'none') ?
    'flex' :
    'none'
    });

    animation.start();
}