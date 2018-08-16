import { axios, axiosHelper } from './api-config.js'

import MockData from './mock-data/onboarding.js'

let baseUrl = process.env.baseUrl;
// let baseUrl = 'http://ec4t01933.itcs.entsvcs.net';


let urlPrefix = function(customerId) {
  return `/api-gateway/${customerId}`;
}

export default {
  createNewDataPackage(customerId, processId) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
        timeout: 30000
      });
      let url = '/dataPackage/' + processId;
      return instance.post(url);
    },
    getAllDataPackage(customerId, processId) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
        timeout: 30000
      });
      let url = '/dataPackage/' + processId;
      return instance.get(url);
    },
    getSingleDataPackage(packageId, processId) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
        timeout: 30000
      });
      let url = '/dataPackage/' + processId + '/' + packageId;
      return instance.get(url);
    },
    notyUploadDataPackage(customerId, processId, packageId) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
        timeout: 30000
      });
      let url = '/dataPackage/' + processId + '/' + packageId;
      return instance.put(url);
    },
    uploadDataPackage(customerId, processId, packageId, data, config) {
      let instanceForUpload = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
        timeout: 30 * 60 * 1000
      });
      let url = '/dataPackage/' + processId + '/' + packageId;
      return instanceForUpload.post(url, data, config);
    },
    updateDataPackage(customerId, processId, packageId, changeData) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
        timeout: 30 * 60 * 1000
      });
      let url = '/dataPackage/' + processId + '/' + packageId;
      return instance.put(url, changeData);
    },
    deleteDataPackage(customerId, processId, packageId) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
        timeout: 30000
      });
      let url = '/dataPackage/' + processId + '/' + packageId;
      return instance.delete(url);
    },
    downloadSingleFile(customerId, fileId) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
        timeout: 30 * 60 * 1000
      });
      let url = '/dataPackage/file/' + fileId;
      return instance.get(url);
    },
    // upload
    // getHistoricalUploadedFiles(customerId, processId) {
    //   let instance = axiosHelper.createAxios({
    //     baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
    //     timeout: 30000
    //   });
    //   let url = '/eventFile/' + processId;
    //   return instance.get(url);
    // },
    // uploadEventFile(customerId, processId, data, config) {
    //   let instance = axiosHelper.createAxios({
    //     baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
    //     timeout: 30000
    //   });
    //   let url = '/eventFile/' + processId;
    //   return instance.post(url, data, config);
    // },
    // downloadHistoricalUploadedFiles(customerId, processId, id) {
    //   let instance = axiosHelper.createAxios({
    //     baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
    //     timeout: 30000
    //   });
    //   let url = '/eventFile/' + processId + '/' + id;
    //   return instance.get(url);
    // },

    // new API for upload
    getHistoricalUploadedFiles(customerId, processId) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/file-service/api/v1',
        timeout: 30000
      });
      let url = 'eventlog_audit/process_info/process_id/' + processId + '/files';
      return instance.get(url);
    },
    uploadEventFile(customerId, processId, fileName, data, config) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/file-service/api/v1',
        timeout: 30 * 60 * 1000
      });
      let url = 'eventlog_audit/process_id/' + processId + '/eventlog/' + fileName;
      return instance.post(url, data, config);
    },
    downloadHistoricalUploadedFile(customerId, processId, fileId, fileName) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/file-service/api/v1',
        timeout: 30 * 60 * 1000
      });
      let url = 'eventlog_audit/process_id/' + processId + '/eventlog/' + fileId + '_' + fileName;
      return instance.get(url);
    },

    getDashboardSetupData(customerId, processId) {
      return new Promise((resolve, reject) => {
        resolve({
          data: MockData.getDashboardSetupData
        });
      });
    },

    getDashboardSetupData(customerId, processId) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
        timeout: 30000
      });
      let url = '/dashboard_config/' + processId + '/fields';
      return instance.get(url);
    },

    //get processLevel config
    getSystemLevelConfig(customerId, processId) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
        timeout: 30000
      });
      let url = '/dashboard_config/processLevel/' + processId;
      return instance.get(url);
    },
    getLatestDashboardConfig(customerId, processId) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
        timeout: 30000
      });
      let url = '/dashboard_config/' + processId;
      return instance.get(url);
    },

    //get userLevel config
    getPersonalLevelConfig(customerId, processId) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
        timeout: 30000
      });
      let url = '/dashboard_config/userLevel/' + processId;
      return instance.get(url);
    },

    //get available personalized dashborad level config
    getAvailableLevelConfig(customerId, processId) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
        timeout: 30000
      });
      let url = '/dashboard_config/' + processId + '/availableDashboardConfigs';
      return instance.get(url);
    },

    //----------------------------------  
    // updating existing dashboard configuration
    updateDashboardConfiguration(customerId, params) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
        timeout: 30000
      });
      let url = '/dashboard_config';
      return instance.put(url, params /*{ params}*/ );
    },
    // set last selected type of dashboard 
    updateDashboardConfigType(customerId, processId, dashboardType) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
        timeout: 30000
      });
      let url = 'dashboard_config/' + processId + '/type/' + dashboardType;
      return instance.put(url);
    },
    // set last selected type of dashboard 
    setDashboardConfig(customerId, processId, dashboardType) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
        timeout: 30000
      });
      let url = 'dashboard_config/' + processId + '/type/' + dashboardType;
      return instance.put(url);
    },
    // create a new dashboard configuration 
    createDashboardConfiguration(customerId, params) {
      console.log(params)
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
        timeout: 30000
      });
      let url = '/dashboard_config';
      return instance.post(url, params /*{ params}*/ );
    },
    //Liao Fang: Mapping api
    uploadMappingFile(customerId, data) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
        timeout: 30 * 60 * 1000
      });
      let url = '/process/upload'
      return instance.post(url, data)
    },
    submitMappingForm(customerId, processId, data) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
        timeout: 30000
      });
      let url = '/process/config/' + processId
      return instance.post(url, data)
    },
    forceSubmitMappingForm(customerId, processId, data) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
        timeout: 30000
      });
      let url = '/process/config/' + processId + '/save'
      return instance.post(url, data)
    },
    getMappingStatus(customerId, processId) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
        timeout: 30000
      });
      let url = '/process/config/' + processId
      return instance.get(url)
    },
    // liting add
    getPayloadData(customerId, processId) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api/api/v1',
        timeout: 30000
      });
      let url = '/process/dataMap/' + processId
      return instance.get(url)
    },
    updateMappingData(customerId, processId, data) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/raas_agent_api/api/v1',
        timeout: 30000
      });
      let url = '/processes/run'
      return instance.post(url, data)
    },
    updateScriptData(customerId, processId, data){
       let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/raas_agent_api/api/v1',
        timeout: 30000
        });
        let url = '/scheduler/script/run'
        return instance.post(url, data)
    },
    updateProcessData(customerId, processId, data){
       let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/raas_agent_api/api/v1',
        timeout: 30000
      });
      let url = '/scheduler/process/run'
      return instance.post(url, data)
    },
    getScriptData(customerId, processId) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + urlPrefix(customerId) + '/raas_agent_api/api/v1',
        timeout: 30000
      });
      let url = '/processes/' + processId
      return instance.get(url)
    },
    //17 April 2018: adib.ghazali@dxc.com - Dynamic Filter - Attribute (New data model)
    getAllAttributes(customerId, processId) {
      let instance = axiosHelper.createAxios({
        baseURL: baseUrl + '/process_mining/process_definition',
        timeout: 30000
      });
      let url = `/${processId}/fields`;
      return instance.get(url);
    }
}
