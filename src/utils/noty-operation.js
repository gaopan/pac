import Noty from 'noty'
import animation from "animate.css"
import TypeChecker from './type-checker.js'

let images = require.context('@/assets/', false, /\.(png|jpg)$/)

let wrapText = function(title, text, textClass,styleConfig){

  let apaNotyMainStyle = styleConfig && styleConfig["apa-noty-main-style"] ? styleConfig["apa-noty-main-style"] : "",
      apaNotyTitleStyle = styleConfig && styleConfig["apa-noty-title-style"] ? styleConfig["apa-noty-title-style"] : "",
      apaNotyBodyStyle = styleConfig && styleConfig["apa-noty-body-style"] ? styleConfig["apa-noty-body-style"] : "";

  return `<div style="${apaNotyMainStyle}" class="apa-noty-main ${textClass}">\
      <div style="${apaNotyTitleStyle}" class="apa-noty-title">${title}</div>\
      <div style="${apaNotyBodyStyle}" class="apa-noty-body">${text}</div>\
    </div>`;
}

export default {

  alertWithTwoButtons: function(config) {
    var title = config.title ? config.title : '';
    var text = config.text;
    var textClass = !config.notyModel ? '' : 'noty-danger';
    var type = config.type || 'alert';
    var animationOpen = !config.animationOpen ? 'animated bounceIn' : config.animationOpen;
    var animationClose = !config.animationClose ? 'animated bounceOut' : config.animationClose;
    var layout = !config.layout ? 'center' : config.layout;
    var timeout = !config.timeout ? null : config.timeout;
    var modal = config.modal == undefined ? true : config.modal;
    var buttononclickdefault = function($noty) { $noty.close(); }

    var button1class = !config.btn1class ? 'btn btn-secondary' : config.btn1class;
    var button1text = !config.btn1text ? 'Yes' : config.btn1text;
    var button1onclick = !config.btn1onclick ? buttononclickdefault : config.btn1onclick;

    var button2class = !config.button2class ? 'btn btn-primary' : config.button2class;
    var button2text = !config.btn2text ? 'No' : config.btn2text;
    var button2onclick = !config.btn2onclick ? buttononclickdefault : config.btn2onclick;

    var afterCloseCb = !config.afterCloseCb ? null : config.afterCloseCb;

    var bodyStyle = config.bodyStyle ? config.bodyStyle : undefined;

    noty({
      text: wrapText(title, text, textClass,bodyStyle),//default setting 
      type: type,//default setting 
      theme: 'metroui',
      animation: {
        open: animationOpen,
        close: animationClose
      },
      layout: layout,//center or layout
      modal: modal,//
      buttons: [{
        addClass: button1class,
        text: button1text,
        onClick: button1onclick
      }, {
        addClass: button2class,
        text: button2text,
        onClick: button2onclick
      }],
      callback: {
        afterClose: afterCloseCb
      },
      timeout: timeout,
      closeWith: ['button']
    });
  },
  alertWithOneButton: function(config) {
    var title = config.title ? config.title : '';
    var text = config.text;
    var textClass = !config.notyModel ? '' : 'noty-danger';
    var type = config.type || 'alert';
    var animationOpen = !config.animationOpen ? 'animated bounceIn' : config.animationOpen;
    var animationClose = !config.animationClose ? 'animated bounceOut' : config.animationClose;
    var layout = !config.layout ? 'center' : config.layout;
    var timeout = !config.timeout ? null : config.timeout;
    var modal = config.modal == undefined ? true : config.modal;

    var buttononclickdefault = function($noty) { $noty.close(); }

    var button1class = !config.btn1class ? 'btn btn-primary' : config.btn1class;
    var button1text = !config.btn1text ? 'OK' : config.btn1text;
    var button1onclick = !config.btn1onclick ? buttononclickdefault : config.btn1onclick;

    var bodyStyle = config.bodyStyle ? config.bodyStyle : undefined; 

    noty({
      text: wrapText(title, text, textClass,bodyStyle),
      type: type,
      theme: 'metroui',
      animation: {
        open: animationOpen,
        close: animationClose
      },
      layout: layout,
      modal: modal,
      closeWith: ['button'],
      buttons: [{
        addClass: button1class,
        text: button1text,
        onClick: button1onclick
      }],
      timeout: timeout
    });
  },
  notifyInfo: function(config) {
    var text = config.text;
    var animationOpen = !config.animationOpen ? 'animated slideInRight' : config.animationOpen;
    var animationClose = !config.animationClose ? 'animated fadeOut' : config.animationClose;
    var layout = !config.layout ? 'topRight' : config.layout;
    var timeout = TypeChecker.isUndefined(config.timeout) ? 5000 : config.timeout;

    return noty({
      text: text,
      type: 'information',
      theme: 'metroui',
      animation: {
        open: animationOpen,
        close: animationClose
      },
      layout: layout,
      timeout: timeout,
    });
  },
  notifySuccess: function(config) {
    var text = config.text;
    var animationOpen = !config.animationOpen ? 'animated slideInRight' : config.animationOpen;
    var animationClose = !config.animationClose ? 'animated fadeOut' : config.animationClose;
    var layout = !config.layout ? 'topRight' : config.layout;
    var timeout = !config.timeout ? 5000 : config.timeout;

    return noty({
      text: text,
      type: 'success',
      theme: 'metroui',
      animation: {
        open: animationOpen,
        close: animationClose
      },
      layout: layout,
      timeout: timeout,
    });
  },
  notifyError: function(config) {
    var text = config.text;
    var animationOpen = !config.animationOpen ? 'animated slideInRight' : config.animationOpen;
    var animationClose = !config.animationClose ? 'animated fadeOut' : config.animationClose;
    var layout = !config.layout ? 'topRight' : config.layout;
    var timeout = !config.timeout ? 5000 : config.timeout;

    return noty({
      text: text,
      type: 'error',
      theme: 'metroui',
      animation: {
        open: animationOpen,
        close: animationClose
      },
      layout: layout,
      timeout: timeout
    });
  }

}
