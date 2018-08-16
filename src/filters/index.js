import Vue from 'vue'
import GlobalFilters from './global-filters.js'

// Global Filters
for (var key in GlobalFilters) {
  if (GlobalFilters.hasOwnProperty(key)) {
    Vue.filter(key, GlobalFilters[key]);
  }
}