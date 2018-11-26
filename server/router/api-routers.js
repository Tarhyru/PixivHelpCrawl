// 路由设置
// var getPixivData = require('../api/PixivCrawler/getPixivData.js');
const getPixivHotList = require('../api/PixivCrawler/getPixivHotList.js');
const customSearch = require('../api/PixivCrawler/customSearch.js');
const downloadControl = require('../api/PixivCrawler/pixivDownloadControl.js');
const addFilter = require('../api/PixivCrawler/addFilter.js');

const randomImg = require('../api/ImgControler/randomImg.js');
const proxyImg = require('../api/ImgControler/proxyImg.js');



var routerConfig = {
        // getPixivData:{
        //     type:'post',
        //     contrl:getPixivData.contrl
        // },
        getPixivHotList:{
            type:'post',
            contrl:getPixivHotList.contrl
        },
        addFilter:{
            type:'post',
            contrl:addFilter.contrl
        },
        makeSeachPlan:{
            type:'post',
            contrl:customSearch.makePlan
        },
        getPlanState:{
            type:'post',
            contrl:customSearch.getState
        },
        getPlanDetail:{
            type:'post',
            contrl:customSearch.getDetail
        },
        getPlanList:{
            type:'get',
            contrl:customSearch.getList
        },
        delPlanItem:{
            type:'post',
            contrl:customSearch.delItem
        },
        doCash:{
            type:'post',
            contrl:customSearch.createPreviewCash
        },
        // autoSerach:{
        //     type:'post',
        //     contrl:autoSerach.contrl
        // },
        download:{
            type:'post',
            contrl:downloadControl.contrl
        },
        randomImg:{
            type:'get',
            contrl:randomImg.contrl
        },
        proxyImg:{
            type:'get',
            contrl:proxyImg.contrl
        }
    }

module.exports =  routerConfig 