//form field to add a new reservation
//submit button that saves and displays the dashboard page for new reservation
//cancel button that returns to previous page
//display error messages
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import { createReservation } from "../utils/api";
import ReservationForm from "./ReservationForm";

function NewReservation(){
const history = useHistory();
const initialFormState={
    first_name:"",
    last_name:"",
    mobile_number:"",
    reservation_date:"",
    reservation_time:"",
    people:"",
}
const [formData, setFormData] = useState(initialFormState);
const [error, setError] = useState(null);

const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    const reservation = {
        ...formData,
        status: "booked",
    };
    createReservation(reservation)
    .then(() => {
        history.push(`/dashboard?date=${formData.reservation_date}`);
    })
    .catch(setError);
}

return (
    <div>
        <ErrorAlert error={error} />
        <h3 className="d-flex m-3 justify-content-center">New Reservation Form</h3>

        <div>
            <ReservationForm 
                formData={formData} 
                setFormData={setFormData} 
                handleSubmit={handleSubmit} 
            />
        </div>
    </div>
);

};

export default NewReservation;
