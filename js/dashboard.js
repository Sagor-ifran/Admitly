/* Dashboard (index.html) */
(function () {
    "use strict";

    /* ---------- 1. Daily goal: Edit ---------- */
    var goalEl = document.getElementById("dhGoal");

    if (goalEl) {
        var form = document.getElementById("dhGoalForm");
        var panel = document.getElementById("dhGoalEdit");
        var editBtn = document.getElementById("dhGoalEditBtn");
        var ring = document.getElementById("dhRing");
        var ringNum = document.getElementById("dhRingNum");
        var ringDen = document.getElementById("dhRingDen");
        var textEl = document.getElementById("dhGoalText");
        var srEl = document.getElementById("dhGoalSr");

        var OPTIONS = [10, 20, 40, 50];
        var KEY = "admitly:dailyGoal";     // DEMO: Laravel-e eta users table-e save hobe

        var done = Number(goalEl.getAttribute("data-done")) || 0;
        var goal = Number(goalEl.getAttribute("data-goal")) || 10;

        try {
            var saved = Number(localStorage.getItem(KEY));
            if (OPTIONS.indexOf(saved) !== -1) goal = saved;
        } catch (e) { }

        var render = function () {
            var pct = Math.min(100, Math.round((done / goal) * 100));
            var left = goal - done;

            ring.style.setProperty("--p", pct);
            ring.setAttribute("aria-label", done + " of " + goal + " questions done today");
            ringNum.textContent = String(done);
            ringDen.textContent = "/" + goal;

            textEl.textContent = left <= 0
                ? "Goal complete! Great work today."
                : done + " of " + goal + " questions done today. Only " + left + " more to hit your goal!";

            [].forEach.call(form.elements["daily_goal"], function (r) {
                r.checked = Number(r.value) === goal;
            });
        };

        form.addEventListener("submit", function (e) {
            // Laravel-e eta server-e POST hobe, tai ei line muche dien
            e.preventDefault();

            var picked = form.querySelector('input[name="daily_goal"]:checked');
            if (!picked) return;

            goal = Number(picked.value);
            try { localStorage.setItem(KEY, String(goal)); } catch (err) { }

            render();
            srEl.textContent = "Daily goal set to " + goal + " questions.";

            if (window.bootstrap) bootstrap.Collapse.getOrCreateInstance(panel).hide();
            editBtn.focus({ preventScroll: true });
        });

        // Cancel/bondho korle radio abar bortoman goal-e phire jay
        panel.addEventListener("hidden.bs.collapse", render);

        render();
    }

    /* ---------- 2. Calendar: month bodlale keyboard focus ---------- */
    var cal = document.getElementById("dhCalCarousel");

    if (cal) {
        cal.addEventListener("slid.bs.carousel", function (e) {
            var item = e.relatedTarget;
            if (!item) return;

            var want = e.direction === "left" ? "next" : "prev";
            var btn = item.querySelector('[data-bs-slide="' + want + '"]:not(:disabled)') ||
                item.querySelector('[data-bs-slide]:not(:disabled)');

            if (btn) btn.focus({ preventScroll: true });
        });
    }
})();