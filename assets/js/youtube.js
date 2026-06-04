// 유튜브 썸네일 클릭 → 그 자리에서 iframe 재생.
// .video-card[data-yt]에 유튜브 URL(또는 11자리 ID)을 넣으면 ID를 추출해 처리.
(function () {
  function extractId(s) {
    if (!s) return '';
    const m = s.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/);
    return m ? m[1] : s.trim();
  }

  document.querySelectorAll('.video-card').forEach(card => {
    const id = extractId(card.dataset.yt || '');
    if (!id) return;

    // 썸네일이 비어 있으면 ID로 채움
    const thumb = card.querySelector('.video-thumb');
    if (thumb && !thumb.getAttribute('src')) {
      thumb.src = 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg';
    }

    card.addEventListener('click', () => {
      if (card.classList.contains('is-playing')) return;
      card.classList.add('is-playing');

      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0';
      iframe.title = 'YouTube video player';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      card.replaceChildren(iframe);
    });
  });
})();
