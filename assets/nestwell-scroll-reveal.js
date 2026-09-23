function initScrollReveal(root) {
  var targets = root.querySelectorAll(
    '.observe-fade-up, .observe-fade-left, .observe-fade-right, .observe-scale-in'
  );
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  targets.forEach(function (el) { observer.observe(el); });
}

document.addEventListener('DOMContentLoaded', function () {
  initScrollReveal(document);
});

document.addEventListener('shopify:section:load', function (event) {
  initScrollReveal(event.target);
});

window.nestwellObserveReveal = function (el) {
  if (!el) return;
  if (!('IntersectionObserver' in window)) {
    el.classList.add('is-visible');
    return;
  }
  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  observer.observe(el);
};