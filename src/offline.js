const metadataCache = 'anatomy-3d-offline';
const fileList = './offline-files.json';

async function savedCopy() {
  const response = await caches.match(fileList, { cacheName: metadataCache });
  const copy = response && await response.json();
  return copy && await caches.has(copy.cacheName) ? copy : null;
}

async function saveCopy(onProgress) {
  const listResponse = await fetch(fileList, { cache: 'no-store' });
  if (!listResponse.ok) throw new Error('파일 목록을 열 수 없습니다.');
  const { files, bytes } = await listResponse.json();
  const cacheName = `${metadataCache}-${crypto.randomUUID()}`;
  const cache = await caches.open(cacheName);
  let downloaded = 0;
  try {
    for (let start = 0; start < files.length; start += 4) {
      const batch = await Promise.allSettled(files.slice(start, start + 4).map(async file => {
        const response = await fetch(file.path, { cache: 'no-store' });
        if (!response.ok) throw new Error('오프라인 파일을 내려받지 못했습니다.');
        const data = await response.arrayBuffer();
        const digest = await crypto.subtle.digest('SHA-256', data);
        const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
        if (data.byteLength !== file.bytes || hash !== file.sha256) {
          throw new Error('내려받은 파일이 현재 버전과 다릅니다.');
        }
        const type = response.headers.get('Content-Type') || 'application/octet-stream';
        await cache.put(file.path, new Response(data, { headers: { 'Content-Type': type } }));
        downloaded += file.bytes;
        onProgress(Math.floor(downloaded / bytes * 100));
      }));
      const failed = batch.find(item => item.status === 'rejected');
      if (failed) throw failed.reason;
    }
    const previous = await savedCopy();
    const metadata = await caches.open(metadataCache);
    await metadata.put(fileList, Response.json({ cacheName, bytes }));
    if (previous) void caches.delete(previous.cacheName).catch(() => {});
  } catch (error) {
    await caches.delete(cacheName);
    throw error;
  }
}

export async function initOffline() {
  if (!('serviceWorker' in navigator) || !('caches' in window)) return;
  const panel = document.getElementById('offline-panel');
  const status = document.getElementById('offline-status');
  const progress = document.getElementById('offline-progress');
  const button = document.getElementById('save-offline');
  const link = document.getElementById('offline-link');
  const offline = new URLSearchParams(location.search).has('offline');

  function showSaved() {
    status.textContent = '오프라인 저장 완료 · 전신과 모든 상세 부위를 열 수 있습니다.';
    button.textContent = '저장 갱신';
    button.hidden = offline;
    link.hidden = false;
    if (offline) {
      link.href = './';
      link.textContent = '온라인으로 열기';
    }
  }

  try {
    if (await savedCopy()) {
      showSaved();
      panel.hidden = false;
    }
    // An installed app can open the saved copy while the worker script is unreachable.
    if (offline && !panel.hidden) return;
    await navigator.serviceWorker.register('./offline-worker.js');
    await navigator.serviceWorker.ready;
  } catch {
    button.hidden = true;
    return;
  }

  if (panel.hidden) status.textContent = '전신과 상세 부위를 저장하면 인터넷 없이도 볼 수 있습니다.';
  panel.hidden = false;
  button.addEventListener('click', async () => {
    button.disabled = true;
    progress.value = 0;
    progress.hidden = false;
    status.textContent = '이 기기에 저장 중입니다. 완료될 때까지 화면을 열어 두세요.';
    void navigator.storage?.persist?.().catch(() => {});
    try {
      await saveCopy(percent => { progress.value = percent; });
      showSaved();
    } catch (error) {
      status.textContent = error.name === 'QuotaExceededError'
        ? '저장 공간이 부족합니다. 공간을 확보한 뒤 다시 시도하세요.'
        : '저장하지 못했습니다. 인터넷 연결과 로그인 상태를 확인한 뒤 다시 시도하세요.';
    } finally {
      button.disabled = false;
      progress.hidden = true;
    }
  });
}
