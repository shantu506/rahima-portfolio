(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Dark / light switch (remembered)
  var root = document.documentElement, sw = $("#themeBtn");
  function setTheme(t) {
    root.setAttribute("data-theme", t);
    sw.setAttribute("aria-checked", t === "dark");
    try { localStorage.setItem("theme", t); } catch (e) {}
  }
  var saved = null; try { saved = localStorage.getItem("theme"); } catch (e) {}
  setTheme(saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  sw.addEventListener("click", function () { setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark"); });

  // Mobile menu
  var menu = $("#menuBtn"), nav = $("#nav");
  menu.addEventListener("click", function () { menu.setAttribute("aria-expanded", nav.classList.toggle("open")); });
  $$("#nav a").forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("open"); menu.setAttribute("aria-expanded", false); }); });

  // Scroll progress bar
  var bar = $("#progress");
  window.addEventListener("scroll", function () {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? window.scrollY / h * 100 : 0) + "%";
  }, { passive: true });

  // Rotating role text
  var roles = ["responsive websites", "clean user interfaces", "interactive web apps", "React components"];
  var el = $("#role"), r = 0, c = 0, del = false;
  if (reduce) { el.textContent = roles[0]; } else {
    (function type() {
      var w = roles[r]; el.textContent = w.slice(0, del ? --c : ++c);
      var wait = del ? 40 : 90;
      if (!del && c === w.length) { del = true; wait = 1500; }
      else if (del && c === 0) { del = false; r = (r + 1) % roles.length; wait = 300; }
      setTimeout(type, wait);
    })();
  }

  // Technology strip: duplicate items so the scroll loops
  var track = $("#track");
  track.innerHTML += track.innerHTML;

  // Stats count what is really on the page
  var totals = { project: $$(".proj").length, skill: $$(".skill").length, cert: $$(".cert").length, edu: $$(".edu").length };
  var so2 = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      so2.unobserve(e.target);
      var end = totals[e.target.getAttribute("data-count")], n = 0;
      if (reduce) { e.target.textContent = end; return; }
      var t = setInterval(function () { e.target.textContent = ++n; if (n >= end) clearInterval(t); }, 120);
    });
  }, { threshold: .6 });
  $$("[data-count]").forEach(function (b) { so2.observe(b); });

  // Certificate: click the thumbnail to enlarge
  var dlg = $("#certDlg");
  $(".thumb").addEventListener("click", function () { dlg.showModal(); });
  $("#certClose").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

  // Highlight current section in nav
  var links = $$("#nav a");
  var so = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); }); });
  }, { rootMargin: "-40% 0px -55% 0px" });
  $$("main section").forEach(function (s) { so.observe(s); });

  // Contact form: validate, then open email app
  $("#form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var f = ev.target, n = f.name.value.trim(), m = f.email.value.trim(), t = f.msg.value.trim(), note = $("#note");
    if (!n || !/^\S+@\S+\.\S+$/.test(m) || !t) { note.textContent = "Please enter your name, a valid email and a message."; return; }
    note.textContent = "Opening your email app...";
    window.location.href = "mailto:251-35-210@diu.edu.bd?subject=" + encodeURIComponent("Portfolio message from " + n) + "&body=" + encodeURIComponent(t + "\n\nFrom: " + n + " (" + m + ")");
  });

  // Reveal sections as they scroll in
  if (!reduce) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } });
    }, { threshold: .12 });
    $$(".block h2,.about,.stats,.edu,.skill,.card,.contact,.filters").forEach(function (x, i) { x.classList.add("rv"); x.style.transitionDelay = (i % 3) * 90 + "ms"; rio.observe(x); });

    // Gentle 3D tilt on project cards
    $$(".proj").forEach(function (card) {
      card.addEventListener("mousemove", function (ev) {
        var b = card.getBoundingClientRect(), x = (ev.clientX - b.left) / b.width - .5, y = (ev.clientY - b.top) / b.height - .5;
        card.style.transitionDelay = "0ms";
        card.style.transform = "perspective(700px) rotateY(" + x * 8 + "deg) rotateX(" + -y * 8 + "deg) translateY(-6px)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  // A little plane flies down the education timeline as you scroll
  var tl = $(".timeline");
  if (tl) {
    var fly = document.createElement("span");
    fly.className = "flyer"; fly.setAttribute("aria-hidden", "true");
    fly.innerHTML = '<svg viewBox="0 0 24 24"><polygon points="22,12 3,3 8,12 3,21"/></svg>';
    tl.appendChild(fly);
    var move = function () {
      var b = tl.getBoundingClientRect(), p = (window.innerHeight * .6 - b.top) / b.height;
      fly.style.top = Math.max(0, Math.min(1, p)) * (b.height - 30) + "px";
    };
    window.addEventListener("scroll", move, { passive: true }); move();
  }

  $("#year").textContent = new Date().getFullYear();
})();
