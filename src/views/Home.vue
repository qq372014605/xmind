<template>
  <div class="home">
    <div class="data-show" v-if="loaded">
      <el-form class="search-form" :inline="true">
        <el-form-item label="账单时间">
          <el-select v-model="billMonth" placeholder="请选择">
            <el-option v-for="(item,index) in billMonths" :key="index" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="category" label="账单类型">
          <el-select v-model="billCategory" clearable placeholder="请选择">
            <el-option v-for="(item,index) in categoryList" :key="index" :label="item.name" :value="item.category"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
        </el-form-item>
      </el-form>

      <div class="data-opera">
        <div class="bill-add">
          <el-button size="small" type="primary" @click="billAdd">添加账单</el-button>
          <el-button size="small" type="primary" @click="billDetail">账单支出明细</el-button>
        </div>
        <div class="bill-statistics">
          <span>总收入{{totalIncome}}</span>
          <span>总支出{{totalPay}}</span>
        </div>
      </div>

      <el-table
        class="data-table"
        :data="tableData">
        <el-table-column
          prop="categoryName"
          label="账单分类">
        </el-table-column>
        <el-table-column
          prop="time"
          label="账单时间">
        </el-table-column>
        <el-table-column
          label="账单金额">
          <template slot-scope="scope">
            <div class="amount" v-html="scope.row.amountShow"></div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="csv-upload" v-else>
      <el-steps :active="active">
        <el-step title="步骤 1" description="请上传账单分类(categories.csv)"></el-step>
        <el-step title="步骤 2" description="请上传账单(bill.csv)"></el-step>
        <el-step title="步骤 3" description="完成"></el-step>
      </el-steps>

      <div class="steps" v-if="active==1">
        <el-upload
          :action="''"
          :auto-upload="true"
          :show-file-list="false"
          :before-upload="beforeUploadCategory">
          <el-button slot="trigger" type="primary">选取文件</el-button>
          <div slot="tip" class="el-upload__tip">请上传账单分类</div>
        </el-upload>
      </div>

      <div class="steps" v-if="active==2">
        <el-upload
          :action="''"
          :auto-upload="true"
          :show-file-list="false"
          :before-upload="beforeUploadBill">
          <el-button slot="trigger" type="primary">选取文件</el-button>
          <div slot="tip" class="el-upload__tip">请上传账单</div>
        </el-upload>
      </div>

      <div class="steps" v-if="active==3">
        <el-button type="primary" @click="loadData">加载数据</el-button>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Home',
  data() {
    return {
      loaded: false,//数据是否已经加载完成
      active: 1,
      category: null,//账单分类数据
      bill: null,//账单数据
      billMonth: '',
      billMonths: [],
      currentMonth: '',
      billCategory: '',
      currentCategory: '',
      tableData: [],
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    //加载上次保存的数据
    init() {
      const loaded = this.storage.get('loaded');
      if(loaded){
        this.loaded = loaded;
        this.active = 3;
        this.category = this.storage.get('category');
        this.bill = this.storage.get('bill');
      }

      this.getBillMonths();
      this.getTableData();
    },

    getBillMonths() {
      let month = [];
      if(this.bill){
        this.bill.map(item => {
          month.push(this.formatDate('yyyy-MM',new Date(item.time)));
        });
        month = Array.from(new Set(month));
        month.sort();
        month.reverse();
        this.billMonth = month[0];
        this.currentMonth = this.billMonth;
      }
      this.billMonths = month;
    },

    getTableData() {
      this.tableData = [];
      if(this.bill){
        this.bill.forEach(item => {
          item.time = this.formatDate('yyyy-MM-dd hh:mm:ss',new Date(item.time));
          const billMonth = item.time.slice(0,7);
          if(this.currentMonth==billMonth && (this.currentCategory==''||this.currentCategory==item.category)){
            item.categoryName = this.category[item.category].name;
            item.amountShow = item.type==1?'<span style="color:red;">+'+item.amount.toFixed(2)+'</span>':'<span>-'+item.amount.toFixed(2)+'</span>';
            this.tableData.push(item);
          }
        });
      }
      return this.tableData;
    },

    beforeUploadCategory(file) {
      if(typeof FileReader == 'undefined') {
          this.$message.error('你的浏览器不支持FileReader接口，请更换其他浏览器！');
          return false;
      }

      const csvType = [
        'application/vnd.ms-excel',
      ];
      const isCsv = csvType.indexOf(file.type)>-1 ? true : false;

      if (!isCsv) {
        this.$message.error('清上传csv文件！');
        return false;
      }

      //读取文件内容
      var reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        this.category = {};
        var data = reader.result.split("\r\n");
        for(var key = 1, len = data.length; key < len; key++) {
          var value = data[key];
          var item = value.split(",");
          if(item.length!=3){
            this.$message.error('账单分类csv文件格式错误！');
            return false;
          }
          this.category[item[0]] = {
            'type': item[1],
            'name': item[2],
          };
        }
        this.active = 2;
      }

      //因为不实际上传到服务器，都返回false阻止
      return false;
    },

    beforeUploadBill(file) {
      if(typeof FileReader == 'undefined') {
          this.$message.error('你的浏览器不支持FileReader接口，请更换其他浏览器！');
          return false;
      }

      const csvType = [
        'application/vnd.ms-excel',
      ];
      const isCsv = csvType.indexOf(file.type)>-1 ? true : false;

      if (!isCsv) {
        this.$message.error('清上传csv文件！');
        return false;
      }

      //读取文件内容
      var reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        this.bill = [];
        var data = reader.result.split("\r\n");
        for(var key = 1, len = data.length; key < len; key++) {
          var value = data[key];
          var item = value.split(",");
          if(item.length!=4){
            this.$message.error('账单csv文件格式错误！');
            return false;
          }
          this.bill.unshift({
            'type': item[0],
            'time': parseInt(item[1]),
            'category': item[2],
            'amount': parseFloat(item[3])
          });
        }
        this.active = 3;
      }

      //因为不实际上传到服务器，都返回false阻止
      return false;
    },

    loadData() {
      this.loaded = true;
      this.storage.set('loaded',this.loaded);
      this.storage.set('category',this.category);
      this.storage.set('bill',this.bill);
      this.getBillMonths();
      this.getTableData();
    },

    onSubmit() {
      this.currentMonth = this.billMonth;
      this.currentCategory = this.billCategory;
      this.getTableData();
    },

    billAdd() {
      this.goPage('Add');
    },

    billDetail() {
      this.goPage('Detail',{'month':this.currentMonth});
    }
  },
  computed: {
    categoryList() {
      let list = [];
      if(this.category){
        for(var key in this.category){
          let item = this.category[key];
          item.category = key;
          list.push(item);
        }
      }
      return list;
    },

    totalIncome() {
      let income = 0;
      this.tableData.forEach(item => {
        if(item.type==1){
          income += item.amount;
        }
      });
      return income.toFixed(2);
    },

    totalPay() {
      let pay = 0;
      this.tableData.forEach(item => {
        if(item.type==0){
          pay += item.amount;
        }
      });
      return pay.toFixed(2);
    }
  }
}
</script>

<style lang="scss" scoped>
.data-show{
  .data-opera{
    display: flex;
    .bill-add{
      flex: 1;
    }
    .bill-statistics{
      span{
        margin-left: 15px;
      }
    }
  }
  .data-table{
    width: 100%;
    .amount{
      font-weight: bold;
    }
  }
}
.csv-upload{
  margin-top: 100px;
  .steps{
    margin-top: 80px;
    text-align: center;
  }
}
</style>