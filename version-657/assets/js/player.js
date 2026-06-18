function initPlayer(videoId, buttonId, source, poster) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var ready = false;

  if (!video || !button || !source) {
    return;
  }

  if (poster) {
    video.setAttribute('poster', poster);
  }

  function attachSource() {
    if (ready) {
      return;
    }
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function start() {
    attachSource();
    button.classList.add('is-hidden');
    var playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function () {
        button.classList.remove('is-hidden');
      });
    }
  }

  button.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
}
