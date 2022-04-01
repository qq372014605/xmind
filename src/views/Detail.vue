<template>
  <div class="detail">
    <h1>{{$route.query.month}}支出明细</h1>
    
    <el-table
      class="data-table"
      :data="tableData">
      <el-table-column
        prop="categoryName"
        label="账单分类">
      </el-table-column>
      <el-table-column
        label="占比">
        <template slot-scope="scope">
          <el-progress :percentage="scope.row.percent" :show-text="false"></el-progress>
        </template>
      </el-table-column>
      <el-table-column
        label="账单金额">
        <template slot-scope="scope">
          <div class="amount" v-html="scope.row.amountShow"></div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>

export default {
  name: 'Detail',
  data() {
    return {
      category: null,//账单分类数据
      bill: null,//账单数据
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      const loaded = this.storage.get('loaded');
      if(loaded){
        this.category = this.storage.get('category');
        this.bill = this.storage.get('bill');
      }else{
        this.goPage('Home');
      }
    },
  },
  computed: {
    billPay() {
      let pay = [];
      if(this.bill){
        this.bill.forEach(item => {
          item.time = this.formatDate('yyyy-MM-dd hh:mm:ss',new Date(item.time));
          const billMonth = item.time.slice(0,7);
          if(this.$route.query.month==billMonth && item.type==0){
            item.categoryName = this.category[item.category].name;
            item.amountShow = '<span>￥'+item.amount.toFixed(2)+'</span>';
            pay.push(item);
          }
        });
      }
      return pay;
    },

    //按账号类型分组的数据
    tableData() {
      let tableData = [];
      const billPay = this.billPay;
      if(billPay.length>0){
        let dataObj = {};
        let totalAmount = 0;
        billPay.forEach(item => {
          if(Object.prototype.hasOwnProperty.call(dataObj,item.category)){
            dataObj[item.category] += item.amount;
          }else{
            dataObj[item.category] = item.amount;
          }
          totalAmount += item.amount;
        });
        
        for(var key in dataObj){
          const categoryName = this.category[key].name;
          const amountShow = '<span>￥'+dataObj[key].toFixed(2)+'</span>';
          tableData.push({
            categoryName: categoryName,
            percent: parseFloat((100*dataObj[key]/totalAmount).toFixed(2)),
            amount: dataObj[key],
            amountShow: amountShow
          });
        }
        tableData.sort(this.keysrt('amount'));
        console.log(tableData);
      }
      return tableData;
    }
  }
}
</script>

<style lang="scss" scoped>
</style>