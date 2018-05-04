/*
 * Alipay.com Inc.
 * Copyright (c) 2006-2020 All Rights Reserved.
 *
 * mic_common.js
 *
 */

// 名字空间 MobileIC
var mic = {};

mic.path = amc.isAndroid ? 'android-phone-securitycommon-verifyidentitybiz/com.alipay.android.phone.mobilecommon.verifyidentity/' : 'VIVerifyCore.bundle/';

mic.fn = {};

mic.fn.onBackWithResponse = function onBackWithResponse(data) {
    obj = {};
    obj['eventName'] = 'vi_quit_module_with_response';
    obj['params'] = data;
    document.submit(obj);
};

mic.fn.onBack = function onBack() {

    var dialogObj = {
        title: '',
        message: '{{confirm_exit}}',
        okButton: '{{confirm_btn}}',
        cancelButton: '{{cancel}}'
    };

    amc.fn.viConfirm(dialogObj, function(result) {
        if (result.ok) {
            obj = {};
            obj['eventName'] = 'vi_quit_module';
            document.submit(obj);
        }
    });
};

mic.fn.changeModule = function changeModule() {
    obj = {};
    obj['eventName'] = 'vi_change_module';
    document.submit(obj);
};
