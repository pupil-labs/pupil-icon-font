PROJECT := $(notdir ${PWD})
PWD  := $(shell pwd)
BIN  := ./node_modules/.bin
FONT_NAME := pupil_icons
svg_dir := ./svgs
font_dir := ./font/
output_dir := $(join $(font_dir),$(FONT_NAME))

# dist: transform_svg font

dist: transform_svg font
transform_svg:
	@echo "Transforming SVG"
	@python3 svg.py

optimize:
	${BIN}/svgo --config `pwd`/dump.svgo.yml -f ./svgs

font:
	@if test ! -d node_modules ; then \
		echo "dependencies not found:" >&2 ; \
		echo "  make dependencies" >&2 ; \
		exit 128 ; \
		fi

	node ./svg-font-create.js -c ./config.yml -i $(svg_dir) -o "$(output_dir).svg"
	fontforge -c 'font = fontforge.open("$(output_dir).svg"); font.generate("$(output_dir).ttf")'

	@if test ! -d node_modules ; then \
		echo "dependencies not found:" >&2 ; \
		echo "  make dependencies" >&2 ; \
		exit 128 ; \
		fi

	@# for creating webfonts
	@# ${BIN}/ttf2eot "$(output)$(FONT_NAME).ttf" "$(output)$(FONT_NAME).eot"
	@# ${BIN}/ttf2woff "$(output)$(FONT_NAME).ttf" "$(output)$(FONT_NAME).woff"

dependencies:
	@if test ! `which npm` ; then \
		echo "Node.JS and NPM are required." >&2 ; \
		echo "  - Install Node.JS and NPM" >&2 ; \
		exit 128 ; \
		fi
	@if test ! -d node_modules ; then \
		echo "Installing dependencies..." ; \
		npm i ; \
		fi

.PHONY: transform_svg font dist optimize dependencies