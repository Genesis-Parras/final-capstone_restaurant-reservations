const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const theProperties = require("../errors/theProperties");
const validProperties = require("../errors/validProperties");

// SET UP FOR VALIDATION
const required_properties = [
  "first_name",
  "last_name",
  "people",
  "mobile_number",
  "reservation_date",
  "reservation_time",
];
const valid_properties = [
  "first_name",
  "last_name",
  "people",
  "status",
  "mobile_number",
  "reservation_date",
  "reservation_time",
];
const update_required_properties = [
  "first_name",
  "last_name",
  "people",
  "mobile_number",
  "reservation_date",
  "reservation_time",
];
const update_valid_properties = [
  "reservation_id",
  "status",
  "created_at",
  "updated_at",
  "first_name",
  "last_name",
  "people",
  "mobile_number",
  "reservation_date",
  "reservation_time",
];

const validProps = validProperties(valid_properties);
const requiredProperties = theProperties(required_properties);
const validUpdateProperties = validProperties(
  update_valid_properties
);
const requiredUpdateProperties = theProperties(update_required_properties);
const hasStatus = validProperties(["status"]);
const requiredStatus = theProperties(["status"]);

/**
 * 
 *  Middleware fn()'s
 * 
 */
async function reservationExists(req, res, next) {
  const { reservationId } = req.params;
  const reservation = await service.read(reservationId);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation: ${reservationId} cannot be found.`,
  });
}


function reservationIdValidation(req, res, next) {
  const { reservationId } = req.params;
  const { reservation_id } = res.locals.reservation;
  if (!reservation_id || Number(reservation_id) === Number(reservationId)) {
    return next();
  }
  next({
    status: 400,
    message: `reservation_id: '${reservation_id}' should be blank or match url '${reservationId}'.`,
  });
}

function dateValidation(req, res, next) {
  const date = req.body.data.reservation_date;
  const valid = Date.parse(date);
  if (valid) {
    return next();
  }
  next({
    status: 400,
    message: `reservation_date: '${date}' is not a valid date.`,
  });
}

function timeValidation(req, res, next) {
  const regex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  const time = req.body.data.reservation_time;
  const valid = time.match(regex);
  if (valid) {
    return next();
  }
  next({
    status: 400,
    message: `reservation_time: '${time}' is not a valid time.`,
  });
}

function peopleValidation(req, res, next) {
  const people = req.body.data.people;
  const valid = Number.isInteger(people);
  if (valid && people > 0) {
    return next();
  }
  next({
    status: 400,
    message: `people: '${people}' is not a valid integer.`,
  });
}

function statusValidation(req, res, next) {
  const { status } = req.body.data;
  if (
    status === "booked" ||
    status === "seated" ||
    status === "finished" ||
    status === "cancelled"
  ) {
    return next();
  }
  next({
    status: 400,
    message: `status: '${status}' should be: 'booked', 'seated', or 'finished'.`,
  });
}

function bookedStatus(req, res, next) {
  const { status } = res.locals.reservation;
  if (status === "booked") {
    return next();
  }
  next({
    status: 400,
    message: `status should be "booked", not '${status}'.`,
  });
}

function bookedStatusExist(req, res, next) {
  const { status } = req.body.data;
  if (!status || status === "booked") {
    return next();
  }
  next({
    status: 400,
    message: `status should be "booked" or absent, not '${status}'`,
  });
}

function finishedStatus(req, res, next) {
  const { status } = res.locals.reservation;
  if (status === "finished") {
    return next({
      status: 400,
      message: `Reservation status is already 'finished'. They are long gone now, cannot update.`,
    });
  }
  next();
}

function tuesdaysValidation(req, res, next) {
  const reservation_date = req.body.data.reservation_date;
  const weekday = new Date(reservation_date).getUTCDay();
  if (weekday !== 2) {
    return next();
  }
  next({
    status: 400,
    message: `So we heard the club is going up ... on a Tuesday! Therefore, we shall be there instead. Please choose another reservation date...just not on Tuesday's we are closed. ;)`,
  });
}

function pastReservationValidation(req, res, next) {
  const { reservation_date, reservation_time } = req.body.data;
  const presentDate = Date.now();
  const newReservationDate = new Date(`${reservation_date} ${reservation_time}`).valueOf();
  if (newReservationDate > presentDate) {
    return next();
  }
  next({
    status: 400,
    message: `Woah are you a time traveler? Looks like that reservation date is in the past. Please choose a future date.`,
  });
}

function businessHourValidation(req, res, next) {
  const reservation_time = req.body.data.reservation_time;
  const hours = Number(reservation_time.slice(0, 2));
  const minutes = Number(reservation_time.slice(3, 5));
  const clockTime = hours * 100 + minutes;
  if (clockTime < 1030 || clockTime > 2130) {
    next({
      status: 400,
      message: `We love the enthusiasm but your Reservation time: '${reservation_time}' must be between 10:30 AM and 9:30 PM.`,
    });
  }
  next();
}
  

/**
 * 
 *  CRUD fn()'s
 * 
 */

async function create(req, res) {
  const newReservation = { ...req.body.data, status: "booked" };
  const data = await service.create(newReservation);
  res.status(201).json({ data });
}

function read(req, res) {
  const data = res.locals.reservation;
  res.json({ data });
}

async function update(req, res) {
  const updatedReservation = { ...req.body.data };
  const { reservationId } = req.params;
  const data = await service.update(reservationId, updatedReservation);
  res.status(200).json({ data });
}

async function updateStatus(req, res) {
  const { status } = req.body.data;
  const { reservationId } = req.params;
  const data = await service.updateStatus(reservationId, status);
  res.status(200).json({ data });
}

async function list(req, res) {
  const { date, viewDate, mobile_number } = req.query;
  if (date) {
    const data = await service.listByDate(date);
    res.json({ data });
  } else if (viewDate) {
    const data = await service.listByDate(viewDate);
    res.json({ data });
  } else if (mobile_number) {
    const data = await service.listByPhone(mobile_number);
    res.json({ data });
  } else {
    const data = await service.list();
    res.json({ data });
  }
}

module.exports = {
  create: [
    validProps,
    requiredProperties,
    dateValidation,
    timeValidation,
    peopleValidation,
    bookedStatusExist,
    tuesdaysValidation,
    pastReservationValidation,
    businessHourValidation,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExists), read],
  update: [
    asyncErrorBoundary(reservationExists),
    reservationIdValidation,
    validUpdateProperties,
    requiredUpdateProperties,
    dateValidation,
    timeValidation,
    peopleValidation,
    bookedStatus,
    tuesdaysValidation,
    pastReservationValidation,
    businessHourValidation,
    asyncErrorBoundary(update),
  ],
  updateStatus: [
    asyncErrorBoundary(reservationExists),
    hasStatus,
    requiredStatus,
    statusValidation,
    finishedStatus,
    asyncErrorBoundary(updateStatus),
  ],
  list: asyncErrorBoundary(list),
};