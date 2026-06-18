(function () {
    var panel = document.querySelector('[data-mobile-panel]');
    var button = document.querySelector('[data-menu-button]');

    if (button && panel) {
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
            document.body.classList.toggle('menu-open', panel.classList.contains('open'));
            button.textContent = panel.classList.contains('open') ? '×' : '☰';
        });
    }

    var blossomLayer = document.createElement('div');
    blossomLayer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(blossomLayer);

    for (var i = 0; i < 20; i += 1) {
        var petal = document.createElement('span');
        petal.className = 'cherry-blossom';
        petal.style.left = Math.random() * 100 + '%';
        petal.style.animationDelay = Math.random() * 8 + 's';
        petal.style.animationDuration = 10 + Math.random() * 12 + 's';
        blossomLayer.appendChild(petal);
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
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

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    document.querySelectorAll('.site-search').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                if (input) {
                    input.focus();
                }
            }
        });
    });

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    var searchInput = document.querySelector('.search-large input[name="q"]');
    if (searchInput && initialQuery) {
        searchInput.value = initialQuery;
    }

    var filterInput = document.querySelector('.page-filter');
    var filterList = document.querySelector('[data-filter-list]');
    var emptyState = document.querySelector('[data-empty-state]');

    if (filterInput && filterList) {
        if (initialQuery) {
            filterInput.value = initialQuery;
        }

        var filterCards = function () {
            var term = filterInput.value.trim().toLowerCase();
            var visible = 0;
            filterList.querySelectorAll('[data-card]').forEach(function (card) {
                var text = card.getAttribute('data-search') || card.textContent.toLowerCase();
                var matched = !term || text.indexOf(term) !== -1;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        };

        filterInput.addEventListener('input', filterCards);
        filterCards();
    }

    document.querySelectorAll('.movie-player').forEach(function (player) {
        var video = player.querySelector('video');
        var startButton = player.querySelector('.player-start');
        var hlsInstance = null;

        function startPlayer() {
            if (!video) {
                return;
            }

            var stream = video.getAttribute('data-stream');
            if (!stream) {
                return;
            }

            if (!player.classList.contains('is-ready')) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = stream;
                }
                player.classList.add('is-ready');
            }

            video.controls = true;
            player.classList.add('is-playing');
            var playTask = video.play();
            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {});
            }
        }

        if (startButton) {
            startButton.addEventListener('click', startPlayer);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!player.classList.contains('is-ready')) {
                    startPlayer();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}());
