FONTS			= svgs
FONT_DIR		= ./font
BIN  := ./node_modules/.bin

all: index font

help:
	echo "make help        - Print this help"
	echo "make index       - Generate html font index"
	echo "make optimize    - optimize src svgs"
	echo "make font        - Rebuild embedded fonts"

index:
	node ./font-index.js
	echo "Icons indexed"

optimize:
	${BIN}/svgo -f ./svgs

font:

	@if test ! -d node_modules ; then \
	echo "dependencies not found:" >&2 ; \
	echo "  npm install" >&2 ; \
	exit 128 ; \
	fi

	rm -rf $(FONT_DIR)
	mkdir -p $(FONT_DIR)
	# build single font
	./svg-font-create.js \
		-i ./$(FONTS) \
		-o $(FONT_DIR)/pupil_icons.svg \
		-s ./server_config.js

	# convert to other formats
	./node_modules/.bin/svg2ttf "$(FONT_DIR)/pupil_icons.svg" "$(FONT_DIR)/pupil_icons.ttf"
	echo "Icon font created"

	# convert ttf to webfonts -> woff /woff2
	# ./node_modules/.bin/ttf2woff "$(FONT_DIR)/pupil_icons.ttf" "$(FONT_DIR)/pupil_icons.woff"
	# cat "$(FONT_DIR)/pupil_icons.ttf" | ./node_modules/.bin/ttf2woff2 >> "$(FONT_DIR)/pupil_icons.woff2"

.PHONY: all help font index optimize
.SILENT: all help font index optimize
