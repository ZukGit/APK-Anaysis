if (typeof(amc) == 'undefined') {
    throw 'amc is undefined';
}

amc.ext = amc.ext || {};

/**
 * 处理服务端返回的问卷数据：
 * {
 *   dataType: usq,
 *   dataId: 1
 * }
 * @param userId 用户纬度控制疲劳度数据，如果缺失，不做处理
 * @param cashierCfgData 服务端下发的id数据
 */
amc.ext.processCashierCfgDate = function(userId, cashierCfgData) {
    if (!userId || !cashierCfgData) {
        return;
    }
    amc.ext.userId = userId;
    var cfgJson = {};
    try {
        cfgJson = JSON.parse(cashierCfgData);
    } catch (e) {
        return;
    }
    var dataId = cfgJson.dataType;
    var dataVersion = cfgJson.dataId;

    amc.ext.dataId = dataId;

    document.invoke('wifiInfo', function(wifiInfo) {
        setTimeout(function() {
            if (wifiInfo && wifiInfo.wifiInfo) {
                amc.ext.wifiInfo = wifiInfo.wifiInfo;
            }
        }, 1);
    });

    document.invoke('location', function(lbsInfo) {
        if (lbsInfo) {
            setTimeout(function() {
                amc.ext.lbsInfo = lbsInfo;
            }, 1);
        }
    });

    amc.fn.fetchCache(userId + dataId, function(data) {
        if (data) {
            amc.ext.cashierQuestionData = data.content;
            amc.ext.fatigueData = data.fatigueData;
        }
        if (!data || dataVersion != data.version) {
            amc.fn.fetchCashierRpc('/cashier/cfgData', {
                'dataType': dataId,
                'dataId': dataVersion
            }, function(data) {
                if (data && data.dataContent) {
                    var content;
                    try {
                        content = JSON.parse(data.dataContent).content;
                    } catch (e) {
                        // ignore
                    }

                    if (content) {
                        if (!content.fatigueCfg) {
                            content.fatigueCfg = {
                                'week': 1,
                                'month': 1,
                                'threshold': 1
                            };
                        }
                        var fatigueCfg = content.fatigueCfg;
                        fatigueCfg.week = fatigueCfg.week || 1;
                        fatigueCfg.month = fatigueCfg.month || 1;
                        fatigueCfg.threshold = fatigueCfg.threshold || 1;

                        amc.ext.cashierQuestionData = content;
                        amc.ext.fatigueData = [];
                        amc.fn.putCache(userId + dataId, {
                            'version': dataVersion,
                            'content': content,
                            'fatigueData': amc.ext.fatigueData
                        }, true);
                    }
                }
            });
        }
    }, true);
};

/**
 * 处理收银台退出流程
 * @param exitCashier function类型，最终的退出收银台操作
 */
amc.ext.processCashierCfgExit = function(exitCashier) {
    var content = amc.ext.cashierQuestionData;

    if (!content || !amc.ext.showCashierUsqData(content.fatigueCfg)) {
        exitCashier();
        return;
    }

    var quest = content.questions;

    if (quest) {
        var data = {};
        if (content.title) {
            data.title = content.title;
        }

        var btns = [];
        for (var i = 0; i < quest.length; i = i + 1) {
            btns.push(quest[i].item);
        }

        data.btns = btns;
        var cancelBtn = content.cancelBtn || '取消';
        if (amc.isIOS) {
            data.cancelBtn = cancelBtn;
        } else {
            btns.push(cancelBtn);
            data.needCancel = true;
        }

        var usqSpmMap = {
            'uid': amc.ext.userId,
            'tradeNo': amc.fn.getTradeNo()
        };

        if (amc.ext.wifiInfo) {
            usqSpmMap.wifiInfo = amc.ext.wifiInfo;
        }

        if (amc.ext.lbsInfo) {
            var lbsInfo = amc.ext.lbsInfo;
            usqSpmMap.longitude = lbsInfo.longitude;
            usqSpmMap.latitude = lbsInfo.latitude;
            usqSpmMap.accuracy = lbsInfo.accuracy;
        }

        document.actionSheet(data, function(data) {
            if (data && (data.index != undefined) && data.index < quest.length) {
                var selectedItem = quest[data.index];
                amc.fn.spmClick(selectedItem.spmId, usqSpmMap);
            } else if (data && data.index == quest.length && content.cancelSpmId) {
                amc.fn.spmClick(content.cancelSpmId, usqSpmMap);
            }
            exitCashier();
        });

        if (content.queSpmId) {
            amc.fn.spmExposure(content.queSpmId, usqSpmMap);
        }

        var fatigueData = amc.ext.fatigueData;
        fatigueData.push(new Date().getTime());
        amc.fn.putCache(amc.ext.userId + amc.ext.dataId, {
            'fatigueData': fatigueData
        }, true);
    } else {
        exitCashier();
    }
};

/**
 * 判断是否展示调查问卷
 * @param fatigueCfg 疲劳度配置数据，周，月，总次数三个纬度限制
 */
amc.ext.showCashierUsqData = function(fatigueCfg) {
    var fatigueData = amc.ext.fatigueData;
    var current = new Date();
    var MONTH_LIMIT = current.getTime() - 30 * 24 * 3600 * 1000;
    var WEEK_LIMIT = current.getTime() - 7 * 24 * 3600 * 1000;

    var monTime = 0;
    var weekTime = 0;
    var totalTime = fatigueData.length;

    for (var i = 0; i < fatigueData.length; i++) {
        if (WEEK_LIMIT <= fatigueData[i]) {
            monTime = monTime + 1;
            weekTime = weekTime + 1;
        } else if (MONTH_LIMIT <= fatigueData[i]) {
            monTime = monTime + 1;
        }
    }

    if (weekTime >= fatigueCfg.week || monTime >= fatigueCfg.month || totalTime >= fatigueCfg.threshold) {
        return false;
    }
    return true;
};
