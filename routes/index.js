// #region INITILISATION

// #region REQUIRE STATEMENTS
//* Express
const express = require("express");

//* Module Exports
const requestDataFromAPI = require(`../ModuleExports/requestDataFromAPI.js`);
const countryFlags = require(`../ModuleExports/CountryFlags`);
const calculatePlayerAge = require(`../ModuleExports/calculatePlayerAge`);
const turnStringIntoAcronym = require(`../ModuleExports/turnStringIntoAcronym`);
const formatPlayerHeight = require(`../ModuleExports/formatPlayerHeight`);
const formatPlayerGender = require(`../ModuleExports/formatPlayerGender`);
// #endregion

const router = express.Router();
// #endregion

router.get(`/`, async (req, res, next) => {
  //* Create empty array to store objects of favourites which can be passed through to index.ejs
  const favouritesToDisplay = [];
  const favPlayersTeam = [];
  const teamKits = [];
  let favourites = [];
  let fav;

  try {
    if (req.user)
      favourites = req.user.favourites;

    for (const element of favourites) {
      //* return an array of objects
      fav = await Promise.all([
        requestDataFromAPI(`https://www.thesportsdb.com/api/v1/json/1/lookupteam.php?id=`, element.ID.toString()),
        requestDataFromAPI(`https://www.thesportsdb.com/api/v1/json/1/lookupplayer.php?id=`, element.ID.toString()),
      ]);

      //* Loop through the array of fav objects
      for (let i = 0; i < fav.length; i++) {
        //* Loop and access the key for each object in fav
        for (const key in fav[i]) {
          //* If the value of the key in the current iterated object is not null
          if (fav[i][key] != null) {
            //* Add the object to the list of favourites to be displayed
            favouritesToDisplay.push(fav[i]);
            
            // break out of the loop, becasue we know the rest will be null
            break;
          }
        }
      }
    }

    //* Gather the team information for all the favourite players
    for (let i = 0; i < favouritesToDisplay.length; i++) {
      if (favouritesToDisplay[i].players) {
          if (favouritesToDisplay[i].players[0].strTeam !== "_Retired Soccer" &&
              favouritesToDisplay[i].players[0].strTeam !== "_Free Agent Soccer" && favouritesToDisplay[i].players[0].strTeam !== "_Deceased Soccer") {
                const team = await requestDataFromAPI(`https://www.thesportsdb.com/api/v1/json/1/searchteams.php?t=`, favouritesToDisplay[i].players[0].strTeam);
                const teamObject = { badge: team.teams[0].strTeamBadge, teamName: team.teams[0].strTeam };
                favPlayersTeam.push(teamObject);
          } else {
            const teamObject = {
              badge: "https://www.clipartmax.com/png/middle/307-3077324_x-mark-cross-computer-icons-clip-art-red-cross-icon.png",
              teamName: "None"
            };
            favPlayersTeam.push(teamObject);
        }
      }
      else {
        favPlayersTeam.push(null);
      }

      if (favouritesToDisplay[i].teams) {
        const team = await requestDataFromAPI(`https://www.thesportsdb.com/api/v1/json/1/searchteams.php?t=`, favouritesToDisplay[i].teams[0].strTeam);
        const kit = team.teams[0].strTeamJersey;
        teamKits.push(kit);
      } else {
        teamKits.push(null);
      }
    }

    res.render(`index.ejs`, {
      listOfFavourites: favouritesToDisplay,
      countryFlags,
      calculatePlayerAge,
      turnStringIntoAcronym,
      favPlayersTeam,
      formatPlayerHeight,
      formatPlayerGender,
      teamKits
    });
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;
