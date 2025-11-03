
(async () => {
  const slots = document.querySelectorAll('[data-include]');
  const tasks = Array.from(slots).map(async (el) => {
    const url = el.getAttribute('data-include');
    const res = await fetch(url, { cache: 'no-cache' });
    const html = await res.text();
    
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    el.replaceWith(...wrapper.childNodes);
  });

  await Promise.all(tasks);

  document.dispatchEvent(new CustomEvent('partials:loaded'));
})();

