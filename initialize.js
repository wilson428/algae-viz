var temp_colors = ["#0A38FF", "#146BFF", "#1E9FFF", "#29D3FF"];
var lux_colors = ["#FEE66D", "#FDFFB8"];

var width = document.getElementById("dishes").offsetWidth;
//document.querySelector("#species table").style.width = width - 40; // allow for scroll bar outside

var petri_size = width / 8 * 0.95; // add just a little margin around the dish

// number of cells to start with. Start with fewer for small devices so that the dishes don't get too crowded too soon
var STARTING_N = 100;
if (width <= 400) {
    STARTING_N = 50;
}

var species = [];

algae_data.forEach(function(algae, a) {                
    // container for the controls
    var day_container = document.createElement("div");
    day_container.classList = "day_container";
    day_container.id = "day_container_" + a;
    document.querySelector("#dishes").appendChild(day_container);

    // species name
    var header = document.createElement("div");
    header.classList = "algae_title";
    header.innerHTML = algae.name;
    document.querySelector("#dishes").appendChild(header);

    // add the headers for temperature and light
    var temp = document.createElement("div");
    temp.classList = "temp_header";
    document.querySelector("#dishes").appendChild(temp);

    var lux = document.createElement("div");
    lux.classList = "lux_header";
    document.querySelector("#dishes").appendChild(lux);

    categories.forEach(function(category, c) {
        if (c % 2 == 0) {
            var div = document.createElement("div");
            div.classList = "temp";
            div.innerHTML = category.temperature + "&deg;";
            div.style.backgroundColor = temp_colors[c / 2];
            temp.appendChild(div);
        }

        var div = document.createElement("div");
        div.classList = "lux";
        div.innerHTML = category.lux + " lux";
        div.style.backgroundColor = lux_colors[c % 2];
        lux.appendChild(div);
    });

    // initialize the Petri dishes for this species
    var dishes = document.createElement("div");
    dishes.id = "algae_" + a;
    dishes.classList = "algae_row";
    document.querySelector("#dishes").appendChild(dishes);

    // (Yes, these two category loops could be combined, but I prefer to code in drawing order when it's not too burdensome)         
    categories.forEach(function(category, c) {
        var dish = new Dish("#algae_" + a, petri_size, a, category.slug);
        //dish.addCells(STARTING_N);
        species.push(dish);
    });
});

// play/pause button
var button = document.createElement("button");
button.innerHTML = "&#9658;";
button.id = "play_pause";
document.querySelector("#days_row").appendChild(button);

// day buttons
for (var c = 0; c <= 7; c += 1) {
    var button = document.createElement("button");
    button.innerHTML = c;
    if (c == 0) {
        button.classList = "selected";
    }
    document.querySelector("#days_row").appendChild(button);
}

document.getElementById("day_container_0").append(document.getElementById("days_container"));


var day = 0;

// draw the number of cells in each Petri dish for all 152 combinations
function goToDay(day) {
    document.getElementById("day_count").innerHTML = "DAY " + day;

    for (var c = 0; c < buttons.length; c += 1) {
        buttons[c].classList = "";
    }
    buttons[day + 1].classList = "selected";

    species.forEach(function(s) {
        s.addDay(day);
    });
}

// event handlers for buttons

var buttons = document.querySelectorAll("button"),
    timer,
    PLAYING = false;

for (var c = 0; c < buttons.length; c += 1) {
    buttons[c].addEventListener("click", function() {
        var that = this;
        if (that.id == "play_pause") {
            if (PLAYING) {
                clearTimeout(timer);
                that.innerHTML = "&#9658;";
                PLAYING = false;
            } else {
                if (day >= 7) {
                    day = 0;
                } else {
                    day += 1;
                }
                that.innerHTML = "&#10074;&#10074;";
                PLAYING = true;
                goToDay(day);

                timer = setInterval(function() {
                    day += 1;
                    if (day == 7) {
                        clearTimeout(timer);
                        that.innerHTML = "&#9658;";
                        PLAYING = false;
                    }
                    goToDay(day);
                }, 2000);
            }
            return;
        }

        clearTimeout(timer);
        buttons[0].innerHTML = "&#9658;";
        PLAYING = false;

        day = +that.innerHTML;
        goToDay(day);
    });
}

goToDay(0);

// https://stackoverflow.com/questions/2481350/how-to-get-scrollbar-position-with-javascript
var getScrollTop = function(){
    if (typeof window.pageYOffset != undefined) {
        return window.pageYOffset;
    } else {
        var sy, d = document, r = d.documentElement, b = d.body;
        sy= r.scrollTop || b.scrollTop || 0;
        return sy;
    }
}

var viz_height = document.getElementById("algae_viz").offsetTop + document.getElementById("algae_viz").offsetHeight;

// don't reactive onScroll when the day_container moves; otherwise you can get infinite switching back and forth
var CHECKED_POSITION = false;

// move the controls to the highest visible algae species
function positionControls() {
    var scrollPosition = getScrollTop();

    // if we've scrolled past the viz, return
    if (scrollPosition > viz_height) {
        return;
    }

    // find the species that, accounting for the page scroll, is highest and fully visible
    for (var c = 0; c < algae_data.length; c += 1) {
        var dc_position = document.getElementById("day_container_" + c).offsetTop + document.getElementById("algae_viz").offsetTop - scrollPosition - document.getElementById("days_container").offsetHeight;
        // console.log(dc_position, scrollPosition);
        if (dc_position > -40) {
            // console.log("Moving to", c);
            document.getElementById("day_container_" + c).append(document.getElementById("days_container"));
            break;
        }
    }
    CHECKED_POSITION = true;
}

window.onscroll = function() {
    if (!CHECKED_POSITION) {
        positionControls();
    } else {
        CHECKED_POSITION = false;
    }
};