const cartValidator = {
    product: {
        notEmpty: {
            errorMessage: 'Product is required'
        }, isMongoId: {
            errorMessage: "Please add a valid product"
        }
    }
}