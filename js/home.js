(function () {
	"use strict";

	var THEME_KEY = "iamshezad-theme";

	function systemIsLight() {
		return window.matchMedia("(prefers-color-scheme: light)").matches;
	}

	function resolveTheme(pref) {
		if (pref === "light") return "light";
		if (pref === "dark") return "dark";
		return systemIsLight() ? "light" : "dark";
	}

	function getPreference() {
		try {
			var p = localStorage.getItem(THEME_KEY);
			if (p === "light" || p === "dark" || p === "auto") return p;
		} catch (e) {}
		return "auto";
	}

	function setPreference(pref) {
		try {
			if (pref === "auto") localStorage.removeItem(THEME_KEY);
			else localStorage.setItem(THEME_KEY, pref);
		} catch (e) {}
		document.documentElement.setAttribute("data-theme-pref", pref);
		document.documentElement.setAttribute("data-theme", resolveTheme(pref));
		syncThemeButtons(pref);
	}

	function syncThemeButtons(pref) {
		var buttons = document.querySelectorAll(".theme-bar__btn[data-theme-choice]");
		for (var i = 0; i < buttons.length; i++) {
			var choice = buttons[i].getAttribute("data-theme-choice");
			buttons[i].setAttribute("aria-pressed", choice === pref ? "true" : "false");
		}
	}

	function initTheme() {
		var bar = document.querySelector(".theme-bar");
		if (!bar) return;

		var pref = document.documentElement.getAttribute("data-theme-pref") || getPreference();
		if (pref !== "light" && pref !== "dark" && pref !== "auto") pref = "auto";
		document.documentElement.setAttribute("data-theme-pref", pref);
		document.documentElement.setAttribute("data-theme", resolveTheme(pref));
		syncThemeButtons(pref);

		bar.addEventListener("click", function (e) {
			var btn = e.target.closest(".theme-bar__btn[data-theme-choice]");
			if (!btn) return;
			var choice = btn.getAttribute("data-theme-choice");
			if (choice === "light" || choice === "dark" || choice === "auto") {
				setPreference(choice);
			}
		});

		var mq = window.matchMedia("(prefers-color-scheme: light)");
		function onSystemChange() {
			if (getPreference() === "auto") {
				document.documentElement.setAttribute("data-theme", resolveTheme("auto"));
			}
		}
		if (mq.addEventListener) mq.addEventListener("change", onSystemChange);
		else mq.addListener(onSystemChange);
	}

	initTheme();

	var glow = document.querySelector(".cursor-glow");
	var ambient = document.querySelector(".ambient");
	var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	if (!glow || reduceMotion) return;

	var active = false;
	var raf = 0;
	var tx = 0;
	var ty = 0;
	var mx = window.innerWidth / 2;
	var my = window.innerHeight / 2;

	function tick() {
		raf = 0;
		tx += (mx - tx) * 0.08;
		ty += (my - ty) * 0.08;
		glow.style.transform = "translate(" + tx + "px, " + ty + "px) translate(-50%, -50%)";
		if (ambient) {
			var dx = (mx / window.innerWidth - 0.5) * 16;
			var dy = (my / window.innerHeight - 0.5) * 16;
			ambient.style.transform = "translate(" + dx + "px, " + dy + "px)";
		}
		if (Math.abs(mx - tx) > 0.5 || Math.abs(my - ty) > 0.5) {
			raf = requestAnimationFrame(tick);
		}
	}

	function queue() {
		if (!raf) raf = requestAnimationFrame(tick);
	}

	document.addEventListener(
		"pointermove",
		function (e) {
			mx = e.clientX;
			my = e.clientY;
			if (!active) {
				active = true;
				glow.classList.add("is-active");
			}
			queue();
		},
		{ passive: true }
	);

	document.addEventListener(
		"pointerleave",
		function () {
			active = false;
			glow.classList.remove("is-active");
		},
		{ passive: true }
	);
})();
