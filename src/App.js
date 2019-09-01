import React, { useState } from "react";
import "./App.css";
import axios from "axios";
import { Formik } from "formik";

function App() {
  const [locationsFound, setLocationsFound] = useState([]);
  const [meetingType, setMeetingType] = useState("dinner");
  const [addressErrors, setAddressErrors] = useState(undefined);
  const [noLocationsFound, setNoLocationsFound] = useState(false);

  return (
    <div className="app-container">
      <h1>
        Meet In Between <i className="fas fa-street-view"></i>
      </h1>

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
          let radius = 2000;

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
                            setLocationsFound(yelpRes.data.businesses);
                          } else {
                            setNoLocationsFound(true)
                          }

                          setSubmitting(false);
                        });

                    } else {
                      setAddressErrors('Location Two not found. Please a enter more exact address')
                      return;
                    }

                  });
              } else {
                setAddressErrors('Location One not found. a Please enter more exact address')
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
              <div className="meeting-type-list">
                <button type="button" className={`${meetingType === 'dinner' ? 'active' : ''}`} onClick={() => setMeetingType('dinner')}><i className="fas fa-utensils"></i> Dinner </button>
                <button type="button" className={`${meetingType === 'lunch' ? 'active' : ''}`} onClick={() => setMeetingType('lunch')}><i className="fas fa-utensils"></i> Lunch </button>
                <button type="button" className={`${meetingType === 'date' ? 'active' : ''}`} onClick={() => setMeetingType('date')}><i className="fas fa-heart"></i> Date </button>
                <button type="button" className={`${meetingType === 'coffee' ? 'active' : ''}`} onClick={() => setMeetingType('coffee')}><i className="fas fa-coffee"></i> Coffee </button>
                <button type="button" className={`${meetingType === 'drinks' ? 'active' : ''}`} onClick={() => setMeetingType('drinks')}><i className="fas fa-cocktail"></i> Drinks </button>
              </div>
              <p className="address-errors">{addressErrors ? addressErrors : ''}</p>
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
                {isSubmitting ? "Searching..." : "Find the Perfect Inbetween!"}
              </button>
            </form>
          )}
      </Formik>
      <div className="results-container">
        {noLocationsFound && <><p>Sorry, no locations were found</p><h1><i className="far fa-sad-cry"></i> </h1></>}
        {locationsFound.map((loc, key) => {
          return <LocationRow loc={loc} key={key} />;
        })}
      </div>
    </div>
  );
}

const LocationRow = ({ loc }) => {
  const [rowToggled, setRowToggle] = useState(false);

  return (
    <div className="each-location" onClick={() => setRowToggle(!rowToggled)}>
      <div className="app-row">
        <img src={loc.image_url} />
        <div>
          <p>
            {" "}
            <b>{loc.name}</b>
            <br />
            {loc.location.display_address[0]}
          </p>
          <p>
            {loc.categories.map((category, ckey) => {
              return (
                <span className="category-tag" key={ckey}>
                  {" "}
                  {category.title}
                </span>
              );
            })}
          </p>
        </div>
      </div>

      {rowToggled && (
        <div>
          {loc.display_phone}
          {loc.is_closed && "Currently Closed"}
          {loc.price}
          {loc.rating}
          <a href={`${loc.url}`}>visit Yelp Page</a>
        </div>
      )}
    </div>
  );
};

export default App;
