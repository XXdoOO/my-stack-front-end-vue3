import axios from "axios"
import LoginRegister from '@/components/login'
import xMessage from '@/components/message/index'


axios.defaults.baseURL = "/api"
axios.defaults.withCredentials = true
axios.defaults.timeout = 10000

const CancelToken = axios.CancelToken
const source = CancelToken.source()

axios.interceptors.request.use((req) => {
  console.log("请求URL：", req.url, req)

  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"))

  if (userInfo == null && (req.url.includes("/user/") || req.url.includes("/admin/"))) {
    LoginRegister()
    source.cancel()
  } else {
    start()
    return req
  }
}, (error) => {
  console.log("error", error);
  xMessage({
    type: 'error',
    message: error.message,
  })
})

axios.interceptors.response.use((res) => {
  console.log("响应", res);

  done()

  if (res.data.code == 200) {
    return Promise.resolve(res.data.data)
  } else if (res.data.code == 403) {
    sessionStorage.clear()
    LoginRegister()
    return Promise.reject(res.data.msg)
  }
}, (error) => {
  console.log(error.message)
  done()

  if (error.code === 'ECONNABORTED' && error.message.indexOf('timeout') !== -1) {
    xMessage({
      message: error.message,
      type: 'error',
    })
    return Promise.reject("请求超时")
  } else if (error.message.includes("cancelToken") != -1) {
    return Promise.reject("用户未登录")
  } else {
    xMessage({
      message: error.message,
      type: 'error',
    })
    return Promise.reject("其他错误")
  }
})

let timer

const start = () => {
  const progress: HTMLElement | null = document.querySelector('.header-block')

  progress?.style.setProperty('--transition-time', '.3s')

  let progressWidth = 0

  clearInterval(timer)
  timer = setInterval(() => {
    progress?.style.setProperty('--progress-width', progressWidth + '%')

    if (progressWidth < 70) {
      progressWidth += Math.random() * 5
    }
  }, 300)
}

const done = () => {
  clearInterval(timer)

  const progress: HTMLElement | null = document.querySelector('.header-block')

  progress?.style.setProperty('--transition-time', '0')
  progress?.style.setProperty('--progress-width', '100%')

  setTimeout(() => {
    progress?.style.setProperty('--progress-width', '0')
  }, 200)
}

export default axios