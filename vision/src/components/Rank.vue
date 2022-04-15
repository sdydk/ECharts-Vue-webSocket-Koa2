// 商家销量统计的横向柱状图
<template>
    <div class="com-container" >
        <div class="com-chart" ref='rank_ref'></div>
    </div>
  
</template>

<script>
    import { mapState } from 'vuex'
    export default {
        name:'Rank',
        data(){
            return {
                chartInstance:null,
                allData:null,       //服务器返回的数据
                startValue:0,       //区域缩放的起点值
                endValue:9,
                timerId:null,
            }
        },
        created() {
            // 组件创建完成之后进行回调函数的注册
            this.$socket.registerCallBack('rankData', this.getData)
            
        },
        computed:{
            ...mapState(['theme']),

        },
        watch: {
           theme(){
               this.chartInstance.dispose()        //销毁当前的图表
               this.initChart()
               this.screenAdapter()
               this.updataChart()
           }
        },
        
        mounted() {
            // 图表在DOM元素加载后进行调用
            this.initChart()
            // this.getData()
            // 发送数据给服务器,告诉服务器我现在需要数据
            this.$socket.send(
                {
                    action:'getData',
                    socketType:'rankData',
                    chartName:'rank',
                    value:'',
                }
            )
            window.addEventListener('resize',this.screenAdapter)

            // 在页面加载完成的时候主动进行屏幕适配
            this.screenAdapter()

            
        },
        destroyed() {

            // 组件销毁的时候需要将监听器取消掉
            window.removeEventListener('resize',this.screenAdapter)
            clearInterval(this.timerId)

            // 组件销毁的时候进行回调函数的取消
            this.$socket.unRegisterCallBack('rankData')
        },
        methods:{
            // 初始化echartInstance对象
            async initChart(){
                // 2.初始化echarts实例对象  init里边传入的是元素节点
                this.chartInstance = this.$echarts.init(this.$refs.rank_ref, this.theme)

                // 对图表初始化配置的控制
                const initOption = {
                    xAxis:{
                        type:'category'
                    },
                    yAxis:{
                        type:'value'
                    },
                    series:[
                        {
                            type:'bar'
                        }
                    ],
                    title:{
                        text:"▍地区销售排榜",
                        left:20,
                        top:20,
                    },
                    grid:{
                        top:'40%',
                        left:'5%',
                        right:'5%',
                        bottom:'5%',
                        containLabel:true
                    },
                    tooltip:{
                        show:true
                    },
                    legend:{
                        left:'5%',
                        bottom:'5%',
                        orient:'vertical',      //图例摆放的方向
                    }
                }
                this.chartInstance.setOption(initOption)
                this.chartInstance.on('mouseover',()=>{
                    clearInterval(this.timerId)
                })
                this.chartInstance.on('mouseout',()=>{
                    this.startInterval()
                })



            },

            // 获取服务器数据
            getData(ret){
                // http://127.0.0.1:8888/api/seller
                // AJAX请求
                // const {data:ret} = await this.$http.get('rank')
                this.allData = ret
                this.allData.sort((a,b)=>{
                    return b.value - a.value
                })
                this.updataChart()
                this.startInterval()
 
                
                
            },

            // 更新图表
            updataChart(){

                const colorArr = [
                    ['#0BA82C','#4FF778'],
                    ['#2E72BF','#23E5E5'],
                    ['#5052EE','#AB6EE5'],
                ]

                // 所有省份的数组
                const provinceArr = this.allData.map((item)=>{
                    return item.name
                })
                // 销售金额
                const valueArr = this.allData.map((item)=>{
                    return item.value
                })
                // 设置配置项
                const dataOption={
                    xAxis:{
                        data:provinceArr,
                    },
                    dataZoom:{
                        show:false,
                        startValue:this.startValue,
                        endValue:this.endValue,
                    },
                    series:[
                        {
                            data:valueArr,
                            itemStyle:{
                                color:(arg)=>{
                                    let targetColorArr = null
                                    if(arg.value>300){
                                        targetColorArr = colorArr[0]
                                        return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1,[
                                            {
                                                offset:0,
                                                color:targetColorArr[0]
                                            },
                                            {
                                                offset:1,
                                                color:targetColorArr[1]
                                            },
                                        ])
                                    }else if(arg.value>200){
                                        targetColorArr = colorArr[1]
                                        return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1,[
                                            {
                                                offset:0,
                                                color:targetColorArr[0]
                                            },
                                            {
                                                offset:1,
                                                color:targetColorArr[1]
                                            },
                                        ])
                                    }else{
                                        targetColorArr = colorArr[2]
                                        return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1,[
                                            {
                                                offset:0,
                                                color:targetColorArr[0]
                                            },
                                            {
                                                offset:1,
                                                color:targetColorArr[1]
                                            },
                                        ])
                                    }
                                }
                            },
                        }
                    ],
                }
                this.chartInstance.setOption(dataOption)
            },
 
            // 当浏览器窗口发生变化时调用，完成屏幕的适配
            screenAdapter(){
                this.titleFontSize = this.$refs.rank_ref.offsetWidth / 100 * 3.6

                // 和分辨率大小相关的配置项
                const adapterOption = {

                    title:{
                        textStyle:{
                            fontSize:this.titleFontSize 
                        }
                    },
                    series:[{
                        barWidth:this.titleFontSize,
                        itemStyle:{
                            barBorderRadius:[this.titleFontSize / 2, this.titleFontSize / 2, 0, 0]
                        },
                    }],
                    
                }
                this.chartInstance.setOption(adapterOption)
                // 手动的调用图表的resize()方法才能有效果
                this.chartInstance.resize()
            },
            startInterval(){
                if(this.timerId){
                    clearInterval(this.timerId)
                }
                this.timerId = setInterval(()=>{
                    this.startValue++
                    this.endValue++
                    if(this.endValue > this.allData.length - 1){
                        this.startValue = 0
                        this.endValue = 9 
                    }
                    this.updataChart()
                },2000)
            },
        }
    }
</script>

<style lang = 'less' scoped>

</style>