import mongoose, {Schema} from "mongoose"
const DisputeSchema= new mongoose.Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    productId:{
        type:Schema.Types.ObjectId,
        ref:"Product",
    },
    description:{
        type:String,
        trim:true,
    },
    location:String,
    date:{
        type: Date,
        default: Date.now, 
    },
    image:{
        type:String,
        trim:true,
    },
    status:{
        type:String,
        enum:["pending","resolve","rejected"],
        default:"pending",
    }
},{timestamps:true})
const Dispute=mongoose.model("Dispute",DisputeSchema)
export default Dispute