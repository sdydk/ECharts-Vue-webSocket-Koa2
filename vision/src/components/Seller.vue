// 商家销量统计的横向柱状图
<template>
    <div class="com-container">
        <div class="com-chart" ref='seller_ref'></div>
    </div>
  
</template>

<script>
    import { mapState } from 'vuex'
    export default {
        name:'Seller',
        data(){
            return {
                chartInstance:null,
                allData:null,       //服务器返回的数据
                currentPage:1,      //当前显示的页数
                totalPage:0,        //一共有多少页
                timerId:null        //定时器标识
            }
        },
        created() {
            // 组件创建完成之后进行回调函数的注册
            this.$socket.registerCallBack('sellerData', this.getData)
            
        },
        mounted() {
            // 图表在DOM元素加载后进行调用
            this.initChart()
            // this.getData()

            this.$socket.send(
                {
                    action:'getData',
                    socketType:'sellerData',
                    chartName:'seller',
                    value:'',
                }
            )
            window.addEventListener('resize',this.screenAdapter)

            // 在页面加载完成的时候主动进行屏幕适配
            this.screenAdapter()

            
        },
        destroyed() {
            clearInterval(this.timerId)

            // 组件销毁的时候需要将监听器取消掉
            window.removeEventListener('resize',this.screenAdapter)
            // 组件销毁的时候进行回调函数的取消
            this.$socket.unRegisterCallBack('sellerData')
        },
        methods:{
            // 初始化echartInstance对象
            initChart(){
                // 2.初始化echarts实例对象  init里边传入的是元素节点
                this.chartInstance = this.$echarts.init(this.$refs.seller_ref, this.theme)

                // 对图表初始化配置的控制
                const initOption = {
                    title:{
                        text:'📑商家销售统计',
                        left:20,
                        top:20
                    },
                    grid:{
                        top: '20%',
                        right: '6%',
                        left:'3%',
                        bottom:'3%',
                        containLabel:true
                    },
                    xAxis:{
                        type:'value'
                    },
                    yAxis:{ 
                        type:'category',
                    },
                    // 设置背景
                    tooltip:{
                        trigger:'axis',
                        axisPointer:{
                            z:0,
                            type:'line',
                            lineStyle:{
                                color:'#2D3443'
                            },
                        },
                    },
                    series:[
                        {
                            type:'bar',
                            label:{
                                show:true,
                                position:'right',
                                textStyle:{
                                    color:'white'
                                },
                            },
                            itemStyle:{

                                // 线性渐变  颜色渐变的方向；不同百分比之下颜色的值
                                color: new this.$echarts.graphic.LinearGradient(0,0,1,0,[{
                                    offset:0,
                                    color:'#5052EE'
                                },{
                                    offset:1,
                                    color:'#AB6EE5'
                                }])
                            }
                        }
                    ],
                }
                this.chartInstance.setOption(initOption)


                this.chartInstance.on('mouseover',()=>{
                    clearInterval(this.timerId)
                })
                this.chartInstance.on('mouseout',()=>{
                    
                    this.satrtInterval()
                })
            },

            // 获取服务器数据
            getData(ret){
                // http://127.0.0.1:8888/api/seller
                // AJAX请求
                // const {data:ret} = await this.$http.get('seller')
                this.allData = ret
                // 对数据进行排序  从小到大
                this.allData.sort((a,b)=>{
                    return a.value - b.value
                })
                this.totalPage = this.allData.length % 5 === 0 ? this.allData.length / 5 : this.allData.lenght / 5 + 1
        
                this.updataChart()
                // 启动定时器
                this.satrtInterval()
                
                
            },

            // 更新图表
            updataChart(){
                const start = (this.currentPage - 1) * 5
                const end = this.currentPage * 5

                const showData = this.allData.slice(start, end)

                const sellerNames = showData.map((item)=>{ return item.name})  
                const sellerValue = showData.map((item)=>{ return item.value})
                // 设置配置项
                const dataOption={
                    
                    yAxis:{ 
                        data:sellerNames
                    },
                
                    series:[
                        { 
                            data:sellerValue
                        }
                    ],
                }
                this.chartInstance.setOption(dataOption)
            },
            // 设置定时器
            satrtInterval(){
                if(this.timerId){
                    clearInterval(this.timerId)
                }
                this.timerId = setInterval(()=>{
                    this.currentPage++
                    if(this.currentPage > this.totalPage){
                        this.currentPage = 1
                    }
                    this.updataChart()
                },3000)
            },
            // 当浏览器窗口发生变化时调用，完成屏幕的适配
            screenAdapter(){
                const titleFontSize = this.$refs.seller_ref.offsetWidth / 100 * 3.6

                // 和分辨率大小相关的配置项
                const adapterOption = {
                    title:{
                        textStyle:{
                            fontSize:titleFontSize
                        }
                    },
                    // 设置背景
                    tooltip:{
                        axisPointer:{
                            lineStyle:{
                                width:titleFontSize,
                            },
                        },
                    },
                    series:[
                        {
                            barWidth:titleFontSize,
                            itemStyle:{
                                barBorderRadius:[0,titleFontSize/2,titleFontSize/2,0],
                            }
                        }
                    ],

                }
                this.chartInstance.setOption(adapterOption)
                // 手动的调用图表的resize()方法才能有效果
                this.chartInstance.resize()
            },
        },
        computed :{
            ...mapState(['theme']),
        },
         watch: {
            theme(){   //切换主题
                this.chartInstance.dispose()        //销毁当前的图表
                this.initChart()
                this.screenAdapter()
                this.updataChart()

            }
        },
    }
</script>

<style lange = 'less' scoped>

</style>