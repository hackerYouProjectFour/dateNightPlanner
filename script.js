// Create app namespace to hold all methods
const app = {};

app.restaurantApp = {};
app.restaurantApp.queryParams = {};
app.restaurantApp.queryParams.queryRestaurantUrl = 'https://developers.zomato.com/api/v2.1/search';
app.restaurantApp.queryParams.queryCuisineUrl = 'https://developers.zomato.com/api/v2.1/cuisines';
app.restaurantApp.queryParams.apiKey = '9ab73e55b485303a844c8e0f5d16d2c9';
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
        res.restaurants.forEach((place) => {
            if (place.restaurant.price_range === app.restaurantApp.queryParams.price){
                app.restaurantApp.restaurants.push(place.restaurant);
                console.log(place.restaurant.name);
            }
        });
        
    })
}

// Display data on the page
app.displayInfo = function() {

}

// Start app
app.init = () => {
    app.restaurantApp.getRestaurantsList();
    app.restaurantApp.getRestorantInfo();
}

$(function() {
    app.init();
});