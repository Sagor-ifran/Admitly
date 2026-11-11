/* Progress page (progress.html) */
(function () {
    "use strict";

    var page = document.querySelector(".pg_page");
    if (!page) return;

    // ===== Settings (ekhane bodlan) =====
    var COUNT_DURATION = 1800;   // number 0 theke koto ms-e count-up hobe (boro korle aro slow)
    var BAR_DURATION = 1800;     // bar 0 theke koto ms-e bhorbe
    var BAR_STAGGER = 180;       // prottek subject-er majhe koto ms deri
    var TOPICS_VISIBLE = 5;      // Topics to improve-e prothome koyta item dekhabe, tar por scroll

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var hasIO = "IntersectionObserver" in window;
    var animate = !reduce && hasIO;

    function fmt(n) { return Math.round(n).toLocaleString("en-US"); }

    function setZero(el) {
        el.textContent = "0" + (el.getAttribute("data-suffix") || "");
    }

    // ---------- Number: 0 theke count-up ----------
    function countUp(el) {
        var target = Number(el.getAttribute("data-count"));
        if (isNaN(target)) return;

        var suffix = el.getAttribute("data-suffix") || "";
        var finalText = fmt(target) + suffix;
        var delay = Number(el.getAttribute("data-delay")) || 0;

        if (!animate) { el.textContent = finalText; return; }

        setZero(el);

        function start() {
            var t0 = null;
            function frame(now) {
                if (t0 === null) t0 = now;
                var p = Math.min((now - t0) / COUNT_DURATION, 1);
                el.textContent = fmt(target * (1 - Math.pow(1 - p, 3))) + suffix;   // shuru-te druto, shesh-e dhire
                if (p < 1) requestAnimationFrame(frame);
                else el.textContent = finalText;
            }
            requestAnimationFrame(frame);
        }

        if (delay) setTimeout(start, delay); else start();
    }

    // Element screen-e ashle ekবার-i run korbe
    function onVisible(nodes, run) {
        if (!nodes.length) return;
        if (!hasIO) { nodes.forEach(run); return; }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    run(e.target);
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.2 });

        nodes.forEach(function (n) { io.observe(n); });
    }

    // ---------- Subject-wise: bar + % ekshathe, ekটা ekটা kore ----------
    var subjects = page.querySelector(".pg_subjects");
    var listCounts = [];

    if (subjects) {
        page.style.setProperty("--pg-dur", BAR_DURATION + "ms");

        [].forEach.call(subjects.querySelectorAll(".pg_sub"), function (sub, i) {
            var d = i * BAR_STAGGER;
            sub.style.setProperty("--d", d + "ms");

            var pct = sub.querySelector("[data-count]");
            if (pct) pct.setAttribute("data-delay", d);
        });

        listCounts = [].slice.call(subjects.querySelectorAll("[data-count]"));
    }

    // Baki number (upore-r 4 ta card)
    var otherCounts = [].slice.call(page.querySelectorAll("[data-count]")).filter(function (n) {
        return listCounts.indexOf(n) === -1;
    });

    // Screen-e ashar age number 0 dekhabe (nahole final number theke 0 e jhat kore bodlay)
    if (animate) {
        otherCounts.concat(listCounts).forEach(setZero);
        page.classList.add("is-anim");
    }

    onVisible(otherCounts, countUp);

    if (subjects) {
        onVisible([subjects], function (list) {
            void list.offsetWidth;          // reflow: bar thik 0 theke shuru hobe
            list.classList.add("is-in");
            listCounts.forEach(countUp);
        });
    }

    // ---------- Topics to improve: prothom 5 ta, baki scroll ----------
    var topics = page.querySelector(".pg_topics");

    function limitTopics() {
        if (!topics) return;
        var items = topics.children;

        if (items.length <= TOPICS_VISIBLE) {
            topics.classList.remove("is-scroll");
            topics.style.maxHeight = "";
            topics.removeAttribute("tabindex");
            topics.removeAttribute("role");
            topics.removeAttribute("aria-label");
            return;
        }

        topics.classList.add("is-scroll");

        // 2 bar: scrollbar ashle content ektu soru hoy, tai abar mepe nei
        for (var k = 0; k < 2; k++) {
            topics.style.maxHeight = "";
            var last = items[TOPICS_VISIBLE - 1];
            var h = last.offsetTop + last.offsetHeight - items[0].offsetTop;
            topics.style.maxHeight = Math.max(0, h - 2) + "px";
        }

        topics.tabIndex = 0;     // keyboard diye scroll korar jonno
        topics.setAttribute("role", "region");
        topics.setAttribute("aria-label", "Topics to improve, scrollable list");
    }

    limitTopics();
    window.addEventListener("load", limitTopics);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(limitTopics);

    var rt = null;
    window.addEventListener("resize", function () {
        clearTimeout(rt);
        rt = setTimeout(limitTopics, 150);
    });
})();