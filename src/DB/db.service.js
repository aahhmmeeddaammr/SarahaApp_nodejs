export const findOne = async ({ model, filter = {}, select = "" }) => {
  return await model.findOne(filter).select(select);
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
  return await model.updateOne(filter, data, options);
};
