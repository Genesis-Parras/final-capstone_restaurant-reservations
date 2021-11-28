import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { listTables, updateSeatReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";


function SeatReservation() {
    const history = useHistory();
    const params = useParams();

    const [tables, setTables] = useState([]);
    const [formValue, setFormValue] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        const abortController = new AbortController();
        setError(null);
        listTables()
        .then(setTables)
        .catch(setError);
        return () => abortController.abort();
    }, []);

    const submitHandler = (event) => {
        event.preventDefault();
        setError(null);
        const tableObj = JSON.parse(formValue);
        updateSeatReservation(tableObj.table_id, params.reservation_id)
        .then((response) => {
            const newTables = tables.map((table) => {
                return table.table_id === response.table_id ? response : table
            })
            setTables(newTables);
            history.push(`/dashboard`);
        })
        .catch(setError);
    }

    const cancelHandler = (event) => {
        event.preventDefault();
        history.goBack();
    }

    if (tables) {
        return (
            <div>
                <ErrorAlert error={error} />

                <h3 className="d-flex m-3 justify-content-center">Seat Reservation: {params.reservation_id}</h3>

                <div className="d-flex justify-content-center">
                    <form className="form-group" onSubmit={submitHandler} >
                        <label>Table Number - Capacity:</label>
                        <br />
                        <select className="form-control" name="table_id" onChange={(event) => setFormValue(event.target.value)}>
                            <option value="">---Choose Table---</option>
                                {tables && tables.map((table) => (
                                    <option key={table.table_id}
                                        value={JSON.stringify(table)}
                                        required
                                        >
                                    {table.table_name} - {table.capacity}
                                </option>
                            ))}
                        </select>
                        <br />
                        <div className="d-flex justify-content-around">
                            <button className="btn btn-outline-primary" type="submit">submit</button>
                            <button className="btn btn-outline-danger" onClick={cancelHandler}>cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        )
    } else {
        return (
            <div>Loading...</div>
        )
    }
}

export default SeatReservation;