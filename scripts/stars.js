starRating = (rating) => {
    let starArray = [];
    if (!isNaN(rating) && 0 <= rating && rating <= 5 ){
        const halfStar = rating % 1;
        const fullStar = Math.floor(rating);
        
        for (let i = 0; i < fullStar; i++){
            starArray.push('*');
        }

        if (halfStar) {
            starArray.push('*/2');
        }

        return starArray;
    }
}