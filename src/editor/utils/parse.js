export default function (codeStr) {
  const html = document.createElement('div');
  const content = html.innerHTML = codeStr.trim();

  try {
    const template = html.querySelector('template');
    const script = html.querySelector('script');
    const styles = [...html.querySelectorAll('style')].map(n => n.innerHTML);

    if (!template && !script && !styles.length) {
      return {
        content,
        script: content
      };
    }

    return {
      content: /<\/script>$/g.test(content) ? content : (content + '\n</script>'),
      template: template ? template.innerHTML : '',
      script: script ? script.innerHTML : '',
      styles: styles
    };

  } catch (error) {
    return {
      error
    };
  }
}