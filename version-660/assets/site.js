(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("open");
    });
  }

  const hero = document.querySelector(".hero-slider");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    let current = 0;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5800);
    }
  }

  const localInput = document.querySelector(".local-search");
  const localCards = Array.from(document.querySelectorAll("[data-search]"));
  const noResult = document.querySelector(".no-result");

  const applyFilter = function (value) {
    const keyword = (value || "").trim().toLowerCase();
    let visible = 0;

    localCards.forEach(function (card) {
      const text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
      const match = !keyword || text.indexOf(keyword) !== -1;
      card.style.display = match ? "" : "none";
      if (match) {
        visible += 1;
      }
    });

    if (noResult) {
      noResult.style.display = visible ? "none" : "block";
    }
  };

  if (localInput && localCards.length) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";

    if (query) {
      localInput.value = query;
      applyFilter(query);
    }

    localInput.addEventListener("input", function () {
      applyFilter(localInput.value);
    });
  }
})();
