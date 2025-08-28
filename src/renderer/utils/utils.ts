export function debounce(fn, delay = 300, immediate = false) {
  let timer = null;

  return function (...args) {
    const context = this;

    if (timer) clearTimeout(timer);

    if (immediate && !timer) {
      fn.apply(context, args); // 第一次立即执行
    }

    timer = setTimeout(() => {
      if (!immediate) fn.apply(context, args);
      timer = null; // 清理，确保下一次还能立即执行
    }, delay);
  };
}
