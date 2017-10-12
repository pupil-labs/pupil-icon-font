# pupil-icon-font
Icon font for Pupil software

Using [fontello](https://github.com/fontello/) toolchains to locally optimize and convert individual SVGs to TTF font

Preview the icon font and mappings by opening [index.html](.index.html) in your browser.

## Installation

Install [node](https://nodejs.org/en/download/) and NPM. 


### Install Node Dependencies

```
npm install
```

## Make tasks

### Make all tasks

```
make
```

### Make glyph`.svg` and `.ttf` font
```
make font
```

### Generate `.html` with icon font and glyphs

```
make index
```

### Optimize SVGs

```
make optimize
```

## Project structure

Diagram of repo hierarchy

```
/pupil-icon-font
|-- svgs
	`-- individual svgs
|-- font
	`-- glyph svg and ttf file
```

## Development	

Fork and clone to work locally.

### New SVG icons 

Add icons to `./svgs` folder,
Edit `config.yml` to specify your icon names and unicode mapping for each glyph.
Make sure the icon codename is the same as the svg icon file name.

### SVG requirements

- All svg icons must be `1000x1000` px.
- Svg path must be a compound path.
- Black and white, no colors.
- No fills.

Example

```html
<svg height="1000" viewBox="0 0 1000 1000" width="1000" xmlns="http://www.w3.org/2000/svg">
	<path d="M723.61115,432.91665V276.38885a44.85373,44.85373,0,0,0-44.72223-44.72223H142.22215a44.85371,44.85371,0,0,0-44.72223,44.72223V723.61115a44.85373,44.85373,0,0,0,44.72223,44.72223H678.88892a44.85375,44.85375,0,0,0,44.72223-44.72223V567.08335L902.50008,745.97227V254.02773Z"/>
</svg>
```

**Note** - Other tags will be stripped out during the make process.

### SVG Optimization

Run `make optimize`, to optimize images with `SVGO` or on the web - https://jakearchibald.github.io/svgomg/

## License

Font is distributed under LGPL-3.0 licence.

All icons are distributed under their respective licences (Apache License Version 2.0).