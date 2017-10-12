#!/usr/bin/env node


'use strict';

var fs        = require('fs');
var path      = require('path');
var _         = require('lodash');
var yaml      = require('js-yaml');
var Domparser      = require('xmldom').DOMParser;
var ArgumentParser = require('argparse').ArgumentParser;
var SvgPath   = require('svgpath');


var svgFontTemplate = _.template(
    '<?xml version="1.0" standalone="no"?>\n' +
    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' +
    '<svg xmlns="http://www.w3.org/2000/svg">\n' +
    '<metadata><%= metadata %></metadata>\n' +
    '<defs>\n' +
    '<font id="<%= font.fontname %>" horiz-adv-x="<%= fontHeight %>" >\n' +

    '<font-face' +
      ' font-family="font.familyname"' +
      ' font-weight="400"' +
      ' font-stretch="normal"' +
      ' units-per-em="<%= fontHeight %>"' +
      ' ascent="<%= font.ascent %>"' +
      ' descent="<%= font.descent %>"' +
    ' />\n' +

    '<missing-glyph horiz-adv-x="<%= fontHeight %>" />\n' +

    '<% _.forEach(glyphs, function(glyph) { %>' +
      '<glyph' +
        ' glyph-name="<%= glyph.css %>"' +
        ' unicode="<%= glyph.unicode %>"' +
        ' d="<%= glyph.d %>"' +
        ' horiz-adv-x="<%= glyph.width %>"' +
      ' />\n' +
    '<% }); %>' +

    '</font>\n' +
    '</defs>\n' +
    '</svg>'
  );

function parseSvgImage(data, filename) {

  var doc = (new Domparser()).parseFromString(data, 'application/xml');
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
    throw 'Multiple paths not supported' + (filename ? ' (' + filename + ' ' : '');
  }
  if (path.length === 0) {
    throw 'No path data fount' + (filename ? ' (' + filename + ' ' : '');
  }

  path = path[0];

  var d = path.getAttribute('d');

  var transform = '';

  if (path.hasAttribute('transform')) {
    transform = path.getAttribute('transform');
  }

  return { height, width, d, transform };
}

var parser = new ArgumentParser({
  addHelp: true,
  description: 'Fontello internal tool. Join multiple fonts to single one and create JS configs for processing'
});
parser.addArgument([ '-i', '--input_fonts' ], { help: 'Input fonts paths', required: true, nargs : '+' });
parser.addArgument([ '-o', '--output' ], { help: 'Output font file path', required: true });
parser.addArgument([ '-s', '--output_server' ], { help: 'Output server config path' });

var args = parser.parseArgs();

// server config, to build svg fonts
// contains uid hash + svg paths, to generate font quickly
var configServer = {
  icons  : {},
  fonts : {},
  metas : {}
};

////////////////////////////////////////////////////////////////////////////////

// Scan sources

// we don't need to loop - but could keep it in if we ever want to add more than one font
_.forEach(args.input_fonts, function (fontDir) {
  // Iterate each font
  var cfg = yaml.load(fs.readFileSync(path.resolve('./config.yml'), 'utf8'));

  // push font info to server config
  configServer.fonts[cfg.font.fontname] = _.clone(cfg.font, true);
  configServer.metas[cfg.font.fontname] = _.clone(cfg.meta, true);

  // iterate glyphs
  _.forEach(cfg.glyphs, function (glyph) {

    // Cleanup fields list
    var glyph_data = _.pick(glyph, ['codename', 'code']);

    // Add more data for server config
    glyph_data.fontname = cfg.font.fontname;

    glyph_data.svg = {};

    // load svg file & translate coordinates
    var file_name = path.join('./svgs', glyph_data.codename + '.svg');
    var svg = parseSvgImage(fs.readFileSync(file_name, 'utf8'), file_name);

    // FIXME: Apply transform from svg file. Now we understand
    // pure paths only.
    var scale = cfg.font.scale
    var vb = 1000
    var x = vb * scale
    var y = vb - x
    var z = y / 2

    var trans_x = z
    var trans_y = z + cfg.font.descent

    glyph_data.svg.width = +(svg.width).toFixed(1);
    // !!key algo for transformation!!
    glyph_data.svg.d = new SvgPath(svg.d)
                            .scale(scale)
                            .translate(trans_x, trans_y)
                            .abs().round(1).rel()
                            .toString();

    configServer.icons[glyph.fullname] = _.clone(glyph_data, true);
  });
});

// Write out configs
fs.writeFileSync(args.output_server, 'module.exports = ' + JSON.stringify(configServer, null, 2), 'utf8');

// Prepare SVG structures & write font file
var font = {
  fontname: 'pupil_icons',
  familyname: 'pupil',
  ascent: 850,
  descent: -150
};

var glyphs = [];

_.forEach(configServer.icons, function (glyph) {

  glyphs.push({
    height : glyph.svg.height,
    width : glyph.svg.width,
    d     : new SvgPath(glyph.svg.d)
                  .scale(1, -1)
                  .translate(0, font.ascent + font.descent)
                  .abs().round(0).rel()
                  .toString(),
    name   : glyph.name,
    unicode : '&#x' + glyph.code.toString(16) + ';'
  });
});

var svgOut = svgFontTemplate({
  font,
  glyphs,
  metadata: 'internal font for pupil software',
  fontHeight : font.ascent - font.descent
});

fs.writeFileSync(args.output, svgOut, 'utf8');