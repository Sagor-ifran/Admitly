document.querySelectorAll("[data-slider]").forEach(function (slider) {
    var track = slider.querySelector("[data-slider-track]");
    if (!track) return;

    var items = Array.prototype.slice.call(track.children);
    var DELAY = Number(slider.dataset.delay) || 3000; // koto ms por por slide
    var desktop = window.matchMedia("(min-width: 768px)");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    var timer = null;
    var dragging = false;
    var moved = false;
    var startX = 0;
    var startLeft = 0;

    function maxLeft() {
        return slider.scrollWidth - slider.clientWidth;
    }

    // Prottek card-er scroll position (shesh card-er jonno max porjonto)
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

    function goTo(i) {
        slider.scrollTo({ left: positions()[i], behavior: "smooth" });
    }

    // Auto slide: ekটা kore card dan theke bam-e, shesh-e gele abar shuru-te
    function next() {
        if (!desktop.matches || maxLeft() <= 2) return;
        if (slider.scrollLeft >= maxLeft() - 2) {
            slider.scrollTo({ left: 0, behavior: "smooth" });
            return;
        }
        goTo(Math.min(nearestIndex() + 1, items.length - 1));
    }

    function stop() { clearInterval(timer); timer = null; }
    function start() {
        stop();
        if (desktop.matches && !reduce.matches) timer = setInterval(next, DELAY);
    }

    // ---------- Mouse drag (bam-dan dui dike) ----------
    slider.addEventListener("pointerdown", function (e) {
        if (e.pointerType !== "mouse" || e.button !== 0 || !desktop.matches) return;
        dragging = true;
        moved = false;
        startX = e.clientX;
        startLeft = slider.scrollLeft;
        stop();
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
        if (moved) goTo(nearestIndex()); // sobcheye kache-r card-e boshe jabe
        start();
    }
    slider.addEventListener("pointerup", endDrag);
    slider.addEventListener("pointercancel", endDrag);

    // Drag korar por link e click hoye jeno page na khule
    slider.addEventListener("click", function (e) {
        if (moved) {
            e.preventDefault();
            e.stopPropagation();
            moved = false;
        }
    }, true);

    // Browser-er default image/link drag bondho
    slider.addEventListener("dragstart", function (e) { e.preventDefault(); });

    // ---------- Pause/resume ----------
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", function () { if (!dragging) start(); });
    slider.addEventListener("focusin", stop);
    slider.addEventListener("focusout", start);
    slider.addEventListener("touchstart", stop, { passive: true });
    slider.addEventListener("touchend", start, { passive: true });
    document.addEventListener("visibilitychange", function () {
        if (document.hidden) stop(); else start();
    });

    // Screen size bodlale
    function onResize() {
        if (!desktop.matches) {
            stop();
            slider.scrollLeft = 0;
        } else {
            start();
        }
    }
    if (desktop.addEventListener) desktop.addEventListener("change", onResize);
    else desktop.addListener(onResize);

    start();
});