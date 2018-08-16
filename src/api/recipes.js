import {
  axios,
  cookies,
  axiosHelper
} from './api-config.js'

const baseUrl = process.env.baseUrl;
const instance = function(cId) {
  return axiosHelper.createAxios({
    // baseURL: baseUrl + '/api-gateway/' + cId + '/process-recipe-api/api/v1',
    baseURL: baseUrl + '/',
    timeout: 30000
  });
}

export default {
  getAllRecipes(customerId, data) {
    let url = 'recipes/' + data;
    return instance(customerId).get(url, data);
  },
  getRecipeById(customerId, params) {
    let url = 'recipes/' + params + "/";
    return instance(customerId).get(url);
  },
  getAllProcessTypes(customerId) {
    let url = 'recipes/types';
    // return instance(customerId).get(url);
    return new Promise((res, rej) => {
      res({
        data: [{"processType":"PRIVATE"},{"processType":"PUBLIC"}]
      });
    });
  },
  filterProcessType(customerId, params) {
    let url = 'recipes';
    return instance(customerId).get(url, params);
  },
  saveRecipes(customerId, data) {
    let url = 'recipes';
    return instance(customerId).post(url, data);
  },
  deleteRecipeById(customerId, params) {
    let url = 'recipes/' + params;
    return instance(customerId).delete(url);
  },
  updateRecipeById(customerId, params, data) {
    let url = 'recipes/' + params;
    return instance(customerId).post(url, data);
  },
  updateRecipeThoughWhiteBoard(customerId, params, data) {
    let url = 'recipes/' + params;
    return instance(customerId).put(url, data);
  },
  saveRecipesOnWhiteBoard(customerId, data) {
    let url = 'recipes/whiteboard';
    return instance(customerId).post(url, data);
  },
  getAllRecipesByProcessId(customerId, params) {
    let url = 'recipes/process/' + params;
    return instance(customerId).get(url);
  },
  exportRecipe(customerId, rid) {
    let url = 'recipes/export/' + rid;
    return instance(customerId).get(url);
  },
  importRecipe(customerId,processId,recipeName,data) {
    let url = 'recipes/import/'+processId+'?recipeName='+recipeName;
    return instance(customerId).post(url,data);
  },

}
