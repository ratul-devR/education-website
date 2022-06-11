module.exports =
  ({ fields, property }) =>
  (req, res, next) => {
    const missingFields = [];

    fields.map((field) => {
      if (!req[property][field]) {
        missingFields.push(field);
      }
      return field;
    });

    if (!missingFields.length) next();
    else {
      res
        .status(403)
        .json({ msg: `You are missing some fields in 'request.${property}'`, missingFields });
    }
  };
