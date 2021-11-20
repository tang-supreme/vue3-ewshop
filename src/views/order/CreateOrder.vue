<template>
  <div class="create-order">
    <nav-bar class="nav-bar">
      <template v-slot:default> 定单预览 </template>
    </nav-bar>

    <!-- 订单预览的地址部分 -->
    <div class="address-wrap" @click="goTo">
      <div class="name">
        <span>{{ address.name }}-</span>
        <span>{{ address.phone }}</span>
      </div>
      <div class="address">
        {{ address.province }}-{{ address.city }}-{{ address.county }}-{{
          address.address
        }}
      </div>
      <van-icon class="arrow" name="arrow"></van-icon>
    </div>

    <!-- 购物车商品信息 -->
    <div class="good">
      <div class="good-item" v-for="(item, index) in cartList" :key="index">
        <div class="good-img"><img v-lazy="item.goods.cover_url" alt="" /></div>
        <div class="good-desc">
          <div class="good-title">
            <span>{{ item.goods.title }}</span>
            <span>x{{ item.num }}</span>
          </div>
          <div class="good-btn">
            <div class="price">
              <small>¥</small> {{ item.goods.price + ".00" }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 商品生成，提交按钮 -->
    <van-submit-bar
      class="submit-all"
      :price="total * 100"
      button-text="生成订单"
      @submit="handleCreateOrder">
      商品金额
    </van-submit-bar>

    <!-- 弹出层支付宝微信 -->
    <van-popup
        closeable
        close-on-click-overlay="false"
        v-model:show="showPay"
        position="bottom"
        :style="{ height: '40%' }"
        @close="close">
      <van-grid :border="false" :column-num="2">
        <van-grid-item>
          支付宝二维码<br>
          <van-image width="150" height="150" :src="aliyun" />
        </van-grid-item>
        <van-grid-item>
          微信二维码<br>
          <van-image width="150" height="150" :src="wechat" />
        </van-grid-item>
        </van-grid>
    </van-popup>

  </div>
</template>

<script>
import { reactive, onMounted, toRefs, computed } from "vue";
import NavBar from "components/common/navbar/NavBar";
import {
  getOrderPreview,
  createOrder,
  payOrder,
  payOrderStatus,
} from "network/order";
import { Toast } from "vant";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

export default {
  components: {
    NavBar,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    // 定义数据
    const state = reactive({
      cartList: [], //购物车选中数据
      address: {}, //地址
      // 支付
      showPay: false,
      orderNo: "",
      aliyun: "",
      wechat: "",
    });

    // 初始化数据
    const init = () => {
      Toast.loading({ message: "加载中...", forbidClick: true });
      // 订单预览请求
      getOrderPreview().then((res) => {
        // console.log(res);
        // 地址赋值
        let address = res.address.filter((n) => n.is_default == "1");
        // 如果地址长度为0
        if (address.length == 0) {
          state.address = {
            address: "还没有设置默认地址，请选择或填写地址信息",
          };
        } else {
          state.address = address[0];
        }
        // 获取购物车信息
        state.cartList = res.carts;
      });
    };

    onMounted(() => {
      init();
    });

    const goTo = () => {
      router.push({ path: "/address" });
    };

    const handleCreateOrder = () =>{
      const params = {address_id:state.address.id}
      
      createOrder(params).then(res=>{
        // console.log(res);
        Toast('创建订单成功')
        store.dispatch('updateCart'); //状态管理更新购物车数量

        // 支付流程的编写
        state.showPay = true;
        // 订单ID
        state.orderNo = res.id;
        // 调用支付订单
        payOrder(state.orderNo, {type:'aliyun'}).then(res=>{
          console.log(res);
          state.aliyun = res.qr_code_url;
          state.wechat = res.qr_code_url;
        })
        // payOrder(state.orderNo, {type:'wechat'}).then(res=>{
        //   console.log(res);
        //   state.aliyun = res.qr_code_url;
        //   state.wechat = res.qr_code_url;
        // })

        // 支付成功后，轮询查看
        const timer = setInterval(()=>{
          payOrderStatus(state.orderNo).then(res=>{
            if(res=='2') {
              clearInterval(timer);
              router.push({path:'/orderdetail', query:{id:state.orderNo}})
            }
          })
        }, 2000)
      })
    }

    const close = () =>{
      router.push({path:'/orderdetail', query:{id:state.orderNo}})
    }

    const total = computed(()=>{
      let sum = 0
      state.cartList.forEach(item=>{
        sum += parseInt(item.num) * parseInt(item.goods.price)
      })
      return sum
    })

    return {
      ...toRefs(state),
      goTo,
      total,
      handleCreateOrder,
      close
    };
  },
};
</script>

<style lang="scss" scoped>
.create-order {
  background: #f9f9f9;
  .address-wrap {
    text-align: left;
    margin-bottom: 20px;
    background: #fff;
    position: relative;
    margin-top: 44px;
    font-size: 14px;
    padding: 15px;
    color: #222333;
    .name,
    .address {
      margin: 10px 0;
    }
    .arrow {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 20px;
    }
    &::before {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      height: 2px;
      background: -webkit-repeating-linear-gradient(
        135deg,
        #ff6c6c 0,
        #ff6c6c 20%,
        transparent 0,
        transparent 25%,
        #1989fa 0,
        #1989fa 45%,
        transparent 0,
        transparent 50%
      );
      background: repeating-linear-gradient(
        -45deg,
        #ff6c6c 0,
        #ff6c6c 20%,
        transparent 0,
        transparent 25%,
        #1989fa 0,
        #1989fa 45%,
        transparent 0,
        transparent 50%
      );
      background-size: 80px;
      content: "";
    }
  }
  .good {
    margin-bottom: 120px;
  }
  .good-item {
    padding: 10px;
    background: #fff;
    display: flex;
    .good-img {
      img {
        width: 100px;
        height: auto;
      }
    }
    .good-desc {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex: 1;
      padding: 20px;
      .good-title {
        display: flex;
        justify-content: space-between;
      }
      .good-btn {
        display: flex;
        justify-content: space-between;
        .price {
          font-size: 16px;
          color: red;
          line-height: 28px;
        }
        .van-icon-delete {
          font-size: 20px;
          margin-top: 4px;
        }
      }
    }
  }
  .pay-wrap {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #fff;
    padding: 10px 0;
    padding-bottom: 50px;
    border-top: 1px solid #e9e9e9;
    > div {
      display: flex;
      justify-content: space-between;
      padding: 0 5%;
      margin: 10px 0;
      font-size: 14px;
      span:nth-child(2) {
        color: red;
        font-size: 18px;
      }
    }
    .pay-btn {
      position: fixed;
      bottom: 7px;
      right: 0;
      left: 0;
      width: 90%;
      margin: 0 auto;
    }
  }
}
.submit-all {
  margin-bottom: 50px;
  z-index: 9 !important;
}
</style>
