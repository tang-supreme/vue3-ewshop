import {getCart} from 'network/cart'; //获取购物车列表

const actions = { 
  // 异步修改数据
    updateCart({commit}){
      getCart().then(res=>{
        // console.log('下面请求到的是购物车数据');
        // console.log(res.data); // 打印购物车中的数据
        commit('addCart',{count:res.data.length || 0})
      })
    }
}

export default actions;