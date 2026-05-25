// 覆盖主题默认的三态切换为二态（light/dark）
(function() {
    function initTwoStateToggle() {
        document.querySelectorAll('.theme-switch').forEach(function(el) {
            // 克隆节点移除所有已有事件
            var clone = el.cloneNode(true);
            el.parentNode.replaceChild(clone, el);
            clone.addEventListener('click', function() {
                var isDark = document.body.getAttribute('theme') === 'dark';
                var newTheme = isDark ? 'light' : 'dark';
                document.body.setAttribute('theme', newTheme);
                document.body.setAttribute('cfg-theme', newTheme);
                try { localStorage.setItem('theme', newTheme); } catch(ex) {}
            });
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initTwoStateToggle, 100);
        });
    } else {
        setTimeout(initTwoStateToggle, 100);
    }
})();
