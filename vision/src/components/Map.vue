// 商家销量统计的横向柱状图
<template>
    <div class="com-container" @dblclick="revertMap">
        
        <div class="com-chart" ref='map_ref'></div>
    </div>
  
</template>

<script>
    import { mapState } from 'vuex'
    import axios from 'axios'
    import {getProvinceMapInfo} from '../utils/map_utils'
    export default {
        name:'Map',
        data(){
            return {
                chartInstance:null,
                allData:null,       //服务器返回的数据
                mapData:{}      //所获取的省份地图矢量数据
            }
        },
        created() {
            // 组件创建完成之后进行回调函数的注册
            this.$socket.registerCallBack('mapData', this.getData)
            
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
        mounted() {
            // 图表在DOM元素加载后进行调用
            this.initChart()
            // this.getData()

            // 发送数据给服务器,告诉服务器我现在需要数据
            this.$socket.send(
                {
                    action:'getData',
                    socketType:'mapData',
                    chartName:'map',
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
            this.$socket.unRegisterCallBack('mapData')
        },
        methods:{
            // 初始化echartInstance对象
            async initChart(){
                // 2.初始化echarts实例对象  init里边传入的是元素节点
                this.chartInstance = this.$echarts.init(this.$refs.map_ref, this.theme)
                // 获取中国的矢量数据 这个是在客户端  这里用locoalhost不要用127.0.0.1
                // http://127.0.0.1:8080/static/map/china.json  不能使用this.$http
                const ret = await axios.get('http://localhost:8080/static/map/china.json')
                

                // 注册地图数据
                this.$echarts.registerMap('china', ret.data)

                // 对图表初始化配置的控制
                const initOption = {
                    title:{
                        text:"▍商家分布",
                        left:20,
                        top:20,
                    },
                    // 配置GEO
                    geo:{
                       type:'map',
                       map:'china',
                       top:'5%',
                       bottom:'5%',
                       itemStyle:{
                           areaColor:'#2E72BF',
                           borderColor:'#333',
                       },
                    },
                    legend:{
                        left:'5%',
                        bottom:'5%',
                        orient:'vertical',      //图例摆放的方向
                    }
                }
                this.chartInstance.setOption(initOption)


                this.chartInstance.on('click',async (arg)=>{
                    // arg.name能得到省份名字
                    const provinceInfo = getProvinceMapInfo(arg.name)
                    // 获取各个省份的矢量数据
                    // 判断缓存中是否存在地图矢量数据
                    if(!this.mapData[provinceInfo.key]){
                        const ret = await axios.get('http://localhost:8080' + provinceInfo.path)

                        this.mapData[provinceInfo.key] = ret.data
                        this.$echarts.registerMap(provinceInfo.key, ret.data)
                    }
                    const changeOption ={
                        geo:{
                            map:provinceInfo.key
                        },
                    }

                    this.chartInstance.setOption(changeOption)

                })

            },

            // 获取服务器数据
            getData(ret){
                // http://127.0.0.1:8888/api/seller
                // AJAX请求
                // const {data:ret} = await this.$http.get('map')
                this.allData = ret
                this.updataChart()
 
                
                
            },

            // 更新图表
            updataChart(){

                // 图例数据
                const legendArr = this.allData.map((item)=>{
                    return item.name
                })

                const seriesArr = this.allData.map((item,index)=>{
                    // 返回的对象是一个类别的所有散点
                    // 需要给散点的图表添加coordinateSystem:geo
                    return {
                        name:item.name,
                        rippleEffect:{      //控制涟漪的效果
                            scale:5,
                            brushType:'stroke',
                        },
                        type:"effectScatter",
                        data:item.children,
                        coordinateSystem:'geo',
                    }
                })
        
                // 设置配置项
                const dataOption={
                    legend:{
                        data:legendArr
                    },
                    series:seriesArr
                }
                this.chartInstance.setOption(dataOption)
            },
 
            // 当浏览器窗口发生变化时调用，完成屏幕的适配
            screenAdapter(){
                this.titleFontSize = this.$refs.map_ref.offsetWidth / 100 * 3.6

                // 和分辨率大小相关的配置项
                const adapterOption = {

                    title:{
                        textStyle:{
                            fontSize:this.titleFontSize 
                        }
                    },
                    legend:{
                        itemWidth:this.titleFontSize / 2,
                        itemHeight:this.titleFontSize / 2,
                        itemGap:this.titleFontSize / 2,
                        textStyle:{
                            fontSize:this.titleFontSize / 2
                        }
                    },
                    
                }
                this.chartInstance.setOption(adapterOption)
                // 手动的调用图表的resize()方法才能有效果
                this.chartInstance.resize()
            },
            revertMap(){
                const revertOption={
                    geo:{
                        map:'china'
                    }
                }
                this.chartInstance.setOption(revertOption )
            }
        }
    }
</script>

<style lang = 'less' scoped>

</style>