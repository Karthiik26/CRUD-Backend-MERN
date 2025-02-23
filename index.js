require("./db-connection");
const express = require("express");
const Collection = require("./schema");
const cors = require("cors");
const multer = require("multer");
const app = express();
const bodyParser = require('body-parser');
const PORT = 4500;
require("dotenv").config();

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// User Signup
app.post("/UserSignUp", upload.single("UserImage"), async (req, res) => {
  try {
    const { Name, Email, Country, Password } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!Name || !Email || !Password || !Country) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const ExUser = await Collection.findOne({ Email });
    if (ExUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const image = {
      Data: req.file.buffer,
      contentType: req.file.mimetype,
    };

    const User = new Collection({
      UserImage: image,
      Name,
      Email,
      Password,
      Country,
    });

    await User.save();

    res.status(201).json(User);
  } catch (error) {
    console.error("Internal server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login User
app.post("/login/:Email/:Password", async (req, res) => {
  let Email = req.params.Email;
  let user = await Collection.findOne({ Email: Email });
  if (user) {
    let CPassword = req.params.Password;
    let SPassword = user.Password;

    if (CPassword === SPassword) {
      res.status(200).send(user);
    } else {
      res.status(409).send("enter valid Password");
    }
  } else {
    res.status(404).send("User Not Found");
  }
});

// Update User
app.put("/UpdateUser/:UserId", upload.single("UserImage"), async (req, res) => {
  try {
    const userId = req.params.UserId;
    const { Name, Email, Country } = req.body;

    const user = await Collection.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (req.file) {
      const image = {
        Data: req.file.buffer,
        contentType: req.file.mimetype,
      };
      user.UserImage = image;
    }

    if (Name) {
      user.Name = Name;
    }
    if (Email) {
      const ExUser = await Collection.findOne({ Email });
      if (ExUser && ExUser._id.toString() !== userId) {
        return res.status(400).json({ error: "Email already exists" });
      }
      user.Email = Email;
    }
    if (Country) {
      user.Country = Country;
    }

    await user.save();

    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Internal server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Change Users Password
app.put("/changePswrd/:Id/:oldPassword/:newPassword", async (req, res) => {
  try {
    const userId = req.params.Id;
    const oldPassword = req.params.oldPassword;
    const newPassword = req.params.newPassword;

    const user = await Collection.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.Password !== oldPassword) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    user.Password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Create -> add product Inside ProductList -----> CREATE
app.post(
  "/ProductInserting/:_id",
  upload.single("ProductImage"),
  async (req, res) => {
    try {
      const userId = req.params._id;

      let user = await Collection.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { Title, description } = req.body;

      if (!Title || !description) {
        return res.status(400).json({ error: "Missing Some fields" });
      }

      const image = {
        Data: req.file.buffer,
        contentType: req.file.mimetype,
      };

      user.ProductList.push({
        ProductImage: image,
        Title,
        description,
      });

      await user.save();

      res.status(201).json({ message: "Product added successfully" });
    } catch (error) {
        console.error("Internal server error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Feeding Into DataTable -> read Entire Array ProductList ------> ARRAY READ
app.get("/GetMyData/:userId", async (req, res) => {
  const userId = req.params.userId; // Get the user's ID from the request parameter

  try {
    const user = await Collection.findById(userId, "ProductList");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.ProductList);
  } catch (err) {
    res.status(500).send("Error fetching mycart data");
  }
});

// Getting Single Product By Id
app.get("/GettingInnerData/:UserId/:ProductId", async (req, res) => {
  try {
    const userId = req.params.UserId;
    const productId = req.params.ProductId;

    const user = await Collection.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const product = user.ProductList.find(
      (product) => product._id.toString() === productId
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Getting Single Product By Id
app.get("/GettingUser/:UserId", async (req, res) => {
  try {
    const userId = req.params.UserId;

    const user = await Collection.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// removing one one items from the productList ------> DELETE
app.delete("/deleteProductItem/:userId/:itemId", async (req, res) => {
  try {
    const user = await Collection.findById(req.params.userId);

    if (user) {
      const ProductArray = user.ProductList;

      const indexToRemove = ProductArray.findIndex(
        (item) => item.id === req.params.itemId
      );
      console.log("Index to Remove:", indexToRemove);
      if (indexToRemove !== -1) {
        ProductArray.splice(indexToRemove, 1);

        await Collection.findByIdAndUpdate(req.params.userId, {
          ProductList: ProductArray,
        });
        res.json({ message: "Item Removed" });
      } else {
        res.status(404).json({ message: "Item Not Found" });
      }
    } else {
      res.status(404).json({ message: "User Not Found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Edit Product ------> UPDATE
app.put(
  "/UpdateProduct/:UserId/:ProductId",
  upload.single("ProductImage"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      if (!req.body.Title || !req.body.description) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const userId = req.params.UserId;
      const ProductId = req.params.ProductId;

      const user = await Collection.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const product = user.ProductList.find(
        (product) => product._id.toString() === ProductId
      );
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const image = {
        Data: req.file.buffer,
        contentType: req.file.mimetype,
      };

      product.ProductImage = image;
      product.Title = req.body.Title;
      product.description = req.body.description;
      product.Date = new Date();

      await user.save();

      res.json({ message: "Product updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);


app.listen(PORT, () => {
  console.log("SERVER IS CONNECTED TO THE PORT - " + PORT);
});
