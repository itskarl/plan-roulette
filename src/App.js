import React, { useState } from "react";
import "./App.css";
import axios from "axios";
import { Formik } from "formik";

function App() {
  const [locationsFound, setLocationsFound] = useState([]);
  const [meetingType, setMeetingType] = useState("dinner");
  const [addressErrors, setAddressErrors] = useState(undefined);
  const [noLocationsFound, setNoLocationsFound] = useState(false);
  const [mapImage, setMapImage] = useState(undefined)

  const colorsNTags = {
    0: {tag: 'A', color: 'red'},
    1: {tag: 'B', color: 'blue'},
    2: {tag: 'C', color: 'green'},
    3: {tag: 'D', color: 'yellow'},
    4: {tag: 'E', color: 'purple'},
    5: {tag: 'F', color: 'white'},
    6: {tag: 'G', color: 'black'},
    7: {tag: 'H', color: 'brown'},
    8: {tag: 'I', color: 'silver'},
    9: {tag: 'J', color: 'orange'}
  }


  return (
    <div className="app-container">


      <Formik
        initialValues={{ address1: "", address2: "" }}
        validate={values => {
          let errors = {};
          if (!values.address1) {
            errors.address1 = "First Address Required";
          }
          if (!values.address2) {
            errors.address2 = "Second Address Required";
          }
          return errors;
        }}
        onSubmit={(values, { setSubmitting }) => {
          let location1;
          let location2;
          let new_lat;
          let new_long;

          axios
            .get(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${values.address1}&key=${process.env.REACT_APP_GEOCODE_KEY}`
            )
            .then(res => {
              if (res.data.results[0]) {
                location1 = res.data.results[0].geometry.location;

                axios
                  .get(
                    `https://maps.googleapis.com/maps/api/geocode/json?address=${values.address2}&key=${process.env.REACT_APP_GEOCODE_KEY}`
                  )
                  .then(res2 => {
                    if (res2.data.results[0]) {
                      location2 = res2.data.results[0].geometry.location;

                      new_lat = (location1.lat + location2.lat) / 2;
                      new_long = (location1.lng + location2.lng) / 2;


                      const doYelpSearch = (radius) => {
                        axios
                        .get(
                          `${"https://cors-anywhere.herokuapp.com/"}https://api.yelp.com/v3/businesses/search?term=${meetingType}&latitude=${new_lat}&longitude=${new_long}&limit=10&radius=${radius}`,
                          {
                            headers: {
                              Authorization: `Bearer ${process.env.REACT_APP_YELP_API}`
                            }
                          }
                        )
                        .then(yelpRes => {
                          if (yelpRes.data.businesses.length > 0) {
                            const businessList = yelpRes.data.businesses;
                            setLocationsFound(businessList);
                            const businessLatLongs = businessList.slice(0,5).map((bus, key) => {return( `%20&markers=color:${colorsNTags[key].color}%7Clabel:${colorsNTags[key].tag}%7C${bus.coordinates.latitude},${bus.coordinates.longitude}`)}).join('')
                            setMapImage( `https://maps.googleapis.com/maps/api/staticmap?center=${new_lat},${new_long}&zoom=14&size=800x600&maptype=roadmap${businessLatLongs}&key=${process.env.REACT_APP_GEOCODE_KEY}`)
                            setNoLocationsFound(false);
                          } else { 
                            setNoLocationsFound(true);
                          }

                          setSubmitting(false);
                        });
                      }

                      // let count = 1000;
       
                      // var zoop = setInterval(function () {
                      //   if ((count > 8000) || foundStuff) {
                      //     clearInterval(zoop)
                      //   }
                      //   console.log('aaaa', count, locationsFound.length);
                      //   doYelpSearch(count);
                      //   count += 1500;
                        

                      // }, 2000)

                      doYelpSearch(2000)

                   
                      } else {
                      setAddressErrors(
                        "Location Two not found. Please a enter more exact address"
                      );
                      setSubmitting(false);
                      return;
                    }
                  });
              } else {
                setAddressErrors(
                  "Location One not found. a Please enter more exact address"
                );
                setSubmitting(false);
                return;
              }
            });
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting
          /* and other goodies */
        }) => (
          <form className="address-fields" onSubmit={handleSubmit}>
                  <h1>
        Meet <i className="fas fa-street-view"></i>n Between
      </h1>
            <div className="banner"  />
            <div className="meeting-type-list">
              <button
                type="button"
                className={`${meetingType === "dinner" ? "active" : ""}`}
                onClick={() => setMeetingType("dinner")}
              >
                <i className="fas fa-utensils"></i> Dinner{" "}
              </button>
              <button
                type="button"
                className={`${meetingType === "lunch" ? "active" : ""}`}
                onClick={() => setMeetingType("lunch")}
              >
                <i className="fas fa-utensils"></i> Lunch{" "}
              </button>
              <button
                type="button"
                className={`${meetingType === "date" ? "active" : ""}`}
                onClick={() => setMeetingType("date")}
              >
                <i className="fas fa-heart"></i> Date{" "}
              </button>
              <button
                type="button"
                className={`${meetingType === "coffee" ? "active" : ""}`}
                onClick={() => setMeetingType("coffee")}
              >
                <i className="fas fa-coffee"></i> Coffee{" "}
              </button>
              <button
                type="button"
                className={`${meetingType === "drinks" ? "active" : ""}`}
                onClick={() => setMeetingType("drinks")}
              >
                <i className="fas fa-cocktail"></i> Drinks{" "}
              </button>
            </div>
            <p className="address-errors">
              {addressErrors ? addressErrors : ""}
            </p>
            <input
              type="text"
              name="address1"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.address1}
              placeholder="Location 1"
            />
            <span className="errors">
              {" "}
              {errors.address1 && touched.address1 && errors.address1}
            </span>

            <input
              type="text"
              name="address2"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.address2}
              placeholder="Location 2"
            />
            <span className="errors">
              {" "}
              {errors.address2 && touched.address2 && errors.address2}
            </span>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Searching..." : "Find It!"}
            </button>
          </form>
        )}
      </Formik>
      <div className="results-container">
        {mapImage && <div className="map-container"><img src={mapImage} className="map-image" alt="google map" /></div>}
        {noLocationsFound && (
          <>
            <p>Sorry, no locations were found</p>
            <h1>
              <i className="far fa-sad-cry"></i>{" "}
            </h1>
          </>
        )}
        {locationsFound.slice(0,5).map((loc, key) => 
           <LocationRow loc={loc} key={key} />
        )}
      </div>
    </div>
  );
}

const LocationRow = ({ loc }) => {
  const [rowToggled, setRowToggle] = useState(false);

  return (
    <div className="each-location" onClick={() => setRowToggle(!rowToggled)}>
      <div className="app-row">
        <img src={loc.image_url} alt="restaurant" />
        <div className="row-text">
          <div className="title-row">
            {" "}
            <b>
              {loc.name} {loc.is_closed && "(Currently Closed)"}{" "}
            </b>
            {loc.price && <div className="price-text">{loc.price.split('').map((a,z) => <React.Fragment key={z}><i className="fas fa-dollar-sign"></i></React.Fragment>)}</div>}
          </div>
          <p>{loc.location.display_address[0]}</p>
          <div className="category-list">
            {loc.categories.map((category, ckey) => 
              
                <div className="category-tag" key={ckey}>
              
                  {category.title}
                </div>
              
            )}
          </div>
        </div>
      </div>

      {rowToggled && (
        <div className="additional-info">
          <p><b>Phone:</b>{loc.display_phone}</p>
          <p><b>Reviews:</b> ({loc.rating}/5) <i class="fab fa-yelp"></i>{' '}<a href={`${loc.url}`} target="_blank" rel="noopener noreferrer" >visit Yelp Page</a></p>
          <p><i class="fab fa-google"></i>{' '}<a href={`https://www.google.com/maps/search/${loc.name.replace(' ','+')}+${loc.location.display_address[0].replace(' ','+')}`} target="_blank" rel="noopener noreferrer">Find on Google</a> </p>
        </div>
      )}
    </div>
  );
};

export default App;
