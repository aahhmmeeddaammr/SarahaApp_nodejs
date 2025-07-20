export const findOne = async ({ model, filter = {}, select = "" }) => {
  return await model.findOne(filter).select(select);
};

export const findById = async ({ model, filter = "", select = "" }) => {
  return await model.findById(filter).select(select);
};

export const create = async ({ model, data = [{}], options = {} }) => {
  return await model.create(data, options);
};
