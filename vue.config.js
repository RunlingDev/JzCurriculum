module.exports = {
    publicPath: '/',
    devServer: {
      proxy: {
        '/api': {
          target: 'https://kq.stjszx.net',
          changeOrigin: true,
          pathRewrite: {
            '^/api': ''
          }
        }
      }
    }
  }