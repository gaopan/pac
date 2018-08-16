import {
  axios,
  cookies,
  axiosHelper
} from './api-config.js'


let baseUrl = process.env.baseUrl;

let instance = axiosHelper.createAxios({
  baseURL: (baseUrl + '/'),
  timeout: 30000
});

export default {
  login(data) {
    let url = baseUrl + '/login',
      form = new FormData();
    form.set('email', data.email);
    form.set('password', data.password);
    return axios({
      method: 'post',
      url: url,
      data: form,
      config: { headers: { 'Content-Type': 'multipart/form-data' } }
    });
    // let url = baseUrl + '/login';
    // return instance.post(url, {
    //   email: data.email,
    //   password: data.password
    // });
  },
  logout(auth) {
    let url = 'logout';
    return instance.get(url, {
      headers: {
        "Authorization": auth
      }
    });
  }
}
