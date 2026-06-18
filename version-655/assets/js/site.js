(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("open");
      });
    }

    initHero();
    initFilters();
    initPlayer();
  });

  function initHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll(".filter-scope"));
    scopes.forEach(function (scope) {
      var keywordInput = scope.querySelector("[data-filter-keyword]");
      var yearSelect = scope.querySelector("[data-filter-year]");
      var regionSelect = scope.querySelector("[data-filter-region]");
      var typeSelect = scope.querySelector("[data-filter-type]");
      var empty = scope.querySelector("[data-filter-empty]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

      if (scope.hasAttribute("data-url-filters")) {
        var params = new URLSearchParams(window.location.search);
        if (keywordInput && params.get("q")) {
          keywordInput.value = params.get("q");
        }
        if (yearSelect && params.get("year")) {
          yearSelect.value = params.get("year");
        }
        if (regionSelect && params.get("region")) {
          regionSelect.value = params.get("region");
        }
        if (typeSelect && params.get("type")) {
          typeSelect.value = params.get("type");
        }
      }

      function apply() {
        var keyword = normalize(keywordInput ? keywordInput.value : "");
        var year = normalize(yearSelect ? yearSelect.value : "");
        var region = normalize(regionSelect ? regionSelect.value : "");
        var type = normalize(typeSelect ? typeSelect.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var blob = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var ok = true;
          if (keyword && blob.indexOf(keyword) === -1) {
            ok = false;
          }
          if (year && normalize(card.getAttribute("data-year")) !== year) {
            ok = false;
          }
          if (region && normalize(card.getAttribute("data-region")) !== region) {
            ok = false;
          }
          if (type && normalize(card.getAttribute("data-type")) !== type) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [keywordInput, yearSelect, regionSelect, typeSelect].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function initPlayer() {
    var shell = document.querySelector(".player-shell");
    if (!shell) {
      return;
    }

    var video = shell.querySelector("video");
    var overlay = shell.querySelector("[data-play-button]");
    var message = shell.querySelector("[data-player-message]");
    var stream = shell.getAttribute("data-stream");
    var mediaReady = false;
    var hls = null;

    if (!video || !stream) {
      return;
    }

    function setMessage(text) {
      if (!message) {
        return;
      }
      if (text) {
        message.textContent = text;
        message.hidden = false;
      } else {
        message.textContent = "";
        message.hidden = true;
      }
    }

    function attachMedia() {
      if (mediaReady) {
        return;
      }
      mediaReady = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setMessage("视频加载遇到问题，请稍后重试");
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setMessage("视频播放遇到问题，正在恢复");
            hls.recoverMediaError();
          } else {
            setMessage("视频暂时无法播放，请稍后重试");
            hls.destroy();
          }
        });
        return;
      }

      setMessage("当前浏览环境暂时无法播放该视频");
    }

    function play() {
      attachMedia();
      setMessage("");
      var promise = video.play();
      if (promise && typeof promise.then === "function") {
        promise.then(function () {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
        }).catch(function () {
          setMessage("点击视频区域可继续播放");
        });
      } else if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove("is-hidden");
      }
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }
})();
