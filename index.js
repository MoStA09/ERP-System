// Import express
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");

//Require Route Handlers
const users = require("./routes/api/users");
const safes = require("./routes/api/safes");
const expenses = require("./routes/api/expenses");
const clients = require("./routes/api/clients");
const stores = require('./routes/api/stores');
const subStores = require('./routes/api/subStores');
const products = require('./routes/api/products');
const collectionStatements = require('./routes/api/collectionStatements');
const cheques = require('./routes/api/cheques');
const invoices = require('./routes/api/invoices');
const suppliers = require('./routes/api/suppliers');
const discounts = require('./routes/api/discounts');
const storeTransaction = require("./routes/api/storeTransactions");

// Create the app
const app = express(); 

// Use it with post
app.use(express.json());
app.use(cors());


//Getting Mongo's connection URI
const db = require('./config/keys').mongoURI;

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

//Connecting to MongoDB
mongoose
  .connect(db)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// Init middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));



//Express session  
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);

//Passport
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);

//Connect flash
app.use(flash());

//Global Vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


// app.use(express.static(path.join(__dirname, 'data')));  

app.use("/api/users", users);
app.use("/api/safes", safes);
app.use("/api/expenses", expenses);
app.use("/api/clients", clients);
app.use('/api/stores', stores);
app.use('/api/storeTransactions', storeTransaction);
app.use('/api/subStores', subStores);
app.use('/api/products', products);
app.use('/api/collectionStatements', collectionStatements);
app.use('/api/cheques', cheques);
app.use('/api/discounts', discounts);
app.use('/api/invoices', invoices);
app.use('/api/suppliers', suppliers);

//production mode
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../client/build'));
  // Homepage
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"))
  );
} else {
  app.get('/', (req, res) => res.send('Homepage'));
}

// Handling 404
app.use((req, res) => {
  res.status(404).send({ err: 'We can not find what you are looking for' });
});

// Define the port, get it from the enviroment (used in production)
// Or just use 3000
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server up and running on port ${port}`));
