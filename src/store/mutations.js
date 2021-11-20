const mutations = {
    // 设置是否登录
    setIsLogin(state, payload) {
        state.user.isLogin = payload;
    },
    // 修改购物车数量
    addCart(state, payload) {
        state.cartCount = payload.count
    }

}

export default mutations;