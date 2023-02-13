// Modules required to run app
const express = require("express");
const https = require("https");
// Creating the express app
const app = express();
// Seting up ejs as view engine
app.set("view engine", "ejs");
// Using url encoding that is built in to express
app.use(express.urlencoded({
  extended: true
}));
// Static folder for js and css
app.use(express.static(__dirname + '/public'));
// This array stores the results of the search
activities = []
// This string changes to No activity found if we receive an error from BoredAPI
error = ""
// Root route that renders index.ejs
app.get("/", (req, res) => {
  res.render("index", {
    activities: activities,
    error: error
  })
})
// The posting from index.ejs form
app.post("/", (req, res) => {
  // JavaScript object to store all the data posted
  const activity = {
    category: req.body.categoryName,
    // JavaScript does not have unsigned integers, used .replace with regular expression to remove any minus sign to essencially make an unsigned int
    participents: req.body.participentNumber.replace(/[/-]/g, ''),
    priceRangeMin: req.body.priceRangeMin / 100,
    priceRangeMax: req.body.priceRangeMax / 100,
    accessibilityRangeMin: req.body.accessibilityRangeMin / 100,
    accessibilityRangeMax: req.body.accessibilityRangeMax / 100
  }
  //Following two statements check to see if price min and max were swapped, if they were it will automatically correct to try and avoid an error
  if (activity.priceRangeMin > activity.priceRangeMax) {
    [activity.priceRangeMin, activity.priceRangeMax] = [activity.priceRangeMax, activity.priceRangeMin]
  }
  if (activity.accessibilityRangeMin > activity.accessibilityRangeMax) {
    [activity.accessibilityRangeMin, activity.accessibilityRangeMax] = [activity.accessibilityRangeMax, activity.accessibilityRangeMin]
  }

  Object.keys(activity).forEach(key => {
    if (activity[key] === "") {
      delete activity[key];
    }
  });
  // URL for connecting to the BoredAPI
  const url = "https://www.boredapi.com/api/activity?type=" + activity.category + "&participants=" + activity.participents + "&minprice=" + activity.priceRangeMin + "&maxprice=" + activity.priceRangeMax + "&minaccessibility=" + activity.accessibilityRangeMin + "&maxaccessibility=" + activity.accessibilityRangeMin;
  // HTTPS request to BoredAPI- The API accepts both http and https requests
  https.get(url, (response) => {
    response.on("data", function(data) {
      const activityData = JSON.parse(data);
      // Checks to see if there is an error. if there are no errors the activity  gets added in the first position to the activities array
      if (activityData.error) {
        error = "No activity found";
      } else {
        const activityLog = {
          "description": activityData.activity,
          "type": activityData.type,
          "participants": activityData.participants,
          "price": activityData.price,
          "accessibility": activityData.accessibility,
          "link": activityData.link
        }
        activities.unshift(activityLog);
        error = ""
      }
      res.redirect("/");
    })
  });
})

app.listen(3000, () => {
  console.log("server running on port 3000")
});
