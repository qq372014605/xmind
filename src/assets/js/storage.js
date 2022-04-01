/**
 * 封装localstorage本地存储方法
 */
const storage = {
  prefix: 'xmind_',
  set(key, value, expire=0) {
    //不到一个月过期时间加上当前时间戳
    if(expire>0 && expire<30*86400){
      const timestamp = Date.parse(new Date())/1000;
      expire += timestamp;
    }
    const data = {
      'value': value,
      'expire': expire,
    };
    localStorage.setItem(this.prefix + key, JSON.stringify(data));
  },
  get(key) {
    let data = localStorage.getItem(this.prefix + key);
    if(data){
      data = JSON.parse(data);
      const timestamp = Date.parse(new Date())/1000;
      const expire = data.expire;
      if(expire===0 || expire>=timestamp){
        return data.value;
      }else{
        this.remove(key);
      }
    }
    return '';
  },
  remove(key) {
    localStorage.removeItem(this.prefix + key);
  },
  clear(){
    localStorage.clear();
  }
};

export default storage;