

const servicePath = '../';
const manPath = '../../';
const requireMehod = require(servicePath + 'router/refPath.js');

const pixivDownloadModel = requireMehod('pixivDownloadModel');
const getPixivData = requireMehod('getPixivData');
const checkImg = requireMehod('checkImg');
const downloadImg = requireMehod('downloadImg');

const publicClass = require('./publicClass/concurrentHandle.js');
const getPixivImgOriginalClass = new publicClass();

const PathConfig = require(manPath + 'config/index.js')['pathConfig'];
const webPath = PathConfig.webPath;

async function handleUpitem(queryItem) {
    let imgId = queryItem;
    let result = {
        imgId: imgId
    };
    if (await isExist(imgId)) {
        console.log('getPixivImgOriginal:', imgId, '数据库及本地均存在，无需查询');
        result.state = 'isExist'
        return result;
    }
    let queryUrl = `https://www.pixiv.net/member_illust.php?mode=medium&illust_id=${imgId}`;
    let getMonomers = new getPixivData.MonomersClass();

    //获得下载地址
    let queryObj = null;
    await getMonomers.contrl(queryUrl).then((res) => {
        //此处也能拿到别的信息，可以扩展
        result.downUrl = res.urls.original;
        queryObj = res;
        result.state = 'queryOver';
    }).catch((err) => {
        console.log(err)
    });
    //下载，及获得保存信息
    await downloadImg(result.downUrl).then((dres) => {
        result.fileName = dres.fileName;
        result.imgPath = dres.imgPath;
        result.state = 'downOver';
    });
    //保存下载后的信息至数据库
    if (result.state === 'downOver') {
        //这里的await其实可以去掉
        await pixivDownloadModel.downImgInsertSql({
            illustTitle: queryObj.illustTitle,
            fileName: result.fileName,
            imgPath: result.imgPath,
            userName: queryObj.userName,
            tags: queryObj.tags,
            userId: queryObj.userId,
        }, 'YunTest');
    }

    return result
}
async function isExist(imgId) {
    let imgPath = await pixivDownloadModel.searchPath(imgId);
    if (imgPath === false) {
        return false;
    }
    let imgSavePath = webPath + imgPath[0].imgPath;
    console.log(imgSavePath);
    if (checkImg(imgSavePath)) {
        return true;
    }
    return false;
}
getPixivImgOriginalClass.queryInit({
    queryName: 'getPixivImgOriginal',
    step: handleUpitem, //单次操作 通常是async函数，返回需要的结果值
})

let getPixivImgOriginal = {
    /**
     *  实际的调用入口 
    */
    downList: function (queryList) {
        getPixivImgOriginalClass.queryStart(queryList);

        return getPixivImgOriginalClass.overControl();
    },
    addList:function(queryList){
        getPixivImgOriginalClass.queryAddToWaitList(queryList);
    } 
}
module.exports = getPixivImgOriginal