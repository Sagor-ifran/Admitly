/* =========================================================
   SETTINGS PAGE (settings.html)
   ---------------------------------------------------------
   SEGMENT LIST
    1. Tab + dropdown (duto-i ekই function-e chole)
    2. Profile photo: Change photo
    3. Avatar modal: Add avatar
    4. DEMO: form submit korle "Saved" message
   ========================================================= */
(function () {
    "use strict";

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function $(id) { return document.getElementById(id); }

    // SVG element-e `.hidden` property nai, tai attribute diye
    function setHidden(el, on) {
        if (!el) return;
        if (on) el.setAttribute("hidden", "");
        else el.removeAttribute("hidden");
    }


    /* ---------------------------------------------------------
       1. TAB + DROPDOWN
       1200px-er upore tab, niche dropdown. Duto-i show() function-e
       chole, tai ekটা click korle onnotao sathe sathe bodle jay.
       URL-e #subscription ityadi thake, reload korleo oi tab-e phire.
       --------------------------------------------------------- */
    var panes = [].slice.call(document.querySelectorAll(".st_panel[data-pane]"));
    var tabs = [].slice.call(document.querySelectorAll(".st_tab[data-st]"));
    var ddItems = [].slice.call(document.querySelectorAll(".st_dd_item[data-st]"));
    var ddBtn = $("stDdBtn");
    var ddMenu = $("stDdMenu");
    var ddLabel = $("stDdLabel");
    var dd = $("stDd");

    var keys = tabs.map(function (t) { return t.getAttribute("data-st"); });
    var base = location.pathname + location.search;

    function tabFor(key) {
        return tabs.filter(function (t) { return t.getAttribute("data-st") === key; })[0];
    }

    // Dropdown khola/bondho
    function setMenu(open) {
        if (!ddBtn || !ddMenu) return;
        setHidden(ddMenu, !open);
        ddBtn.setAttribute("aria-expanded", open ? "true" : "false");
    }

    // Kon tab/pane dekhabe
    function show(key, updateHash) {
        if (keys.indexOf(key) === -1) key = "profile";

        panes.forEach(function (p) {
            setHidden(p, p.getAttribute("data-pane") !== key);
        });

        tabs.forEach(function (t) {
            var on = t.getAttribute("data-st") === key;
            t.classList.toggle("is-active", on);
            t.setAttribute("aria-selected", on ? "true" : "false");
            t.setAttribute("tabindex", on ? "0" : "-1");
        });

        ddItems.forEach(function (b) {
            var on = b.getAttribute("data-st") === key;
            b.classList.toggle("is-active", on);
            if (on) b.setAttribute("aria-current", "true");
            else b.removeAttribute("aria-current");
        });

        var t = tabFor(key);
        if (ddLabel && t) ddLabel.textContent = t.textContent;

        // Tab row-e jaiga na hole selected tab majhkhane ashe
        if (t && t.offsetParent) {
            t.scrollIntoView({ inline: "center", block: "nearest", behavior: reduce ? "auto" : "smooth" });
        }

        if (updateHash) history.replaceState(null, "", base + (key === "profile" ? "" : "#" + key));
    }

    if (tabs.length) {
        // Tab click
        tabs.forEach(function (t) {
            t.addEventListener("click", function () {
                show(t.getAttribute("data-st"), true);
            });
        });

        // Tab keyboard: ← → Home End
        var tabRow = document.querySelector(".st_tabs");
        if (tabRow) {
            tabRow.addEventListener("keydown", function (e) {
                var i = keys.indexOf(document.activeElement.getAttribute("data-st"));
                if (i === -1) return;

                var next = null;
                if (e.key === "ArrowRight") next = (i + 1) % keys.length;
                else if (e.key === "ArrowLeft") next = (i - 1 + keys.length) % keys.length;
                else if (e.key === "Home") next = 0;
                else if (e.key === "End") next = keys.length - 1;
                if (next === null) return;

                e.preventDefault();
                show(keys[next], true);
                tabs[next].focus();
            });
        }

        // Dropdown button
        if (ddBtn && ddMenu) {
            ddBtn.addEventListener("click", function () {
                setMenu(ddBtn.getAttribute("aria-expanded") !== "true");
            });

            // Dropdown-er item click: tab bodlay, menu bondho
            ddItems.forEach(function (b) {
                b.addEventListener("click", function () {
                    show(b.getAttribute("data-st"), true);
                    setMenu(false);
                    ddBtn.focus({ preventScroll: true });
                });
            });

            // Baire click korle bondho
            document.addEventListener("click", function (e) {
                if (dd && !dd.contains(e.target)) setMenu(false);
            });

            // Esc chaple bondho
            document.addEventListener("keydown", function (e) {
                if (e.key === "Escape" && ddBtn.getAttribute("aria-expanded") === "true") {
                    setMenu(false);
                    ddBtn.focus({ preventScroll: true });
                }
            });

            // Screen boro hole (dropdown lukiye jay) menu bondho
            window.addEventListener("resize", function () { setMenu(false); });
        }

        // Browser Back / URL-e #hash bodlale
        window.addEventListener("hashchange", function () {
            show(location.hash.replace("#", ""), false);
        });

        show(location.hash.replace("#", ""), false);
    }


    /* ---------------------------------------------------------
       2. PROFILE PHOTO: Change photo
       --------------------------------------------------------- */
    var photoImg = $("stPhotoImg");
    var photoSvg = $("stPhotoSvg");
    var photoInput = $("stPhotoInput");
    var photoMsg = $("stPhotoMsg");
    var avVal = $("stAvatarVal");

    var MAX_SIZE = 2 * 1024 * 1024;                        // 2 MB
    var OK_TYPES = ["image/png", "image/jpeg", "image/webp"];
    var photoUrl = null;

    function say(text, bad) {
        if (!photoMsg) return;
        photoMsg.textContent = text;
        photoMsg.classList.toggle("is-error", !!bad);
    }

    if (photoInput && photoImg) {
        photoInput.addEventListener("change", function () {
            var f = photoInput.files && photoInput.files[0];
            if (!f) return;

            if (OK_TYPES.indexOf(f.type) === -1) {
                photoInput.value = "";
                say("Please choose a PNG, JPG or WebP image.", true);
                return;
            }
            if (f.size > MAX_SIZE) {
                photoInput.value = "";
                say("That image is too large. Please choose one under 2 MB.", true);
                return;
            }

            if (photoUrl) URL.revokeObjectURL(photoUrl);
            photoUrl = URL.createObjectURL(f);

            photoImg.src = photoUrl;
            setHidden(photoImg, false);
            setHidden(photoSvg, true);
            if (avVal) avVal.value = "";                    // photo dile avatar choice muche jay

            say("Photo selected. Press Save changes to keep it.");
        });
    }


    /* ---------------------------------------------------------
       3. AVATAR MODAL: Add avatar
       --------------------------------------------------------- */
    var avModal = $("avatarModal");
    var avUse = $("stAvUse");

    var SYMBOL = { male: "#avMale", female: "#avFemale" };
    var AV_LABEL = { male: "Male avatar", female: "Female avatar" };
    var KEY_AV = "admitly:avatar";                          // DEMO: Laravel-e eta users.avatar-e save hobe

    function showAvatar(key) {
        if (!SYMBOL[key] || !photoSvg) return;

        var use = photoSvg.querySelector("use");
        if (use) use.setAttribute("href", SYMBOL[key]);
        photoSvg.setAttribute("aria-label", AV_LABEL[key]);

        setHidden(photoSvg, false);
        setHidden(photoImg, true);
        if (avVal) avVal.value = key;
    }

    // Modal-er radio ager choice-e set kore
    function checkRadio(key) {
        [].forEach.call(document.querySelectorAll('input[name="avatar_choice"]'), function (r) {
            r.checked = r.value === key;
        });
    }

    if (avModal) {
        // Modal khulle bortoman avatar select kora thake
        avModal.addEventListener("show.bs.modal", function () {
            checkRadio((avVal && avVal.value) || "male");
        });

        if (avUse) {
            avUse.addEventListener("click", function () {
                var picked = document.querySelector('input[name="avatar_choice"]:checked');
                if (!picked) return;

                showAvatar(picked.value);
                if (photoInput) photoInput.value = "";      // upload kora photo bad
                say(AV_LABEL[picked.value] + " selected. Press Save changes to keep it.");

                if (window.bootstrap) {
                    bootstrap.Modal.getOrCreateInstance(avModal).hide();
                }
            });
        }
    }

    // Page khulle ager save kora avatar (demo)
    try {
        var savedAv = localStorage.getItem(KEY_AV);
        if (savedAv && SYMBOL[savedAv]) showAvatar(savedAv);
    } catch (e) { }


    /* ---------------------------------------------------------
       4. DEMO: form submit korle "Saved" message
       Laravel-e eta muche dien, tahole form nijei server-e POST hobe
       --------------------------------------------------------- */
    [].forEach.call(document.querySelectorAll("form[data-st-demo]"), function (form) {
        var status = form.querySelector(".st_status");
        var timer = null;

        form.addEventListener("submit", function (e) {
            e.preventDefault();             // Laravel-e ei line muche dile form server-e jabe

            // Profile form: avatar choice demo-te save
            if (form.id === "stProfForm" && avVal) {
                try {
                    if (avVal.value) localStorage.setItem(KEY_AV, avVal.value);
                    else localStorage.removeItem(KEY_AV);
                } catch (err) { }
                say("");
            }

            if (!status) return;
            status.textContent = form.getAttribute("data-st-msg") || "Saved.";
            clearTimeout(timer);
            timer = setTimeout(function () { status.textContent = ""; }, 3500);
        });
    });

    // Delete modal bondho hole input clear
    var delModal = $("deleteModal");
    if (delModal) {
        delModal.addEventListener("hidden.bs.modal", function () {
            var input = $("delConfirm");
            if (input) input.value = "";
        });
    }
})();