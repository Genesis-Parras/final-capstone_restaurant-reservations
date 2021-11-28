import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ReservationInfo from "../dashboard/ReservationInfo";

function Search() {
  const [mobile_number, setMobile_number] = useState("");
  const [reservations, setReservations] = useState(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (reservations && reservations.length === 0) {
      setShowError(true);
    }
  }, [reservations]);

  const submitHandler = (event) => {
    event.preventDefault();
    listReservations({ mobile_number })
      .then((response) => {
      setReservations(response);
    })
  };


  return (
    <div>
      <div>
        {showError && (
          <p className="alert alert-danger">
            No reservations found
          </p>
        )}
      </div>

      <h3 className="d-flex m-3 justify-content-center">
        Search for Reservation by Mobile #:
      </h3>

      <div className="d-flex justify-content-center">
        <form className="form-group" onSubmit={submitHandler}>
          <input
            name="mobile_number"
            type="text"
            placeholder="Enter a customer's phone number"
            required
            onChange={(event) => setMobile_number(event.target.value)}
            value={mobile_number}
            className="form-control"
          />
          <br />
          <div className="d-flex justify-content-center">
            <button className="btn btn-outline-primary" type="submit">
              Find
            </button>
          </div>
        </form>
        <div>
          <ul className="list-group list-group-flush">
            {reservations &&
              reservations.map((res) => (
                <li className="list-group-item" key={res.reservation_id}>
                  <ReservationInfo reservation={res} />
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Search;
