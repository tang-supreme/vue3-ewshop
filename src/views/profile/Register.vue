<template>
  <div>
    <nav-bar>
      <template v-slot:default>新用户注册</template>
    </nav-bar>

    <div style="margin-top: 50px">
      <!-- 注册部分的图片 -->
      <div style="text-align: center; padding-top: 50px">
        <van-image
          width="10rem"
          height="10rem"
          fit="contain"
          src="https://img01.yzcdn.cn/vant/cat.jpeg"
        />
      </div>

      <!-- 注册的图片 -->
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="name"
            name="用户名"
            label="用户名"
            placeholder="用户名"
            :rules="[{ required: true, message: '请填写用户名' }]"
          />
          <van-field
            v-model="password"
            type="password"
            name="密码"
            label="密码"
            placeholder="密码"
            :rules="[{ required: true, message: '请填写密码' }]"
          />
          <van-field
            v-model="password_confirmation"
            type="password"
            name="确认密码"
            label="确认密码"
            placeholder="确认密码"
            :rules="[{ required: true, message: '请填写一致密码' }]"
          />
          <van-field
            v-model="email"
            name="电子邮箱"
            label="电子邮箱"
            placeholder="请输入正确电子邮箱格式"
            :rules="[{ required: true, message: '请填写用户名' }]"
          />
        </van-cell-group>
        <div style="margin: 16px">
          <div class="link-login" @click="$router.push({ path: '/login' })">
            已有账号，立即登录
          </div>
          <van-button
            round
            block
            type="info"
            color="#44b883"
            native-type="submit"
          >
            提交
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script>
import NavBar from "components/common/navbar/NavBar";

import { useRouter } from "vue-router";

import { reactive, ref, toRefs } from "vue";
import { register } from "network/user";
import { Notify, Toast } from "vant";

export default {
  name: "Register",
  setup() {
    const router = useRouter();
    const userinfo = reactive({
      name: "",
      password: "",
      password_confirmation: "",
      email: "",
    });
    const onSubmit = () => {
      // 先验证密码是否一致
      if (userinfo.password != userinfo.password_confirmation) {
        Notify("两次密码不一致...");
      } else {
        // 提交至服务器
        register(userinfo).then((res) => {
          // console.log(res);//提交一个数据试试
          if (res.status == "201") {
            Toast.success("注册成功");
            // 设置跳转
            setTimeout(() => {
              router.push({ path: "/login" });
            }, 1000);
          }

          // 注册完后清空
          userinfo.password_confirmation = "";
          userinfo.password = "";
        });
      }
    };

    return {
      ...toRefs(userinfo),
      onSubmit,
    };
  },
  components: {
    NavBar,
  },
};
</script>

<style scoped>
.link-login {
  font-size: 14px;
  margin-bottom: 20px;
  color: #42b983;
  display: inline-block;
  text-align: left;
  float: left;
}
</style>