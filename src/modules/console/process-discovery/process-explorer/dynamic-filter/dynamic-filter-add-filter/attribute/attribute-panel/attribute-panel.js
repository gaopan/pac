import AttributeChart from "./attribute-chart/attribute-chart.vue"
import AttributeTable from "./attribute-table/attribute-table.vue"
import AttributeDate from "./attribute-date/attribute-date.vue"

export default {
    name: 'attribute-panel',
    props: ['attrData'],
    data() {
        return {
            style: {
                chart: null,
                table: null
            }
        }
    },
    components: {
        'attribute-chart': AttributeChart,
        'attribute-table': AttributeTable,
        'attribute-date': AttributeDate
    },
    computed: {
        currentType: function() {
            return this.$props.attrData.fieldType;
        }
    },
    created() {
        window.addEventListener('resize', this.windowResize);
    },
    mounted() {
        this.calculateContainer();
    },
    watch: {
        attrData: {
            handler(data, oldData) {
                if (data) {
                    this.calculateContainer();
                }

            },
            deep: true
        }
    },
    methods: {
        calculateContainer() {

            let element = this.$refs.attributePanel,
                height = element.offsetHeight,
                width = element.offsetWidth;

            this.style = {
                chart: {
                    height: `${height * (40/100)}px`,
                    width: `${width}px`
                },
                table: {
                    height: `${height * (60/100) - 20}`,
                    width: `${width}`
                }
            }

        },
        windowResize() {
            this.calculateContainer();
        }
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.windowResize);
    }
}