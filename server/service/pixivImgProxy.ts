import * as fs from 'fs-extra';
import * as Path from 'path';
import * as stream from 'stream';
import { promisify } from 'util';
import { pathConfig } from '../../config';
import { fromFile } from 'file-type';
import { loggerShow } from '../utils/logger';

const BasePath = pathConfig.cashPath;
fs.ensureDirSync(BasePath);
const pipeline = promisify(stream.pipeline);

export function parseTarget(target) {
    const pathInfo = Path.parse(target);
    const key = Buffer.from(pathInfo.dir).toString('base64');
    const targetName = `${key}-${pathInfo.name}${pathInfo.ext}`;
    const targetPath = Path.resolve(BasePath, `./${targetName}`);
    return {
        targetName,
        targetPath
    };
}
export function getTargetCash({ targetName, targetPath }) {
    if (fs.existsSync(targetPath)) {
        return fs.createReadStream(targetPath);
    }
    return null;
}
export function saveGotImgStream({ readStream, path }) {
    return new Promise(resolve => {
        readStream.on('response', async res => {
            // 请求成功
            if (res.statusCode !== 200) {
                resolve(false);
                return;
            }
            try {
                const savePath = `${path}.tmp`;
                await pipeline(readStream, fs.createWriteStream(savePath));
                // 下载文件完整性检查
                const size = Number(res.headers['content-length']);
                const mime = res.headers['content-type'];
                const fileInfo = fs.statSync(savePath);
                const fileType = await fromFile(savePath);
                if (
                    !isNaN(size) &&
                    fileInfo &&
                    fileType &&
                    fileInfo.size === size &&
                    fileType.mime === mime
                ) {
                    fs.renameSync(savePath, path);
                } else {
                    loggerShow.warn(
                        `saveGotImgStream download failed:`,
                        res.headers,
                        '\n',
                        fileInfo,
                        '\n',
                        fileType,
                        '\n',
                        path
                    );
                    resolve(false);
                    return;
                }
            } catch (error) {
                loggerShow.error(error);
                resolve(false);
                return;
            }

            resolve(true);
        });
    });
}