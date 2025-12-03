module.exports = {
  content: [
    './index.html',
    './contact.html',
    './pages/**/*.html',
    './script.js',
    './assets/js/**/*.js'
  ],
  css: [
    './assets/css/style.css',
    './assets/css/responsive.css'
  ],
  output: './assets/css/purged/',
  safelist: {
    standard: [
      /^active$/,
      /^show$/,
      /^open$/,
      /^darkmode$/,
      /^theme-/,
      /^data-theme/,
      /^lenis/,
      /^notification/,
      /^preloader/,
      /^sidebar/,
      /^settings/,
      /^search/,
      /^night-light/
    ],
    deep: [
      /modal/,
      /overlay/,
      /ripple/,
      /transition/
    ],
    greedy: [
      /data-/,
      /aria-/
    ]
  }
};
