document.addEventListener("DOMContentLoaded", () => {
  // Create floating hearts background (subtle)
  const heartsWrap = document.querySelector(".hearts");
  if (heartsWrap) {
    setInterval(() => spawnHeart(heartsWrap), 520);
  }

  function spawnHeart(container) {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.textContent = Math.random() > 0.5 ? "💗" : "💘";

    const left = Math.random() * 100;
    const size = 14 + Math.random() * 18;
    const duration = 7 + Math.random() * 6;
    const drift = (Math.random() * 120 - 60).toFixed(0);

    heart.style.left = `${left}vw`;
    heart.style.fontSize = `${size}px`;
    heart.style.animationDuration = `${duration}s`;
    heart.style.setProperty("--drift", `${drift}px`);

    container.appendChild(heart);
    setTimeout(() => heart.remove(), duration * 1000);
  }

  // -------------------------
  // INDEX PAGE: Yes/No buttons
  // -------------------------
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const message = document.getElementById("message");

  const noTease = [
    "No 😢",
    "Are you sure? 😳",
    "Maya… don’t do this 😭",
    "You’re joking right? 😤",
    "That button is broken 😇",
    "Try Yes instead 💖",
    "You can’t catch me 😈"
  ];
  let teaseIndex = 0;

  if (yesBtn && message) {
    yesBtn.addEventListener("click", () => {
      message.classList.add("show");
      setTimeout(() => {
        window.location.href = "main.html";
      }, 650);
    });
  }

  // GUARANTEED-IN-VIEWPORT No button
  if (noBtn) {
    const pad = 18;
    let clampRaf = 0;

    const getViewportSize = () => {
      if (window.visualViewport) {
        return {
          width: window.visualViewport.width,
          height: window.visualViewport.height
        };
      }

      return {
        width: Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0),
        height: Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0)
      };
    };

    const getStylePosition = () => {
      const rect = noBtn.getBoundingClientRect();
      const parsedLeft = parseFloat(noBtn.style.left);
      const parsedTop = parseFloat(noBtn.style.top);

      return {
        left: Number.isFinite(parsedLeft) ? parsedLeft : rect.left,
        top: Number.isFinite(parsedTop) ? parsedTop : rect.top
      };
    };

    const nudgeIntoViewport = () => {
      const viewport = getViewportSize();
      const rect = noBtn.getBoundingClientRect();

      const minLeft = pad;
      const maxRight = viewport.width - pad;
      const minTop = pad;
      const maxBottom = viewport.height - pad;

      let dx = 0;
      let dy = 0;

      if (rect.width >= viewport.width - pad * 2) {
        dx = minLeft - rect.left;
      } else if (rect.left < minLeft) {
        dx = minLeft - rect.left;
      } else if (rect.right > maxRight) {
        dx = maxRight - rect.right;
      }

      if (rect.height >= viewport.height - pad * 2) {
        dy = minTop - rect.top;
      } else if (rect.top < minTop) {
        dy = minTop - rect.top;
      } else if (rect.bottom > maxBottom) {
        dy = maxBottom - rect.bottom;
      }

      if (dx !== 0 || dy !== 0) {
        const pos = getStylePosition();
        noBtn.style.left = `${pos.left + dx}px`;
        noBtn.style.top = `${pos.top + dy}px`;
      }
    };

    const settleIntoViewport = () => {
      if (!noBtn.classList.contains("is-fleeing")) return;

      if (clampRaf) cancelAnimationFrame(clampRaf);
      clampRaf = requestAnimationFrame(() => {
        nudgeIntoViewport();
        clampRaf = requestAnimationFrame(() => nudgeIntoViewport());
      });
    };

    const getRandomTargetStylePos = () => {
      const viewport = getViewportSize();
      const rect = noBtn.getBoundingClientRect();
      const pos = getStylePosition();

      const rangeX = Math.max(0, viewport.width - rect.width - pad * 2);
      const rangeY = Math.max(0, viewport.height - rect.height - pad * 2);
      const targetRectLeft = pad + Math.random() * rangeX;
      const targetRectTop = pad + Math.random() * rangeY;

      // This offset handles browsers where fixed-position coordinates and
      // rect coordinates do not share the same origin.
      const styleOffsetX = pos.left - rect.left;
      const styleOffsetY = pos.top - rect.top;

      return {
        left: styleOffsetX + targetRectLeft,
        top: styleOffsetY + targetRectTop
      };
    };

    const tease = () => {
      teaseIndex = (teaseIndex + 1) % noTease.length;
      noBtn.textContent = noTease[teaseIndex];
    };

    const setFixedIfNeeded = () => {
      if (!noBtn.classList.contains("is-fleeing")) {
        const r = noBtn.getBoundingClientRect();
        noBtn.classList.add("is-fleeing");
        noBtn.style.left = `${r.left}px`;
        noBtn.style.top = `${r.top}px`;
        settleIntoViewport();
      }
    };

    const moveNoButton = () => {
      setFixedIfNeeded();
      const target = getRandomTargetStylePos();

      // Pick a random spot that is ALWAYS inside the viewport
      // Restart the wiggle each run so it feels like it is actively escaping.
      noBtn.classList.remove("is-running");
      void noBtn.offsetWidth;
      noBtn.classList.add("is-running");

      noBtn.style.left = `${target.left}px`;
      noBtn.style.top = `${target.top}px`;
      settleIntoViewport();
    };

    // Hover = run away + tease
    noBtn.addEventListener("pointerenter", () => {
      tease();
      moveNoButton();
    });

    // Click = even more teasing
    noBtn.addEventListener("click", () => {
      noBtn.textContent = "😳 Nice try";
      moveNoButton();
    });

    noBtn.addEventListener("transitionend", (event) => {
      if (event.propertyName === "left" || event.propertyName === "top") {
        noBtn.classList.remove("is-running");
        settleIntoViewport();
      }
    });

    // On viewport changes, clamp it back into view.
    const clampIfFleeing = () => {
      if (!noBtn.classList.contains("is-fleeing")) return;
      settleIntoViewport();
    };

    window.addEventListener("resize", clampIfFleeing);
    window.addEventListener("orientationchange", clampIfFleeing);
    window.addEventListener("scroll", clampIfFleeing, { passive: true });

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", clampIfFleeing);
      window.visualViewport.addEventListener("scroll", clampIfFleeing);
    }

    if (typeof ResizeObserver !== "undefined") {
      const buttonResizeObserver = new ResizeObserver(clampIfFleeing);
      buttonResizeObserver.observe(noBtn);
    }
  }

  // -------------------------
  // MAIN PAGE: Typewriter letter
  // -------------------------
  const typedLetter = document.getElementById("typedLetter");
  if (typedLetter) {
    const letterText =
      "I don’t really know how to write this without sounding cheesy, but I mean it.\n\n" +
      "You make life feel lighter. You make the boring parts feel fun. And even when we’re apart, you still feel close.\n\n" +
      "So here’s me asking properly.\n" +
      "Will you be my Valentine, and my favourite person, today and every day after? 💘";

    typewriter(typedLetter, letterText, 18);
  }

  function typewriter(el, text, speed = 20) {
    el.classList.add("type-cursor");
    el.textContent = "";
    let i = 0;

    const tick = () => {
      el.textContent += text[i];
      i += 1;
      if (i < text.length) setTimeout(tick, speed);
      else el.classList.remove("type-cursor");
    };

    tick();
  }

  // -------------------------
  // MAIN PAGE: Open When cards
  // -------------------------
  const cards = document.querySelectorAll(".card[data-msg]");
  const cardMessage = document.getElementById("cardMessage");

  if (cards.length && cardMessage) {
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        cardMessage.textContent = card.dataset.msg;
        cardMessage.classList.add("show");
      });
    });
  }

  // -------------------------
  // MAIN PAGE: Music toggle
  // -------------------------
  const music = document.getElementById("bgMusic");
  const musicControl = document.getElementById("musicControl");

  if (music && musicControl) {
    let isPlaying = false;

    const updateBtn = () => {
      musicControl.classList.toggle("is-off", !isPlaying);
      musicControl.textContent = isPlaying ? "🎵" : "🔇";
    };

    updateBtn();

    musicControl.addEventListener("click", async () => {
      try {
        if (!isPlaying) {
          await music.play();
          isPlaying = true;
        } else {
          music.pause();
          isPlaying = false;
        }
        updateBtn();
      } catch {
        isPlaying = false;
        updateBtn();
      }
    });
  }

  // -------------------------
  // MAIN PAGE: Polaroid fullscreen viewer (fits image)
  // -------------------------
  const polaroids = document.querySelectorAll(".polaroid");
  const overlay = document.getElementById("photoOverlay");
  const viewerImg = document.getElementById("viewerImg");
  const viewerCaption = document.getElementById("viewerCaption");
  const viewerClose = document.getElementById("viewerClose");
  const pageContent = document.getElementById("pageContent");
  let activePolaroid = null;
  let closeTimer = 0;
  const closeAnimMs = 420;

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  const setViewerOriginFromPolaroid = (fig) => {
    if (!overlay) return;

    if (!fig) {
      overlay.style.setProperty("--from-x", "0px");
      overlay.style.setProperty("--from-y", "24px");
      overlay.style.setProperty("--from-scale", "0.88");
      return;
    }

    const rect = fig.getBoundingClientRect();
    const viewportW = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0);
    const viewportH = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0);
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const fromX = centerX - viewportW / 2;
    const fromY = centerY - viewportH / 2;
    const relativeScale = rect.width / Math.max(1, viewportW * 0.7);
    const fromScale = clamp(relativeScale, 0.28, 0.72);

    overlay.style.setProperty("--from-x", `${fromX.toFixed(2)}px`);
    overlay.style.setProperty("--from-y", `${fromY.toFixed(2)}px`);
    overlay.style.setProperty("--from-scale", `${fromScale.toFixed(3)}`);
  };

  const openViewer = (imgSrc, caption, fig = null) => {
    if (!overlay || !viewerImg || !viewerCaption || !pageContent) return;

    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = 0;
    }

    overlay.classList.remove("is-closing");
    overlay.classList.add("open");

    if (activePolaroid) activePolaroid.classList.remove("is-viewing");
    activePolaroid = fig;
    if (activePolaroid) activePolaroid.classList.add("is-viewing");

    setViewerOriginFromPolaroid(activePolaroid);
    viewerImg.classList.remove("is-ready");
    viewerImg.src = imgSrc;
    viewerCaption.textContent = caption || "";
    viewerCaption.hidden = !caption;

    overlay.setAttribute("aria-hidden", "false");

    requestAnimationFrame(() => {
      overlay.classList.add("is-visible");
    });

    pageContent.classList.add("is-blurred");
    document.body.style.overflow = "hidden";
    if (viewerClose) viewerClose.focus({ preventScroll: true });
  };

  const closeViewer = () => {
    if (!overlay || !pageContent) return;
    if (!overlay.classList.contains("open") || overlay.classList.contains("is-closing")) return;

    overlay.setAttribute("aria-hidden", "true");
    overlay.classList.add("is-closing");
    overlay.classList.remove("is-visible");
    pageContent.classList.remove("is-blurred");
    document.body.style.overflow = "";

    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      overlay.classList.remove("open", "is-closing");
      viewerImg.classList.remove("is-ready");
      if (activePolaroid) activePolaroid.classList.remove("is-viewing");
      activePolaroid = null;
      closeTimer = 0;
    }, closeAnimMs);
  };

  if (polaroids.length && overlay) {
    if (viewerImg) {
      viewerImg.addEventListener("load", () => {
        viewerImg.classList.add("is-ready");
      });
    }

    polaroids.forEach((fig) => {
      fig.setAttribute("role", "button");
      fig.setAttribute("tabindex", "0");

      const openFromFigure = () => {
        const img = fig.querySelector("img");
        const cap = fig.querySelector("figcaption");
        if (!img) return;
        const captionText = cap ? cap.textContent : "";
        fig.setAttribute("aria-label", captionText || "Open photo");
        openViewer(img.src, captionText, fig);
      };

      fig.addEventListener("click", () => {
        openFromFigure();
      });

      fig.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openFromFigure();
        }
      });
    });

    if (viewerClose) viewerClose.addEventListener("click", closeViewer);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeViewer();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("open")) closeViewer();
    });

    window.addEventListener("resize", () => {
      if (!overlay.classList.contains("open") || overlay.classList.contains("is-closing")) return;
      setViewerOriginFromPolaroid(activePolaroid);
    });
  }
});
