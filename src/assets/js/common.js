export default {
	install(Vue) {
		// 时间日期格式化
		Vue.prototype.formatDate = function (fmt, date = null) {
			if (date) {
				if (typeof (date) == 'string') {
					date = new Date(date.replace(/-/g, '/'));// 替换-为/兼容ios
				}
			} else {
				date = new Date();
			}
			var o = {
				"M+": date.getMonth() + 1,                 //月份
				"d+": date.getDate(),                    //日
				"h+": date.getHours(),                   //小时
				"m+": date.getMinutes(),                 //分
				"s+": date.getSeconds(),                 //秒
				"q+": Math.floor((date.getMonth() + 3) / 3), //季度
				"S": date.getMilliseconds()             //毫秒
			};
			if (/(y+)/.test(fmt)) {
				fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
			}
			for (var k in o) {
				if (new RegExp("(" + k + ")").test(fmt)) {
					fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
				}
			}
			return fmt;
		};

		// 获取当前时间
		Vue.prototype.getTime = function () {
			return this.formatDate('yyyy-MM-dd hh:mm:ss');
		};

		// 获取当前时间戳（秒）
		Vue.prototype.getTimestamp = function () {
			return Date.parse(new Date()) / 1000;
		};

		// 页面跳转
		Vue.prototype.goPage = function (name, query = null) {
			let routerParams = {
				'name': name,
			};
			if (query) {
				routerParams.query = query;
			}
			this.$router.push(routerParams);
		};
		

		// 二维数组排序
		Vue.prototype.keySort = function (key, sort='desc') {
			return function (a, b) {
				return sort=='desc' ? b[key] - a[key] : a[key] - b[key];
			}
		}
	}
};