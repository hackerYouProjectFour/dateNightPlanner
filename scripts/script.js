// ZOMATO API KEYS
// 9ab73e55b485303a844c8e0f5d16d2c9
// 97641d101a3b203687e053667fcd3898


// Create app namespace to hold all methods
const app = {};

app.restaurantApp = {};
app.restaurantApp.queryParams = {};
app.restaurantApp.queryParams.queryRestaurantUrl = 'https://developers.zomato.com/api/v2.1/search';
app.restaurantApp.queryParams.queryCuisineUrl = 'https://developers.zomato.com/api/v2.1/cuisines';
app.restaurantApp.queryParams.apiKey = '97641d101a3b203687e053667fcd3898';
app.restaurantApp.queryParams.cityCode = 89;
app.restaurantApp.queryParams.entity = 'city';
app.restaurantApp.queryParams.count = 20;
app.restaurantApp.queryParams.offset = 0;
app.restaurantApp.restaurants = [];
app.restaurantApp.cuisines = [];

// Make AJAX call to zomato to get the list of restaurants ad put them on the page

app.restaurantApp.getRestaurantsList = () => {
    $.ajax({
        type: 'GET',
        url: app.restaurantApp.queryParams.queryCuisineUrl,
        data: {
            apikey : app.restaurantApp.queryParams.apiKey,
            city_id : app.restaurantApp.queryParams.cityCode
        },
        dataType: 'json'
    }).then(res => {
        res.cuisines.forEach( item => {
            app.restaurantApp.cuisines.push({
                name: item.cuisine.cuisine_name,
                code: item.cuisine.cuisine_id
            });
            $('#cuisine').append(`<option value="${item.cuisine.cuisine_id}">${item.cuisine.cuisine_name}</option>`);
        });
    })
}

// Collect user input
app.restaurantApp.getRestorantInfo = () => {
    // Creat object to hold user picked info
    app.restaurantApp.userPicks = {};
    $('.dinnerForm').on('submit', (e) =>{
        // Empty array from any previous results
        app.restaurantApp.restaurants = [];
        e.preventDefault();
        app.restaurantApp.queryParams.cuisine = $('#cuisine option:selected').val();
        app.restaurantApp.queryParams.price = parseInt($('#price option:selected').val());
        
        // this loop is required because api returns only 20 results at a time
        for(let i = 0; i<=100; i = i + 20){
            app.restaurantApp.getInfo();
            app.restaurantApp.queryParams.offset = i;
        }
    });
}

// Make AJAX request with user inputted to the zomato 
app.restaurantApp.getInfo = () => {
    // make api call
    $.ajax({
        type: 'GET',
        url: app.restaurantApp.queryParams.queryRestaurantUrl,
        data: {
            apikey : app.restaurantApp.queryParams.apiKey,
            entity_id : app.restaurantApp.queryParams.cityCode,
            entity_type : app.restaurantApp.queryParams.entity,
            count : app.restaurantApp.queryParams.count,
            cuisines : app.restaurantApp.queryParams.cuisine,
            start : app.restaurantApp.queryParams.offset
        },
        dataType: 'json'
    }).then((res) => {
        // save resuls from the array.
        res.restaurants.forEach(function(place) {
            if (place.restaurant.price_range === app.restaurantApp.queryParams.price){
                app.restaurantApp.restaurants.push(place.restaurant);
                console.log(place);
                // this one here supposed to to display shit to the page but theres some kind of weird shit going on!!!!!!!!!!!!!
                app.restaurantApp.displayInfo(place);
            }
            if (!app.restaurantApp.restaurants.length){
                // alert('nothing found chech again');
            }
        });
        
    })
}

// Display restaurant  data on the page
app.restaurantApp.displayInfo = function(place) {
    $('.card-area').append(`
        <div class="card-area">
            <div class="restaurant-card flex">
                <div class="card-content basis100">
                    <h3>NAME GOES HERE</h3>
                    <p class="address"> ADDRESS GOES HERE</p>
                    <p class="phone">PHONE GOES HERE</p>
                    <div class="stars">FUNCTION THAT RENDERS STAR RATING IS CALLED HERE</div>
                </div>
                <div class="show-movie flex">
                    <button>-></button>
                </div>
            </div>
        </div>
    `);
}

// Start app
app.init = () => {
    app.restaurantApp.getRestaurantsList();
    app.restaurantApp.getRestorantInfo();
}

$(function() {
    app.init();
});