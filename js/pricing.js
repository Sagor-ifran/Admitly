// ===== Student-er current plan (pore Laravel theke ashbe) =====
// plan: "free" | "weekly" | "monthly" | "complete"
// expires: "10 November 2026" (weekly/monthly-er jonno) ba null
window.ADMITLY_CURRENT_PLAN = window.ADMITLY_CURRENT_PLAN || { plan: "free", expires: null };
// ===============================================================

(function () {
    var PLANS = {
        free: {
            name: "Free Access",
            price: "৳0",
            desc: "You are on the free plan. Upgrade anytime to unlock more.",
            // APNAR REAL FREE FEATURE ekhane likhun (ami placeholder diyechi)
            features: ["Limited practice questions", "Sample lessons", "Basic progress tracking"],
            cta: "Explore Plans"
        },
        weekly: {
            name: "Weekly Plan",
            price: "৳99",
            desc: "Focused preparation for one week.",
            features: ["Full question bank", "Mock tests", "AI Essay Evaluation"],
            cta: "Upgrade plan"
        },
        monthly: {
            name: "Monthly Plan",
            price: "৳249",
            desc: "Consistent preparation every day.",
            features: ["Everything in Weekly", "Topic-wise video lessons", "Unlimited mock tests"],
            cta: "Upgrade plan"
        },
        complete: {
            name: "Complete Admission Pack",
            price: "৳499",
            desc: "Access until the admission preparation package expires.",
            features: ["All question banks", "All video lessons", "Advanced analytics"],
            cta: null // upgrade-er kichu nai, button lukano thakbe
        }
    };

    var current = window.ADMITLY_CURRENT_PLAN || {};
    var key = PLANS[current.plan] ? current.plan : "free";
    var p = PLANS[key];

    // ---------- Banner ----------
    document.getElementById("cpName").textContent = p.name;
    document.getElementById("cpPrice").textContent = p.price;

    var desc = p.desc;
    if ((key === "weekly" || key === "monthly") && current.expires) {
        desc = "Active until " + current.expires + ".";
    }
    document.getElementById("cpDesc").textContent = desc;

    var list = document.getElementById("cpFeatures");
    list.innerHTML = "";
    p.features.forEach(function (text) {
        var li = document.createElement("li");
        li.textContent = text;
        list.appendChild(li);
    });

    var cta = document.getElementById("cpCta");
    if (p.cta) {
        cta.textContent = p.cta;
        cta.hidden = false;
    } else {
        cta.hidden = true;
    }

    // ---------- Card: current plan chinhito kora ----------
    var card = document.querySelector('.plan_card[data-plan="' + key + '"]');
    if (card) {
        card.classList.add("is-current");

        var badge = card.querySelector(".plan_badge--current");
        if (badge) badge.hidden = false;

        var popular = card.querySelector(".plan_badge--popular");
        if (popular) popular.hidden = true;

        var btn = card.querySelector(".plan_btn");
        if (btn) {
            btn.textContent = "Your current plan";
            btn.classList.add("is-disabled");
            btn.setAttribute("aria-disabled", "true");
            btn.setAttribute("tabindex", "-1");
        }
    }
})();


// ===== Explore Plans: smooth scroll =====
(function () {
    var DURATION = 1000; // koto ms-e scroll hobe (boro korle aro dhire)
    var OFFSET = 20;     // card-er upore koto px jaga rakhbe

    var cta = document.getElementById("cpCta");
    var target = document.getElementById("plans");
    if (!cta || !target) return;

    var rafId = null;
    var activeScroller = null;
    var savedBehavior = "";

    // Je element scroll hocche seta khuje ber kora (card-er bhitor ba page)
    function getScroller(el) {
        var p = el.parentElement;
        while (p && p !== document.body) {
            var oy = getComputedStyle(p).overflowY;
            if ((oy === "auto" || oy === "scroll") && p.scrollHeight > p.clientHeight) return p;
            p = p.parentElement;
        }
        return document.scrollingElement || document.documentElement;
    }

    function ease(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Animation shesh/bondho hole CSS-er smooth ager moto phire dewa
    function restore() {
        if (activeScroller) {
            activeScroller.style.scrollBehavior = savedBehavior;
            activeScroller = null;
        }
    }

    function cancel() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        restore();
    }

    cta.addEventListener("click", function (e) {
        e.preventDefault();
        cancel();

        var scroller = getScroller(target);
        var isRoot = scroller === document.scrollingElement || scroller === document.documentElement;

        var from = scroller.scrollTop;
        var offsetTop = target.getBoundingClientRect().top - (isRoot ? 0 : scroller.getBoundingClientRect().top);
        var max = scroller.scrollHeight - scroller.clientHeight;
        var to = Math.max(0, Math.min(from + offsetTop - OFFSET, max));
        var diff = to - from;

        function done() {
            restore();
            target.setAttribute("tabindex", "-1");
            target.focus({ preventScroll: true });
        }

        // Animation kom chaile sathe sathe jabe
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || Math.abs(diff) < 2) {
            scroller.scrollTop = to;
            done();
            return;
        }

        // CSS smooth ei animation-er shomoy bondho rakha
        activeScroller = scroller;
        savedBehavior = scroller.style.scrollBehavior;
        scroller.style.scrollBehavior = "auto";

        var t0 = null;

        function frame(now) {
            if (t0 === null) t0 = now;
            var p = Math.min((now - t0) / DURATION, 1);
            scroller.scrollTop = from + diff * ease(p);
            if (p < 1) {
                rafId = requestAnimationFrame(frame);
            } else {
                rafId = null;
                done();
            }
        }
        rafId = requestAnimationFrame(frame);

        // User nije scroll korle animation thame jabe
        var stopEvents = ["wheel", "touchstart", "keydown"];
        function stopOnUser() {
            cancel();
            stopEvents.forEach(function (ev) { scroller.removeEventListener(ev, stopOnUser); });
        }
        stopEvents.forEach(function (ev) {
            scroller.addEventListener(ev, stopOnUser, { passive: true, once: true });
        });
    });
})();