function forAllTags(name, callback) {
  [].forEach.call(document.getElementsByTagName(name), callback);
}

syntaxHighlighting = function (pre) {
  pre.innerHTML = pre.innerHTML
    .replace(/(?:\b[0-9]+(?:\.[0-9]+)?\b|"[^"]*"|\btrue\b|\bfalse\b)/g, '<span class="literal">$&</span>')
    .replace(/(?:\b(?:dynamic_cast|if|else|for|while|return|void|int|bool|float|vec2|vec3|vec4|uniform|varying|attribute|sizeof|template|typename|virtual|class(?!=)|struct|enum|typedef|using|namespace|static|const|operator|try|catch|throw|private|protected|public|new|delete)|#(include|define|undef))\b/g, '<span class="keyword">$&</span>')
    .replace(/\/\/.*/g, '<span class="comment">$&</span>');
}

// Simple syntax highlighting
forAllTags('pre', syntaxHighlighting);
