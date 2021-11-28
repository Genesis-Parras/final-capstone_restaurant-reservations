function validProperties(valid_properties) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      const invalidFields = Object.keys(data).filter(
        (field) => !valid_properties.includes(field)
      );
  
      if (invalidFields.length) {
        return next({
          status: 400,
          message: `Invalid field(s): ${invalidFields.join(", ")}.`,
        });
      }
      next();
    };
}
  
module.exports = validProperties;