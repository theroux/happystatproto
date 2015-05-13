gulp
cd dist
rm Archive.zip
zip -r Archive.zip *.html css/ fonts/ images/ js/
divshot push
open http://development.happystat.divshot.io/
cd ..