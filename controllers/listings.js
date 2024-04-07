const Listing = require("../models/listings.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListings = await Listing.find();
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing does not exist");
    res.redirect("/listings");
  }
  if (!listing) {
    next(new ExpressError(404, "Listing does not exist"));
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = response.body.features[0].geometry;
  let savedListing = await newListing.save();
  console.log(savedListing);
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing does not exist");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  await listing.save();
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();
  listing.geometry = response.body.features[0].geometry;
  await listing.save();
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  await req.flash("success", "Listing Updated");
  await res.redirect(`/listings/${id}`);
};

// module.exports.resultPage = async (req, res) => {
//   const searchQuery = req.query.search;
//   const searchRegex = new RegExp(searchQuery, "i");

//   console.log(searchQuery);
//   if (!searchQuery) {
//     req.flash("error", "Location does not exist");
//     res.redirect("/listings");
//   }
//   const allListings = await Listing.find({ title: searchQuery });
//   console.log(allListings);
//   res.render("/listings", { allListings });
// };

module.exports.resultPage = async (req, res) => {
  const searchQuery = req.query.search;
  const searchRegex = new RegExp(searchQuery, "i");

  console.log(searchQuery);
  console.log(searchQuery);

  const filteredListings = await Listing.find({
    $or: [
      { title: searchRegex },
      { location: searchRegex },
      { category: searchRegex },
    ],
  });
  if (filteredListings.length === 0) {
    req.flash("error", `No place found for search query: ${searchQuery}`);
    return res.redirect("/listings");
  }

  res.render("listings/index.ejs", { allListings: filteredListings });
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
