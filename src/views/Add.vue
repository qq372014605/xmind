<template>
  <div class="add">
    <el-form :model="form" :rules="formRules" label-width="80px" ref="form">
      <el-form-item prop="category" label="账单类型">
        <el-select v-model="form.category" placeholder="请选择">
          <el-option v-for="(item,index) in categoryList" :key="index" :label="item.name" :value="item.category"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="amount" label="账单金额">
        <el-input v-model="form.amount" maxlength="10" placeholder="请描述入账单金额"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">确认添加</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>

export default {
  name: 'Add',
  data() {
    var validateAmount = (rule, value, callback) => {
      if(!/^\d+(\.\d+)?$/.test(value)){
        callback(new Error('账单金额必须为合法数值'));
      }else if(value<=0){
        callback(new Error('账单金额必须大于0'));
      }else{
        callback();
      }
    }
    return {
      category: null,//账单分类数据
      bill: null,//账单数据
      form: {
        category: '',
        amount: ''
      },
      formRules: {
        category: [
          { required: true, message: '请选择账单类型', trigger: 'blur' },
        ],
        amount: [
          { required: true, message: '请输入账单金额', trigger: 'blur' },
          { validator: validateAmount, trigger: 'blur' }
        ],
      }
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

    onSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const category = this.form.category;
          const categoryItem = this.category[category];
          const billItem = {
            'type': categoryItem.type,
            'time': Date.parse(new Date()),
            'category': category,
            'amount': parseFloat(this.form.amount)
          };
          this.bill.unshift(billItem);
          this.storage.set('bill',this.bill);
          this.$message({
						showClose: true,
						message: '添加成功！',
						type: 'success',
						onClose: () => {
							this.goPage('Home');
						}
					});
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
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
  }
}
</script>