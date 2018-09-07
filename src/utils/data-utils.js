export default {
	groupBy(list, key){
		let res = {}, keyValues = [];
		list.forEach(item => {
			if(keyValues.indexOf(item[key]) < 0) {
				keyValues.push(item[key]);
				res[item[key]] = [item];
			} else {
				res[item[key]].push(item);
			}
		});
		return res;
	}
}