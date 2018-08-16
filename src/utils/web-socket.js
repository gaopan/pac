/** 
 *  @author Adib Ghazali
 * 
 *   ref -  https://github.com/MetinSeylan/Vue-Socket.io
 *          https://coligo.io/real-time-analytics-with-nodejs-socketio-vuejs/
 *   More to come when integrate with Kent idea on DNA customer web socket
 */

import Vue from 'vue'
import VueSocketio from 'vue-socket.io'

Vue.use(VueSocketio, 'ws://html5rocks.websocket.org/echo');

export default {
    sockets: {
        connect() {
            console.log('socket connected');
        },
        emit1(data) {
            console.log('this method was fired by the socket server');
        }
    }, 
    methods: {
        callFn(data) {
            // $socket is socket.io-client instance 
            this.$socket.emit('emit1', data);
        }
    }
}

