import Validator from 'vee-validate'
import axios from 'axios'

var images = require.context('@/assets/', false, /\.(png|jpg)$/)

let baseUrl = process.env.baseUrl;

export default {
    name: 'passport',
    data() {
        return {
            img: {
                "DxC": "DxC-Logo-Shape.png",
                "LEAP": 'LEAP-logo-solid.png'
            }
        }
    },
    components: {
    },
    created() {
    },
    methods: {
        imgUrl: function(path) {
            return images('./' + path);
        }
    },
    beforeDestroy: function(){
    }
}