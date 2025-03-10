
const blogValidator={
    image:{
        notEmpty:{
            errorMessage:"Please provide an image"
        }
    },
    title:{
        notEmpty:{
            errorMessage:"Please Provide a Title"
        }

    },
    description:{
        notEmpty:{
            errorMessage:"Please Enter some Descriptions"
        }
    }
}
export default blogValidator