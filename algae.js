/*
@container: the HTML selector to which to append this canvas
@size: The dimensions of that canvas in height and width
@algae_type: The index to use from algae.json
@value: the index of temperature and light
*/

var CELL_RADIUS = 1;

function Dish(container, size, algae_index, key) {
	this.N = 0;
	this.key = key;

	this.data = algae_data[algae_index];
	this.slug = "a_" + algae_index + "_" + key;
	this.size = size;
	this.radius = size / 2 - 1;

	// smaller radii get filled up faster, so let's set the opacity accordingly
	this.opacity = Math.max(0.33, Math.min(1, size / 120));
	// console.log("opacity", this.size, this.opacity);

	// add a new dish to the container
	var div = document.createElement("div");
	div.id = this.slug;
	div.classList = "dish";
	document.querySelector(container).appendChild(div);

	// the cell count above the dish
	this.cell_count = document.createElement("div");
	this.cell_count.classList = "cell_count";
	this.cell_count.innerHTML = "100 cells";
	div.appendChild(this.cell_count);

	// the canvas where we'll draw the dish
	this.canvas = document.createElement('canvas');
	this.canvas.width = size;
	this.canvas.height = size;	
	div.append(this.canvas);

	// the growth rate below the dish
	this.growth_rate = document.createElement("div");
	this.growth_rate.classList = "growth_rate";
	this.growth_rate.innerHTML = this.data.values[key].toFixed(2);
	div.appendChild(this.growth_rate);

	this.context = this.canvas.getContext("2d");
	this.context.globalCompositeOperation = 'multiply';

	// draw Petri dish circle
	this.context.beginPath();
	this.context.arc(size / 2, size / 2, this.radius, 0, 2 * Math.PI, false);
	this.context.lineWidth = this.size > 400 ? 2 : 1;
	this.context.strokeStyle = '#000000';
	this.context.stroke();
}

// randomly place a new cell in the dish
Dish.prototype.addCell = function() {
	this.N += 1;

	var R = this.radius - CELL_RADIUS;
	var theta = Math.PI * 2 * Math.random();
	var radius = R * Math.sqrt(Math.random());
	var x = Math.cos(theta) * radius + this.size / 2;
	var y = Math.sin(theta) * radius + this.size / 2;

	this.context.beginPath();
	this.context.arc(x, y, CELL_RADIUS, 0, 2 * Math.PI, false);
	this.context.lineWidth = 0;
	this.context.fillStyle = "rgba(0, 200, 0, " + this.opacity + ")";
	this.context.fill();
}

// add N cells to the dish
Dish.prototype.addCells = function(N, interval) {
	interval = typeof interval === undefined ? 0 : interval;

	if (interval === 0) {
		for (var c = 0; c < N; c += 1) {
			this.addCell();
		}		
		return;
	}

	var that = this;
	var addedCells = 0;
	var timer = setInterval(function() {
		that.addCell();
		addedCells += 1;
		if (addedCells >= N) {
			clearTimeout(timer);
		}
	}, interval);
}

// clear the dish
Dish.prototype.reset = function() {
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	// redraw dish
	this.context.beginPath();
	this.context.arc(this.size / 2, this.size / 2, this.radius, 0, 2 * Math.PI, false);
	this.context.lineWidth = this.size > 400 ? 2 : 1;
	this.context.strokeStyle = '#000000';
	this.context.stroke();	
}

// compute the number of cells for a certain day and add them
Dish.prototype.addDay = function(day) {
	var d_per_day = this.data.values[this.key];
	// STARTING_N is the initial value set in index.html, currently set to 100
	// https://www.illustrativemathematics.org/content-standards/tasks/570
	// this is the absolute number of cells on this day, not including those already drawn
	var N = Math.round(STARTING_N * Math.pow(2, day * d_per_day));
	this.cell_count.innerHTML = commafy(N); // + " cells";
	// if we lost cells, need to redraw
	if (N < this.N) {
		this.reset();
		this.N = 0;
		this.addCells(N, 0);
		return;
	}

	// number of new cells we have to draw, accounting for those already drawn
	var newCells = N - this.N;
	this.addCells(newCells, 0);
}

// https://stackoverflow.com/questions/6784894/add-commas-or-spaces-to-group-every-three-digits
function commafy( num ) {
    var str = num.toString().split('.');
    if (str[0].length >= 4	) {
        str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    }
    if (str[1] && str[1].length >= 5) {
        str[1] = str[1].replace(/(\d{3})/g, '$1 ');
    }
    return str.join('.');
}
