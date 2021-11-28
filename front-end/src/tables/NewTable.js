import { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function NewTable() {
    const history = useHistory();
    const [table_name, setTable_name] = useState("");
    const [capacity, setCapacity] = useState("");
    const [error, setError] = useState(null);

    const submitHandler = (event) => {
        event.preventDefault();
        setError(null);
        const table = {
            table_name,
            capacity,
        };
        createTable(table)
        .then(() => {
            history.push("/dashboard");
        })
        .catch(setError);
    }

    const cancelHandler = (event) => {
        event.preventDefault();
        history.goBack();
    }

    return (
        <div>
            <ErrorAlert error={error} />

            <h3 className="d-flex m-3 justify-content-center">New Table Form</h3>

            <div className="d-flex justify-content-center">
                <form className="form-group" onSubmit={submitHandler}>
                    <label>Table Name:</label>
                    <br />
                        <input 
                        name="table_name"
                        type="text"
                        required
                        onChange={(e) => setTable_name(e.target.value)}
                        value={table_name}
                        className="form-control"
                        />
                    <br />
                    <label>Table Capacity:</label>
                    <br />
                        <input 
                        name="capacity"
                        type="number"
                        required
                        onChange={(e) => setCapacity(e.target.valueAsNumber)}
                        value={capacity}
                        className="form-control"
                        />
                    <br />

                    <div className="d-flex justify-content-around">
                        <button className="btn btn-outline-primary" type="submit">submit</button>
                        <button className="btn btn-outline-danger" onClick={cancelHandler}>cancel</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default NewTable;