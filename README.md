# pupil-icon-font
Icon font for Pupil software

Using [fontello](https://github.com/fontello/) toolchains to locally optimize and convert individual SVGs to TTF font

## Installation

You need [node.js])(https://nodejs.org/en/download/) and `fontforge` installed first.

### Debian Ubunbu
Fontforge
```bash
sudo add-apt-repository ppa:fontforge/fontforge
sudo apt-get update
sudo apt-get install fontforge
```

Dependencies
```
npm install
```

## Make .ttf font

Run command to make ttf font

```
make
```

## Project structure

Diagram of repo hierarchy

```
/pupil-icon-font
|-- svgs
	`-- individual svgs
|-- font
	`-- glyph svg and ttf file
|-- dist
	`-- temp file for transformed svgs
```

## Development	

Fork and clone to work locally.

### New SVG icons 
Add icons to `./svgs` folder,
Edit `config.yml` to specify your icon names and unicode mapping for each glyph.
Make sure the icon name is the same as the svg icon file name.

### SVG requirements
All svg icons must be `1000x1000` px.
Svg path must be a compound path.
Black and white, no colors.
No fills.

Example
```
<svg height="1000" viewBox="0 0 1000 1000" width="1000" xmlns="http://www.w3.org/2000/svg">
	<path d="M723.61115,432.91665V276.38885a44.85373,44.85373,0,0,0-44.72223-44.72223H142.22215a44.85371,44.85371,0,0,0-44.72223,44.72223V723.61115a44.85373,44.85373,0,0,0,44.72223,44.72223H678.88892a44.85375,44.85375,0,0,0,44.72223-44.72223V567.08335L902.50008,745.97227V254.02773Z"/>
</svg>
```

Note - Other tags will be stripped out during the make process.

### SVG optimization
Run `make optimize`, to optimize images with `SVGO` or on the web - https://jakearchibald.github.io/svgomg/

## License

Font is distributed under LGPL-3.0 licence.

All icons are distributed under Apache License Version 2.0 licence.