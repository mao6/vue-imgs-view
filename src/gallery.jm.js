import Vuer from './Vuer.vue'
import vfinger from 'v-finger-mk42'
import Gallery from './Gallery.vue'
// 有写大图属性就取大图
const getImgSrc = el => el.dataset.large || el.src

const JmGallery = {
  install(Vue, options = {}) {
    Vue.use(vfinger)
    // 所有图片地址储存位置
    let imgList = {}
    let VuerE = Vue.extend(Vuer)
    // 新建实例并挂载
    let vm = new VuerE().$mount()
    // 如果没有提供 $mount 的参数，模板将被渲染为文档之外的的元素，并且你必须使用原生 DOM API 把它插入文档中。
    document.querySelector('body').appendChild(vm.$el)
    vm.swipeThreshold = options.swipeThreshold || 100
    options.loadingStyle // TODO
    let openVuer = (el, group) => e => {
      let imgSrc = getImgSrc(el)
      if (group || group === 0) {
        vm.isSingle = false
        vm.imgList = imgList[group]
        vm.isShow = true
        vm.currentIndex =
          Number(e.currentTarget.dataset.index) || vm.imgList.indexOf(imgSrc)
      } else {
        vm.isSingle = true
        vm.imgList = [imgSrc]
        vm.isShow = true
        vm.currentIndex = 0
      }
    }
    Vue.prototype.$imgVuer = {
      close() {
        vm.closeGallery()
      }
    }

    // 全局创建该点击事件
    const _initGallery = (el, group) => {

      el.addEventListener('click', openVuer(el, group))
      let imgSrc = getImgSrc(el)
      if (group) {
        let imgGroup = imgList[group]
        // 有分组
        if (imgGroup) {
          // 分组已定义
          imgGroup.push(imgSrc)
        } else {
          imgList[group] = [imgSrc]
        }
      } else {
        // 无分组（单张）
        // 无需储存，直接用imgSrc打开
      }
    }
    Vue.prototype.$initGallery = (wrapDom, group) => {
      Array.from(wrapDom.getElementsByTagName('img')).forEach(item => {

        _initGallery(item, group)
      })
    }
    // 销毁
    Vue.prototype.$removeGallery = (group)=>{
      if(imgList[group]){
        imgList[group] = null
      }
    }
    Vue.component('Gallery',Gallery)
    Vue.directive('gallery', {
      bind(el) {
        if (!el.src) throw '<img/> missing src'
      },
      // add update
      inserted(el, binding) {
        // 同时兼容arg和value传分组名称
        // 加 String() 防止 0 捣乱
        let group = binding.arg || binding.value
        el.addEventListener('click', openVuer(el, group))
        let imgSrc = getImgSrc(el)
        if (group) {
          let imgGroup = imgList[group]
          // 有分组
          if (imgGroup) {
            // 分组已定义
            imgGroup.push(imgSrc)
          } else {
            imgList[group] = [imgSrc]
          }
        } else {
          // 无分组（单张）
          // 无需储存，直接用imgSrc打开
        }
      },
      unbind(el, binding) {
        // 调查keep alive后跳转是否触发unbind
        vm.isShow = false
        let imgSrc = getImgSrc(el)
        let group = binding.arg || binding.value
        el.removeEventListener('click', openVuer(el, group))
        if (group || group === 0) {
          let imgGroup = imgList[group]
          let index = imgGroup.indexOf(imgSrc)
          imgGroup.splice(index, 1)
        }
      }
    })
  }
}
export default JmGallery
