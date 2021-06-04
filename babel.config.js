module.exports = {
  plugins: ['@babel/plugin-transform-async-to-generator'],
  presets: [
    [
      '@babel/env',
      {
        targets: {
          node: 'current'
        },
        modules: 'cjs'
      }
    ],
    [
      "minify",
      {
        "booleans": true,
        "mangle": true,
        "simplify": true,
        "keepFnName": false
      }
    ]
  ]
}