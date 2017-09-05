"use-strict";

const  fs = require('fs');
const  yaml = require('js-yaml');
const  fileName = 'index.html';
const  stream = fs.createWriteStream(fileName);

const config_dir = './config.yml';

// load the config file
try {
  var config = yaml.safeLoad(fs.readFileSync(config_dir, 'utf8'));
} catch (e) {
  console.error(`Can\'t read config file ${config_dir}`);
  process.exit(1);
}

const font = config.font;
const glyphs = config.glyphs;

var allglyphs = '';

// template for each glyph
for(var i = 0; i < glyphs.length; i++){
  var num = glyphs[i];
  var name = glyphs[i].name;
  var byte_code = glyphs[i].code;
  var code = byte_code.toString(16);
  var human_hex = `0x${code}`;
  var hex = `&#x${code}`;

  allglyphs += `<div class="flex">
        <i class="pupil-icon ${name}">${hex};</i>
        <span class="i-name">Name: ${name}</span>
        <span class="i-code">Code: ${human_hex}</span>
      </div>`
}

// html components
const body = allglyphs;
const css = `.flex {
            display: flex;
            align-content: center;
          }
          body {
            margin: 0;
            font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
            font-size: 14px;
            line-height: 20px;
            color: #333;
            background-color: #fff;
          }
          @font-face {
            font-family: 'pupil_icons';
            src: url('./font/pupil_icons.ttf') format('truetype'),
                 url('./font/pupil_icons.svg') format('svg');
            font-weight: normal;
            font-style: normal;
          }
          .pupil-icon {
            font-family: "pupil_icons";
            font-style: normal;
            font-size: 2em;
            font-weight: normal;
            speak: none;
            display: inline-block;
            text-decoration: inherit;
            width: 1em;
            margin-right: 1em;
            text-align: center;
            font-variant: normal;
            text-transform: none;
            line-height: 1em;
            margin-left: .2em;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .i-name {
            margin-right: 1em;
            width: 4.5vw;
          }
          .i-code {
            margin-right: 1em;
          }`;


// html template
function buildHtml() {

  return `<!DOCTYPE html>
  <html>
    <header> 
      <meta charset="UTF-8">
        <style>
          ${css}
        </style>
    </header>
    <body> 
      ${body}
    </body>
  </html>`;
};


// create file
stream.once('open', function(fd) {
  let html = buildHtml();
  stream.end(html);
});