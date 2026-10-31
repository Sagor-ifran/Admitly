(function () {
    var list = document.getElementById("practiceList");
    if (!list) return;

    var items = Array.prototype.slice.call(list.querySelectorAll(".pc_item"));
    var desktop = window.matchMedia("(min-width: 768px)");

    var colA = document.createElement("div");
    var colB = document.createElement("div");
    colA.className = "pc_col";
    colB.className = "pc_col";

    // Desktop: 1,3,5 bam-e ar 2,4,6 dan-e
    function split() {
        items.forEach(function (item, i) {
            (i % 2 === 0 ? colA : colB).appendChild(item);
        });
        list.appendChild(colA);
        list.appendChild(colB);
        list.classList.add("is-split");
    }

    // Mobile: abar 1,2,3,4... order-e
    function merge() {
        items.forEach(function (item) {
            list.appendChild(item);
        });
        colA.remove();
        colB.remove();
        list.classList.remove("is-split");
    }

    function check() {
        if (desktop.matches) split(); else merge();
    }

    if (desktop.addEventListener) desktop.addEventListener("change", check);
    else desktop.addListener(check);

    check();
})();