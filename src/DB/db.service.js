export const findOne = async ({ model, filter = {}, select = "", deleted = false }) => {
  return await model
    .findOne({
      ...filter,
      ...(!deleted ? { deletedAt: { $exists: false }, deletedBy: { $exists: false } } : {}),
    })
    .select(select);
};

export const find = async ({ model, filter = {}, select = "" }) => {
  return await model.find(filter).select(select);
};

export const findById = async ({ model, filter = "", select = "" }) => {
  return await model.findById(filter).select(select);
};

export const findByIdAndDelete = async ({ model, Id = "" }) => {
  return await model.findByIdAndDelete(Id);
};

export const create = async ({ model, data = [{}], options = {} }) => {
  return await model.create(data, options);
};

export const updateOne = async ({ model, filter, data = {}, options = {} }) => {
  return await model.updateOne(
    filter,
    {
      ...data,
      $inc: {
        __v: 1,
      },
    },
    options
  );
};

export const findOneAndUpdate = async ({ model, filter, data = {}, options = { new: true }, deleted = false }) => {
  return await model.findOneAndUpdate(
    {
      ...filter,
      ...(!deleted ? { deletedAt: { $exists: false }, deletedBy: { $exists: false } } : {}),
    },
    {
      ...data,
      $inc: {
        __v: 1,
      },
    },
    options
  );
};

export const findOneAndDelete = async ({ model, filter, deleted = false } = {}) => {
  return await model.findOneAndDelete(
    {
      ...filter,
      ...(!deleted ? { deletedAt: { $exists: false }, deletedBy: { $exists: false } } : {}),
    },
    { new: true }
  );
};
