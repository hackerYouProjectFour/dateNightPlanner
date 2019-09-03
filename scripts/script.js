// ZOMATO API KEYS
// 9ab73e55b485303a844c8e0f5d16d2c9
// 97641d101a3b203687e053667fcd3898

// comment

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

restaurantApp.errorsArray = [];

// Make AJAX call to zomato to get the list of restaurants ad put them on the page

restaurantApp.getRestaurantsList = () => {
    $.ajax({
        type: 'GET',
        url: restaurantApp.queryParams.queryCuisineUrl,
        data: {
            apikey : restaurantApp.queryParams.apiKey,
            city_id : restaurantApp.queryParams.cityCode
        },
        dataType: 'json',
        error: function () {
            console.log('SOMETHING WENT WRONG!!!!');
        }
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
        // RESET EVERYTHING!!!!!
        restaurantApp.resetAll();
        e.preventDefault();
        $('.card-area').html('');
        restaurantApp.queryParams.cuisine = $('#cuisine option:selected').val();
        restaurantApp.queryParams.price = parseInt($('#price option:selected').val());
        // Must make 5 api calls for max amount of restaurants because the api returns only 20 at a time
        for(let i = 0; i < 100; i = i+20){
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
        dataType: 'json',
        error: function() {
            console.log('SOMETHING WENT WRONG!!!!');
        }
    }).then((res) => {
        // save results to the array.
        res.restaurants.forEach(function(place) {
            if (place.restaurant.price_range === restaurantApp.queryParams.price && place.restaurant.location.zipcode && place.restaurant.featured_image){
                restaurantApp.restaurants.push(place.restaurant);
                restaurantApp.displayInfo(place);
            }
        });
    }).then(()=>{
        if (restaurantApp.restaurants.length === 0){
            restaurantApp.errorsArray.push(1);
            let checkSum = restaurantApp.errorsArray.reduce((accumulator, currentValue) =>accumulator + currentValue, 0);
            if (checkSum === 5){
                $('.dinner .card-area').append('<div class="not-found"><p>Sorry, we were not able to find and restaurants that match your requirements. Please change search parameters and try again.</p></div>')
                
            }
        }
    });
}

// This function over here makes stars appear in the rating
restaurantApp.starRating = (rating) => {
    // create arraay to hold stars
    let starArray = [];
    // check if the input making sense
    if (!isNaN(rating) && 0 <= rating && rating <= 5 ){
        // convert the decimal stars to half stars because users dont responr well to quater stars i guess
        const halfStar = rating % 1;
        const fullStar = Math.floor(rating);
        if(!rating){
            return "Not rated yet."
        }
        for (let i = 0; i < fullStar; i++){
            starArray.push('<i class="fas fa-star star" aria-hidden="true"></i><span class="sr-only">One star</span>');
        }

        if (halfStar) {
            starArray.push('<i class="fas fa-star-half star aria-hidden="true""></i><span class="sr-only">Half star</span>');
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
    // console.log(place);
    $('.card-area').append(`
        <div class="restaurant-card flex basis45">
            <div class="card-content basis75">
                <h3>${place.restaurant.name}</h3>
                <p class="address"> ${place.restaurant.location.address}</p>
                <p class="phone"><em>${place.restaurant.phone_numbers.replace(/^\+[0-9]/, '')}</em></p>
                <div class="stars">Rating: ${restaurantApp.starRating(place.restaurant.user_rating.aggregate_rating)}</div>
            </div>
            <div class="card-right flex column basis25 justify-center">
                <div class="restaurant-picture">
                    <img src="${place.restaurant.featured_image}" alt="featured image from a restaurant">
                </div>
                <div class="show-movie flex">
                    <button value="${place.restaurant.location.zipcode}">Get Showtimes!</button>
                </div>
            </div>
        </div>
    `);
}

// This function resets all the variables to the initial state.
restaurantApp.resetAll = () => {
    restaurantApp.restaurants = [];
    restaurantApp.checkSum = [];
    restaurantApp.errorsArray = [];
    restaurantApp.offset = 0;
}

// Start reastaurant app
restaurantApp.init = () => {
    restaurantApp.getRestaurantsList();
    restaurantApp.getRestorantInfo();
}

// ================================================================================================
// this one here contains the movie theatre portions of the code
// ================================================================================================
const movieApp = {};

movieApp.showtimeUrl = `http://data.tmsapi.com/v1.1/movies/showings`;
// movieApp.apiKey = `asa363es8bybmdvt64csjra7`;
movieApp.apiKey = `gzt7vyqbw7ukmn5z5a7kt4um`;
movieApp.zip = ``;
movieApp.radius = 3;
movieApp.units = `km`;
movieApp.theatreList = {};
movieApp.data = [];
movieApp.theatres = [];
movieApp.movieObj = {};
// PULLS DATA FROM SHOWTIME API
movieApp.pullData = function () {
    return $.ajax({
        url: movieApp.showtimeUrl,
        method: 'GET',
        datatype: 'json',
        data: {
            api_key: movieApp.apiKey,
            startDate: movieApp.getTodaysDate,
            zip: movieApp.zip,
            radius: movieApp.radius,
            units: movieApp.units
        },
    // RETURNS ERROR MESSAGE IF MOVIES ARE UNABLE TO BE PULLED
    }).fail((error) => {
        movieApp.displayError();
    });
};
// APPENDS ERROR MESSAGE TO MODAL BOX IF NO MOVIE SHOWTIMES FOUND
movieApp.displayError = function() {
    $('.movie-area').append(`
            <div class='theatre-card flex column'>
            <h3>I'm sorry, we can't find any showtimes nearby.</h3>
            </div>
        `);
};
// GETS THE CURRENT DATE TO FEED INTO THE API CALL DATA
movieApp.getTodaysDate = function () {
    const today = new Date();
    // CONVERTS DATE TO FORMAT ACCEPTED BY API
    const date = today.getFullYear() + `-` + ('0' + (today.getMonth() + 1)).slice(-2) + `-` + ('0' + today.getDate()).slice(-2);
    return date;
};
// APPENDS SHOWTIMES TO THE MODAL BOX ON THE DOM
movieApp.addTheatre = function () {
    for (let theatre in movieApp.movieObj) {
        // ADDS EACH THEATRE TO THE MODAL BOX
        $('.movie-area').append(`
            <div class='theatre-card ${theatre.replace(/[^a-zA-Z0-9]/g, "")} flex column'>
            <h3>${theatre}</h3>
            </div>
        `);
        // ADDS EACH MOVIE TO THE CORRECT THEATRE
        for (let movie in movieApp.movieObj[theatre]) {
            $(`.${theatre.replace(/[^a-zA-Z0-9]/g, "")}`).append(`
                <div class='${movie.replace(/[^a-zA-Z0-9]/g, "")}'>
                <h4>${movie}</h4>
                </div>
            `);
            // ADDS EACH SHOWTIME TO THE CORRECT MOVIE AT THE CORRECT THEATRE
            movieApp.movieObj[theatre][movie].forEach(function (item) {
                $(`.${movie.replace(/[^a-zA-Z0-9]/g, "")}`).append(`
                        <div class="showtimes column flex">
                        <p>${movieApp.movieObj[theatre][movie]}</p>
                        </div>
                `);
            });
        };
    };
};
// REMOVES DUPLICATE THEATRE ENTREIES THAT ARE RECEIVED FROM THE API
movieApp.duplicateRemover = function(list) {
    //CONVERTS DATA TO A SET TO REMOVE DUPLICATES
    const uniqueSet = new Set(list);
    //CONVERTS THE DATA BACK TO AN ARRAY
    movieApp.theatreList = [...uniqueSet];
    //ADDS EACH ITEM IN THE ARRAY BACK TO THE CORRECT OBJECT
    movieApp.theatreList.forEach(function (item) {
        movieApp.movieObj[item] = {};
    })
}
// ORGANIZES THE DATA FROM THE API INTO AN ARRAY OF OBJECTS SORTED BY THEATRE -> MOVIE NAME -> SHOWTIMES
movieApp.movieSorter = function(data) {
    data.forEach(function (item) {
        let movieName = item.title;
        let theatreName = item.showtimes[0].theatre.name;
        let showTimes = [];
        //ADDS EACH MOVIE TO THE CORRECT THEATRE IN THE OBJECT
        if (movieApp.theatreList.includes(theatreName)) {
            movieApp.movieObj[theatreName][movieName] = [];
        }
        // ADDS THE SHOWTIMES AS AN ARRAY TO THE CORRECT MOVIE
        for (i = 0; i < item.showtimes.length; i++) {
            showTimes.push(item.showtimes[i].dateTime);
        };
        // CUTS OUT THE DATE AND CONVERTS THE TIME TO A READABLE FORMAT
        let apendedTimes = showTimes.map(item => item.slice(11));
        let spacedTimes = apendedTimes.map(item => item = ` ` + item);
        movieApp.movieObj[theatreName][movieName].push(spacedTimes);
    });
}
// RUNS THE FUNCTIONS TO CALL THE DATA THEN SORT EACH ENTRY INTO AN ARRAY OF OBJECTS FOR USE BY THE APP
movieApp.storeData = function () {
    movieApp.pullData().then(function (results) {
        const duplicateTheatres = [];
        const fullData = results;
        results.forEach(function (result) {
            duplicateTheatres.push(result.showtimes[0].theatre.name);
        })
        movieApp.duplicateRemover(duplicateTheatres);
        movieApp.movieSorter(fullData);
        movieApp.addTheatre();
    });
};
// RUNS THE APP WHEN THE RESTAURANT SELECTION IS MADE
movieApp.displayOptions = function() {
    // LISTENS FOR CLICK TO DETERMINE THE SELECTED RESTAURANT
    $('.card-area').on('click', 'button', function(){
        // CLEARS THE ENTRIES IF THERE HAS ALREADY BEEN A SELECTION
        $('.movie-area').html('')
        // PULLS THE POSTAL CODE FROM THE VALUE OF THE BUTTON
        movieApp.zip = $(this).val();
        // THE THE FUNCTION TO STORE AND SORT THE DATA
        movieApp.storeData();
        // OPENS THE MODAL BOX TO DISPLAY RESULTS
        $('.modal').css('display', 'block');
    })
};

// CLOSES THE MODAL WHEN USER CLICKS OUTSIDE THE BOX
movieApp.closeModal = function() {
    $('body').on('click', function(event){
        if (!$(event.target).closest(".modal-content").length && !$(event.target).closest('.card-area').length) {
            $(".modal").css('display', 'none');
        }
    });
}
// INITIALIZES THE MOVIE APP
movieApp.init = function () {
    movieApp.getTodaysDate();
    movieApp.displayOptions();
    movieApp.closeModal();
}


// Both come togethere here

app.init = function () {
    restaurantApp.init();
    movieApp.init();  
}
$(function() {
    app.init();
});