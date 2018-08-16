/**
 * @author Adib Ghazali
 * 
 */
export default {
    //to get processType code and color code form processType (receive from API)
    //will be delete after receive a proper data
    getExtraData(data) {
        let vm = this;
        let temp = [];
        data.forEach(function(obj) {
            obj.processTypeCode = obj.processType.trim().match(/\b(\w)/g).join('').toUpperCase();
            obj.processColor = vm.getColorCode(obj.processTypeCode);
            temp.push(obj);
        });
        return temp;
    },
    getColorCode(processTypeCode) {
        switch (processTypeCode) {
            case 'AP':
                return '#FF931E'
            case 'S':
                return '#64FF00'
            default:
                return '#00C9FF'
        }
    },
    // Note to Haziq : get all the processType
    // Next Monday(26 Jun), endponint API to receive all processType will be ready
    getProcessTypeList(data) {
        let list = [];
        let count = 0;
        data.forEach(function(obj) {
            var val = list.map((obj) => obj.name);
            if (val.indexOf(obj.processType.trim()) == -1) {
                list.push({
                    "id": ++count,
                    "name": obj.processType.trim(),
                    "selected": false
                });
            }
        });
        return list;
    }
}