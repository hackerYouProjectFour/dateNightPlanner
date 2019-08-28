// Create app namespace to hold all methods
const app = {};

app.queryParams = {};
app.queryParams.queryUrl = 'https://developers.zomato.com/api/v2.1/search';
app.queryParams.apiKey = '9ab73e55b485303a844c8e0f5d16d2c9';
app.queryParams.cityCode = 89;
app.queryParams.entity = 'city';
app.queryParams.count = 20;
app.queryParams.offset = 0;
app.restaurants = [];
// Collect user input
app.getRestorantInfo = function(){
    // Creat object to hold user picked info
    app.userPicks = {};
    $('.dinnerForm').on('submit', (e) =>{
        // Empty array from any previous results
        app.restaurants = [];
        e.preventDefault();
        app.queryParams.cusine = $('#cusine option:selected').val();
        app.queryParams.price = parseInt($('#price option:selected').val());
        // this loop is required because api returns only 20 results at a time
        for(let i = 0; i<=4; i++){
            app.getInfo();
            app.queryParams.offset = i;
        }
    });
}
// Make AJAX request with user inputted to the zomato
app.getInfo = function() {
    // make api call
    $.ajax({
        type: 'GET',
        url: app.queryParams.queryUrl,
        data: {
            apikey : app.queryParams.apiKey,
            entity_id : app.queryParams.cityCode,
            entity_type : app.queryParams.entity,
            count : app.queryParams.count,
            cuisines : app.queryParams.cusine,
            results_start : app.queryParams.offset
        },
        dataType: 'json'
    }).then((res) => {
        // save resuls from the array.
        res.restaurants.forEach((place) => {
            if (place.restaurant.price_range === app.queryParams.price){
                app.restaurants.push(place.restaurant);
                console.log(place.restaurant.name);
            }
        });
        
    })
}
// Display data on the page
app.displayInfo = function() {

}
// Start app
app.init = function() {
    app.getRestorantInfo();
}

const movieApp = {};

movieApp.showtimeUrl = `http://data.tmsapi.com/v1.1/movies/showings`;
movieApp.apiKey = `asa363es8bybmdvt64csjra7`;
movieApp.zip = `M6K 3R4`;
movieApp.radius = 3;
movieApp.units = `km`;
movieApp.theatreList = {};
movieApp.data = [];
movieApp.theatres = [];
movieApp.pullData = function () {
    return $.ajax({
        url: movieApp.showtimeUrl,
        method: 'GET',
        datatype: 'json',
        data: {
            api_key: movieApp.apiKey,
            startDate: movieApp.getTodaysDate,
            //TO BE CHANGED
            zip: movieApp.zip,
            radius: movieApp.radius,
            units: movieApp.units
        },
    });
};
movieApp.getTodaysDate = function () {
    const today = new Date();
    const date = today.getFullYear() + `-` + ('0' + (today.getMonth() + 1)).slice(-2) + `-` + ('0' + today.getDate()).slice(-2);
    return date;
}
movieApp.storeData = function () {
    movieApp.pullData().then(function (results) {
        const duplicateTheatres = [];
        results.forEach(function(result){
            duplicateTheatres.push(result.showtimes[0].theatre.name);
        })
        const uniqueSet = new Set(duplicateTheatres);
        movieApp.theatreList = [...uniqueSet];
        console.log(movieApp.theatreList);
    });

};

movieApp.init = function () {
    movieApp.getTodaysDate();
    movieApp.storeData();
}

$(function() {
    app.init();
    movieApp.init();  
});