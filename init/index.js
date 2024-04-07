// const mongoose = require("mongoose");
// const { sampleListings } = require("./data.js");
// const Listing = require("../models/listings.js");
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
// // const initData = require("./data.js");
// main()
//   .then(() => {
//     console.log("Connected to DB");
//   })
//   .catch((err) => {
//     console.log(err);
//   });
// async function main() {
//   await mongoose.connect(MONGO_URL);
// }

// const initDB = async () => {
//   await Listing.deleteMany({});
//   initData.data = initData.data.map((obj) => ({
//     ...obj,
//     owner: "66002bd5f70a9f8e3819e6d4",
//   }));
//   console.log(sampleListings);
//   await Listing.insertMany(sampleListings);
//   console.log("Data was initialized");
//   ``;
// };

// initDB();

const mongoose = require("mongoose");
// const { sampleListings } = require("./data.js");
const Listing = require("../models/listings.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const initData = require("./data.js");
main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "66002bd5f70a9f8e3819e6d4",
  }));
  console.log(initData.data);
  await Listing.insertMany(initData.data);
  console.log("Data was initialized");
};

initDB();
