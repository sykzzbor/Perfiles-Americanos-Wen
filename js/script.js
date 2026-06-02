(function () {
  "use strict";

  document.body.classList.remove("no-js");

  var WHATSAPP_NUMBER = "543515155999";

  /* -----------------------------------------------------------------
     1. Navbar
     ----------------------------------------------------------------- */
  var nav = document.getElementById("nav");

  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 24);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* -----------------------------------------------------------------
     2. Menú (mobile)
     ----------------------------------------------------------------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");

  function closeMenu() {
    if (!toggle || !menu) return;
    toggle.classList.remove("open");
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
    document.body.style.overflow = "";
  }

  function openMenu() {
    if (!toggle || !menu) return;
    toggle.classList.add("open");
    menu.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Cerrar menú");
    document.body.style.overflow = "hidden";
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      if (menu.classList.contains("open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    var navBack = document.getElementById("navBack");
    if (navBack) {
      navBack.addEventListener("click", closeMenu);
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        closeMenu();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900 && menu.classList.contains("open")) {
        closeMenu();
      }
    });
  }

  /* -----------------------------------------------------------------
     3. Animaciones de aparición (IntersectionObserver)
     ----------------------------------------------------------------- */
  var reveals = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && reveals.length) {
    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* -----------------------------------------------------------------
     3b. Animación de conteo en las estadísticas
     ----------------------------------------------------------------- */
  var counters = document.querySelectorAll("[data-count]");

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var duration = 1400;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = prefix + Math.round(target * eased);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + target;
      }
    }
    requestAnimationFrame(step);
  }

  if (counters.length) {
    if ("IntersectionObserver" in window) {
      var countObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach(function (el) {
        countObserver.observe(el);
      });
    } else {
      counters.forEach(animateCount);
    }
  }

  /* -----------------------------------------------------------------
     4. Acordeón de preguntas frecuentes
     ----------------------------------------------------------------- */
  var faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    if (!btn) return;

    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");

      faqItems.forEach(function (other) {
        if (other !== item) {
          other.classList.remove("open");
          var b = other.querySelector(".faq-q");
          if (b) b.setAttribute("aria-expanded", "false");
        }
      });

      item.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  /* -----------------------------------------------------------------
     4b. Galería de accesorios: filtros + modal
     ----------------------------------------------------------------- */
  var agalGrid = document.getElementById("agalGrid");

  if (agalGrid) {
    var agalFilters = document.querySelectorAll(".agal-filter");
    var agalCards = [].slice.call(agalGrid.querySelectorAll(".agal__card"));
    var moreWrap = document.querySelector(".agal-more");
    var moreBtn = document.getElementById("agalMore");
    var initialCount = parseInt(agalGrid.getAttribute("data-initial"), 10) || 6;
    var currentFilter = "todos";
    var expanded = false;

    function applyAgal() {
      var matches = 0;
      agalCards.forEach(function (card) {
        var inCat = currentFilter === "todos" || card.getAttribute("data-cat") === currentFilter;
        var show = inCat;
        if (inCat && !expanded) {
          show = matches < initialCount;
        }
        if (inCat) matches++;
        card.style.display = show ? "" : "none";
      });

      if (moreWrap && moreBtn) {
        if (matches > initialCount) {
          moreWrap.hidden = false;
          moreBtn.textContent = expanded ? "Ver menos" : "Ver más accesorios";
          moreBtn.setAttribute("aria-expanded", String(expanded));
        } else {
          moreWrap.hidden = true;
        }
      }
    }

    /* Filtros por categoría (sin recargar) */
    agalFilters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        agalFilters.forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");
        currentFilter = btn.getAttribute("data-filter");
        expanded = false; 
        applyAgal();
      });
    });

    if (moreBtn) {
      moreBtn.addEventListener("click", function () {
        expanded = !expanded;
        applyAgal();
      });
    }

    applyAgal();

    var modal = document.getElementById("accModal");

    if (modal) {
      var mImg = document.getElementById("accModalImg");
      var mName = document.getElementById("accModalName");
      var mWa = document.getElementById("accModalWa");
      var lastFocused = null;

      function openModal(card) {
        var name = card.getAttribute("data-name");
        var img = card.getAttribute("data-img");
        mImg.src = img;
        mImg.alt = "Accesorio para aluminio: " + name;
        mName.textContent = name;
        mWa.href = "https://wa.me/543515155999?text=" +
          encodeURIComponent("Hola, quiero consultar por el accesorio: " + name);
        lastFocused = document.activeElement;
        modal.hidden = false;
        document.body.style.overflow = "hidden";
        var closeBtn = modal.querySelector(".amodal__close");
        if (closeBtn) closeBtn.focus();
      }

      function closeModal() {
        modal.hidden = true;
        document.body.style.overflow = "";
        mImg.src = "";
        if (lastFocused) lastFocused.focus();
      }

      agalCards.forEach(function (card) {
        card.addEventListener("click", function () {
          openModal(card);
        });
      });

      modal.querySelectorAll("[data-close]").forEach(function (el) {
        el.addEventListener("click", closeModal);
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !modal.hidden) closeModal();
      });
    }
  }

  /* -----------------------------------------------------------------
     5. Formulario de contacto -> WhatsApp
     ----------------------------------------------------------------- */
  var form = document.getElementById("contactForm");

  if (form) {
    var feedback = document.getElementById("formFeedback");

    function getField(name) {
      return form.querySelector('[name="' + name + '"]');
    }

    function showError(field, message) {
      if (!field) return;
      field.classList.add("invalid");
      var box = form.querySelector('[data-error-for="' + field.name + '"]');
      if (box) box.textContent = message;
    }

    function clearError(field) {
      if (!field) return;
      field.classList.remove("invalid");
      var box = form.querySelector('[data-error-for="' + field.name + '"]');
      if (box) box.textContent = "";
    }

    function isValidEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    ["nombre", "email", "mensaje"].forEach(function (name) {
      var field = getField(name);
      if (field) {
        field.addEventListener("input", function () {
          clearError(field);
        });
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var nombreField = getField("nombre");
      var emailField = getField("email");
      var mensajeField = getField("mensaje");

      var nombre = nombreField ? nombreField.value.trim() : "";
      var email = emailField ? emailField.value.trim() : "";
      var mensaje = mensajeField ? mensajeField.value.trim() : "";

      var valid = true;

      if (!nombre) {
        showError(nombreField, "Por favor, ingresá tu nombre.");
        valid = false;
      }
      if (!email) {
        showError(emailField, "Por favor, ingresá tu mail.");
        valid = false;
      } else if (!isValidEmail(email)) {
        showError(emailField, "Ingresá un mail válido.");
        valid = false;
      }
      if (!mensaje) {
        showError(mensajeField, "Contanos brevemente tu consulta.");
        valid = false;
      }

      if (!valid) {
        var firstInvalid = form.querySelector(".invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var texto =
        "Hola, soy " + nombre + "." +
        "\nMi mail es " + email + "." +
        "\nMensaje: " + mensaje;

      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(texto);

      if (feedback) feedback.classList.add("show");

      window.open(url, "_blank", "noopener");

      setTimeout(function () {
        form.reset();
        if (feedback) feedback.classList.remove("show");
      }, 3500);
    });
  }

  /* -----------------------------------------------------------------
     6. Scroll suave en enlaces internos / navbar
     ----------------------------------------------------------------- */

  function navOffset() {
    return (nav ? nav.offsetHeight : 64) + 14;
  }

  document.querySelectorAll('a[href*="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var href = a.getAttribute("href") || "";
      var i = href.indexOf("#");
      if (i < 0) return;
      var id = href.slice(i + 1);
      if (!id) {
        e.preventDefault();
        return;
      }
      var el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      var pos = el.getBoundingClientRect().top + window.scrollY - navOffset();
      window.scrollTo({ top: pos, behavior: "smooth" });
      if (history.replaceState) history.replaceState(null, "", "#" + id);
    });
  });
})();
