/*
 * H5专用
 * Alipay.com Inc.
 * Copyright (c) 2004-2015 All Rights Reserved.
 *
 * amc-h5.js
 *
 */

mqpH5 = {};
mqpH5.fn = {};
/**
 * 将鸟巢的富文本转换为HTML标签
 * @param  {[type]} str [description]
 */
mqpH5.fn.plainText2HTML = function(str) {
    if (!str || !str.length) {
        return str;
    }

    str = str.replace(/\n/g, '<br>');
    return str;
}