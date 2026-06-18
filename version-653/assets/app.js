(function () {
  var mobileButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
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

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  document.querySelectorAll('.poster-frame img, .player-cover img, .category-covers img').forEach(function (image) {
    image.addEventListener('error', function () {
      var frame = image.closest('.poster-frame');
      if (frame) {
        frame.classList.add('image-missing');
      }
    });
  });

  function normalize(text) {
    return (text || '').toString().trim().toLowerCase();
  }

  function filterCards(root, query) {
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
    var normalized = normalize(query);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search') + ' ' + card.textContent);
      var matched = !normalized || haystack.indexOf(normalized) !== -1;
      card.classList.toggle('hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });

    var result = root.querySelector('[data-search-result]');
    if (result) {
      result.textContent = normalized ? '已筛选出 ' + visible + ' 条相关影片' : '';
    }
  }

  document.querySelectorAll('[data-filter-root]').forEach(function (root) {
    var input = root.querySelector('[data-filter-input]');
    if (!input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (query) {
      input.value = query;
      filterCards(root, query);
    }

    input.addEventListener('input', function () {
      filterCards(root, input.value);
    });
  });

  function loadHls(video, source, onReady) {
    if (!source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', onReady, { once: true });
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, onReady);
      video._hlsInstance = hls;
      return;
    }

    video.src = source;
    video.addEventListener('loadedmetadata', onReady, { once: true });
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var source = player.getAttribute('data-src');
    var prepared = false;

    function start() {
      player.classList.add('is-playing');

      if (!prepared) {
        prepared = true;
        loadHls(video, source, function () {
          video.play().catch(function () {});
        });
      }

      video.play().catch(function () {});
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!prepared) {
          start();
        }
      });
    }
  });
})();
