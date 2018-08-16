//Support Documentation - https://github.houston.entsvcs.net/LEAP/documents/blob/master/support/website-components/leap-search/leap-search.md

export default {
    name: 'leap-search',
    props: {
        width: {
            type: String,
            required: false,
            default: '90%'
        },
        searchTitle: {
            type: String,
            required: true
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false
        },
        haveError: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    data() {
        return {
            searchKey: '',
            timeoutSearch: null,
            typingInterval: 500
        }
    },
    mounted(){
        this.$refs.searchInput.onkeyup = this.onKeyUp;
    },
    computed: {
        placeholder() {
            return `Search ${this.$props.searchTitle}`;
        }
    },
    methods: {
        onKeyUp(e) {
            //Refer from: https://schier.co/blog/2014/12/08/wait-for-user-to-stop-typing-using-javascript.html
            clearTimeout(this.$data.timeoutSearch);
  
            this.$data.timeoutSearch = setTimeout(() => {
                this.$emit('searchText',this.searchKey);
            }, this.$data.typingInterval);
        },
        onClickClose() {
            this.$data.searchKey = '';
            this.$emit('searchText',this.searchKey);
        }
    },
    destroy() {
        this.$refs.searchInput.onkeyup = null;
        this.$data.timeoutSearch = null;
    }
}