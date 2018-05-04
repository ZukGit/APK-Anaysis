;
(function() {
    /****************document 能力扩展(兼容鸟巢)*********/
    document.submit = function(event) {
        MQPJSBridge.call('submit', event);
    };

    document.asyncSubmit = function(event, cb) {
        MQPJSBridge.call('asyncSubmit', event, function(data) {
            if(cb) {
                cb(data);
            }
        });
    };

    document.submit = function(params) {
        MQPJSBridge.call('submit', params);
    };

    document.asyncSubmit = function(params, callback) {
        MQPJSBridge.call('asyncSubmit', params, callback);
    };

    document.invoke = function(action, param, callback) {
        if (arguments.length == 2 && typeof param == 'function') {
            callback = param;
            param = null;
        }

        MQPJSBridge.call('invoke', { param: param, action: action }, callback);
    };

    document.alert = function(btns, callback) {
        if (!btns || !callback || typeof btns !== "object" || typeof callback !== "function") {
          return;
        }

        MQPJSBridge.call('alert', btns, callback);
    };

    document.toast = function(opt, callback) {
        MQPJSBridge.call('toast', opt, callback);
    };

    document.actionSheet = function(initArguments, callback) {
        MQPJSBridge.call('actionSheet', initArguments, callback);
    };

    document.picker = function(initArguments, callback) {
        MQPJSBridge.call('picker', initArguments, callback);
    };

    /****************amc.js 能力扩展(兼容鸟巢)*********/

    window.amcH5 = {};
    window.amcH5.localhost = 'https://amc201710.alipay.com/';
    // 修改全屏导航栏
    function getH5Nav(lImg, lTxt, mTxt, rTxt, rImg, onLeft, onRight, option, leftAlt, rightAlt) {
        var create = amc.fn.create;
        // 兼容鸟巢nav
        var _nav = create('nav');
        _nav.style.display = 'none';

        // 标题
        if (mTxt) {
            MQPJSBridge.call('setTitle', mTxt);
        }

        // 左侧导航栏
        var leftConfig = {};
        if (lImg) {
            lImg = lImg.replace(window.amcH5.localhost, '');
            leftConfig.img = lImg;
            if (leftAlt) {
                leftConfig.alt = leftAlt;
            }
        }

        if (lTxt) {
            leftConfig.title = lTxt;
        }

        if (lImg || lTxt) {
            MQPJSBridge.call('setLeft', leftConfig, onLeft);
        }

        // 右侧导航栏
        var rightConfig = {};
        if (rTxt) {
            rightConfig.title = rTxt;
        } else if (rImg) {
            rImg = rImg.replace(window.amcH5.localhost, '');
            rightConfig.img = rImg;
            if (rightAlt) {
                rightConfig.alt = rightAlt;
            }
        }
        if (rTxt || rImg) {
            MQPJSBridge.call('setRight', rightConfig, onRight);
        }

        // 备注: 没有使用全屏导航栏时需要手动指定
        window.amcH5.isFullScreen = true;
        return _nav;
    }

    amc.fn.getNav = getH5Nav;

    /** 页面渲染之后发送的通知
     * 该函数可由页面覆盖
     */
    MQPJSBridge.pageReadyNotify = function(isFullScreen, height, transparent) {
        if (isFullScreen == undefined) {
            isFullScreen = window.amcH5.isFullScreen;
            if (!isFullScreen) {
                // 注意: 如果上面有跑马灯，需要注意计算。
                height = amc.specs.iBodyHeight;
                if (transparent == undefined) {
                    transparent = true;
                }
            }
        }

        MQPJSBridge.call('postNotification', {
            'name': 'MQPH5DocumentReady',
            'data': {
                'isFullScreen': isFullScreen,
                'height': height, // 非全屏页面需要告知高度
                'transparent': !!transparent
            },
        });
    };

    /**
     * 显示loading动画
     * @param  {Node} parentNode 父节点
     * @param  {float} lineWidth  线条宽度, 默认2px
     * @param  {#hex} color       线条颜色, 默认#FFF
     * @param  {float} diameter       直径, 默认100%
     */
    amc.fn.showLoadingAnimation = function(parentNode, lineWidth, color, diameter) {
        if (!parentNode) {
            return;
        }

        // 如果已经创建过子节点
        parentNode.innerHTML = '';

        diameter = !isNaN(diameter) && diameter;
        lineWidth = (!lineWidth || isNaN(lineWidth)) ? 2 : lineWidth;
        color = color || 'white';

        // 创建子节点
        child = document.createElement('div');
        // amc-load-gif只是用来作为标识
        child.className = 'amc-load-outer-wrapper amc-load-gif-tag';

        var rightWrapper = document.createElement('div');
        rightWrapper.className = 'amc-load-inner-wrapper amc-load-inner-wrapper-r';
        var rightCircle = document.createElement('div');
        rightCircle.className = 'amc-load-circle amc-load-circle-r';
        rightWrapper.appendChild(rightCircle);

        var leftWrapper = document.createElement('div');
        leftWrapper.className = 'amc-load-inner-wrapper amc-load-inner-wrapper-l';
        var leftCircle = document.createElement('div');
        leftCircle.className = 'amc-load-circle amc-load-circle-l';
        leftWrapper.appendChild(leftCircle);

        child.appendChild(rightWrapper);
        child.appendChild(leftWrapper);
        if (diameter) {
            var cssText = 'width: ' + diameter + 'px !important;' + 'height: ' + diameter + 'px !important;';
            child.style.cssText = cssText;
            rightWrapper.style.cssText = cssText;
            leftWrapper.style.cssText = cssText;
            leftCircle.style.cssText = cssText;
            rightCircle.style.cssText = cssText;
        }

        var circleCss = 'border: ' + lineWidth + 'px solid transparent;'
        rightCircle.style.cssText += circleCss +
            'border-top: ' + lineWidth + 'px solid ' + color + ';' +
            'border-right: ' + lineWidth + 'px solid ' + color + ';';
        leftCircle.style.cssText += circleCss +
            'border-bottom: ' + lineWidth + 'px solid ' + color + ';' +
            'border-left: ' + lineWidth + 'px solid ' + color + ';';


        parentNode.appendChild(child);

        return true;
    };

    /**
     * @param  {Node} parentNode 父节点
     * @param  {float} lineWidth  线条宽度, 默认2px
     * @param  {#hex} color       线条颜色, 默认#FFF
     * @param  {float} diameter       直径, 默认100%
     */
    amc.fn.showSuccessAnimation = function(parentNode, lineWidth, color, diameter) {
        if (!parentNode) {
            return;
        }
        parentNode.innerHTML = '';

        diameter = !isNaN(diameter) && diameter;
        lineWidth = (!lineWidth || isNaN(lineWidth)) ? 2 : lineWidth;
        color = color || 'white';

        // 创建子节点
        child = document.createElement('div');
        // amc-load-gif只是用来作为标识
        child.className = 'amc-load-outer-wrapper amc-success-gif-tag';

        var rightWrapper = document.createElement('div');
        rightWrapper.className = 'amc-load-inner-wrapper amc-load-inner-wrapper-r';
        var rightCircle = document.createElement('div');
        rightCircle.className = 'amc-load-circle amc-success-circle-r';
        rightWrapper.appendChild(rightCircle);

        var leftWrapper = document.createElement('div');
        leftWrapper.className = 'amc-load-inner-wrapper amc-load-inner-wrapper-l';
        var leftCircle = document.createElement('div');
        leftCircle.className = 'amc-load-circle amc-success-circle-l';
        leftWrapper.appendChild(leftCircle);

        var line1 = document.createElement('div');
        line1.className = 'amc-success-line-1';
        var line1Mask = document.createElement('div')
        line1Mask.className = 'amc-success-line-1-mask';
        var line1Real = document.createElement('div');
        line1Real.className = 'amc-success-line-1-real';
        line1.appendChild(line1Mask);
        line1.appendChild(line1Real);

        var line2 = document.createElement('div');
        line2.className = 'amc-success-line-2';

        child.appendChild(rightWrapper);
        child.appendChild(leftWrapper);
        child.appendChild(line1);
        child.appendChild(line2);
        if (diameter) {
            var cssText = 'width: ' + diameter + 'px !important;' + 'height: ' + diameter + 'px !important;';
            child.style.cssText = cssText;
            rightWrapper.style.cssText = cssText;
            leftWrapper.style.cssText = cssText;
            leftCircle.style.cssText = cssText;
            rightCircle.style.cssText = cssText;
        }

        var circleCss = 'border: ' + lineWidth + 'px solid transparent;'
        rightCircle.style.cssText += circleCss +
            'border-top: ' + lineWidth + 'px solid ' + color + ';' +
            'border-right: ' + lineWidth + 'px solid ' + color + ';';
        leftCircle.style.cssText += circleCss +
            'border-bottom: ' + lineWidth + 'px solid ' + color + ';' +
            'border-left: ' + lineWidth + 'px solid ' + color + ';';
        line1Real.style.backgroundColor = color;

        var lineCss = '-webkit-transform-origin: ' + (lineWidth / 2) +
            'px 50%;transform-origin: ' + (lineWidth / 2) +
            'px 50%;height: ' + lineWidth + 'px;'
        console.log(lineCss);
        line1.style.cssText = lineCss;
        line2.style.cssText = lineCss + ';background-color: ' + color;

        parentNode.appendChild(child);

        return true;
    };

    amc.fn.playGif = function(parentNode, gif) {
        if (!gif && parentNode) {
            parentNode.innerHTML = '';
            return;
        }

        if (gif == amc.res.loading) {
            amc.fn.showLoadingAnimation(parentNode);
        } else if (gif == amc.res.success) {
            amc.fn.showSuccessAnimation(parentNode);
        }
        amc.fn.show(parentNode);
    }


    /*
     * 1. 处理 local 图片
     * 2. 处理待 pixelWidth 的图片
     *
     * @param {*} url 需要加载的图片 Url
     * @param {*} cssWidth 服务端返回的Url格式可能为 https://zos.alipay.com/OPrySa.png_[pixelWidth]x.png
     *                     需要将 [pixelWidth] 替换为需要的宽度，函数内处理图片模糊问题
     */
    amc.fn.processImageUrl = function (url, cssWidth) {
        if (!url) {
            return '';
        }
        url = url.replace(new RegExp('^local:'), amc.path);
        if (cssWidth) {
            var ratio = window.devicePixelRatio;
            ratio = (ratio <= 1) ? 2 : ratio;
            var replace = Math.round(cssWidth * ratio).toString();
            url = url.replace(new RegExp('\\[pixelWidth\\]'), replace);
        }
        return url;
    };

    /**
     * 创建img标签，兼容鸟巢defaultValue，failValue逻辑
     * @param {string} style
     * @param {string} parent
     * @param {string} failSrc
     * @param {string} defaultSrc
     */
    amc.fn.createImg = function(style, parent, failSrc, defaultSrc) {
        var img = amc.fn.create('img', style, parent);
        img.onerror = function() {
            this.src = failSrc;
        };
        img.onload = function() {
            this.style.backgroundImage = '';
        };
        img.style.backgroundImage = 'url(' + defaultSrc + ')';
        return img;
    };

    amc.fn.show = function (tag) {
        if (tag) {
            tag = amc.fn.isString(tag) ? document.getElementById(tag) : tag;

            if (tag && tag.classList) {
                tag.classList.remove('amc-hidden');
            }
        }
    };

    amc.fn.hide = function (tag) {
        if (tag) {
            tag = amc.fn.isString(tag) ? document.getElementById(tag) : tag;

            if (tag && tag.classList) {
                tag.classList.add('amc-hidden');
            }
        }
    };

    // 禁止缩放
    var metaTag = document.createElement('meta');
    metaTag.name = 'viewport';
    metaTag.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
    document.head.appendChild(metaTag);

    window.MQPJSBridge.register('MQPOnKeydown', function(event) {
        if (!event || !event.which) {
            return;
        }

        window.event = event;
        if(document.body.onkeydown) {
            document.body.onkeydown();
        }
    });

})();
