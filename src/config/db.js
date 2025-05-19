import mongoose from "mongoose";

export const  connectDB = async () =>{

    await mongoose.connect('mongodb+srv://greatstack:123123123@cluster0.3xpkeaq.mongodb.net/food-del').then(()=>console.log("DB Connected"));
   
}
 
 