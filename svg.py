import xml.dom.minidom as minidom
import os
import glob

# modify width and height as desired

width = "1000"
height = "1000"

# scale = 0.7
# vb = 1000

# x = vb * scale
# y = vb - x
# z = y / 2

# trans = str(z)

# put all your svgs in a dir called svgs or modify the path accordingly
svg_file_paths = glob.glob('./icons_1000x/*.svg')

for p in svg_file_paths:
    fp = os.path.abspath(p)

    doc = minidom.parse(fp)

    svg = doc.getElementsByTagName('svg')[0]
    svg.setAttribute('width', width)
    svg.setAttribute('height', height)

    # rect = doc.getElementsByTagName('rect')[0]
    # rect.attributes['width'].value = str(vb)
    # rect.attributes['height'].value = str(vb)

    # path = doc.getElementsByTagName('path')[0]
    # path.setAttribute('transform',
    #                     "translate({0} {0})" " scale({1})".format(trans,scale))

    with open(fp,'w') as f:
        doc.firstChild.writexml(f)