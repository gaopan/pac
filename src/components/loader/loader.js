export default {
    name: 'loader',
    props: {
        stylesConf: {
            type: Object,
            required: false
        },
        isLoading: {
            type: Boolean,
            required: true
        },
        showText: {
            type: Boolean,
            required: false
        }
    },
    data() {
        return {
            data: (this.$props.stylesConf) ? this.$props.stylesConf: {},
            isShow: (this.$props.showText) ? this.$props.showText : false
        }
    }
}