#!/usr/bin/env node

'use strict';

const fs        = require('fs');
const path      = require('path');
const _         = require('lodash');
const yaml      = require('js-yaml');
const DOMParser = require('xmldom').DOMParser;
const fstools   = require('fs-tools');
const execFile  = require('child_process').execFile;
const ArgumentParser = require('argparse').ArgumentParser;
const svgpath   = require('svgpath');

function parseSvgImage(data, filename) {

  var doc = (new DOMParser()).parseFromString(data, "application/xml");
  var svg = doc.getElementsByTagName('svg')[0];

  if (!svg.hasAttribute('height')) {
    throw filename ? 'Missed height attribute in ' + filename : 'Missed height attribute';
  }
  if (!svg.hasAttribute('width')) {
    throw filename ? 'Missed width attribute in ' + filename : 'Missed width attribute';
  }

  var height = svg.getAttribute('height');
  var width  = svg.getAttribute('width');

  // Silly strip 'px' at the end, if exists
  height = parseFloat(height);
  width  = parseFloat(width);

  var path = svg.getElementsByTagName('path');

  if (path.length > 1) {
    throw 'Multiple paths not supported' + (filename ? ' -- ' + filename + ' ' : '');
  }
  if (path.length === 0) {
    throw 'No path data fount' + (filename ? ' -- ' + filename + ' ' : '');
  }

  path = path[0];

  var d = path.getAttribute('d');

  var transform = '';

  if (path.hasAttribute('transform')) {
    transform = path.getAttribute('transform');
  }

  return {
    height    : height,
    width     : width,
    d         : d,
    transform : transform
  };
}

var svgImageTemplate = _.template(
    '<svg height="<%= height %>" width="<%= width %>" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="<%= d %>"<% if (transform) { %> transform="<%= transform %>"<% } %>/>' +
    '</svg>'
  );

var svgFontTemplate = _.template(
    '<?xml version="1.0" standalone="no"?>\n' +
    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' +
    '<svg xmlns="http://www.w3.org/2000/svg">\n' +
    '<metadata><%= metadata %></metadata>\n' +
    '<defs>\n' +
    '<font id="<%= font.fontname %>" horiz-adv-x="<%= fontHeight %>" >\n' +

    '<font-face' +
      ' font-family="<%= fontFamily %>"' +
      ' font-weight="400"' +
      ' font-stretch="normal"' +
      ' units-per-em="<%= fontHeight %>"' +
      ' ascent="<%= font.ascent %>"' +
      ' descent="<%= font.descent %>"' +
    ' />\n' +

    '<missing-glyph horiz-adv-x="<%= fontHeight %>" />\n' +

    '<% _.forEach(glyphs, function(glyph) { %>' +
      '<glyph' +
        ' glyph-name="<%= glyph.name %>"' +
        ' unicode="<%= glyph.unicode %>"' +
        ' d="<%= glyph.d %>"' +
        ' horiz-adv-x="<%= glyph.width %>"' +
      ' />\n' +
    '<% }); %>' +

    '</font>\n' +
    '</defs>\n' +
    '</svg>'
  );

var parser = new ArgumentParser({
  version: require('./package.json').version,
  addHelp: true,
  description: 'Create SVG font from separate images'
});
parser.addArgument([ '-c', '--config' ], { help: 'Font config file', required: true });
parser.addArgument([ '-i', '--input_dir' ], { help: 'Source images path', required: true });
parser.addArgument([ '-o', '--output' ], { help: 'Output font file path', required: true });
parser.addArgument([ '-s', '--svgo_config' ], { help: 'SVGO config path (use default if not set)' });

var args = parser.parseArgs();

////////////////////////////////////////////////////////////////////////////////

var config, tmpDir;

try {
  config = yaml.load(fs.readFileSync(args.config, 'utf8'));
} catch (e) {
  console.error('Can\'t read config file ' + args.config);
  process.exit(1);
}

// tmpDir = path.resolve('./tmp');
// tmpDir = fstools.tmpdir();
// fstools.mkdirSync(tmpDir);

var font = config.font;
// fix descent sign
if (font.descent > 0) { font.descent = -font.descent; }

var fontHeight = font.ascent - font.descent;


console.log('Transforming coordinates');

// Recalculate coordinates from image to font
fstools.walkSync(args.input_dir, /[.]svg$/i, function (file) {
  var transform = '', svgOut;
  var glyph = parseSvgImage(fs.readFileSync(file, 'utf8'), file);

  // Scaling the svg
  var x,y,z,s
  s = font.scale;
  x = glyph.height * s;
  y = glyph.height - x;
  z = y / 2;

  var trans = `translate(${z} ${z}) scale(${s})`;

  var transform_scale = svgpath(glyph.d)
                          .transform(trans)
                          .rel()
                          .round(3)
                          .toString();

  // y vertical mirror is necessary
  // SVG coordinate system is like OpenGL with y pointing downwards and cartesian coordinates pointing upwards
  var transform_mirror = `translate(0 ${fontHeight / 2}) scale(1 -1) translate(0 -${fontHeight / 2})`;

  var transformed_all = svgpath(transform_scale)
                          .transform(transform_mirror)
                          .rel()
                          .round(3)
                          .toString();

  svgOut = svgImageTemplate({
    height : glyph.height,
    width  : glyph.width,
    d      : transformed_all,
    transform : ''
  });

  var dir = './dist';

  // make temp folder to transform the svgs before converting to ttf
  fs.mkdir(dir, function(err) {
      if (err) {
          if (err.code == 'EEXIST'); // ignore the error if the folder already exists
          else cb(err); // something else went wrong
      }
  });

  fs.writeFileSync(path.join(dir, path.basename(file)), svgOut, 'utf8');
});

console.log('Optimizing images');

var svgoConfig = args.svgo_config ? path.resolve(args.svgo_config) : path.resolve(__dirname, 'svgo.yml');

execFile(
  path.resolve(process.cwd(), './node_modules/.bin/svgo'),
  [ '-f', './dist', '--config', svgoConfig ],
  function (err) {

  if (err) {
    console.error(err);
    process.exit(1);
  }

  //create font output folder
  fs.mkdir('./font', function(err) {
      if (err) {
          if (err.code == 'EEXIST'); // ignore the error if the folder already exists
          else cb(err); // something else went wrong
      }
  });

  console.log('Creating font file');

  _.each(config.glyphs, function (glyph) {
    var fileName = glyph.file || glyph.name + '.svg';
    var svg = parseSvgImage(fs.readFileSync(path.resolve('./dist', fileName), 'utf8'), fileName);

    glyph.width = svg.width;
    glyph.d = svg.d;

    // Fix for FontForge: need space between old and new polyline
    glyph.d = glyph.d.replace(/zm/g, 'z m');

    // 'unicode' attribute can be number in hex format, or ligature
    if (glyph.code === +glyph.code) {
      glyph.unicode = '&#x' + glyph.code.toString(16) + ';';
    } else {
      glyph.unicode = glyph.code;
    }
  });

  var svgOut = svgFontTemplate({
    font : font,
    glyphs : config.glyphs,
    metadata : font.copyright || "Generated by fontello.com",
    fontHeight : font.ascent - font.descent,
    fontFamily : font.familyname || "myfont"
  });

  fs.writeFileSync(args.output, svgOut, 'utf8');

  // fstools.removeSync(tmpDir);
});