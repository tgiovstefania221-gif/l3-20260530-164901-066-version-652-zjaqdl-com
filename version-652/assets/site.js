(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function initMenu() {
    var button = qs('[data-menu-button]');
    var nav = qs('[data-main-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slides = qsa('[data-hero-slide]');
    if (!slides.length) {
      return;
    }
    var dots = qsa('[data-hero-dot]');
    var prev = qs('[data-hero-prev]');
    var next = qs('[data-hero-next]');
    var index = 0;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    window.setInterval(function () {
      show(index + 1);
    }, 6200);
  }

  function initFilters() {
    var cards = qsa('.movie-card, .ranking-item');
    if (!cards.length) {
      return;
    }
    var search = qs('[data-page-search]');
    var year = qs('[data-filter-year]');
    var type = qs('[data-filter-type]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (search && query) {
      search.value = query;
    }

    function apply() {
      var keyword = text(search && search.value);
      var yearValue = text(year && year.value);
      var typeValue = text(type && type.value);
      cards.forEach(function (card) {
        var haystack = text(card.getAttribute('data-search'));
        var cardYear = text(card.getAttribute('data-year'));
        var cardType = text(card.getAttribute('data-type'));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !yearValue || cardYear === yearValue;
        var matchType = !typeValue || cardType === typeValue;
        card.hidden = !(matchKeyword && matchYear && matchType);
      });
    }

    [search, year, type].forEach(function (input) {
      if (input) {
        input.addEventListener('input', apply);
        input.addEventListener('change', apply);
      }
    });

    apply();
  }

  window.setupMoviePlayer = function (options) {
    var video = qs(options.selector);
    var overlay = qs(options.overlay);
    var source = options.source;
    if (!video || !source) {
      return;
    }
    var hls = null;
    var ready = false;

    function start() {
      if (!ready) {
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
        video.setAttribute('controls', 'controls');
      }
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (!ready) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
