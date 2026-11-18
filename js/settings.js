/* Settings page (settings.html) */
(function () {
    "use strict";

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- 1. Tab: URL-e #subscription ityadi, reload korleo oi tab-e thake ---------- */
    var tabs = [].slice.call(document.querySelectorAll(".st_tabs [data-st]"));

    if (tabs.length && window.bootstrap) {
        var base = location.pathname + location.search;

        var openFromHash = function () {
            var key = location.hash.replace("#", "");
            var tab = tabs.filter(function (t) { return t.getAttribute("data-st") === key; })[0];
            if (tab) bootstrap.Tab.getOrCreateInstance(tab).show();
        };

        tabs.forEach(function (t) {
            t.addEventListener("shown.bs.tab", function () {
                history.replaceState(null, "", base + "#" + t.getAttribute("data-st"));
                // Mobile-e selected tab majhkhane ashe
                t.scrollIntoView({ inline: "center", block: "nearest", behavior: reduce ? "auto" : "smooth" });
            });
        });

        window.addEventListener("hashchange", openFromHash);
        openFromHash();
    }

    /* ---------- 2. DEMO: form submit korle "Saved" message. Laravel-e eta muche dien ---------- */
    [].forEach.call(document.querySelectorAll("form[data-st-demo]"), function (form) {
        var status = form.querySelector(".st_status");
        var timer = null;

        form.addEventListener("submit", function (e) {
            e.preventDefault();      // Laravel-e ei line muche dile form nijei server-e POST hobe
            if (!status) return;

            status.textContent = form.getAttribute("data-st-msg") || "Saved.";
            clearTimeout(timer);
            timer = setTimeout(function () { status.textContent = ""; }, 3500);
        });
    });
})();