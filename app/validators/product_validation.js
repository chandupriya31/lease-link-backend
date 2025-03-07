export const productSchema = {
    name: {
        notEmpty: {
            errorMessage: "Please add your product name"
        }
    }, description: {
        notEmpty: {
            errorMessage: "Please add the description or data related to your product"
        }
    }, category: {
        notEmpty: {
            errorMessage: "Please select the category"
        }
    }, price: {
        notEmpty: {
            errorMessage: "Please select the category"
        }
    }, images: {
        notEmpty: {
            errorMessage: "Please add images of your product"
        }
    }
}