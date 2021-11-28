import { useHistory } from "react-router-dom";

function ReservationForm({ handleSubmit, formData, setFormData }) {
    const history = useHistory();
    
    const cancelHandler = (event) => {
        event.preventDefault();
        history.goBack();
    }

    return (
        <div className="d-flex justify-content-center">
        <form className="form-group" onSubmit={handleSubmit} >
            <label className="form-label">First Name:</label>
            <br />
                <input
                name="first_name"
                type="text"
                required
                onChange={(event) => setFormData({
                    first_name: event.target.value,
                    last_name: formData.last_name,
                    mobile_number: formData.mobile_number,
                    reservation_date: formData.reservation_date,
                    reservation_time: formData.reservation_time,
                    people: formData.people,
                })}
                value={formData.first_name}
                className="form-control"
                />
            <br />
            <label className="form-label">Last Name:</label>
            <br />
                <input
                name="last_name"
                type="text"
                required
                onChange={(event) => setFormData({
                    first_name: formData.first_name,
                    last_name: event.target.value,
                    mobile_number: formData.mobile_number,
                    reservation_date: formData.reservation_date,
                    reservation_time: formData.reservation_time,
                    people: formData.people,
                })}
                value={formData.last_name}
                className="form-control"
                />
            <br />
            <label className="form-label">Mobile #:</label>
            <br />
                <input
                name="mobile_number"
                type="text"
                required
                onChange={(event) => setFormData({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    mobile_number: event.target.value,
                    reservation_date: formData.reservation_date,
                    reservation_time: formData.reservation_time,
                    people: formData.people,
                })}
                value={formData.mobile_number}
                className="form-control"
                />
            <br />
            <label>Reservation Date:</label>
            <br />
                <input
                name="reservation_date"
                type="date"
                required
                onChange={(event) => setFormData({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    mobile_number: formData.mobile_number,
                    reservation_date: event.target.value,
                    reservation_time: formData.reservation_time,
                    people: formData.people,
                })}
                value={formData.reservation_date}
                className="form-control"
                />
            <br />
            <label>Reservation Time:</label>
            <br />
                <input
                name="reservation_time"
                type="time"
                required
                onChange={(event) => setFormData({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    mobile_number: formData.mobile_number,
                    reservation_date: formData.reservation_date,
                    reservation_time: event.target.value,
                    people: formData.people,
                })}
                value={formData.reservation_time}
                className="form-control"
                />
            <br />
            <label>Amount of People:</label>
            <br />
                <input
                name="people"
                type="number"
                required
                onChange={(event) => setFormData({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    mobile_number: formData.mobile_number,
                    reservation_date: formData.reservation_date,
                    reservation_time: formData.reservation_time,
                    people: event.target.valueAsNumber,
                })}
                value={formData.people}
                className="form-control"
                />
            <br />

            <div className="d-flex justify-content-around">
                <button className="btn btn-outline-primary" type="submit">submit</button>
                <button className="btn btn-outline-danger" onClick={cancelHandler}>cancel</button>
            </div>
        </form>
        </div>
    )
}

export default ReservationForm;