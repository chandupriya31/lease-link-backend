const contactUsValidator={
    name:{
        notEmpty:{
            errorMessage:"Please Enter your Name"
        }
    },
    email:{
        notEmpty:{
            errorMessage:"Please Enter your Email"
        },
        isEmail:{
            errorMessage:"Please Enter a Valid Email"
        }
    },
    description:{
        notEmpty:{
            errorMessage:"Please Enter some Description"
        }
    }
}
export default contactUsValidator