// 鼠标点击特效 - 显示随机文字
(function() {
  const words = ['❤️', '✨', '🎉', '👍', '🌟', '💪', '🔥', '⭐', '🎵', '💫'];

  document.addEventListener('click', function(e) {
    // 创建文字元素
    const word = document.createElement('span');
    word.textContent = words[Math.floor(Math.random() * words.length)];
    word.style.cssText = `
      position: fixed;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      pointer-events: none;
      user-select: none;
      font-size: 20px;
      z-index: 99999;
      animation: clickWordFloat 1s ease-out forwards;
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(word);

    // 动画结束后移除元素
    setTimeout(() => {
      word.remove();
    }, 1000);
  });

  // 添加动画样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes clickWordFloat {
      0% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -100px) scale(1.5);
      }
    }
  `;
  document.head.appendChild(style);
})();
