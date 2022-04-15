// 商家销量统计的横向柱状图
<template>
    <div class="com-container">
        <div class="title" :style="comStyle">
            <span>{{'▍' + showTitle}}</span>
            <span class="iconfont title-icon" :style="comStyle" @click="showChoice = !showChoice">&#xe6eb;</span>
            <div class="select-on" v-show="showChoice" :style="marginStyle">
                <div class="select-item" v-for="item in selectType" :key="item.key" @click="handlerSelect(item.key)">
                    {{item.text}}
                </div>
            </div>
        </div>
        <div class="com-chart" ref='trend_ref'></div>
    </div>
  
</template>

<script>
    import { mapState } from 'vuex'
    import { getThemeValue } from '../utils/theme_utils'
    export default {
        name:'Seller',
        data(){
            return {
                chartInstance:null,
                allData:null,       //服务器返回的数据
                showChoice:false,   //是否显示可选项
                choiceType:'map',   //显示数据类型
                titleFontSize:0,  //指明标题的字体大小
            }
        },
        created() {
            // 组件创建完成之后进行回调函数的注册
            this.$socket.registerCallBack('trendData', this.getData)
            
        },
        mounted() {
            // 图表在DOM元素加载后进行调用
            this.initChart()
            // this.getData()

            // console.log('---------发送数据给服务器,告诉服务器我现在需要数据-----------')
            // 发送数据给服务器,告诉服务器我现在需要数据
            this.$socket.send(
                {
                    action:'getData',
                    socketType:'trendData',
                    chartName:'trend',
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

            // 组件销毁的时候进行回调函数的取消
            this.$socket.unRegisterCallBack('trendData')
        },
        computed:{
            ...mapState(['theme']),
            selectType(){
                if(!this.allData){
                    return []
                }else{
                    return this.allData.type.filter((item)=>{
                        return item.key !== this.choiceType
                    })
                }
            },
            showTitle(){
                if(!this.allData){
                    return ''
                }else{
                    return this.allData[this.choiceType].title
                }
            },
            // 设置给标题的样式
            comStyle(){
                return{
                    fontSize:this.titleFontSize + 'px',
                    color:getThemeValue(this.theme).titleColor
                }
            },
            marginStyle(){
                return{
                    marginLeft:this.titleFontSize-23 + 'px'
                }
            }
        },
        methods:{
            // 初始化echartInstance对象
            initChart(){
                // 2.初始化echarts实例对象  init里边传入的是元素节点
                this.chartInstance = this.$echarts.init(this.$refs.trend_ref, this.theme)
                // 对图表初始化配置的控制
                const initOption = {
                    grid:{
                        top: '35%',
                        right: '4%',
                        left:'3%',
                        bottom:'1%',
                        containLabel:true       //把坐标轴的文字控制在大小范围当中
                    },
                    xAxis:{
                        type:'category',
                        boundaryGap:false
                    },
                    yAxis:{ 
                        type:'value',
                    },
                    // 设置背景
                    tooltip:{
                        trigger:'axis',
                    },
                    legend:{
                        left:20,
                        top:'15%',
                        icon:'circle'
                    },
                }
                this.chartInstance.setOption(initOption)

            },

            // 获取服务器数据

            // ret就是服务器发送给客户端的图表的数据
            getData(ret){
                // http://127.0.0.1:8888/api/seller
                // AJAX请求
                // const {data:ret} = await this.$http.get('trend')
                this.allData = ret

                // console.log(this.allData)
                this.updataChart()
 
                
                
            },

            // 更新图表
            updataChart(){
                // 半透明的颜色
                const colorArr1 = [
                    'rgba(11,168,44,0.5)',
                    'rgba(44,110,255,0.5)',
                    'rgba(22,242,217,0.5)',
                    'rgba(254,33,30,0.5)',
                    'rgba(250,105,0,0.5)'
                ]
                // 全透明的颜色
                const colorArr2 = [
                    'rgba(11,168,44,0)',
                    'rgba(44,110,255,0)',
                    'rgba(22,242,217,0)',
                    'rgba(254,33,30,0)',
                    'rgba(250,105,0,0)'
                ]


                // 类目轴的数据
                const timeArr = this.allData.common.month

                // Y轴数据
                const valueArr = this.allData[this.choiceType].data

                // 形成每一条折线图
                const seriesArr = valueArr.map((item,index)=>{
                    return {
                        name:item.name,
                        type:"line",
                        data:item.data,
                        stack:this.choiceType,
                        areaStyle:{
                            color: new this.$echarts.graphic.LinearGradient(0,0,0,1,[
                                {
                                    offset:0,
                                    color:colorArr1[index]
                                },
                                {
                                    offset:1,
                                    color:colorArr2[index]      //100%时候的颜色
                                },
                            ])
                        },
                    }
                })
                
                const legendArr = valueArr.map((item)=>{
                    return item.name
                    
                })
                
                // 设置配置项
                const dataOption={
                    xAxis:{
                        data:timeArr
                    },
                    legend:{
                        data:legendArr
                    },
                    series:seriesArr
                }
                this.chartInstance.setOption(dataOption)
            },
 
            // 当浏览器窗口发生变化时调用，完成屏幕的适配
            screenAdapter(){
                this.titleFontSize = this.$refs.trend_ref.offsetWidth / 100 * 3.6

                // 和分辨率大小相关的配置项
                const adapterOption = {
                    legend:{
                        itemWidth:this.titleFontSize,
                        itemHeight:this.titleFontSize,
                        itemGap:this.titleFontSize,
                        textStyle:{
                            fontSize:this.titleFontSize / 2
                        }
                    },
                    
                }
                this.chartInstance.setOption(adapterOption)
                // 手动的调用图表的resize()方法才能有效果
                this.chartInstance.resize()
            },
            handlerSelect(currentType){
                this.choiceType = currentType
                this.updataChart()
                this.showChoice = false
            }
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
    .title{
        position: absolute;
        left: 20px;
        top: 20px;
        z-index: 10;
        color:white;
        .title-icon{
            margin-left: 10px;
            cursor: pointer;

        }
        .select-con{
            background-color: #222733;
        }
    }

</style>