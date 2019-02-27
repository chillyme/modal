(function(root, factory){
    if(typeof module === "object" && typeof module.exports === "object"){
        module.exports = factory(require("jquery"));
    }
    else if(typeof define === "function" && define.amd){
        define(["jquery"], factory);
    }
    else{
        var old = root.modal;
        var modal = factory(root.jQuery || root.$);

        // 如果是通过 script 标签引入，则额外提供一个重命名方法，以解决与其他库或插件命名冲突的问题
        modal.noConflict = function(){
            if(root.modal === modal){
                root.modal = old;
            }

            return modal;
        };

        root.modal = modal;
    }
})(this, function(jQuery){
    var objProto = Object.prototype;
    var funProto = Function.prototype;

    var getPrototypeOf = Object.getPrototypeOf;
    var isArray = Array.isArray;

    var objToString = objProto.toString;
    var hasOwnProperty = objProto.hasOwnProperty;
    var funToString = funProto.toString;

    // --------------------------------------------------------------------------------
    // 准备工作
    var ready = {
        // 如果是 ie 浏览器，则返回相应的版本号，否则返回 false
        ie: (!!window.ActiveXObject || "ActiveXObject" in window) ? ((navigator.userAgent.toLowerCase().match(/msie\s(\d+)/) || [])[1] || "11") : false,
        // 如果 value 是一个对象，则返回 true
        isObject: function(value){
            return !!value && typeof value === "object";
        },
        // 如果 value 是一个纯对象，则返回 true
        isPlainObject: function(value){
            if(!value || objToString.call(value) !== "[object Object]"){
                return false;
            }

            var prototype = getPrototypeOf(value);

            if(prototype === null){
                return true;
            }

            var constructor = hasOwnProperty.call(prototype, "constructor") && prototype.constructor;

            return typeof constructor === "function" && funToString.call(constructor) === funToString.call(Object);
        },
        // 如果 value 是一个数组，则返回 true
        isArray: isArray || function(value){
            return objToString.call(value) === "[object Array]";
        },
        // 如果 value 是一个函数，则返回 true
        isFunction: function(value){
            return objToString.call(value) === "[object Function]" || typeof value === "function";
        },
        // 如果 value 是一个布尔值，则返回 true
        isBoolean: function(value){
            return value === true || value === false || objToString.call(value) === "[object Boolean]";
        },
        // 如果 value 是一个数值，则返回 true
        isNumber: function(value){
            return objToString.call(value) === "[object Number]";
        },
        // 如果 value 是一个字符串，则返回 true
        isString: function(value){
            return objToString.call(value) === "[object String]";
        },
        // 空函数，用于默认的回调函数
        noop: function(){

        },
        // 用于存储所有的弹框实例，以 index 作为 key 存储
        queue: {

        },
        // 用于存储所有含有 id 选项的弹框实例，以 id 作为 key 存储
        uniqueue: {

        },
        // 基础索引
        index: 0,
        // 基础配置
        options: {
            // 层叠顺序
            zIndex: 10000,
            // 遮罩。默认 0.5 透明度的黑色遮罩
            backdrop: 0.5,
            // 点击遮罩关闭
            clickBackdropToClose: false,
            // 皮肤
            skin: "",
            // 标题。如果不想显示标题，设置为 false 即可
            title: "\u4fe1\u606f",
            // 内容
            content: "",
            // 固定定位
            fixed: true,
            // 宽高（忽略边框）。默认宽高自适应
            size: "auto",
            // 最大宽度。只有当宽度自适应时，maxWidth 的设定才有效；默认不限定最大宽度
            maxWidth: false,
            // 最大高度。只有当高度自适应时，maxHeight 的设定才有效；默认不限定最大高度
            maxHeight: false,
            // 内边距
            padding: "20px",
            // 坐标。默认水平垂直居中
            offset: "auto",
            // 图标
            icon: false,
            // 关闭按钮。提供两种风格的关闭按钮，可通过设置 1 或 2 来切换，如果不想显示关闭按钮，设置为 false 即可
            btnClose: 1,
            // 自定义按钮
            btns: [],
            // 自定义按钮水平方向的排列方式。默认右对齐
            btnsAlign: "right",
            // 确定按钮文本
            okText: "\u786e\u5b9a",
            // 确定按钮点击事件回调函数
            ok: null,
            // 取消按钮文本
            cancelText: "\u53d6\u6d88",
            // 取消按钮点击事件回调函数
            cancel: null,
            // 自动关闭倒计时，单位毫秒。默认不会自动关闭
            time: 0,
            // 触发拖动的目标元素
            dragger: ".ui-modal-head",
            // 是否允许拖出窗口可视区域
            canDragOut: false,
            // 打开动画
            animate: "bounceIn",
            // 关闭动画
            closeAnimate: "bounceOut"
        }
    };

    // --------------------------------------------------------------------------------
    // 构造函数
    var Modal = function(options){
        var me = this;

        // 设置全局索引
        me.index = ++ready.index;
        // 扩展基础配置
        me.options = jQuery.extend(true, {}, ready.options, options);

        var options = me.options;

        // 重设 zIndex 配置
        options.zIndex = options.zIndex + me.index;

        // 重设 backdrop 配置
        if(ready.isNumber(options.backdrop)){
            options.backdrop = [options.backdrop, "#000"];
        }
        else if(ready.isString(options.backdrop)){
            options.backdrop = [0.5, options.backdrop];
        }

        // 重设 size 配置
        if(ready.isString(options.size)){
            options.size = options.size === "auto" ? ["", ""] : [options.size, ""];
        }

        // 重设 btnClose 配置
        if(!options.title && options.btnClose){
            options.btnClose = 2;
        }

        // 重设 btns 配置
        var btns = [];

        if(ready.isFunction(options.ok)){
            btns.push({
                text: options.okText,
                callback: options.ok
            });
        }

        if(ready.isFunction(options.cancel)){
            btns.push({
                text: options.cancelText,
                callback: options.cancel
            });
        }

        options.btns = options.btns ? btns.concat(options.btns) : btns;

        // 创建弹框
        me.render();
    };

    // 创建弹框
    Modal.prototype.render = function(){
        var me = this;
        var index = me.index;
        var options = me.options;
        var body = jQuery("body");

        // 创建拖动弹框时的蒙板
        // 避免按住鼠标移动至 iframe 区域后弹框不会跟随移动的问题
        // 这是因为拖动是通过监听当前窗口 document 的 onmousemove 事件来计算拖动距离的
        // 而鼠标移动至 iframe 区域后并不会触发当前窗口 document 的 onmousemove 事件
        if(jQuery("#ui-modal-shade").length === 0){
            body.append("<div id=\"ui-modal-shade\" class=\"ui-modal-shade\"></div>");
        }

        // 创建新的弹框
        var template = me.template();

        options.backdrop && body.append(template[0]);
        body.append(template[1]);

        // 创建新的弹框后，缓存弹框 dom 对象
        me.backdrop = options.backdrop ? jQuery("#ui-modal-backdrop" + index) : null;
        me.dom = jQuery("#ui-modal" + index);

        // 设置尺寸
        me.size();

        // 设置坐标
        me.offset();

        // 注册事件处理程序
        me.handle();

        var next = function(){
            if(options.time > 0){
                setTimeout(function(){
                    me.close();
                }, options.time);
            }
        };

        // 如果浏览器不支持 css3 动画，或者未设置打开动画
        if((ready.ie && ready.ie < 10) || !options.animate){
            next();
        }
        // 否则先应用打开动画
        else{
            var animation = "ui-modal-animate ui-modal-animate-" + options.animate;

            me.dom.addClass(animation).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function(){
                me.dom.removeClass(animation);
                next();
            });
        }
    };

    // 构建 html 模板
    Modal.prototype.template = function(){
        var me = this;
        var index = me.index;
        var options = me.options;

        // 遮罩
        var htmlBackdrop = "";

        if(options.backdrop){
            htmlBackdrop = "<div id=\"ui-modal-backdrop" + index + "\" class=\"ui-modal-backdrop\" style=\"z-index: " + options.zIndex + "; opacity: " + options.backdrop[0] + "; background-color: " + options.backdrop[1] + ";\"></div>";
        }

        // 主体
        var html = "";

        html += "<div id=\"ui-modal" + index + "\" class=\"ui-modal" + (options.skin ? (" " + options.skin) : "") + "\" style=\"z-index: " + options.zIndex + "; position: " + (options.fixed ? "fixed" : "absolute") + "; width: " + options.size[0] + "; height: " + options.size[1] + ";\">";
        if(options.title){
            if(ready.isString(options.title)){
                html += "<div class=\"ui-modal-head\">" + options.title + "</div>";
            }
            else if(ready.isPlainObject(options.title)){
                html += "<div class=\"ui-modal-head\" style=\"" + options.title.style + "\">" + options.title.text + "</div>";
            }
        }
        html += "<div class=\"ui-modal-body\" style=\"padding: " + options.padding + ";\">";
        if(options.icon){
            html += "<div class=\"ui-modal-content ui-modal-content-relative\">";
            html += "<i class=\"ui-modal-icon ui-modal-icon-" + options.icon + "\" />";
            html += options.content;
            html += "</div>";
        }
        else{
            html += "<div class=\"ui-modal-content\">";
            html += options.content;
            html += "</div>";
        }
        html += "</div>";
        if(options.btns && options.btns.length > 0){
            html += "<div class=\"ui-modal-foot\" style=\"text-align: " + options.btnsAlign + ";\">";
            for(var i = 0, length = options.btns.length; i < length; i++){
                html += "<b class=\"ui-modal-btn\">" + options.btns[i].text + "</b>";
            }
            html += "</div>";
        }
        if(options.btnClose){
            html += "<b class=\"ui-modal-btn-close ui-modal-btn-close" + options.btnClose + "\"></b>";
        }
        html += "</div>";

        return [htmlBackdrop, html];
    };

    // 设置尺寸
    Modal.prototype.size = function(){
        var me = this;
        var index = me.index;
        var options = me.options;
        var dom = me.dom;

        // 设置宽度
        if(!options.size[0] && options.maxWidth > 0 && dom.innerWidth() > options.maxWidth){
            dom.width(options.maxWidth);
        }

        // 设置高度
        var height = dom.innerHeight();
        var domHeadHeight = dom.find(".ui-modal-head").outerHeight() || 0;
        var domFootHeight = dom.find(".ui-modal-foot").outerHeight() || 0;
        var setHeight = function(){
            var target = dom.find(".ui-modal-body");
            var paddingTop = parseFloat(target.css("padding-top"));
            var paddingBottom = parseFloat(target.css("padding-top"));

            target.height(height - domHeadHeight - domFootHeight - paddingTop - paddingBottom);
        };

        if(!options.size[1]){
            if(options.maxHeight > 0 && height > options.maxHeight){
                height = options.maxHeight;
                setHeight();
            }
        }
        else{
            setHeight();
        }
    };

    // 设置坐标
    Modal.prototype.offset = function(){
        var me = this;
        var options = me.options;
        var dom = me.dom;
        var win = jQuery(window);

        var width = dom.outerWidth();
        var height = dom.outerHeight();
        var offsetTop = (win.height() - height) / 2;
        var offsetLeft = (win.width() - width) / 2;

        if(ready.isArray(options.offset)){
            offsetTop = options.offset[0] || offsetTop;
            offsetLeft = options.offset[1] || offsetLeft;
        }
        else if(options.offset !== "auto"){
            // 停靠在顶部 => offset: "top"
            if(options.offset === "top"){
                offsetTop = 0;
            }
            // 停靠在底部 => offset: "bottom"
            else if(options.offset === "bottom"){
                offsetTop = win.height() - height;
            }
            // 停靠在左侧 => offset: "left"
            else if(options.offset === "left"){
                offsetLeft = 0;
            }
            // 停靠在右侧 => offset: "right"
            else if(options.offset === "right"){
                offsetLeft = win.width() - width;
            }
            // 停靠在左上角 => offset: "top left"
            else if(options.offset === "top left"){
                offsetTop = 0;
                offsetLeft = 0;
            }
            // 停靠在右上角 => offset: "top right"
            else if(options.offset === "top right"){
                offsetTop = 0;
                offsetLeft = win.width() - width;
            }
            // 停靠在左下角 => offset: "bottom left"
            else if(options.offset === "bottom left"){
                offsetTop = win.height() - height;
                offsetLeft = 0;
            }
            // 停靠在右下角 => offset: "bottom right"
            else if(options.offset === "bottom right"){
                offsetTop = win.height() - height;
                offsetLeft = win.width() - width;
            }
            // 单纯设置距离顶部距离 => offset: "100px"
            else{
                offsetTop = options.offset;
            }
        }

        if(!options.fixed){
            offsetTop = win.scrollTop() + parseFloat(offsetTop);
            offsetLeft = win.scrollLeft() + parseFloat(offsetLeft);
        }

        dom.css({
            top: offsetTop,
            left: offsetLeft
        });
    };

    // 注册事件处理程序
    Modal.prototype.handle = function(){
        var me = this;
        var index = me.index;
        var options = me.options;
        var backdrop = me.backdrop;
        var dom = me.dom;
        var dragger = dom.find(options.dragger);
        var win = jQuery(window);
        var doc = jQuery(document);
        var dict = {};

        // 执行打开成功的回调函数
        ready.isFunction(options.success) && options.success(index, dom);

        // 窗口大小改变时，重新设置坐标
        win.on("resize", function(){
            me.offset();
        });

        // 注册拖动事件处理程序
        if(dragger.length > 0){
            dragger.on("mousedown", function(e){
                dict.dragging = true;
                dict.offset = [
                    e.clientX - parseFloat(dom.css("left")),
                    e.clientY - parseFloat(dom.css("top"))
                ];

                jQuery("#ui-modal-shade").show();

                e.preventDefault();
            });

            doc.on("mousemove", function(e){
                if(dict.dragging){
                    var x = e.clientX - dict.offset[0];
                    var y = e.clientY - dict.offset[1];

                    if(!options.canDragOut){
                        var minX = options.fixed ? 0 : win.scrollLeft();
                        var minY = options.fixed ? 0 : win.scrollTop();
                        var maxX = win.width() - dom.outerWidth() + minX;
                        var maxY = win.height() - dom.outerHeight() + minY;

                        x < minX && (x = minX);
                        x > maxX && (x = maxX);
                        y < minY && (y = minY);
                        y > maxY && (y = maxY);
                    }

                    dom.css({
                        left: x,
                        top: y
                    });

                    e.preventDefault();
                }
            });

            doc.on("mouseup", function(e){
                if(dict.dragging){
                    delete dict.dragging;
                    delete dict.offset;

                    jQuery("#ui-modal-shade").hide();

                    ready.isFunction(options.dragEnd) && options.dragEnd(index, dom);
                }
            });
        }

        // 注册遮罩点击事件处理程序
        if(backdrop && options.clickBackdropToClose){
            backdrop.on("click", function(){
                var value = ready.isFunction(options.cancel) ? options.cancel(index, dom) : undefined;

                value === false || me.close();
            });
        }

        // 注册关闭按钮点击事件处理程序
        if(options.btnClose){
            dom.on("click", ".ui-modal-btn-close", function(){
                var value = ready.isFunction(options.cancel) ? options.cancel(index, dom) : undefined;

                value === false || me.close();
            });
        }

        // 注册底部按钮点击事件处理程序
        if(options.btns && options.btns.length > 0){
            dom.on("click", ".ui-modal-btn", function(){
                var i = jQuery(this).index();
                var callback = options.btns[i].callback;
                var value = ready.isFunction(callback) ? callback(index, dom) : undefined;

                value === false || me.close();
            });
        }
    };

    // 关闭
    Modal.prototype.close = function(){
        var me = this;
        var index = me.index;
        var options = me.options;
        var backdrop = me.backdrop;
        var dom = me.dom;
        var next = function(){
            // 销毁 dom 元素
            backdrop && backdrop.remove();
            dom.remove();

            // 执行关闭后的回调函数
            ready.isFunction(options.destroy) && options.destroy();
        };

        // 如果浏览器不支持 css3 动画，或者未设置关闭动画，则直接关闭
        if((ready.ie && ready.ie < 10) || !options.closeAnimate){
            next();
        }
        // 否则先应用关闭动画，并在动画结束时关闭
        else{
            var animation = "ui-modal-animate ui-modal-animate-" + options.closeAnimate;

            dom.addClass(animation).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function(){
                dom.removeClass(animation);
                next();
            });
        }
    };

    // --------------------------------------------------------------------------------
    // 内置方法
    var modal = {};

    // 打开一个新的弹框
    modal.open = function(options){
        // 具有相同 id 选项的弹框，同时只能打开一个
        var id = options.id;

        if(id && ready.uniqueue[id]){
            return ready.uniqueue[id].index;
        }

        // 打开一个新的弹框
        var me = new Modal(options);
        var index = me.index;
        var options = me.options;

        ready.queue[index] = me;

        if(options.id){
            ready.uniqueue[options.id] = me;
        }

        return index;
    };

    // 根据索引关闭指定弹框
    modal.close = function(index){
        var me = ready.queue[index];

        // 如果弹框不存在，则返回不处理
        if(!me){
            return;
        }

        // 执行关闭操作
        var index = me.index;
        var options = me.options;

        me.close();

        delete ready.queue[index];

        if(options.id){
            delete ready.uniqueue[options.id];
        }
    };

    // 关闭所有指定类型的弹框
    modal.closeAll = function(type){
        for(var index in ready.queue){
            var me = ready.queue[index];

            if(!type || me.options.type === type){
                me.close();
            }
        }
    };

    // 仿系统 alert 对话框
    modal.alert = function(content, ok){
        // 默认配置
        var defaults = {
            type: "alert",
            skin: "ui-modal-alert",
            maxWidth: 360,
            ok: ready.noop
        };

        // 自定义配置
        var options = {};

        if(ready.isString(content)){
            options.content = content;
        }
        else if(ready.isPlainObject(content)){
            options = content;
        }

        if(ready.isFunction(ok)){
            options.ok = ok;
        }

        // 打开弹框，并返回弹窗索引
        return this.open(jQuery.extend(true, {}, defaults, options));
    };

    // 仿系统 confirm 对话框
    modal.confirm = function(content, ok, cancel){
        // 默认配置
        var defaults = {
            type: "confirm",
            skin: "ui-modal-confirm",
            maxWidth: 360,
            ok: ready.noop,
            cancel: ready.noop
        };

        // 自定义配置
        var options = {};

        if(ready.isString(content)){
            options.content = content;
        }
        else if(ready.isPlainObject(content)){
            options = content;
        }

        if(ready.isFunction(ok)){
            options.ok = ok;
        }

        if(ready.isFunction(cancel)){
            options.cancel = cancel;
        }

        // 打开弹框，并返回弹窗索引
        return this.open(jQuery.extend(true, {}, defaults, options));
    };

    // 仿系统 prompt 对话框
    modal.prompt = function(title, ok, cancel){
        // 默认配置
        var defaults = {
            type: "prompt",
            skin: "ui-modal-prompt",
            ok: ready.noop,
            cancel: ready.noop
        };

        // 自定义配置
        var options = {};

        if(ready.isString(title)){
            options.title = title;
        }
        else if(ready.isPlainObject(title)){
            options = title;
        }

        if(options.value){
            options.content = "<input type=\"text\" class=\"ui-modal-input\" value=\"" + options.value + "\" />";
            delete options.value;
        }
        else{
            options.content = "<input type=\"text\" class=\"ui-modal-input\" />";
        }

        options.ok = function(index, dom){
            var input = dom.find(".ui-modal-input");
            var value = input.val();

            return ready.isFunction(ok) ? ok(value, index, dom) : true;
        };

        options.cancel = function(index, dom){
            return ready.isFunction(cancel) ? cancel(null, index, dom) : true;
        };

        // 打开弹框，并返回弹窗索引
        return this.open(jQuery.extend(true, {}, defaults, options));
    };

    // 消息框
    modal.msg = function(content, destroy){
        // 关闭之前所有打开的 msg 类型弹窗
        this.closeAll("msg");

        // 默认配置
        var defaults = {
            backdrop: false,
            type: "msg",
            skin: "ui-modal-msg",
            title: false,
            maxWidth: 360,
            padding: "15px 20px",
            btnClose: false,
            time: 3000,
            destroy: ready.noop
        };

        // 自定义配置
        var options = {};

        if(ready.isString(content)){
            options.content = content;
        }
        else if(ready.isPlainObject(content)){
            options = content;
        }

        if(ready.isFunction(destroy)){
            options.destroy = destroy;
        }

        // 打开弹框，并返回弹窗索引
        return this.open(jQuery.extend(true, {}, defaults, options));
    };

    // 加载框
    modal.loading = function(icon){
        // 默认配置
        var defaults = {
            backdrop: false,
            type: "loading",
            skin: "ui-modal-loading",
            title: false,
            padding: 0,
            btnClose: false,
            animate: "fadeIn",
            closeAnimate: "fadeOut"
        };

        // 自定义配置
        var options = {};

        if(ready.isString(icon)){
            options.icon = icon;
        }
        else if(ready.isPlainObject(icon)){
            options = icon;
        }

        if(options.icon){
            options.content = "<i class=\"ui-modal-svg ui-modal-svg-" + options.icon + "\" />";
            delete options.icon;
        }
        else{
            options.content = "<i class=\"ui-modal-svg ui-modal-svg-bars\" />";
        }

        // 打开弹框，并返回弹窗索引
        return this.open(jQuery.extend(true, {}, defaults, options));
    };

    // --------------------------------------------------------------------------------
    // 返回 modal 对象供外部使用
    return modal;
});
