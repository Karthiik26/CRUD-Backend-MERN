const mongoose = require('mongoose');
// mongoose.connect("mongodb://127.0.0.1:27017/CRUDOPERATIONS");
mongoose.connect("mongodb+srv://imkarthiik26:f6hoCpiPpsEmJDUe@tailorapp-db.q5nuy3b.mongodb.net/CrudMERNApp?retryWrites=true&w=majority&appName=TailorAPP-DB");

const db = mongoose.connection;

db.on("error", (error)=>{
    console.log("Mongo Connection Error - "+error);
});

db.on("open", ()=>{
    console.log("MongoDB Connected Succesfully");
});

db.on("disconnected", ()=>{
    console.log("MongoDb Disconnected");
});

process.on("SIGINT", ()=>{
    db.on(()=>{
        console.log("Mongodb connection Closed Through the Cmd - nodemon");
        process.exit(0);
    })
})