import Koa from 'koa';
import fs from 'fs';
import json from 'koa-json';
import onerror from 'koa-onerror';
import bodyparser from 'koa-bodyparser';
import staticServer from 'koa-static-server';
import gzip from 'koa-compress';
import apiRouter from '../router/api-routers';

const mainConfig = require('../../config/index');
const pathConfig = mainConfig['pathConfig'];
import generalResult from '../middleware/generalResult';
import { loggerErr, loggerRes } from '../utils/logger';

const app = new Koa();

onerror(app);
app.use(
    gzip({
        filter: function (content_type) {
            return /(javascript|text)/i.test(content_type);
        },
        threshold: 2048,
        flush: require('zlib').Z_SYNC_FLUSH
    })
);

app.use(
    bodyparser({
        enableTypes: ['json', 'form', 'text']
    })
);
app.use(json());

// logger
app.use(async (ctx, next) => {
    const start = new Date().getTime();
    loggerRes.info(`${ctx.method} ${ctx.url} - in`);
    generalResult(ctx);
    await next();
    const ms = new Date().getTime() - start;
    // if (ctx.status === 404) {
    //     ctx.status = 200;
    //     ctx.set('content-type', 'text/html; charset=utf-8');
    //     ctx.body = fs.createReadStream(`${pathConfig.webPath}/index.html`);
    // }
    loggerRes.info(`${ctx.method} ${ctx.url} - ${ms}ms - ${ctx.status}`);
});

app.use(apiRouter);

// 读取前端文件
app.use(
    staticServer({
        rootDir: pathConfig.webPath,
        rootPath: '/',
        notFoundFile: `index.html`
    })
);

// error-handling
app.on('error', (err, ctx) => {
    loggerErr.error('server error', err, ctx);
});

export default app;
