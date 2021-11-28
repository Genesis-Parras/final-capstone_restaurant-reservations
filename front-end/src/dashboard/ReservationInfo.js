import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import { updateReservationStatus } from "../utils/api";

function ReservationInfo({ reservation }) {
  const history = useHistory();

  const [currentReservation, setCurrentReservation] = useState(reservation);
  const [showSeat, setShowSeat] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (
      currentReservation.status === "booked" ||
      currentReservation.status === null
    ) {
      setShowSeat(true);
    }
  }, [currentReservation]);

  const seatHandler = (event) => {
    event.preventDefault();
    setError(null);
    setShowSeat(false);
    updateReservationStatus(
      { status: "seated" },
      currentReservation.reservation_id
    )
      .then((response) => {
        setCurrentReservation(response);
        history.push(`/reservations/${currentReservation.reservation_id}/seat`);
      })
      .catch(setError);
  };

  const cancelHandler = (event) => {
    event.preventDefault();
    setError(null);
    const confirmBox = window.confirm(
      "Do you want to cancel this reservation? This cannot be undone."
    );
    if (confirmBox === true) {
      updateReservationStatus(
        { status: "cancelled" },
        currentReservation.reservation_id
      )
        .then((response) => {
          setCurrentReservation(response);
          history.go(0);
        })
        .catch(setError);
    }
  };

  return (
    <div className="card text-center card-background">
      <ErrorAlert error={error} />
      <div className="card-body">
        <h4 className="card-title text-center">
          {currentReservation.reservation_time}
        </h4>
        <p className="card-text text-center">
          {currentReservation.reservation_date}
        </p>

        <ul className="list-group list-group-flush">
        <li className="list-group-item">Name: {currentReservation.first_name} {currentReservation.last_name}
        </li>
        <li className="list-group-item">Mobile #: {currentReservation.mobile_number}</li>
        <li className="list-group-item">Party Size: {currentReservation.people}</li>
        <li className="list-group-item text-center" data-reservation-id-status={currentReservation.reservation_id}>
            Status: {currentReservation.status ? currentReservation.status : "booked"}
        </li>
        </ul>

        <div className="d-flex justify-content-center mb-1">
          {showSeat ? (
            <a
              href={`/reservations/${currentReservation.reservation_id}/seat`}
              onClick={seatHandler}
              className="card-link btn btn-outline-primary btn-sm"
            >
              Seat
            </a>
          ) : (
            <div></div>
          )}
        </div>

        <div className="d-flex justify-content-center btn-group">
          <a
            href={`/reservations/${currentReservation.reservation_id}/edit`}
            className="btn btn-sm btn-outline-info"
          >
            Edit
          </a>
          <button
            data-reservation-id-cancel={currentReservation.reservation_id}
            onClick={cancelHandler}
            className="btn btn-outline-danger btn-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReservationInfo;
