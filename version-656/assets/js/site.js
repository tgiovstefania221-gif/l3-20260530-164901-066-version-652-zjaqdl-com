(function() {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function() {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));

  filterInputs.forEach(function(input) {
    var urlParams = new URLSearchParams(window.location.search);
    var initialQuery = urlParams.get('q');

    if (initialQuery && !input.value) {
      input.value = initialQuery;
    }
  });

  var activeCategory = 'all';
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-category-filter]'));

  function filterCards() {
    var scope = document.querySelector('[data-filter-scope]');
    var input = document.querySelector('[data-filter-input]');
    var emptyState = document.querySelector('[data-empty-state]');

    if (!scope) {
      return;
    }

    var query = normalize(input ? input.value : '');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var visible = 0;

    cards.forEach(function(card) {
      var searchText = normalize(card.getAttribute('data-search'));
      var category = card.getAttribute('data-category') || '';
      var matchQuery = !query || searchText.indexOf(query) !== -1;
      var matchCategory = activeCategory === 'all' || category === activeCategory;
      var shouldShow = matchQuery && matchCategory;

      card.style.display = shouldShow ? '' : 'none';

      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  filterInputs.forEach(function(input) {
    input.addEventListener('input', filterCards);
  });

  filterButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      activeCategory = button.getAttribute('data-category-filter') || 'all';

      filterButtons.forEach(function(item) {
        item.classList.toggle('is-active', item === button);
      });

      filterCards();
    });
  });

  filterCards();

  function startPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-start');
    var url = shell.getAttribute('data-hls');

    if (!video || !url) {
      return;
    }

    shell.classList.add('is-playing');

    if (button) {
      button.setAttribute('aria-hidden', 'true');
    }

    if (!video.getAttribute('data-ready')) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = url;
      }

      video.setAttribute('data-ready', 'true');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function() {});
    }
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function(shell) {
    var button = shell.querySelector('.player-start');

    if (button) {
      button.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayer(shell);
      });
    }

    shell.addEventListener('click', function(event) {
      if (event.target && event.target.closest && event.target.closest('.player-start')) {
        return;
      }

      if (!shell.classList.contains('is-playing')) {
        startPlayer(shell);
      }
    });
  });
})();
