/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist' },
    'data-js': { url: '/data', static: true, resolve: false },
  },
  plugins: [
    '@prefresh/snowpack',
    '@snowpack/plugin-dotenv',
    ['@snowpack/plugin-typescript'],
  ],
  alias: {
    react: 'preact/compat',
  },
  routes: [{ match: 'routes', src: '.*', dest: '/index.html' }],
};
