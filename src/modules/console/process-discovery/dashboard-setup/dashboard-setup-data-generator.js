/*
{
  groupBy: 'vendor', // the data field for grouping, should not be null
  sortBy: 'ASC', // used to indicate the order sequence, can be 'ASC' or 'DESC', can be null, default is 'ASC'
  orderBy: 'SUM', // used to indicate the order by, can be "NAME"(Default), "COUNT", "MAX", "MIN", "AVERAGE", "MEDIAN", "SUM", 
  pageSize: 20, // used for the pagination, page size
  pageIndex: 2, // used for the pagination, page index, from 0
  pipes: [{ // pipes for the output, can be an array with length bigger than 0, empty or null
    method: 'SUM', // indicates the method of statics, can be 'SUM', 'AVERAGE', 'MAX', 'MIN', 'COUNT', 'MEDIAN' or null, default is 'COUNT'
    dataField: null // indicates the data field for the statics, can be null, it means we will only need to get the total count
  }]
}
Case Distribution on vendor: {groupBy: 'vendor'}
Comparison on vendor: {groupBy: 'vendor', sortBy: 'DESC', pipes: [{method: 'SUM', dataField: null},{method: 'AVERAGE',dataField: null}]}
Gross Amount on Currency: {groupBy: 'currencyCode', sortBy: 'DESC', pipes: [{method: 'SUM', dataField: 'grossAmount'}]}
*/
import TypeChecker from '@/utils/type-checker.js'
import CommonUtils from '@/utils/common-utils.js'
import ProcessMiningApi from '@/api/process-mining.js'

function ChannelPipe() {
  this._sDataField = null;
  this._sMethod = null;
}

ChannelPipe.validate = function(obj) {
  if (!TypeChecker.isObject(obj)) {
    return false;
  }
  if (!TypeChecker.isString(obj.method)) {
    return false;
  }
  return true;
};
ChannelPipe.newInstance = function(obj) {
  return new ChannelPipe().method(obj.method).dataField(obj.dataField);
};

// The statics method: 'SUM', 'AVERAGE', 'MAXIMUM', 'MINIMUM', 'COUNT', 'MEDIAN'
ChannelPipe.prototype.method = function(m) {
  let availableMethods = ['SUM', 'AVERAGE', 'MAXIMUM', 'MINIMUM', 'COUNT', 'MEDIAN'];
  if (TypeChecker.isString(m) && availableMethods.indexOf(m) > -1) {
    this._sMethod = m;
  }
  return this;
};

// The data field for the result of statics
ChannelPipe.prototype.dataField = function(df) {
  if (TypeChecker.isString(df) && df.length > 0) {
    this._sDataField = df;
  }
  return this;
};

// based on the configuration: 1. attribute, 2. {type,dataField,groupBy}
function Channel() {
  this._sId = null;
  this._sKey = null;
  this._fnObtain = null;
  this._aPipes = [];
  this._sGroupBy = null;
  this._sSortBy = 'ASC';
  this._sOrderBy = 'NAME';
  this._nPageSize = null;
  this._nPageIndex = null;
  this._fnOnError = null;
}

Channel.validate = function(obj) {
  if (!TypeChecker.isObject(obj)) {
    return false;
  }

  if (!TypeChecker.isFunction(obj.obtain)) {
    return false;
  }
  return true;
};

Channel.newInstance = function(obj) {
  //add pageIndex and pageSize item hong-yu.chen@hpe
  let instance = new Channel().groupBy(obj.groupBy).sortBy(obj.sortBy).orderBy(obj.orderBy).pageSize(obj.pageSize).pageIndex(obj.pageIndex).obtain(obj.obtain).id(obj.id).key(obj.key).error(obj.error);
  if (TypeChecker.isArray(obj.pipes) && obj.pipes.length > 0) {
    obj.pipes.forEach(p => {
      instance.pipe(p);
    });
  } else {
    instance.pipe({
      method: 'COUNT',
      dataField: null
    });
  }
  return instance;
};

Channel.flush = function(obj, existedChannel) {
  existedChannel.groupBy(obj.groupBy).sortBy(obj.sortBy).obtain(obj.obtain).id(obj.id).key(obj.key).orderBy(obj.orderBy).pageSize(obj.pageSize).pageIndex(obj.pageIndex).error(obj.error);
  existedChannel._aPipes = [];
  if (TypeChecker.isArray(obj.pipes) && obj.pipes.length > 0) {
    obj.pipes.forEach(p => {
      existedChannel.pipe(p);
    });
  } else {
    existedChannel.pipe({
      method: 'COUNT',
      dataField: null
    });
  }
};

Channel.prototype.id = function(id) {
  if (TypeChecker.isString(id) && id.trim().length > 0) {
    this._sId = id;
  }
  return this;
};

Channel.prototype.key = function(key) {
  if (TypeChecker.isString(key) && key.trim().length > 0) {
    this._sKey = key;
  }
  return this;
};

// The function to aware the react result
Channel.prototype.obtain = function(fnObtain) {
  if (TypeChecker.isFunction(fnObtain)) {
    this._fnObtain = fnObtain;
  }
  return this;
};

// The data field for the group by of statics
Channel.prototype.groupBy = function(gb) {
  if (TypeChecker.isString(gb) && gb.length > 0) {
    this._sGroupBy = gb;
  }
  return this;
};

Channel.prototype.orderBy = function(ob){
  let availableMethods = ['NAME', 'SUM', 'AVERAGE', 'MAX', 'MIN', 'COUNT', 'MEDIAN'];
  if(TypeChecker.isString(ob) && availableMethods.indexOf(ob) > -1) {
    this._sOrderBy = ob;
  }
  return this;
};

// The static type of ordering: 'ASC' or 'DESC'
Channel.prototype.sortBy = function(sb) {
  if (TypeChecker.isString(sb) && sb.length > 0) {
    this._sSortBy = sb;
  }
  return this;
};

// The pageSize for pagination
Channel.prototype.pageSize = function(pageSize) {
  if (TypeChecker.isNumber(pageSize) && pageSize > 0) {
    this._nPageSize = pageSize;
  }
  return this;
};

// The pageIndex for pagination
Channel.prototype.pageIndex = function(pageIndex) {
  if (TypeChecker.isNumber(pageIndex) && pageIndex > -1) {
    this._nPageIndex = pageIndex;
  }
  return this;
};

// The bundle for the channel pipe
Channel.prototype.pipe = function(pipe) {
  if (ChannelPipe.validate(pipe)) {
    this._aPipes.push(new ChannelPipe().method(pipe.method).dataField(pipe.dataField));
  }
  return this;
};

// serialize the parameters
Channel.prototype.serialize = function() {
  let obj = {};
  for (let key in this) {
    if (this.hasOwnProperty(key)) {
      obj[key] = this[key];
    }
  }
  return CommonUtils.toString(obj);
};

Channel.prototype.error = function(error){
  this._fnOnError = error;
  return this;
};

function ReactorDataPool() {
  this._oDataSet = {};
}

ReactorDataPool.serializeKey = function(params, channel) {
  return CommonUtils.toString(params) + ';' + channel.serialize();
};

ReactorDataPool.prototype.request = function(params, channels, fnOnError) {
  let opts = [], methodMap = {
    'SUM': "sum",
    'AVERAGE': "average",
    'MAXIMUM': "max",
    'MINIMUM': "min",
    'COUNT': "count",
    'MEDIAN': "median"
  };
  channels.forEach(c => {
    let opt = {
      category: c._sKey,
      calculateMethods: c._aPipes.map(p => methodMap[p._sMethod]),
      groupBy: c._sGroupBy,
      pageSize: c._nPageSize || 20,
      pageIndex: c._nPageIndex || 0,
      sortBy: c._sSortBy.toLowerCase(),
      orderBy: c._sOrderBy === 'NAME' ? null : c._sOrderBy.toLowerCase()
    };
    var key = null;
    if(TypeChecker.isArray(c._aPipes)) {
      c._aPipes.forEach(p => {
        if(p._sDataField) {
          key = p._sDataField;
        }
      });
    }
    if(!key) {
      opt.key = c._sGroupBy;
    } else {
      opt.key = key;
    }
    opts.push(opt);
  });

  ProcessMiningApi.filterAnalysisDashboard(params.customerId, params.processAnalyticsId, {
    filter: params.filters,
    analysisConfig: opts
  }, params.rank, params.awareCancelFn).then(res => {
    let data = {};
    res.data.forEach(item => {
      data[item.category] = {
        total: item.total,
        list: item.list
      };
    });
    channels.forEach(c => {
      // cache the remote data
      this._oDataSet[ReactorDataPool.serializeKey(params, c)] = data[c._sKey];

      if (TypeChecker.isFunction(c._fnObtain)) {
        c._fnObtain.call(this, data[c._sKey]);
      }
    });
  }, err => {
    channels.forEach(c => {
      if(TypeChecker.isFunction(c._fnOnError)) {
        c._fnOnError.call(c, err);
      }
    });
    if (TypeChecker.isFunction(fnOnError)) {
      fnOnError.call(this, err);
    }
  });
};

ReactorDataPool.prototype.batchFetch = function(params, channels, fnOnError) {
   if(!TypeChecker.isArray(channels)) return;
   let channelsNotCached = []; 
   channels.forEach(c => {
    let key = ReactorDataPool.serializeKey(params, c);
    if(TypeChecker.isObject(this._oDataSet[key])) {
      if(TypeChecker.isFunction(c._fnObtain)) {
        c._fnObtain.call(this, this._oDataSet[key]);
      }
    } else {
      channelsNotCached.push(c);
    }
   });

   if(channelsNotCached.length > 0) {
    this.request(params, channelsNotCached, fnOnError);
   }
};

ReactorDataPool.prototype.fetch = function(params, channel, fnOnError) {
  let key = ReactorDataPool.serializeKey(params, channel);
  if (TypeChecker.isObject(this._oDataSet[key])) {
    if (TypeChecker.isFunction(channel._fnObtain)) {
      channel._fnObtain.call(this, this._oDataSet[key]);
    }
  } else {
    this.request(params, [channel], fnOnError);
  }
};

ReactorDataPool.prototype.clear = function(){
  this._oDataSet = {};
};

ReactorDataPool.prototype.destroy = function() {
  this._oDataSet = null;
};

function Reactor(dataPool) {
  this._oParams = null;
  this._aChannels = [];
  this._fnOnError = null;

  this._dataPool = dataPool;
}

// parameters
Reactor.prototype.params = function(params) {
  if (TypeChecker.isObject(params) && TypeChecker.isString(params.customerId) && TypeChecker.isString(params.processAnalyticsId)) {
    this._oParams = params;
  }
  return this;
};

// To new one channel
Reactor.prototype.shunt = function(obj) {
  if (Channel.validate(obj)) {
    this._aChannels.push(Channel.newInstance(obj));
  }
};

Reactor.prototype.error = function(fn) {
  if (TypeChecker.isFunction(fn)) {
    this._fnOnError = fn;
  }
  return this;
};

Reactor.prototype.fetch = function(obj){
  if (!Channel.validate(obj)) return;
  let existedChannel = null, theChannel = Channel.newInstance(obj);
  this._aChannels.every(c => {
    if (c._sId == obj.id) {
      existedChannel = c;
      return false;
    }
    return true;
  });
  if (!existedChannel) {
    this._aChannels.push(theChannel);
  } else {
    Channel.flush(obj, existedChannel);
    theChannel = existedChannel;
  }

  let params = this._oParams;

  this._dataPool.fetch(params, theChannel, this._fnOnError);
};

Reactor.prototype.batchFetch = function(objs){
  if(!TypeChecker.isArray(objs)) return;
  let existedChannels = [], valid = true;
  objs.every(obj => {
    if(!Channel.validate(obj)) {
      valid = false; return false;
    } 
    this._aChannels.every(c => {
      if(c._sId == obj.id) {
        Channel.flush(obj, c);
        existedChannels.push(c);
        return false;
      }
      return true;
    });
    return true;
  });

  if(!valid) {
    console.warn("Channel Configuration : " + CommonUtils.toString(objs) + "\b is invalid");
    return;
  }

  let params = this._oParams;

  this._dataPool.batchFetch(params, existedChannels, this._fnOnError);
};

// To flush one existed channel
Reactor.prototype.flush = function(obj) {
  if (!Channel.validate(obj)) return;
  let existedChannel = null;
  this._aChannels.every(c => {
    if (c._sId == obj.id) {
      existedChannel = c;
      return false;
    }
    return true;
  });
  if (!existedChannel) return;
  Channel.flush(obj, existedChannel);
  let params = this._oParams;
  
  this._dataPool.request(params, [existedChannel], this._fnOnError);
};

Reactor.prototype.batchFlush = function(objs){
  if(!TypeChecker.isArray(objs)) return;
  let existedChannels = [], valid = true;
  objs.every(obj => {
    if(!Channel.validate(obj)) {
      valid = false; return false;
    } 
    this._aChannels.every(c => {
      if(c._sId == obj.id) {
        existedChannels.push({
          obj: obj,
          channel: c
        });
        return false;
      }
      return true;
    });
    return true;
  });

  if(!valid) {
    console.warn("Channel Configuration : " + CommonUtils.toString(objs) + "\b is invalid");
    return;
  }

  existedChannels.forEach(m => {
    Channel.flush(m.obj, m.channel);
  });

  let params = this._oParams;
  
  this._dataPool.request(params, existedChannels, this._fnOnError);
};

// Lanch the reactor
Reactor.prototype.react = function() {
  if (this._aChannels.length > 0 && TypeChecker.isObject(this._oParams)) {
    let params = this._oParams;
    this._dataPool.batchFetch(this._oParams, this._aChannels, this._fnOnError);
  }
};

Reactor.prototype.destroy = function() {
  this._aChannels = [];
};

let generator = {};

generator.init = function() {
  generator.reactors = [];
  generator.reactorDataPool = new ReactorDataPool();
};

generator.generate = function() {
  if(!generator.reactors || generator.reactors.length == 0 || !generator.reactorDataPool) {
    generator.init();
  }
  let reactor = new Reactor(generator.reactorDataPool);
  generator.reactors.push(reactor);
  return reactor;
};

generator.destroy = function() {
  if (generator.reactorDataPool) {
    generator.reactorDataPool.destroy();
  }
  if (TypeChecker.isArray(generator.reactors)) {
    generator.reactors.forEach(g => {
      g.destroy();
    });
  }
  generator.reactors = null;
};

export default generator
