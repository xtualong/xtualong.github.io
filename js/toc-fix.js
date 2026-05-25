// Fix: TOC scroll tracking with bounds-safe active link highlighting
(function() {
    function patchToc() {
        var tocAuto = document.getElementById('toc-auto');
        var tocCore = document.getElementById('TableOfContents');
        var page = document.getElementsByClassName('page')[0];
        var postFooter = document.getElementById('post-footer');
        if (!tocAuto || !tocCore || !page || !postFooter) return;

        var headerDesktop = document.getElementById('header-desktop');
        var headerHeight = headerDesktop ? headerDesktop.offsetHeight : 0;
        var headerIsFixed = document.body.getAttribute('data-header-desktop') !== 'normal';
        var TOP_SPACING = 20 + (headerIsFixed ? headerHeight : 0);

        var rect = page.getBoundingClientRect();
        tocAuto.style.left = (rect.left + rect.width + 20) + 'px';
        tocAuto.style.maxWidth = (rect.left - 20) + 'px';
        tocAuto.style.visibility = 'visible';

        var tocLinkElements = tocCore.querySelectorAll('a:first-child');
        var headerLinkElements = document.getElementsByClassName('headerLink');
        var tocLiElements = tocCore.getElementsByTagName('li');
        var minTocTop = tocAuto.offsetTop;
        var minScrollTop = minTocTop - TOP_SPACING + (headerIsFixed ? 0 : headerHeight);

        function onScroll() {
            var scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
            var footerTop = postFooter.offsetTop;
            var maxTocTop = footerTop - tocAuto.getBoundingClientRect().height;
            var maxScrollTop = maxTocTop - TOP_SPACING + (headerIsFixed ? 0 : headerHeight);

            if (scrollTop < minScrollTop) {
                tocAuto.style.position = 'absolute';
                tocAuto.style.top = minTocTop + 'px';
            } else if (scrollTop > maxScrollTop) {
                tocAuto.style.position = 'absolute';
                tocAuto.style.top = maxTocTop + 'px';
            } else {
                tocAuto.style.position = 'fixed';
                tocAuto.style.top = TOP_SPACING + 'px';
            }

            // Highlight active TOC item with bounds checking
            var i, activeIndex = -1;
            for (i = 0; i < tocLinkElements.length; i++) {
                tocLinkElements[i].classList.remove('active');
            }
            for (i = 0; i < tocLiElements.length; i++) {
                tocLiElements[i].classList.remove('has-active');
            }

            if (headerLinkElements.length > 0 && tocLinkElements.length > 0) {
                var INDEX_SPACING = 20 + (headerIsFixed ? headerHeight : 0);
                for (i = 0; i < headerLinkElements.length - 1; i++) {
                    var thisTop = headerLinkElements[i].getBoundingClientRect().top;
                    var nextTop = headerLinkElements[i + 1].getBoundingClientRect().top;
                    if ((i === 0 && thisTop > INDEX_SPACING) || (thisTop <= INDEX_SPACING && nextTop > INDEX_SPACING)) {
                        activeIndex = i;
                        break;
                    }
                }
                if (activeIndex === -1) activeIndex = headerLinkElements.length - 1;
                if (activeIndex >= tocLinkElements.length) activeIndex = tocLinkElements.length - 1;
                if (activeIndex >= 0) {
                    tocLinkElements[activeIndex].classList.add('active');
                    var parent = tocLinkElements[activeIndex].parentElement;
                    while (parent && parent !== tocCore) {
                        parent.classList.add('has-active');
                        parent = parent.parentElement ? parent.parentElement.parentElement : null;
                    }
                }
            }
        }

        window.addEventListener('scroll', onScroll, false);
        onScroll();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { setTimeout(patchToc, 200); });
    } else {
        setTimeout(patchToc, 200);
    }
})();
