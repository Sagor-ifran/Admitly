/* Auth pages (login, register, forgot password, reset password) */
(function () {
    "use strict";

    /* ---------- 1. Show / hide password ---------- */
    [].forEach.call(document.querySelectorAll("[data-toggle-password]"), function (btn) {
        var input = document.getElementById(btn.getAttribute("data-toggle-password"));
        if (!input) return;

        btn.addEventListener("click", function () {
            var show = input.type === "password";
            input.type = show ? "text" : "password";
            btn.setAttribute("aria-pressed", show ? "true" : "false");
            btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
        });
    });

    /* ---------- 2. Submit: button disabled + "Logging in…" ---------- */
    [].forEach.call(document.querySelectorAll("[data-auth-form]"), function (form) {
        var btn = form.querySelector('[type="submit"]');
        if (!btn) return;
        var original = btn.textContent;

        form.addEventListener("submit", function (e) {
            if (btn.disabled) { e.preventDefault(); return; }

            btn.disabled = true;
            btn.textContent = form.getAttribute("data-loading") || "Please wait…";

            // DEMO: static server POST kore na, tai ekটা page theke porer page-e niye jay.
            // Laravel-e data-demo-next attribute muche dien, tahole form nijei server-e jabe.
            var next = form.getAttribute("data-demo-next");
            if (next) {
                e.preventDefault();
                setTimeout(function () { location.href = next; }, 700);
            }
        });

        // Browser-er Back-e abar ashle button ager obosthay
        window.addEventListener("pageshow", function () {
            btn.disabled = false;
            btn.textContent = original;
        });
    });

    /* ---------- 3. Resend link: 60 second cooldown ---------- */
    [].forEach.call(document.querySelectorAll("[data-cooldown]"), function (btn) {
        var total = Number(btn.getAttribute("data-cooldown")) || 60;
        var label = btn.getAttribute("data-label") || btn.textContent;
        var timer = null;

        function start() {
            var left = total;
            btn.disabled = true;
            btn.textContent = "Resend in " + left + "s";

            clearInterval(timer);
            timer = setInterval(function () {
                left--;
                if (left <= 0) {
                    clearInterval(timer);
                    btn.disabled = false;
                    btn.textContent = label;
                } else {
                    btn.textContent = "Resend in " + left + "s";
                }
            }, 1000);
        }

        btn.addEventListener("click", function () {
            if (btn.disabled) return;
            // Laravel-e ekhane server-e "resend" request pathate hobe
            start();
        });

        start();     // page khulei cooldown shuru (just pathano hoyeche)
    });
})();