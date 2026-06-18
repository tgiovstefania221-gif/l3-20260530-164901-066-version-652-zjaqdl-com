(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"], input[type="search"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }
  }

  document.querySelectorAll('[data-filter-form]').forEach(function (form) {
    var input = form.querySelector('[data-filter-input]');
    var list = document.querySelector('[data-filter-list]');
    if (!input || !list) {
      return;
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
    });
    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      list.querySelectorAll('[data-card]').forEach(function (card) {
        var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta')).toLowerCase();
        card.classList.toggle('hidden-card', keyword && text.indexOf(keyword) === -1);
      });
    });
  });

  var resultsBox = document.querySelector('[data-search-results]');
  if (resultsBox && window.SEARCH_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.querySelector('[data-search-input]');
    if (input) {
      input.value = query;
    }
    if (query) {
      var lower = query.toLowerCase();
      var results = window.SEARCH_INDEX.filter(function (item) {
        return item.text.toLowerCase().indexOf(lower) !== -1;
      }).slice(0, 80);
      if (results.length) {
        resultsBox.innerHTML = '<h2>搜索结果</h2><div class="search-result-grid">' + results.map(function (item) {
          return '<a class="search-result" href="' + item.url + '"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '"><span><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.desc) + '</p><span class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.category) + '</span></span></span></a>';
        }).join('') + '</div>';
      } else {
        resultsBox.innerHTML = '<h2>搜索结果</h2><p>没有找到匹配内容。</p>';
      }
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }
})();
