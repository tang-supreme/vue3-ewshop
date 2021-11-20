<template>
  <div class="order-detail-box">
    <nav-bar class="nav-bar">
      <template v-slot:default>
        订单详情
      </template>
    </nav-bar>

    <!-- 订单状态编号时间 -->
    <div class="order-status">
      <div class="status-item">
        <label>订单状态:</label>
        <span>{{statusString}}</span>
      </div>
      <div class="status-item">
        <label>订单编号:</label>
        <span>{{detail.order_no}}</span>
      </div>
      <div class="status-item">
        <label>订单时间:</label>
        <span>{{detail.created_at}}</span>
      </div>
      <van-button v-if="detail.status == 1" @click="showPayFn" style="margin-bottom: 10px" color="#1baeae" block>去支付</van-button>
      <van-button v-if="detail.status == 2" @click="handleConfirmOrder" block>确认订单</van-button>
    </div>

    <!-- 金额和配送方式 -->
    <div class="order-price">
      <div class="price-item">
        <label>商品金额：</label>
        <span>￥{{total+'.00'}}</span>
      </div>
      <div class="price-item">
        <label>配送方式：</label>
        <span>普通快递</span>
      </div>
    </div>

    <!-- 订单详情 -->
    <van-card
      v-for="item in detail.orderDetails.data" :key="item.id"
      :num="item.num"
      :price="item.price+'.00'"
      desc="全场包邮"
      :title="item.goods.title"
      :thumb="item.goods.cover_url"
     />

    <!-- 弹出支付二维码 -->
    <van-popup
      v-model:show="showPay"
      position="bottom"
      :style="{ height: '40%' }">
      <div :style="{ width: '90%', margin: '0 auto', padding: '50px 0' }">
        <van-grid :border="false" :column-num="2">
          <van-grid-item  text="支付宝">
            支付宝二维码<br>
            <van-image width="150" height="150" :src="aliyun" />
          </van-grid-item>
          <van-grid-item text="微信支付">
            微信二维码<br>
            <van-image width="150" height="150" :src="wechat" />
          </van-grid-item>
        </van-grid>
      </div>
    </van-popup>
<!--  -->
  </div>
</template>

<script>
import { reactive, toRefs, onMounted,computed } from 'vue'
import NavBar from "components/common/navbar/NavBar";
import { getOrderDetail, confirmOrder, payOrder,payOrderStatus,viewExpress } from 'network/order'
import { Dialog, Toast } from 'vant'
import { useRoute, useRouter } from 'vue-router'

export default {
  name:'OrderDetail',
  components:{
    NavBar
  },
  setup(){
    const route = useRoute()
    const router = useRouter()
    const state = reactive({
      orderNo:'',//订单id
      detail:{ //订单详情
        orderDetails:{
          data:[]
        },
        status:0
      },
      showPay:false,//是否展示支付
      // 支付二维码
      aliyun:'',
      wechat:''
    })

    //初始化调用订单详情
    const init = () =>{
      const {id} = route.query
      state.orderNo = id //获取订单id
      // 根据id获取详情
      getOrderDetail(id).then(res=>{
        console.log(res);
        state.detail = res
      })
    } 

    onMounted(()=>{
      Toast.loading({message:'加载中...', forbidClick:true});
      init();
      Toast.clear();
    })

    // 订单状态的确定
    const statusString = computed(()=>{
      let status = ['', '已下单', '已支付', '等待发货', '确认收货', '已过期'];
      return status[state.detail.status]
    })

    // 计算总价
    const total = computed(()=>{
      let sum = 0;
      state.detail.orderDetails.data.forEach(item=>{
        sum += item.num * item.price
      })
      return sum
    })

    // 去支付，弹出支付二维码
    const showPayFn = () =>{
      state.showPay = true;
      // 获取支付二维码
      payOrder(state.orderNo, {type:'aliyun'}).then(res=>{
        state.aliyun = res.qr_code_url;
        state.wechat = res.qr_code_url;
      })
      // 轮询查看
      const timer = setInterval(()=>{
        payOrderStatus(state.orderNo).then(res=>{
          console.log(res);
          if(res == '2') {
            clearInterval(timer);
            state.showPay = false;
            router.push({path:'/orderdetail', query:{id:state.orderNo}})
          }
        })
      }, 2000)
    }

    // 确定订单按钮
    const handleConfirmOrder = ()=>{
        Dialog.confirm({
          title:'是否确认订单'
        }).then(()=>{
          confirmOrder(state.orderNo).then(res=>{
              Toast('确认成功');
              init();
          })
        }).catch(()=>{
      })
    }
      
    // 关闭
    const close = () =>{
      Dialog.close()
    }

    return{
      ...toRefs(state),
      statusString,
      total,
      showPayFn,
      close,
      handleConfirmOrder
    }
  }
};

</script>

<style lang="scss" scoped>
  .order-detail-box {
    text-align: left;
    background: #f7f7f7;
    .order-status {
      background: #fff;
      margin-top: 44px;
      padding: 20px;
      font-size: 15px;
      .status-item {
        margin-bottom: 10px;
        label {
          color: #999;
        }
        span {

        }
      }
    }
    .order-price {
      background: #fff;
      margin: 20px 0;
      padding: 20px;
      font-size: 15px;
      .price-item {
        margin-bottom: 10px;
        label {
          color: #999;
        }
        span {

        }
      }
    }
    .van-card {
      margin-top: 0;
    }
    .van-card__content {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  }
</style>
