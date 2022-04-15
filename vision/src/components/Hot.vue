// 商家销量统计的横向柱状图
<template>
    <div class="com-container" >
        <div class="com-chart" ref='hot_ref'></div>
        <span class="iconfont arr-left" @click="toLeft" :style="comStyle">&#xe6ef;</span>
        <span class="iconfont arr-right" @click="toRight" :style="comStyle">&#xe6ed;</span>
        <span class="cat-name" :style="comStyle">{{catName}}</span>
    </div>
  
</template>

<script>
    import { mapState } from 'vuex'
    import { getThemeValue } from '../utils/theme_utils'
    export default {
        
        name:'Hot',
        data(){
            return {
                chartInstance:null,
                allData:null,       //服务器返回的数据
                currentIndex:0,     //当前所展示数据的一级分类数据
                titleFontSize:0,
            }
        },
        computed:{
            ...mapState(['theme']),
            catName(){
                if( !this.allData){
                    return ''
                }else{
                    return this.allData[this.currentIndex].name
                }
                
            },
            comStyle(){
                return {
                    fontSize:this.titleFontSize + 'px',
                    color:getThemeValue(this.theme).titleColor
                }
            },
        },
        created() {
            // 组件创建完成之后进行回调函数的注册
            this.$socket.registerCallBack('hotData', this.getData)
            
        },
        mounted() {
            // 图表在DOM元素加载后进行调用
            this.initChart()
            // this.getData()
            // 发送数据给服务器,告诉服务器我现在需要数据
            this.$socket.send(
                {
                    action:'getData',
                    socketType:'hotData',
                    chartName:'hotproduct',
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
            this.$socket.unRegisterCallBack('hotData')
        },
        watch: {
            theme(){
                this.chartInstance.dispose()        //销毁当前的图表
                this.initChart()
                this.screenAdapter()
                this.updataChart()

            }
        },
        methods:{
            // 初始化echartInstance对象
            async initChart(){
                // 2.初始化echarts实例对象  init里边传入的是元素节点
                this.chartInstance = this.$echarts.init(this.$refs.hot_ref, this.theme)

                // 对图表初始化配置的控制
                const initOption = {
                    series:[
                        {
                            type:'pie',
                            label:{
                                show:false
                            },
                            emphasis:{
                                label:{
                                    show:true
                                },
                                labelLine:{
                                    show:false
                                }
                            },
                        }
                    ],
                    title:{
                        text:"▍热销商品占比",
                        left:20,
                        top:20,
                    },
                    tooltip:{
                        show:true,
                        formatter:(arg)=>{
                            const thirdCategory= arg.data.children
                            let total = 0 
                            thirdCategory.forEach((item)=>{
                                total +=item.value
                            })
                            let retStr = ''
                            thirdCategory.forEach((item)=>{
                                retStr +=`${item.name}:${parseInt(item.value / total * 100) + '%'} <br/>`
                            })
                            return retStr
                        }
                    },
                    legend:{
                        top:'15%',
                        icon:'circle',
                    }
                }
                this.chartInstance.setOption(initOption)


            },

            // 获取服务器数据
            getData(ret){
                // http://127.0.0.1:8888/api/seller
                // AJAX请求
                // const {data:ret} = await this.$http.get('hotproduct')
                this.allData = ret
                this.updataChart()
 
                
                
            },

            // 更新图表
            updataChart(){
                const seriesData = this.allData[this.currentIndex].children.map((item)=>{
                    return {
                        name:item.name,
                        value:item.value,
                        children:item.children,
                    }
                })
                const legendData = this.allData[this.currentIndex].children.map((item)=>{
                    return item.name
                })
                
                // 设置配置项
                const dataOption={
                    legend:{
                        data:legendData,
                    },
                    series:[
                        {
                            data:seriesData,
                        }
                    ],
                }
                this.chartInstance.setOption(dataOption)
            },
 
            // 当浏览器窗口发生变化时调用，完成屏幕的适配
            screenAdapter(){
                this.titleFontSize = this.$refs.hot_ref.offsetWidth / 100 * 3.6

                // 和分辨率大小相关的配置项
                const adapterOption = {

                    title:{
                        textStyle:{
                            fontSize:this.titleFontSize 
                        }
                    },
                    legend:{
                        itemWidth:this.titleFontSize,
                        itemHeight:this.titleFontSize,
                        itemGap:this.titleFontSize / 2,
                        textStyle:{
                            fontSize:this.titleFontSize /2
                        }

                    },
                    series:[{
                        radius:this.titleFontSize * 4.5,
                        center:['50%','60%'],
                    }],
                    
                }
                this.chartInstance.setOption(adapterOption)
                // 手动的调用图表的resize()方法才能有效果
                this.chartInstance.resize()
            },
            toLeft(){
                this.currentIndex--
                if(this.currentIndex<0){
                    this.currentIndex = this.allData.length -1
                }
                this.updataChart()
            },
            toRight(){
                this.currentIndex++
                if(this.currentIndex > this.allData.length -1){
                    this.currentIndex = 0
                }
                this.updataChart()
            },
        }
    }
</script>

<style lang = 'less' scoped>
    .arr-left{
        position: absolute;
        left:10%;
        top:60%;
        transform: translateY(-50%);
        cursor: pointer;
        color: white;
    }
    .arr-right{
        position: absolute;
        right:10%;
        top:60%;
        transform: translateY(-50%);
        cursor: pointer;
        color: white;
        
    }
    .cat-name{
        position: absolute;
        left:80%;
        bottom: 20px;
        color: white;
    }

</style>