<template>
  <div>
    <nav-bar>
      <template v-slot:default>
        购物车(<span style="color: red">{{ $store.state.cartCount }}</span
        >)
      </template>
    </nav-bar>
    <!-- 购物车主体部分 -->
    <div class="cart-box">
      <div class="cart-body">
        <!-- checkbox-group盒子 -->
        <van-checkbox-group ref="checkboxGroup" @change="groupChange" v-model="result">
          <van-swipe-cell :right-width="50" v-for="(item,index) in list" :key="index">
            <!-- 购物车商品信息 -->
            <div class="good-item">
              <!-- checkbox标签 -->
              <van-checkbox :name="item.id"/>
              <!-- 购物车图片 -->
              <div class="good-img"><img :src="item.goods.cover_url" alt=""></div>
              <!-- 购物车描述 -->
              <div class="good-desc">
                <div class="good-title">
                  <span>{{item.goods.title}}</span>
                  <span>x{{item.goods.stock}}</span>
                </div>
                <div class="good-btn">
                  <div class="price"><small>¥</small>{{item.goods.price + '.00'}}</div>
                  <van-stepper @change="onChange" integer :min="1" :max="item.goods.stock" :model-value="item.num" :name="item.id" async-change/>
                </div>
              </div>
              
            </div>
            
            <!-- 右侧滑动删除 -->
            <template #right>
              <van-button
                square
                icon="delete"
                type="danger"
                class="delete-button"
                @click="deleteGood(item.id)"
              />
            </template>
          </van-swipe-cell>

        </van-checkbox-group>
        
      </div>

      <!-- 购物车底部提交部分 -->
      <van-submit-bar class="submit-all" :price="total * 100" @submit="onSubmit" button-text="结算">
        <van-checkbox @click="allCheck" v-model:checked="checkAll">全选</van-checkbox>
      </van-submit-bar>

      <!-- 如果购物车为空 -->
      <div class="empty" v-if="!list.length">
        <img class="empty-cart" src="~assets/images/empty-car.png" alt="空购物车">
        <div class="title">购物车空空如也</div>
        <van-button round color="#1baeae" type="primary" block @click="goTo">前往选购</van-button>
      </div>

    </div>
  </div>
</template>

<script>
import {ref, reactive, toRefs, onMounted, computed} from 'vue';
import NavBar from "components/common/navbar/NavBar";

import {getCart, deleteCartItem, checkedCard, modifyCart} from 'network/cart'

import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { Toast } from 'vant'

export default {
  name: "ShopCart",
  setup() {
    const router = useRouter();
    const store = useStore();

    // 数据模型
    const state = reactive({
      list:[],
      result:[], //购物车id数组
      checkAll:false
    })

    // 初始化购物车数据
    const init = () =>{
      Toast.loading({message:'加载中...',forbidClick:true})
      // 获取请求购物车数据
      getCart('include=goods').then(res=>{
        // 将获取到的数据赋值给数据模型里的list
        state.list = res.data;
        console.log(res.data);
        // 将选中数据放在result中
        state.result = res.data.filter(n=>n.is_checked == 1).map(item => item.id)
        console.log(state.result);

        Toast.clear()
      })
    }

    // onMounted生命周期函数
    onMounted(()=>{
      init()
    })

    // 异步修改购物车数量
    const onChange = (value,detail) =>{
      // console.log(value); //购物车数量的值
      // console.log(detail,name); //商品的id值
      Toast.loading({message:'修改中...', forbidClick:true});
      modifyCart(detail.name,{num:value}).then(res=>{
        state.list.forEach(item=>{
          if(item.id == detail.name){
            item.num = value
          }
        })
        Toast.clear()
      })
    }

    // 复选框改变处理
    const groupChange = (result) =>{
      // 定义全选方法
      if(result.length == state.list.length){
        state.checkAll = true
      }else{
        state.checkAll = false
      }
      
      console.log(result);
      state.result =result
      // 改变数据表中选中状态
      checkedCard({cart_ids:result})
    }

    // 全选方法
    const allCheck = () =>{
      if(!state.checkAll){
        state.result = state.list.map(item=>item.id)
        state.checkAll = true
      }else{
        state.result = []
        state.checkAll = false
      }
    }

    // 计算属性，计算总价
    const total = computed(()=>{
      let sum = 0 
      state.list.filter(item=>state.result.includes(item.id)).forEach(item=>{
        sum += parseInt(item.num) * parseInt(item.goods.price)
      })
      return sum
    })

    // 前往选购
    const goTo = () =>{
      router.push({path:'/'}) //跳转前往首页
    }

    // 删除商品
    const deleteGood = (id) =>{
      deleteCartItem(id).then(res=>{
        init()
        store.dispatch('updateCart'); //改变vuex中的状态数量
      })
    }

    // 结算
    const onSubmit = () =>{
      if(state.result.length == 0){
        Toast.fail('请选择商品进行结算')
        return;
      }else{
        router.push({path:'/createorder'}) // 跳转至结算界面
      }
    }

    return{
      ...toRefs(state),
      goTo,
      onChange,
      groupChange,
      allCheck,
      deleteGood,
      total,
      onSubmit
    }
  },
  components: {
    NavBar,
  },
};
</script>

<style lang="scss" scoped>
.cart-box {
  .cart-body {
    // background-color: red;
    margin: 60px 0 100px 0;
    padding-left: 10px;
    .good-item{
      display: flex;
      .good-img{
        img{
          width: 100px;
          height: auto;
        }
      }
      .good-desc{
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        flex: 1;
        padding: 20px;
        .good-title{
          font-size: 14px;
          display: flex;
          justify-content: space-between;
        }
        .good-btn{
          display: flex;
          justify-content: space-between;
          .price{
            font-size: 16px;
            color: red;
            line-height: 28px;
          }
          .van-icon-delete{
            font-size: 20px;
            margin-top: 4px;
          }
        }
      }
    }
    .delete-button{
      width: 50px;
      height: 100%;
    }
  }

  // 底部的css样式
  .empty{
    width: 50%;
    margin: 0 auto;
    text-align: center;
    margin-top: 200px;
    .empty-cart{
      width: 150px;
      margin-bottom: 20px;
    }
    .van-icon-smile-o{
      font-size: 50px;
    }
    .title{
      font-size: 16px;
      margin-bottom: 20px;
    }  
  }

  .submit-all {
    margin-bottom: 51px;
    .van-checkbox{
      margin-left: 0;
    }
    .van-submit-bar__text {
        margin-right: 10px
    }
    .van-submit-bar__button {
        background:red;
    }
  }
  .van-checkbox__icon--checked .van-icon {
    background-color:red;
    border-color: red;
  }
}
</style>