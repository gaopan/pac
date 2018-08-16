import Noty from 'noty'
import animation from "animate.css"

let images = require.context('@/assets/', false, /\.(png|jpg)$/)

let wrapText = function(text, textClass){
  return `<div class="apa-noty-main ${textClass}">\
      <div class="apa-noty-body">${text}</div>\
    </div>`;
}

export default {

  alertWithTwoButtons: function(config) {
    var text = config.text;
    var textClass = config.textClass || '';
    var type = config.type || 'alert';
    var animationOpen = !config.animationOpen ? 'animated bounceIn' : config.animationOpen;
    var animationClose = !config.animationClose ? 'animated bounceOut' : config.animationClose;
    var layout = !config.layout ? 'center' : config.layout;
    var timeout = !config.timeout ? null : config.timeout;
    var modal = config.modal == undefined ? true : config.modal;
    var buttononclickdefault = function($noty) { $noty.close(); }

    var button1class = !config.btn1class ? 'btn btn-primary' : config.btn1class;
    var button1text = !config.btn1text ? 'Yes' : config.btn1text;
    var button1onclick = !config.btn1onclick ? buttononclickdefault : config.btn1onclick;

    var button2class = !config.btn2class ? 'btn btn-secondary' : config.btn2class;
    var button2text = !config.btn2text ? 'No' : config.btn2text;
    var button2onclick = !config.btn2onclick ? buttononclickdefault : config.btn2onclick;

    noty({
      text: wrapText(text, textClass),//default setting 
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
      timeout: timeout
    });
  },
  alertWithOneButton: function(config) {
    var text = config.text;
    var textClass = config.textClass || '';
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

    noty({
      text: wrapText(text, textClass),
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
    var timeout = !config.timeout ? 5000 : config.timeout;

    noty({
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

    noty({
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

    noty({
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
