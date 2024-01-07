//Copy text button for <pre>
function copyText() {
  var copyToText = document.getElementById('copy-text').textContent;
  const textArea = document.createElement('textarea');

  textArea.textContent = copyToText;
  // Create dummy element so we can select it (cannot select a <pre>)
  document.body.append(textArea);
  // Select the text
  textArea.select();
  // Actually copy it
  document.execCommand('copy');
  // Log the copied text
  console.log('Copied the text: ' + copyToText);
}

