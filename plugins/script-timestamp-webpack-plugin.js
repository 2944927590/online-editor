const HtmlWebpackPlugin = require('html-webpack-plugin');
class SetScriptTimestampPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('SetScriptTimestampPlugin', (compilation) => {
      HtmlWebpackPlugin
      .getHooks(compilation)
      .afterTemplateExecution
      .tapAsync('SetScriptTimestampPlugin', (data, cb) => {
        // 读取并修改 script 上 src 列表
        let assets = JSON.parse(data.plugin.assetJson);
        console.log('assets ', assets)
        const jsScripts = assets.filter(item => /\.js/.test(item));
        data.bodyTags = data.bodyTags.filter(item => item.tagName !== 'script');
        // console.log(data.plugin.assetJson, jsScripts);
        let result = `
          <script>
            const jsScripts = [${jsScripts.map(j => '"' + j + '"').join(',')}];
            const suffix = "?" + new Date().getTime()
            jsScripts.forEach(item => {
              const scriptDOM = document.createElement("script");
              scriptDOM.src = item + suffix;
              document.body.appendChild(scriptDOM)
            })
          </script>
        `;
        let resultHTML = data.html.replace(
          "<!--SetScriptTimestampPlugin inset script-->", result
        );
        // console.log(data);
        // 返回修改后的结果
        data.html = resultHTML;
        cb(null, data);
      });
    });
  }
}
module.exports = SetScriptTimestampPlugin;