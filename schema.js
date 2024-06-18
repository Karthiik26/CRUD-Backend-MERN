const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid');

let User = new mongoose.Schema({
    Email : {
        type : String,
        require : true
    },
    Name : {
        type : String,
        require : true
    },
    Country : {
        type : String,
        require : true
    },
    Password : {
        type : String,
        require : true
    },
    UserImage: {
        Data: Buffer,
        contentType: String
    },
    ProductList : [
        {
            ProductImage: {
                Data : Buffer,
                contentType : String
            },
            Title : String,
            description: String,
            Date : {
                type : Date,
                default : Date.now
            }
        }
    ]
});

module.exports = mongoose.model("User", User);
