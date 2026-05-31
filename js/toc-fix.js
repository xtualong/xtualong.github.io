// Fix: TOC scroll tracking with bounds-safe active link highlighting
(function () {
  function patchToc() {
    var tocAuto = document.getElementById("toc-auto");
    var tocCore = document.getElementById("TableOfContents");
    var page = document.getElementsByClassName("page")[0];
    var postFooter = document.getElementById("post-footer");
    if (!tocAuto || !tocCore || !page || !postFooter) return;

    var headerDesktop = document.getElementById("header-desktop");
    var headerHeight = headerDesktop ? headerDesktop.offsetHeight : 0;
    var headerIsFixed =
      document.body.getAttribute("data-header-desktop") !== "normal";
    var TOP_SPACING = 20 + (headerIsFixed ? headerHeight : 0);

    // Use getBoundingClientRect + scrollTop for absolute document positions
    // (offsetTop is relative to offsetParent, which may not be the document)
    var scrollNow =
      (document.documentElement && document.documentElement.scrollTop) ||
      document.body.scrollTop;

    var pageRect = page.getBoundingClientRect();
    var pageTopAbs = pageRect.top + scrollNow;
    tocAuto.style.left = pageRect.left + pageRect.width + 20 + "px";
    tocAuto.style.maxWidth = pageRect.left - 20 + "px";
    tocAuto.style.visibility = "visible";
    // Set initial position
    tocAuto.style.position = "absolute";
    tocAuto.style.top = pageTopAbs + "px";

    var tocLinkElements = tocCore.querySelectorAll("a:first-child");
    var headerLinkElements = document.getElementsByClassName("headerLink");
    var tocLiElements = tocCore.getElementsByTagName("li");

    function onScroll() {
      var scrollTop =
        (document.documentElement && document.documentElement.scrollTop) ||
        document.body.scrollTop;

      // Recalculate page top each scroll (layout shifts from lazy images etc.)
      var pageRectNow = page.getBoundingClientRect();
      var pageTopAbsNow = pageRectNow.top + scrollTop;
      var minTocTop = pageTopAbsNow;
      var minScrollTop = minTocTop - TOP_SPACING;

      // Recalculate footer position each scroll (it can shift with lazy images etc.)
      var footerRect = postFooter.getBoundingClientRect();
      var footerTopAbs = footerRect.top + scrollTop;
      var tocHeight = tocAuto.getBoundingClientRect().height;
      var maxTocTop = footerTopAbs - tocHeight;
      var maxScrollTop = maxTocTop - TOP_SPACING;

      if (scrollTop < minScrollTop) {
        // Above the article: pin at article top
        tocAuto.style.position = "absolute";
        tocAuto.style.top = minTocTop + "px";
      } else if (scrollTop > maxScrollTop) {
        // Past the footer: pin above footer
        tocAuto.style.position = "absolute";
        tocAuto.style.top = maxTocTop + "px";
      } else {
        // In between: float with viewport
        tocAuto.style.position = "fixed";
        tocAuto.style.top = TOP_SPACING + "px";
      }

      // Highlight active TOC item with bounds checking
      var i,
        activeIndex = -1;
      for (i = 0; i < tocLinkElements.length; i++) {
        tocLinkElements[i].classList.remove("active");
      }
      for (i = 0; i < tocLiElements.length; i++) {
        tocLiElements[i].classList.remove("has-active");
      }

      if (headerLinkElements.length > 0 && tocLinkElements.length > 0) {
        var INDEX_SPACING = 20 + (headerIsFixed ? headerHeight : 0);
        for (i = 0; i < headerLinkElements.length - 1; i++) {
          var thisTop = headerLinkElements[i].getBoundingClientRect().top;
          var nextTop = headerLinkElements[i + 1].getBoundingClientRect().top;
          if (
            (i === 0 && thisTop > INDEX_SPACING) ||
            (thisTop <= INDEX_SPACING && nextTop > INDEX_SPACING)
          ) {
            activeIndex = i;
            break;
          }
        }
        if (activeIndex === -1) activeIndex = headerLinkElements.length - 1;
        if (activeIndex >= tocLinkElements.length)
          activeIndex = tocLinkElements.length - 1;
        if (activeIndex >= 0) {
          tocLinkElements[activeIndex].classList.add("active");
          var parent = tocLinkElements[activeIndex].parentElement;
          while (parent && parent !== tocCore) {
            parent.classList.add("has-active");
            parent = parent.parentElement
              ? parent.parentElement.parentElement
              : null;
          }
        }
      }
    }

    // Throttle scroll handler with requestAnimationFrame for better performance
    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(function () {
            onScroll();
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true },
    );
    onScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(patchToc, 200);
    });
  } else {
    setTimeout(patchToc, 200);
  }
})();
