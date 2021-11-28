const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const theProperties = require("../errors/theProperties");
const validProperties = require("../errors/validProperties");
const { as } = require("../db/connection");

// SET UP FOR VALIDATION
const required_properties = ["table_name", "capacity"];
const valid_properties = ["table_name", "capacity", "reservation_id", "people"];

const validPropertiesToCreate = validProperties(valid_properties);
const requiredPropertiesToCreate = theProperties(required_properties);

const validPropertiesToSeat = validProperties(["reservation_id"]);
const requiredPropertiesToSeat = theProperties(["reservation_id"]);

/**
 *
 *  Middleware fn()'s
 *
 */

function nameValidation(req, res, next) {
  const { table_name } = req.body.data;
  if (table_name.length >= 2) {
    return next();
  }
  next({
    status: 400,
    message: `table_name: '${table_name}' must be at least 2 characters.`,
  });
}

function capacityValidation(req, res, next) {
  const capacity = req.body.data.capacity;
  if (capacity > 0 && Number.isInteger(capacity)) {
    return next();
  }
  next({
    status: 400,
    message: `capacity: '${capacity}' must be at least 1.`,
  });
}

async function tableExists(req, res, next) {
  const { tableId } = req.params;
  const table = await service.read(tableId);
  if (table) {
    res.locals.table = table;
    return next();
  }
  next({
    status: 404,
    message: `table: '${tableId}' does not exist.`,
  });
}

function tableVacant(req, res, next) {
  const table = res.locals.table;
  if (!table.reservation_id) {
    return next();
  }
  next({
    status: 400,
    message: `table: '${table.table_id}' is occupied by reservation: '${table.reservation_id}'.`,
  });
}

function tableOccupied(req, res, next) {
  const table = res.locals.table;
  if (table.reservation_id) {
    return next();
  }
  next({
    status: 400,
    message: `table: '${table.table_id}' is not occupied.`,
  });
}

async function reservationSeated(req, res, next) {
  const { reservation_id } = req.body.data;
  const seated = await service.readTable(reservation_id);
  if (!seated) {
    return next();
  }
  next({
    status: 400,
    message: `reservation: '${reservation_id}' already seated at table: '${seated.table_id}'.`,
  });
}

async function reservationExists(req, res, next) {
  const { reservation_id } = req.body.data;
  const reservation = await service.readReservation(reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `reservation ${reservation_id} does not exist.`,
  });
}

async function capacitySizeValidation(req, res, next) {
  const { reservation, table } = res.locals;
  if (table.capacity >= reservation.people) {
    return next();
  }
  next({
    status: 400,
    message: `table capacity: '${table.capacity}' is is not big enough for party size of '${reservation.people}'.`,
  });
}

async function tablesExistsToDelete(req, res, next) {
  const {
    data: { table_id },
  } = req.body;
  const table = await service.read(table_id);
  if (table) {
    res.locals.table = table;
    return next();
  }
  next({
    status: 400,
    message: `table: '${table_id}' cannot be found.`,
  });
}

/**
 *
 *  CRUD fn()'s
 *
 */

async function list(req, res) {
  const data = await service.list();
  res.json({ data });
}

async function create(req, res) {
  const table = req.body.data;
  const data = await service.create(table);
  res.status(201).json({ data });
}

function read(req, res) {
  const data = res.locals.table;
  res.json({ data });
}

async function updateSeat(req, res) {
  const { reservation_id } = req.body.data;
  const table_id = req.params.tableId;
  const data = await service.updateSeat(reservation_id, table_id);
  res.json({ data });
}

async function deleteSeat(req, res) {
  const { table_id, reservation_id } = res.locals.table;
  const data = await service.deleteSeat(table_id, reservation_id);
  res.status(200).json({ data });
}

async function deleteTable(req, res) {
  const { table_id } = res.locals.table;
  await service.deleteTable(table_id);
  res.status(200);
}

module.exports = {
  create: [
    validPropertiesToCreate,
    requiredPropertiesToCreate,
    nameValidation,
    capacityValidation,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(tableExists), read],
  updateSeat: [
    requiredPropertiesToSeat,
    validPropertiesToSeat,
    asyncErrorBoundary(tableExists),
    tableVacant,
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(capacitySizeValidation),
    asyncErrorBoundary(reservationSeated),
    asyncErrorBoundary(updateSeat),
  ],
  deleteSeat: [
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(tableOccupied),
    asyncErrorBoundary(deleteSeat),
  ],
  list: asyncErrorBoundary(list),
  deleteTable: [
    asyncErrorBoundary(tablesExistsToDelete),
    asyncErrorBoundary(deleteTable),
  ],
};
