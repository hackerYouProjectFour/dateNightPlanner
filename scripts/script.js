// ZOMATO API KEYS
// 9ab73e55b485303a844c8e0f5d16d2c9
// 97641d101a3b203687e053667fcd3898


// Create app namespace to hold all methods
const app = {};

// This ine here holds the restaurant portion of the code
restaurantApp = {};
restaurantApp.queryParams = {};
restaurantApp.queryParams.queryRestaurantUrl = 'https://developers.zomato.com/api/v2.1/search';
restaurantApp.queryParams.queryCuisineUrl = 'https://developers.zomato.com/api/v2.1/cuisines';
restaurantApp.queryParams.apiKey = '97641d101a3b203687e053667fcd3898';
restaurantApp.queryParams.cityCode = 89;
restaurantApp.queryParams.entity = 'city';
restaurantApp.queryParams.count = 20;
restaurantApp.queryParams.offset = 0;
restaurantApp.restaurants = [];
restaurantApp.cuisines = [];

// Make AJAX call to zomato to get the list of restaurants ad put them on the page

restaurantApp.getRestaurantsList = () => {
    $.ajax({
        type: 'GET',
        url: restaurantApp.queryParams.queryCuisineUrl,
        data: {
            apikey : restaurantApp.queryParams.apiKey,
            city_id : restaurantApp.queryParams.cityCode
        },
        dataType: 'json'
    }).then(res => {
        res.cuisines.forEach( item => {
            restaurantApp.cuisines.push({
                name: item.cuisine.cuisine_name,
                code: item.cuisine.cuisine_id
            });
            $('#cuisine').append(`<option value="${item.cuisine.cuisine_id}">${item.cuisine.cuisine_name}</option>`);
        });
    })
}

// Collect user input
restaurantApp.getRestorantInfo = () => {
    // Creat object to hold user picked info
    restaurantApp.userPicks = {};
    $('.dinnerForm').on('submit', (e) =>{
        // Empty array from any previous results
        restaurantApp.restaurants = [];
        e.preventDefault();
        $('.card-area').html('');
        restaurantApp.queryParams.cuisine = $('#cuisine option:selected').val();
        restaurantApp.queryParams.price = parseInt($('#price option:selected').val());
        for(let i = 0; i<=100; i = i+20){
            restaurantApp.queryParams.offset = i;
            restaurantApp.getInfo();
        }    
    });
}

// Make AJAX request with user inputted to the zomato 
restaurantApp.getInfo = () => {
    // make api call
    $.ajax({
        type: 'GET',
        url: restaurantApp.queryParams.queryRestaurantUrl,
        data: {
            apikey : restaurantApp.queryParams.apiKey,
            entity_id : restaurantApp.queryParams.cityCode,
            entity_type : restaurantApp.queryParams.entity,
            count : restaurantApp.queryParams.count,
            cuisines : restaurantApp.queryParams.cuisine,
            start : restaurantApp.queryParams.offset
        },
        dataType: 'json'
    }).then((res) => {
        // save resuls from the array.
        console.log(res);
        res.restaurants.forEach(function(place) {
            if (place.restaurant.price_range === restaurantApp.queryParams.price && place.restaurant.location.zipcode && place.restaurant.featured_image){
                restaurantApp.restaurants.push(place.restaurant);
                restaurantApp.displayInfo(place);
            }
            // if (!app.restaurantApp.restaurants.length){
            //     alert('nothing found chech again');
            // }
        });
        
    })
}

// This function over here makes stars appear in the rating
restaurantApp.starRating = (rating) => {
    // create arraay to hold stars
    let starArray = [];
    // check if the input making sense
    if (!isNaN(rating) && 0 <= rating && rating <= 5 ){
        // convert the decimal stars to half stars because 
        const halfStar = rating % 1;
        const fullStar = Math.floor(rating);
        if(!rating){
            return "Not rated yet."
        }
        for (let i = 0; i < fullStar; i++){
            starArray.push('<i class="fas fa-star star"></i>');
        }

        if (halfStar) {
            starArray.push('<i class="fas fa-star-half star"></i>');
        }
        
        starString = "";
        starArray.forEach((star)=>{
            starString = starString + star;
        })
        return starString;
    }
}
// Display restaurant  data on the page
restaurantApp.displayInfo = function(place) {
    console.log(place);
    $('.card-area').append(`
        <div class="restaurant-card flex">
            <div class="card-content basis100">
                <h3>${place.restaurant.name}</h3>
                <p class="address"> ${place.restaurant.location.address}</p>
                <p class="phone">${place.restaurant.phone_numbers}</p>
                <div class="stars">Rating: ${restaurantApp.starRating(place.restaurant.user_rating.aggregate_rating)}</div>
            </div>
            <div class="restaurant-picture flex">
                <img src="${place.restaurant.featured_image}" alt="featured image from a restaurant">
            </div>
            <div class="show-movie flex">
                <button value="${place.restaurant.location.zipcode}">-></button>
            </div>
        </div>
    `);
}
// Start reastaurant app
restaurantApp.init = () => {
    restaurantApp.getRestaurantsList();
    restaurantApp.getRestorantInfo();
}

// ================================================================================================
// this on here contains the movie theatre portions of the code
// ================================================================================================
const movieApp = {};

movieApp.showtimeUrl = `http://data.tmsapi.com/v1.1/movies/showings`;
movieApp.apiKey = `asa363es8bybmdvt64csjra7`;
movieApp.zip = `M6K 3R4`;
movieApp.radius = 3;
movieApp.units = `km`;
movieApp.theatreList = {};
movieApp.data = [];
movieApp.theatres = [];
movieApp.movieObj = {};
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
        const fullData = results;
        results.forEach(function(result){
            duplicateTheatres.push(result.showtimes[0].theatre.name); 
        })
        const uniqueSet = new Set(duplicateTheatres);
        movieApp.theatreList = [...uniqueSet];
        movieApp.theatreList.forEach(function(item){
            movieApp.movieObj[item] = {};
        })
        fullData.forEach(function (item) {
            let movieName = item.title;
            let theatreName = item.showtimes[0].theatre.name;
            let showTimes = [];
            if (movieApp.theatreList.includes(theatreName)) {
                movieApp.movieObj[theatreName][movieName] = [];  
            }
            for (i = 0; i < item.showtimes.length; i++) {
                showTimes.push(item.showtimes[i].dateTime);
            };
            movieApp.movieObj[theatreName][movieName].push(showTimes);
        });
        console.log(movieApp.movieObj);
    });
};

movieApp.init = function () {
    movieApp.getTodaysDate();
    movieApp.storeData();
}

// Both come togethere here

app.init = function () {
    restaurantApp.init();
    movieApp.init();  
}
$(function() {
    app.init();
});