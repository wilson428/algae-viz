const fs = require('fs');
const downcache = require('downcache');
const cheerio = require('cheerio');

const URI = "http://aquatext.com/tables/algaegrwth.htm";

// just as easy to manually build categories as it is to scrape columns with colwidth > 1
var categories = [];
[5, 10, 25, 30].forEach(d => {
	categories.push({
		temperature: d,
		lux: 5000,
		slug: "d_" + d + "_5000"
	});

	categories.push({
		temperature: d,
		lux: 2500,
		slug: "d_" + d + "_2500"
	});
});

var algae = [];

downcache(URI, (err, resp, body) => {
	var $ = cheerio.load(body);
	table = $("table:nth-child(2)");
	rows = table.find("tr");
	rows.each((i, v) => {
		if (i <= 2) {
			return;
		}
		var columns = $(v).find("td");
		var species = { name: "", values: {} };
		columns.each((ii, vv) => {
			if (ii === 0) {
				species.name = $(vv).text().replace("\n", " ").replace(/\s+/g, " ");
				return;
			}
			species.values[categories[ii-1].slug] = +$(vv).text().replace("..", "."); // fixed typo in Isochrysis aff. galbana
		});
		algae.push(species);
	});
	// let's save ourselves an AJAX request
	fs.writeFileSync("./data/algae_data.js", "var algae_data = " + JSON.stringify(algae, null, 2) + ";");
	fs.writeFileSync("./data/categories.js", "var categories = " + JSON.stringify(categories, null, 2) + ";");
});

