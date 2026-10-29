document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll("#menu a");
    const sidebar = document.getElementById("sidebar");

    // Current page-er link ke active kora
    const current = location.pathname.split("/").pop() || "index.html";
    const hasMatch = [...links].some(l => l.getAttribute("href").split("/").pop() === current);

    if (hasMatch) {
        links.forEach(link => {
            const isActive = link.getAttribute("href").split("/").pop() === current;
            link.classList.toggle("active", isActive);
            if (isActive) link.setAttribute("aria-current", "page");
            else link.removeAttribute("aria-current");
        });
    }

    // Mobile-e link click korle menu bondho
    links.forEach(link => {
        link.addEventListener("click", () => {
            const panel = bootstrap.Offcanvas.getInstance(sidebar);
            if (panel) panel.hide();
        });
    });

    // Hamburger animation (menu khulle X)
    const toggle = document.querySelector(".menu-toggle");
    if (sidebar && toggle) {
        sidebar.addEventListener("show.bs.offcanvas", () => toggle.classList.add("is-open"));
        sidebar.addEventListener("hide.bs.offcanvas", () => toggle.classList.remove("is-open"));
    }
});


