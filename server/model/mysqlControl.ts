
import  mysqlPoolCtl from '../dataBaseControl/mysqlLink';
const sqlStringTool = mysqlPoolCtl.getSqlStringMethod();
let mysqlPool = null;
let {loggerErr} = require('../utils/logger')
export  function mySqlPoolOrder(sql) {
    if (mysqlPool === null) {
        mysqlPool = mysqlPoolCtl.getMysqlPool();
    }
    let promise = new Promise((resolve, reject) => {
        let runList = [];
        if (Array.isArray(sql)) {
            runList = sql
        } else {
            runList.push(sql);
        }
        mysqlPool.getConnection(function (err, connection) {
            if (err) {
                loggerErr.error('mysqlControl : 获得线程出错',err);
                return;
            }
            // 使用返回的链接
            var resultList = [];
            queryHandle(connection);
            function queryHandle(connection) {
                var sqlString = runList.shift();
                connection.query(sqlString, function (error, results, fields) {
                    if (error) {
                        loggerErr.error('mysqlControl : query 线程出错',err);
                        reject('sql Err');
                        return;
                    }
                    resultList.push(results);

                    if (runList.length > 0) {
                        queryHandle(connection);
                    } else {
                        connection.release();
                        //全部查询完成
                        var res = resultList.length == 1 ? resultList[0] : resultList;
                        resolve(res);
                    }
                });
            }
        });
    });
    return promise;
}
mySqlPoolOrder.closePool = mysqlPoolCtl.closePool

export let makeSqlString = {
    getSearchSqlString: (opt) => {
        let sql = 'SELECT ?? FROM ?? ';
        let keySqlStr:string|object = '';
        let inserts = [opt.getValue, opt.tableName];
        if (typeof opt.getValue === 'string') {
            sql = `SELECT ${opt.getValue} FROM ??`;
            inserts = [opt.tableName]
        }
        if (typeof opt.key === 'object') {
            sql = sql + 'WHERE ?';
            keySqlStr = makeSqlString.objToSqlString(opt.key);
            inserts.push(keySqlStr);
        } else if (typeof opt.key === 'string') {
            sql = 'SELECT ?? FROM ?? WHERE ' + opt.key;
        }

        sql = sqlStringTool.format(sql, inserts);
        return sql;
    },
    getInsertSqlString: (opt) => {
        var sql = 'INSERT INTO ??(??) VALUE (?)';
        var keyArr = [];
        var valueArr = [];
        var insertOpt = opt.insertOpt;
        for (let key in insertOpt) {
            keyArr.push(key);
            valueArr.push(insertOpt[key]);
        }
        var inserts = [opt.tableName, keyArr, valueArr];
        sql = sqlStringTool.format(sql, inserts);
        return sql;
    },
    getUpDataSqlString: (opt) => {
        var sql = 'UPDATE ?? SET ? WHERE ?';
        var valueSqlStr = makeSqlString.objToSqlString(opt.value);
        var keySqlStr = makeSqlString.objToSqlString(opt.key);
        var inserts = [opt.tableName, valueSqlStr, keySqlStr];
        return sql = sqlStringTool.format(sql, inserts);
    },
    objToSqlString: (obj) => {
        return {
            toSqlString: function () {
                return sqlStringTool.escape(this._insertObj)
            },
            _insertObj: obj
        }
    },
    formatSqlString: sqlStringTool.format
}
