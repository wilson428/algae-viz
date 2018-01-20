# Algae Visualization

By Chris Wilson ([@wilson428](https://github.com/wilson428))

Entry for the [/r/dataisbeautiful/ Jan. 2018 contest](https://www.reddit.com/r/dataisbeautiful/comments/7nm6ed/battle_dataviz_battle_for_the_month_of_january/)

## Getting the data
I'm using the Node modules [downcache](https://www.npmjs.com/package/downcache) (which I wrote and maintain) and [cheerio](https://www.npmjs.com/package/cheerio) to scrape the relevant [table](http://aquatext.com/tables/algaegrwth.htm) and convert it into a nice JSON file (in JavaScript form to avoid AJAX calls). It also outputs a `categories.js` with the eight combinations of temperature and light. These outputs are in the repo, so you don't need to rerun them unless you so desire:

	npm install
	npm scape.js

## Calculating cell growth

It is surprisingly difficult to find a cogent definition of "divisions per day", but [this post on Illustrative Mathematics](https://www.illustrativemathematics.org/content-standards/tasks/570) neatly shows how one can calculate the number of cells in an algae bloom (or decline) based on this figure, which is essentially the percentage (in decimal form) of cells that duplicate each day. Thus, for `N` initial cells, on a given day `t` with a division count of `d`, the number of cells is `N * 2^(d*t)`.

## Drawing the Petri dishes

There are 152 unique combinations of temperature, light and species (4 temperatures * 2 luxes/temperature * 19 species). While it would be convenient to use D3 to handle the clustering of cells around a central point, an SVG-based visualization would quickly blossom (so to speak) into 100,000-plus DOM objects. Canvas is a much more performance-friendly solution. Each cell is randomly placed inside its Petri dish with a simple random radius from the center at a random angle.



