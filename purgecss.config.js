module.exports = {
  content: [
    './index.html',
    './contact.html',
    './pages/**/*.html',
    './script.js',
    './assets/js/**/*.js'
  ],
  css: [
    './assets/css/core.css',
    './assets/css/preloader.css',
    './assets/css/navigation.css',
    './assets/css/sidebar.css',
    './assets/css/search.css',
    './assets/css/settings.css',
    './assets/css/responsive.css',
    './assets/css/install-button.css',
    './assets/css/skeleton.css',
    './assets/css/settings-fix.css'
  ],
  output: './assets/css/purged/',
  safelist: {
    standard: [
      /^active$/,
      /^show$/,
      /^open$/,
      /^loaded$/,
      /^darkmode$/,
      /^theme-/,
      /^data-theme/,
      /^lenis/,
      /^notification/,
      /^preloader/,
      /^webPreloader/,
      /^loading-/,
      /^loader-/,
      /^sidebar/,
      /^settings/,
      /^search/,
      /^night-light/,
      /^skeleton/,
      /^no-scroll$/
    ],
    deep: [
      /modal/,
      /overlay/,
      /ripple/,
      /transition/,
      /fade/,
      /slide/
    ],
    greedy: [
      /data-/,
      /aria-/,
      /\[data-/
    ]
  }
};

