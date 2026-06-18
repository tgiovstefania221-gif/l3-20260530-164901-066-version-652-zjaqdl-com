
(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

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

        function startHero() {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                window.clearInterval(timer);
                startHero();
            });
        });

        showSlide(0);
        startHero();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var list = document.querySelector('[data-filter-list]');

    if (filterInput && list) {
        var params = new URLSearchParams(window.location.search);
        var queryInput = document.querySelector('[data-query-input]');
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
        var initialQuery = params.get('q') || '';

        if (queryInput && initialQuery) {
            queryInput.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function filterCards() {
            var keyword = normalize(filterInput.value);
            var year = yearSelect ? normalize(yearSelect.value) : '';

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.textContent
                ].join(' '));
                var cardYear = normalize(card.getAttribute('data-year'));
                var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                var yearMatch = !year || cardYear === year;
                card.classList.toggle('is-hidden', !(keywordMatch && yearMatch));
            });
        }

        filterInput.addEventListener('input', filterCards);
        if (yearSelect) {
            yearSelect.addEventListener('change', filterCards);
        }
        filterCards();
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var message = player.querySelector('[data-player-message]');
        var source = player.getAttribute('data-source');
        var hlsInstance = null;
        var ready = false;

        function setMessage(text) {
            if (!message) {
                return;
            }
            message.textContent = text || '';
            message.classList.toggle('is-visible', Boolean(text));
        }

        function attachSource() {
            if (!video || !source || ready) {
                return Promise.resolve();
            }

            ready = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            setMessage('视频加载失败，请稍后重试');
                            hlsInstance.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            setMessage('播放恢复中，请稍候');
                            hlsInstance.recoverMediaError();
                        } else {
                            setMessage('播放暂时不可用，请稍后重试');
                            hlsInstance.destroy();
                        }
                    }
                });
                return Promise.resolve();
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return Promise.resolve();
            }

            ready = false;
            setMessage('当前环境暂不支持播放');
            return Promise.reject(new Error('unsupported'));
        }

        function playVideo() {
            attachSource().then(function () {
                var result = video.play();
                if (result && typeof result.then === 'function') {
                    result.then(function () {
                        if (button) {
                            button.classList.add('is-hidden');
                        }
                        setMessage('');
                    }).catch(function () {
                        setMessage('点击播放按钮开始观看');
                    });
                } else if (button) {
                    button.classList.add('is-hidden');
                }
            }).catch(function () {});
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });

            video.addEventListener('pause', function () {
                if (button && video.currentTime === 0) {
                    button.classList.remove('is-hidden');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
