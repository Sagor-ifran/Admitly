/* Mock exam page (mock-exam.html) */
(function () {
    var form = document.getElementById("mockForm");
    if (!form) return;

    var segCards = [].slice.call(form.querySelectorAll(".mk_card[data-seg]"));
    var simpleCards = [].slice.call(form.querySelectorAll(".mk_card[data-section]"));
    var allCards = segCards.concat(simpleCards);
    var dataInputs = [].slice.call(form.querySelectorAll("input[name]"));   // topic ar section (form-e jay)

    var fullEl = document.getElementById("mkFull");
    var sumEl = document.getElementById("mkSum");
    var beginBtn = document.getElementById("mkBegin");
    var allBtn = document.getElementById("mkAll");
    var allText = document.getElementById("mkAllText");

    // ---------- Helpers ----------
    function fmtTime(m) {
        var h = Math.floor(m / 60), r = m % 60;
        if (h === 0) return r + " min";
        return h + "h" + (r ? " " + r + "m" : "");
    }

    // ["a", "b", "c"] -> "a, b and c"
    function joinList(parts) {
        if (parts.length <= 1) return parts.join("");
        return parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1];
    }

    // Reading ar Essay alada gona hoy, MCQ-er bhitore na
    function describe(t) {
        var parts = [];
        if (t.mcq) parts.push(t.mcq + (t.mcq === 1 ? " MCQ" : " MCQs"));
        if (t.reading) parts.push(t.reading + " Reading Comprehension");
        if (t.essay) parts.push(t.essay + (t.essay === 1 ? " Essay" : " Essays"));
        return joinList(parts);
    }

    function tally(cards) {
        var t = { mcq: 0, reading: 0, essay: 0, min: 0 };
        cards.forEach(function (c) {
            t.min += Number(c.dataset.min) || 0;
            if (c.dataset.section === "reading") t.reading += 1;
            else if (c.dataset.section === "essay") t.essay += 1;
            else t.mcq += Number(c.dataset.q) || 0;
        });
        return t;
    }

    function isSelected(card) {
        if (card.hasAttribute("data-seg")) {
            return card.querySelectorAll(".mk_topic input:checked").length > 0;
        }
        return card.querySelector("input[name]").checked;
    }

    function setOpen(card, open) {
        card.classList.toggle("is-open", open);
        card.querySelector(".mk_toggle").setAttribute("aria-expanded", open ? "true" : "false");
    }

    // Segment-er circle: sob topic select hole checked, kichu hole dash, kono na hole khali
    function syncSeg(card) {
        var topics = card.querySelectorAll(".mk_topic input");
        var master = card.querySelector(".mk_seg_input");
        var n = card.querySelectorAll(".mk_topic input:checked").length;

        master.checked = n > 0 && n === topics.length;
        master.indeterminate = n > 0 && n < topics.length;
    }

    // ---------- Upore-r total (card-er data theke) ----------
    var full = tally(allCards);
    fullEl.textContent = describe(full) + " · Total time: " + fmtTime(full.min);

    // ---------- Sob kichu abar hishab ----------
    function refresh() {
        segCards.forEach(syncSeg);

        // Segment-er jekono topic select korle puro segment-er question ar shomoy dhora hoy
        var picked = [];
        allCards.forEach(function (c) {
            var on = isSelected(c);
            c.classList.toggle("is-selected", on);
            if (on) picked.push(c);
        });

        var any = picked.length > 0;
        beginBtn.disabled = !any;

        if (any) {
            var t = tally(picked);
            sumEl.textContent = "Selected: " + describe(t) + " · " + fmtTime(t.min);
        } else {
            sumEl.textContent = "Select at least one topic to begin.";
        }

        // Select all button
        var checkedCount = dataInputs.filter(function (i) { return i.checked; }).length;
        var everything = checkedCount === dataInputs.length;
        var some = checkedCount > 0 && !everything;

        allBtn.classList.toggle("is-all", everything);
        allBtn.classList.toggle("is-some", some);
        allBtn.setAttribute("aria-pressed", everything ? "true" : "false");
        allText.textContent = everything ? "Clear all" : "Select all";
    }

    // ---------- Events ----------
    dataInputs.forEach(function (i) {
        i.addEventListener("change", refresh);
    });

    segCards.forEach(function (card) {
        var master = card.querySelector(".mk_seg_input");
        var toggle = card.querySelector(".mk_toggle");

        // Circle-e click: oi segment-er sob topic select/unselect
        master.addEventListener("change", function () {
            card.querySelectorAll(".mk_topic input").forEach(function (t) {
                t.checked = master.checked;
            });
            refresh();
        });

        // Accordion khola/bondho
        toggle.addEventListener("click", function () {
            setOpen(card, !card.classList.contains("is-open"));
        });
    });

    allBtn.addEventListener("click", function () {
        var everything = dataInputs.every(function (i) { return i.checked; });
        dataInputs.forEach(function (i) { i.checked = !everything; });
        refresh();
    });

    // Kichu select na thakle start hobe na
    form.addEventListener("submit", function (e) {
        if (beginBtn.disabled) e.preventDefault();
    });

    // Checkbox-e Enter chaple jeno test shuru na hoye jay
    form.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && e.target.type === "checkbox") e.preventDefault();
    });

    // Browser form-er ager obostha ferot dile abar hishab
    window.addEventListener("pageshow", refresh);

    // Boro screen-e duto accordion-i khola obosthay shuru
    if (window.matchMedia("(min-width: 992px)").matches) {
        segCards.forEach(function (c) { setOpen(c, true); });
    }

    refresh();
})();