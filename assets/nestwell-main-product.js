document.addEventListener("DOMContentLoaded", function () {
  var root = document.querySelector(".nestwell-product");
  if (!root) return;

  // ---------- Gallery: thumbnail click swaps main image ----------
  var thumbs = root.querySelectorAll("[data-thumb]");
  var mainImages = root.querySelectorAll("[data-main-image]");

  function activateMedia(mediaId) {
    thumbs.forEach(function (t) {
      t.classList.toggle(
        "nestwell-product__thumb--active",
        t.getAttribute("data-media-id") === String(mediaId),
      );
    });
    mainImages.forEach(function (img) {
      img.classList.toggle(
        "nestwell-product__main-image--active",
        img.getAttribute("data-media-id") === String(mediaId),
      );
    });
  }

  thumbs.forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      activateMedia(thumb.getAttribute("data-media-id"));
    });
  });

  // ---------- Variant selector ----------
  var selector = root.querySelector("[data-variant-selector]");
  if (selector) {
    var variantsJson = selector.querySelector("[data-variant-json]");
    var variants = JSON.parse(variantsJson.textContent);
    var swatches = selector.querySelectorAll("[data-swatch]");
    var optionGroups = selector.querySelectorAll(
      ".nestwell-product__option[data-option-position]",
    );
    var variantIdInput = root.querySelector("[data-variant-id-input]");
    var priceCurrent = root.querySelector("[data-price-current]");
    var priceCompare = root.querySelector("[data-price-compare]");
    var addBtn = root.querySelector("[data-add-to-cart-btn]");
    var addBtnText = root.querySelector("[data-add-to-cart-text]");

    function currentSelections() {
      var selections = [];
      optionGroups.forEach(function (group) {
        var active = group.querySelector(".nestwell-product__swatch--active");
        selections.push(active ? active.getAttribute("data-value") : null);
      });
      return selections;
    }

    function findMatchingVariant(selections) {
      return variants.find(function (v) {
        return selections.every(function (val, i) {
          return v["option" + (i + 1)] === val;
        });
      });
    }

    function updateForVariant(variant) {
      if (!variant) {
        variantIdInput.value = "";
        addBtn.setAttribute("disabled", "disabled");
        addBtnText.textContent = "Unavailable";
        return;
      }

      variantIdInput.value = variant.id;

      if (
        variant.compare_at_price &&
        variant.compare_at_price > variant.price
      ) {
        if (!priceCompare) {
          priceCompare = document.createElement("span");
          priceCompare.className = "nestwell-product__price-compare";
          priceCompare.setAttribute("data-price-compare", "");
          priceCurrent.parentNode.insertBefore(priceCompare, priceCurrent);
        }
        priceCompare.textContent = variant.compare_at_price_formatted;
        priceCompare.style.display = "";
        priceCurrent.classList.add("nestwell-product__price-sale");
      } else if (priceCompare) {
        priceCompare.style.display = "none";
        priceCurrent.classList.remove("nestwell-product__price-sale");
      }
      priceCurrent.textContent = variant.price_formatted;

      if (variant.available) {
        addBtn.removeAttribute("disabled");
        addBtnText.textContent = "Add to Cart";
      } else {
        addBtn.setAttribute("disabled", "disabled");
        addBtnText.textContent = "Sold Out";
      }

      var url = new URL(window.location.href);
      url.searchParams.set("variant", variant.id);
      window.history.replaceState({}, "", url);

      if (variant.featured_media) {
        activateMedia(variant.featured_media.id);
      }
    }

    swatches.forEach(function (swatch) {
      swatch.addEventListener("click", function () {
        var position = swatch.getAttribute("data-option-position");
        var group = selector.querySelector(
          '[data-option-position="' + position + '"]',
        );
        group.querySelectorAll("[data-swatch]").forEach(function (s) {
          s.classList.remove("nestwell-product__swatch--active");
        });
        swatch.classList.add("nestwell-product__swatch--active");

        var label = selector.querySelector(
          '[data-option-label="' + position + '"]',
        );
        if (label) label.textContent = swatch.getAttribute("data-value");

        var matched = findMatchingVariant(currentSelections());
        updateForVariant(matched);
      });
    });
  }

  // ---------- Quantity stepper ----------
  var qtyInput = root.querySelector("[data-qty-input]");
  root.querySelectorAll("[data-qty-action]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var val = parseInt(qtyInput.value, 10) || 1;
      if (btn.getAttribute("data-qty-action") === "increase") {
        qtyInput.value = val + 1;
      } else if (val > 1) {
        qtyInput.value = val - 1;
      }
    });
  });

  // ---------- Accordions ----------
  root.querySelectorAll("[data-accordion-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var content = btn.nextElementSibling;
      var icon = btn.querySelector(".nestwell-product__accordion-icon");
      var isOpen = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
      content.style.gridTemplateRows = isOpen ? "0fr" : "1fr";
      icon.textContent = isOpen ? "+" : "−";
    });
  });

  // ---------- Toast ----------
  var sectionId = root.getAttribute("data-section-id");
  var toastContainer = document.querySelector(
    '.nestwell-toast-container[data-section-id="' + sectionId + '"]',
  );
  function showToast(message) {
    if (!toastContainer) return;
    var toast = document.createElement("div");
    toast.className = "nestwell-toast";
    toast.textContent = message;
    toastContainer.appendChild(toast);
    requestAnimationFrame(function () {
      toast.classList.add("nestwell-toast--visible");
    });
    setTimeout(function () {
      toast.classList.remove("nestwell-toast--visible");
      setTimeout(function () {
        toast.remove();
      }, 300);
    }, 3000);
  }

  // ---------- Add to cart (AJAX, with quantity) ----------
  // FIX: button now disables + shows "Adding..." while the request is in
  // flight, and always resets in a `finally`. Prevents double-add on a
  // double click or a slow connection, which the original version allowed.
  var form = root.querySelector("#ProductForm");
  if (form) {
    var addToCartBtn = root.querySelector("[data-add-to-cart-btn]");
    var addToCartText = root.querySelector("[data-add-to-cart-text]");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (addToCartBtn && addToCartBtn.hasAttribute("data-loading")) return; // already in flight

      var variantId = root.querySelector("[data-variant-id-input]").value;
      var quantity = parseInt(qtyInput.value, 10) || 1;
      var originalLabel = addToCartText ? addToCartText.textContent : null;

      if (addToCartBtn) {
        addToCartBtn.setAttribute("data-loading", "");
        addToCartBtn.setAttribute("disabled", "disabled");
      }
      if (addToCartText) addToCartText.textContent = "Adding...";

      fetch(window.routes ? window.routes.cart_add_url : "/cart/add.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          items: [{ id: variantId, quantity: quantity }],
        }),
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          if (data.status) {
            showToast(data.description || "Could not add to cart");
            return;
          }
          showToast("Added to your cart");
          document.dispatchEvent(new CustomEvent("cart:updated"));
        })
        .catch(function () {
          showToast("Something went wrong. Please try again.");
        })
        .finally(function () {
          if (addToCartBtn) {
            addToCartBtn.removeAttribute("data-loading");
            addToCartBtn.removeAttribute("disabled");
          }
          if (addToCartText && originalLabel)
            addToCartText.textContent = originalLabel;
        });
    });
  }

  // ---------- Scroll reveal (for related products, once loaded) ----------
  function observeReveal(container) {
    var targets = container.querySelectorAll(".observe-fade-up");
    if (!targets.length) return;
    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ---------- Product recommendations fetch ----------
  var recWrap = root.querySelector('nestwell-product-recommendations');
  if (recWrap) {
    var url = recWrap.getAttribute("data-url");
    fetch(url)
      .then(function (res) {
        return res.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var content = doc.querySelector(".nestwell-product__related-grid");
        if (content) {
          recWrap.innerHTML = "";
          recWrap.appendChild(content);
          observeReveal(recWrap);
        } else {
          recWrap.remove();
        }
      })
      .catch(function () {
        recWrap.remove();
      });
  }
});
