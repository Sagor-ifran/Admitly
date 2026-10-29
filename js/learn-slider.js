// ===== Slider settings (ekhane bodlan) =====
var SLIDER_DELAY = 1500; // ekটা card theke porer card-e jawar age koto ms thambe
var SLIDER_SPEED = 2000;  // slide hote koto ms lagbe (boro korle dhire slide hobe)
// ===========================================

document.querySelectorAll("[data-slider]").forEach(function (slider) {
    var track = slider.querySelector("[data-slider-track]");
    if (!track) return;

    var items = Array.prototype.slice.call(track.children);
    var DELAY = SLIDER_DELAY;
    var SPEED = SLIDER_SPEED;

    var desktop = window.matchMedia("(min-width: 768px)");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    var canHover = window.matchMedia("(hover: hover)");

    var timer = null;
    var rafId = null;
    var snapTimer = null;
    var animating = false;
    var dragging = false;
    var moved = false;
    var focused = false;
    var startX = 0;
    var startLeft = 0;

    // Mouse ekhon slider-er upor ache kina (page load-e age theke thakleo kaj kore)
    function isHover() {
        return canHover.matches && slider.matches(":hover");
    }

    // Slider ekhon thamiye rakhte hobe kina
    function isPaused() {
        return dragging || focused || isHover();
    }

    function maxLeft() {
        return slider.scrollWidth - slider.clientWidth;
    }

    function positions() {
        var max = maxLeft();
        return items.map(function (el) { return Math.min(el.offsetLeft, max); });
    }

    function nearestIndex() {
        var pos = positions();
        var cur = slider.scrollLeft;
        var best = 0;
        pos.forEach(function (p, i) {
            if (Math.abs(p - cur) < Math.abs(pos[best] - cur)) best = i;
        });
        return best;
    }

    // ---------- Nijer animation (SPEED ekhane kaj kore) ----------
    function ease(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function cancelAnim() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        animating = false;
    }

    function animateTo(target, done) {
        cancelAnim();
        var from = slider.scrollLeft;
        var diff = target - from;
        if (Math.abs(diff) < 1) { if (done) done(); return; }

        animating = true;
        var t0 = null;

        function frame(now) {
            if (t0 === null) t0 = now;
            var p = Math.min((now - t0) / SPEED, 1);
            slider.scrollLeft = from + diff * ease(p);
            if (p < 1) {
                rafId = requestAnimationFrame(frame);
            } else {
                rafId = null;
                animating = false;
                if (done) done();
            }
        }
        rafId = requestAnimationFrame(frame);
    }

    function goTo(i, done) {
        animateTo(positions()[i], done);
    }

    // ---------- Auto slide ----------
    function stop() {
        clearTimeout(timer);
        timer = null;
    }

    // Shob kichu theme gele (animation + timer) ekshathe thamano
    function freeze() {
        stop();
        cancelAnim();
        clearTimeout(snapTimer);
    }

    function schedule() {
        stop();
        if (!desktop.matches || reduce.matches || maxLeft() <= 2) return;
        if (isPaused()) return; // mouse/focus/drag thakle kokhono chalu hobe na
        timer = setTimeout(next, DELAY);
    }

    function next() {
        if (!desktop.matches || isPaused()) return;

        if (slider.scrollLeft >= maxLeft() - 2) {
            animateTo(0, schedule); // shesh-e gele prothom-e
        } else {
            goTo(Math.min(nearestIndex() + 1, items.length - 1), schedule);
        }
    }

    // Pause shesh hole: kache-r card-e boshe, tarpor delay gune slide shuru
    function resume() {
        if (!desktop.matches || isPaused()) return;
        var target = positions()[nearestIndex()];
        if (Math.abs(slider.scrollLeft - target) > 1) {
            animateTo(target, schedule);
        } else {
            schedule();
        }
    }

    // ---------- Hover: sathe sathe thambe ----------
    slider.addEventListener("mouseenter", function () {
        if (canHover.matches) freeze();
    });
    slider.addEventListener("mouseleave", function () {
        if (!dragging) resume();
    });

    // ---------- Keyboard focus ----------
    slider.addEventListener("focusin", function (e) {
        if (e.target.matches && e.target.matches(":focus-visible")) {
            focused = true;
            freeze();
        }
    });
    slider.addEventListener("focusout", function () {
        focused = false;
        resume();
    });

    // ---------- Mouse drag (bam-dan dui dike) ----------
    slider.addEventListener("pointerdown", function (e) {
        if (e.pointerType !== "mouse" || e.button !== 0 || !desktop.matches) return;
        freeze();
        dragging = true;
        moved = false;
        startX = e.clientX;
        startLeft = slider.scrollLeft;
    });

    slider.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        var dx = e.clientX - startX;
        if (!moved && Math.abs(dx) > 5) {
            moved = true;
            slider.classList.add("is-dragging");
            slider.setPointerCapture(e.pointerId);
        }
        if (moved) slider.scrollLeft = startLeft - dx;
    });

    function endDrag() {
        if (!dragging) return;
        dragging = false;
        slider.classList.remove("is-dragging");
        // Drag shesh: kache-r card-e boshe jabe. Mouse ekhono upore thakle slide chalu hobe na.
        if (moved) goTo(nearestIndex(), schedule);
        else schedule();
    }
    slider.addEventListener("pointerup", endDrag);
    slider.addEventListener("pointercancel", endDrag);

    // Drag-er por link e click hoye page jeno na khule
    slider.addEventListener("click", function (e) {
        if (moved) {
            e.preventDefault();
            e.stopPropagation();
            moved = false;
        }
    }, true);

    slider.addEventListener("dragstart", function (e) { e.preventDefault(); });

    // Touch swipe / trackpad-er por kache-r card-e boshiye dewa (hover thakle na)
    slider.addEventListener("scroll", function () {
        if (animating || dragging) return;
        clearTimeout(snapTimer);
        snapTimer = setTimeout(function () {
            if (!desktop.matches || isHover()) return;
            goTo(nearestIndex(), schedule);
        }, 150);
    }, { passive: true });

    // ---------- Touch ----------
    slider.addEventListener("touchstart", freeze, { passive: true });
    slider.addEventListener("touchend", schedule, { passive: true });

    document.addEventListener("visibilitychange", function () {
        if (document.hidden) freeze(); else resume();
    });

    // Screen size bodlale
    function onResize() {
        if (!desktop.matches) {
            freeze();
            slider.scrollLeft = 0;
        } else {
            resume();
        }
    }
    if (desktop.addEventListener) desktop.addEventListener("change", onResize);
    else desktop.addListener(onResize);

    schedule();
});