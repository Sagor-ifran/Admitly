(function () {
    // Shudhu dekhanor jonno. Laravel-e price server theke ashbe.
    var PLANS = {
        weekly:   { name: "Weekly Plan",             price: 99,  validity: "Access for 7 days" },
        monthly:  { name: "Monthly Plan",            price: 249, validity: "Access for 30 days" },
        complete: { name: "Complete Admission Pack", price: 499, validity: "Access until the admission preparation package expires" }
    };

    // checkout.html?plan=weekly | monthly | complete
    var key = new URLSearchParams(location.search).get("plan");
    if (!PLANS[key]) key = "monthly";
    var plan = PLANS[key];
    var money = "৳" + plan.price;

    function set(id, text) {
        var el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    set("sumPlan", plan.name);
    set("sumValidity", plan.validity);
    set("sumPrice", money);
    set("sumTotal", money);
    set("payBtnPrice", money);

    // Method bodlale note bodlano
    var NAMES = { bkash: "bKash", nagad: "Nagad" };
    var radios = document.querySelectorAll('input[name="method"]');
    radios.forEach(function (r) {
        r.addEventListener("change", function () {
            set("methodNote", "You will be redirected to " + NAMES[r.value] + " to complete your payment.");
        });
    });

    // Submit
    var form = document.getElementById("checkoutForm");
    var agree = document.getElementById("agree");
    var err = document.getElementById("agreeError");
    var btn = document.getElementById("payBtn");

    agree.addEventListener("change", function () {
        if (agree.checked) err.hidden = true;
    });

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        if (!agree.checked) {
            err.hidden = false;
            agree.focus();
            return;
        }

        btn.disabled = true;
        btn.textContent = "Redirecting to payment…";

        // DEMO: backend lagle ei timeout muche gateway-te pathano hobe.
        setTimeout(function () {
            location.href = "payment-status.html?status=success";
        }, 1200);
    });
})();