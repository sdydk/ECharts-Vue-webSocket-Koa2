// 商家销量统计的横向柱状图
<template>
    <div class="com-container" >
        <div class="com-chart" ref='stock_ref'></div>
    </div>
  
</template>

<script>
    import { mapState } from 'vuex'
    export default {
        name:'Stock',
        data(){
            return {
                chartInstance:null,
                allData:null,       //服务器返回的数据
                currentIndex:0,
                timerId:null,

            }
        },
        created() {
            // 组件创建完成之后进行回调函数的注册
            this.$socket.registerCallBack('stockData', this.getData)
            
        },
        mounted() {
            // 图表在DOM元素加载后进行调用
            this.initChart()
            // this.getData()
            this.$socket.send(
                {
                    action:'getData',
                    socketType:'stockData',
                    chartName:'stock',
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
            this.$socket.unRegisterCallBack('stockData')
        },
        methods:{
            // 初始化echartInstance对象
            async initChart(){
                // 2.初始化echarts实例对象  init里边传入的是元素节点
                this.chartInstance = this.$echarts.init(this.$refs.stock_ref, this.theme)

                // 对图表初始化配置的控制
                const initOption = {
                    title:{
                        text:"▍库存和销量分析",
                        left:20,
                        top:20,
                    },
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
                // const {data:ret} = await this.$http.get('stock')
                this.allData = ret
                this.updataChart()
                this.startInterval()
 
                
                
            },

            // 更新图表
            updataChart(){
                const centerArr=[
                    ['18%','40%'],
                    ['50%','40%'],
                    ['82%','40%'],
                    ['34%','75%'],
                    ['66%','75%'],
                ]
                const colorArr=[
                    ['#4FF778','#0BA82C'],
                    ['#E5DD45','#E8B11C'],
                    ['#E8821C','#E55445'],
                    ['#5052EE','#AB6EE5'],
                    ['#23E5E5','#2E72BF'],
                ]
                const start = this.currentIndex * 5
                const end = (this.currentIndex + 1) *5
                const showData = this.allData.slice(start,end).map((item,index)=>{
                    return {
                        type:'pie',
                        
                        center:centerArr[index],
                        hoverAnimation:false,       //关闭鼠标引入时的动画效果
                        labelLine:{
                            show:false
                        },
                        label:{
                            position:'center',
                            color:colorArr[index][0]
                        },
                        data:[
                            {
                                name:item.name + '\n\n' + item.sales,
                                value:item.sales, 
                                itemStyle:{
                                    color: new this.$echarts.graphic.LinearGradient(0,1,0,0,[
                                        {
                                            offset:0,
                                            color:colorArr[index][0]
                                        },
                                        {
                                            offset:1,
                                            color:colorArr[index][1]
                                        },
                                    ])
                                }
                            },
                            {
                                value:item.stock,
                                itemStyle:{
                                    color:'#333843'
                                }
                            },
                        ]
                    }
                })
                
                // 设置配置项
                const dataOption={
                    series:showData
                }
                this.chartInstance.setOption(dataOption)
            },
 
            // 当浏览器窗口发生变化时调用，完成屏幕的适配
            screenAdapter(){
                this.titleFontSize = this.$refs.stock_ref.offsetWidth / 100 * 3.6
                const innerRadius = this.titleFontSize * 2.8
                const outterRadius = innerRadius * 1.125
                // 和分辨率大小相关的配置项
                const adapterOption = {

                    title:{
                        textStyle:{
                            fontSize:this.titleFontSize 
                        }
                    },
                    series:[
                        {
                            type:'pie',
                            radius:[outterRadius,innerRadius],
                            label:{
                                fontSize:this.titleFontSize/2
                            },
                        },
                        {
                            type:'pie',
                            radius:[outterRadius,innerRadius],
                            label:{
                                fontSize:this.titleFontSize /2
                            },
                        },
                        {
                            type:'pie',
                            radius:[outterRadius,innerRadius],
                            label:{
                                fontSize:this.titleFontSize/2
                            },
                        },
                        {
                            type:'pie',
                            radius:[outterRadius,innerRadius],
                            label:{
                                fontSize:this.titleFontSize/2
                            },
                        },
                        {
                            type:'pie',
                            radius:[outterRadius,innerRadius],
                            label:{
                                fontSize:this.titleFontSize/2
                            },
                        }
                    ],
                    
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
                    this.currentIndex++
                    if(this.currentIndex >1){
                        this.currentIndex = 0
                    }
                    this.updataChart()
                },5000)
            }
        },
        computed: {
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
    }
</script>

<style lang = 'less' scoped>
</style>