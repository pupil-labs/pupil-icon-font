import xml.dom.minidom as minidom
import os
import glob
import re

# modify width and height as desired

width = "1000"
height = "1000"

# put all your svgs in a dir called svgs or modify the path accordingly
svg_file_paths = glob.glob('./svgs/*.svg')

for p in svg_file_paths:
    fp = os.path.abspath(p)

    doc = minidom.parse(fp)

    svg = doc.getElementsByTagName('svg')[0]
    svg.setAttribute('width', width)
    svg.setAttribute('height', height)

    path = doc.getElementsByTagName('path')

    doc_root = doc.documentElement
    nodeList = doc.childNodes

    for node in nodeList:
        print(node.toprettyxml())

    # remove bounding box path
    k = doc.getElementsByTagName('path')
    for l in k:
        if l.hasAttribute('style'):
            p = l.parentNode
            print(p.removeChild(l))

    nodeList = doc.childNodes
    for node in nodeList:
        print(node.toprettyxml())

    with open(fp,'w') as f:
        doc.firstChild.writexml(f)
