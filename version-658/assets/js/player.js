function initializeMoviePlayer(videoSource) {
  var video = document.getElementById("moviePlayer");
  var overlay = document.getElementById("playerOverlay");
  var playButton = document.getElementById("playButton");
  var hlsInstance = null;
  var loaded = false;

  if (!video || !videoSource) {
    return;
  }

  function loadSource() {
    if (loaded) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSource;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(videoSource);
      hlsInstance.attachMedia(video);
    } else {
      video.src = videoSource;
    }

    loaded = true;
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  }

  function startPlayback(event) {
    if (event) {
      event.preventDefault();
    }
    loadSource();
    hideOverlay();
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener("click", startPlayback);
  }

  if (playButton) {
    playButton.addEventListener("click", startPlayback);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    } else {
      video.pause();
    }
  });

  video.addEventListener("play", hideOverlay);

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
