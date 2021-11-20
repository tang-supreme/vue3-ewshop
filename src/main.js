import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'vant/lib/index.css'

import {PullRefresh, List, Popup, Grid, GridItem, AddressEdit, AddressList,  Icon, Stepper, SwipeCell, Checkbox, CheckboxGroup, SubmitBar, Swipe, SwipeItem, Lazyload, Badge, Sidebar, SidebarItem, Collapse, CollapseItem, Tab, Tabs, Card, Image as VanImage,Tag, Button, Field,Form  } from 'vant'

createApp(App)
  .use(Swipe).use(SwipeItem).use(Lazyload,{
    loading:require('./assets/images/default.png')})
  .use(Badge).use(Sidebar).use(SidebarItem).use(Collapse).use(CollapseItem)
  .use(Tab).use(Tabs).use(Card).use(VanImage).use(Tag).use(Button).use(Form).use(Field)
  .use(SubmitBar).use(Checkbox).use(CheckboxGroup).use(SwipeCell).use(Stepper).use(Icon).use(AddressList).use(AddressEdit)
  .use(GridItem).use(Grid).use(Popup).use(List).use(PullRefresh)
  .use(store).use(router).mount('#app')
