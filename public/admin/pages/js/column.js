function heightauto(){
	var col_list=$(".box_info").height()/2;    
	$(".box_info").css({
		"marginTop":"-"+col_list+"px"
	})
}
var upload_picname;

function columnController($scope, $http) {
    $scope.$parent.showbox = "main";
    $scope.$parent.homepreview = true;
	$scope.$parent.menu = [];
    // 配置json地址
    json_url = '../classify-list';
    checkjs(location.hash.match(/[a-z]+?$/));

    //列表内容
    function get_column_list(json){
        var d;
        d = json.data;
        var _div = '<tr>\n\
                <th><dl class="fl checkclass"><input type="checkbox" name="vehicle" value="Bike1" style=" display:none;">\n\
                <label class="label allcheck"></label></dl><div class="fl">全选</div>栏目名称<div class="fr">|</div></th>\n\
                <th>类型<div class="fr">|</div></th>\n\
                <th>展示<div class="fr">|</div></th>\n\
                <th>操作</th>\n\
            </tr><tr class="sapces"></tr>';
        var layout;
        var column_icon = function(type){
            switch(parseInt(type)){
                case 1: layout = '<i class="fa iconfont icon-liebiao"></i>';break;
                case 3: layout = '<i class="fa iconfont icon-list"></i>';break;
                case 2: layout = '<i class="fa iconfont icon-graph"></i>';break;
                case 4: layout = '<i class="fa iconfont icon-wenjian"></i>';break;
                case 6: layout = '<i class="fa iconfont icon-lianjie"></i>';break;
                case 7: layout = '<i class="fa iconfont icon-weixin"></i>';break;
                case 8: layout = '<i class="fa iconfont icon-dingwei"></i>';break;
            }
        }
        if(d != null){
            $.each(d,function(idx, ele) {
                label = (ele.childmenu != null) ? '<div class="iconbtn"><b class="iconshow disnone">+</b><b class="iconhide">-</b></div>' : '<div class="iconbtn2"><b class="iconshow">-</b></div>';
                _div += '<tr class="Level1" data-aid="'+ele.id+'">\n\
                <td style="text-align: left; height:20px;overflow:hidden;"><dl class="fl checkclass"><input type="checkbox" name="vehicle" value="Bike1" style=" display:none;"><label class="label"></label></dl>'+label+'<div class="tit_info">'+ele.name+'</div></td>';
                column_icon(ele.type);
                _div +='<td><div class="tit_info">'+column_type(ele.type)+'</div>'+layout+'</td>';
                _div += '<td style="text-align:center;"><span><i class="fa icon-pc iconfont btn btn-show btn-desktop '+(ele.pc_show?'blue':'grey')+'"></i></span><div class="pr size1"><i class="fa iconfont icon-snimicshouji btn btn-show btn-mobile '+(ele.mobile_show?'blue':'grey')+'"></i><i class="fa iconfont btn icon-phonehome none '+(ele.show == 1?'blue':'grey')+(ele.showtypetotal == 0?' not-allowed':'')+'"></i></div><span><i class="fa iconfont icon-weixin btn btn-show btn-wechat '+(ele.wechat_show?'blue':'grey')+'"></i></span></td>\n\
                <td><i class="fa iconfont icon-xiayi btn sort"></i><i class="fa iconfont icon-shangyi btn sort"></i><a style="margin:0 10px;" class="column-edit-box"><i class="fa iconfont icon-bianji column-edit"></i><div class="warning"><i class="iconfont'+(ele.issize?' icon-gantanhao':'')+'"></i></div></a><a class="delv" name="'+ele.id+'"><i class="fa iconfont icon-delete"></i></a></td>\n\
                </tr>';
                var NextChild = ele;
                var num = 2;
                var LoopChlid = function(NextChild,num){
                    if(NextChild.childmenu != null){
                        $.each(NextChild.childmenu,function(k,v){
                                _div += '<tr class="Level'+num+'" data-aid="'+v.id+'" data-parent="'+v.p_id+'">\n\
                                <td style="text-align: left;"><div class="fl style">├</div><dl class="fl checkclass"><input type="checkbox" name="vehicle" value="Bike1" style=" display:none;"><label class="label"></label></dl><div class="tit_info">'+v.name+'</div></td>';
                                    column_icon(v.type);
                                    _div +='<td><div class="tit_info">'+column_type(v.type)+'</div>'+layout+'</td>';
                                _div +='<td style="text-align:center;"><span><i class="fa iconfont icon-pc btn btn-show btn-desktop '+(v.pc_show?'blue':'grey')+'"></i></span><div class="pr size1"><i class="iconfont icon-snimicshouji fa btn btn-show btn-mobile '+(v.mobile_show?'blue':'grey')+'"></i><i class="fa iconfont btn icon-phonehome none '+(v.show?'blue':'grey')+(v.showtypetotal == 0?' not-allowed':'')+'"></i></div><span><i class="fa iconfont icon-weixin btn btn-show btn-wechat '+(v.wechat_show?'blue':'grey')+'"></i></span></td>\n\
                                <td><i class="fa iconfont icon-xiayi btn sort grey "></i><i class="fa iconfont icon-shangyi btn sort grey "></i><a style="margin:0 10px;" class="column-edit-box"><i class="fa iconfont icon-bianji grey column-edit"></i><div class="warning"><i class="iconfont'+(v.issize?' icon-gantanhao':'')+'"></i></div></a><a class="delv" name="'+v.id+'"><i class="fa iconfont icon-delete grey "></i></a></td></tr>';
                            if(v.childmenu != null){
                                NextChild = v;
                                num++;
                                LoopChlid(NextChild,num);
                                num--;
                            }
                        });
                    }
                }
                LoopChlid(NextChild,num);
            });
        }
        //父级栏目
        var option1 = '<li><a data-id="0">顶级栏目</a></li>';
        $.each(d,function(k,v){
            if(v.p_id == 0){
                option1 += '<li><a class="parents" data-id="'+v.id+'">'+v.name+'</a></li>';
                var NextChild = v;
                var num = 2;
                var LoopChlid = function(NextChild,num){
                   if(NextChild.childmenu != null){
                        $.each(NextChild.childmenu, function(i,j) {
                            option1 += '<li><a class="LevelChild'+num+'" data-pid="'+j.p_id+'" data-id="'+j.id+'">├'+j.name+'</a></li>';
                            if(v.childmenu != null){
                                NextChild = j;
                                num++;
                                LoopChlid(NextChild,num);
                                num--;
                            }
                        });
                    } 
                }
                LoopChlid(NextChild,num);
            }
        });
        _op = '父级栏目：<div class="dropdown">\
                <div class="selectBox" data-id="1" type="text"></div><span class="arrow"></span>\
                <input class="selectBox_val" name="column_name" class="column_name" type="hidden" value=""/>\
                <ul>'+option1+'</ul></div>';
        $('.f_column').html(_op);
        $('.a-table').html(_div);
        $('.icon-gantanhao').MoveBox({
            context : '图片限制尺寸发生改变，请修改！'
        });
        // 下拉框模拟事件
        DropdownEvent();
        // 站点展示
        column_show();
        // 栏目图标
        var columnicon = new column_icon_choose();
        columnicon.clicks();
        // 栏目编辑提交
        column_edit(editor);
        // 栏目删除
        column_del();
        // 栏目提交移动
        Column_Move();
        // 图片上传
        Column_Upload('');
        //列表展开
        $(".iconbtn").unbind('click').on('click',function(){      
            $(this).parents('tr').nextUntil('.Level1').slideToggle();  
            $(this).children().toggleClass("disnone");      
        });
    }// get_column_list方法结束
    function Column_Move(){
        $('.a-table .sort').on('click',function(){
            var vsort = '';
            var nhtml = '';
            if($(this).hasClass('icon-shangyi')){ // 上移
                vsort = 'up';
                this_tr = $(this).parent().parent();
                //点击的是父级可以有子集且上级也可以有子集
                if( (this_tr.prev().data('aid') != this_tr.data('parent'))){
                    var UpEachNode = this_tr.nextAll();
                    var UpNewNode = [];
                    this_tr.attr('class') != this_tr.prev().attr('class') ? this_tr.prevAll('.'+this_tr.attr('class')+'').first().before(this_tr) : this_tr.prev().before(this_tr);
                    var NextNum = this_tr.attr('class').match(/\d+?$/g);
                    UpEachNode.each(function() {
                        if($(this).attr('class').match(/\d+?$/g) > NextNum){
                            UpNewNode.push($(this));
                        }else{
                            return false;
                        }
                    });
                    $('tr[data-aid="'+this_tr.data('aid')+'"]').after(UpNewNode);
                }else if( (this_tr.data('parent')==this_tr.prev().data('parent')) && !this_tr.next().data('parent')){
                    //点击的只是父级且上下级只是父级
                    this_tr.prev().before(this_tr);
                }
            }else{ // 下移
                if($(this).hasClass('icon-xiayi')){
                    vsort = 'down';
                    this_tr = $(this).parent().parent();
                    //点击的只是父级自身有子集且下级只是父级
                    if(this_tr.next().data('parent') || this_tr.next().next().data('parent')){
                        var DownEachNode = this_tr.nextAll();
                        var DownNum = this_tr.attr('class').match(/\d+?$/g);
                        var DownNewNode = [];
                        // 记录子栏目
                        DownEachNode.each(function() {
                            if($(this).attr('class').match(/\d+?$/g) > DownNum){
                                DownNewNode.push($(this));
                            }else{
                                return false;
                            }
                        });
                        $.each(DownEachNode,function() {
                            if(parseInt($(this).attr('class').match(/\d+?$/g)) == DownNum){
                                var Exchanged = this_tr.nextAll('.'+this_tr.attr('class')+'').first();
                                var ExchangedNextAll = Exchanged.nextAll();
                                if(ExchangedNextAll.length == 0){
                                    Exchanged.after(this_tr);
                                    $('tr[data-aid="'+this_tr.data('aid')+'"]').after(DownNewNode);
                                }else{
                                    $.each(ExchangedNextAll,function() {
                                        if(parseInt($(this).attr('class').match(/\d+?$/g)) <= DownNum){
                                            $(this).before(this_tr);
                                            $('tr[data-aid="'+this_tr.data('aid')+'"]').after(DownNewNode);
                                            return false;
                                        }
                                    });
                                }
                                return false;
                            }else if(parseInt($(this).attr('class').match(/\d+?$/g)) < DownNum){
                                return false;
                            }
                        });
                    }else{
                        if(this_tr.next().hasClass('Level1') && this_tr.hasClass('Level1') && !this_tr.next().next().data('parent')){
                            //点击的只是父级且下级只是父级
                            this_tr.next().after(this_tr);
                        }
                    }    
                }
            }
            // 点击变色
            $(this).hasClass('grey') ? $(this).removeClass('grey') : '';
            $(this).removeClass('grey').addClass('blue');
            $('.sort').not($(this)).removeClass('blue').addClass('grey');
            // 获取排序信息
            var indexs;
            indexs = $('.a-table tr[data-aid]').map(function(){
                return {id:$(this).data('aid'), index:$(this).index()};
            }).toArray();
            var vid = $(this).siblings('.delv').attr('name'); 
            $http.post('../classify-sort', {indexlist:indexs}).success(function(json) {
                checkJSON(json, function(json){
                    var hint_box = new Hint_box();
                    hint_box;
                });
            });
        });//移动点击结束
    }
    function getJson(){
        $http.get(json_url).success(function(json) {
            checkJSON(json, function(json){
                get_column_list(json);
            });//checkJSON结束
        });//GET请求结束
    }
    getJson();
    function column_icon_choose(){
        this.clicks = function(){
            var _this = this;
            $('.col_icon>i').unbind('click').on('click',function(event) {
                if($(this).hasClass('in')){
                    $('.col_icon_box,.col_icon .arrow').fadeOut();
                    $(this).removeClass('in')
                }else{
                    $('.col_icon_box,.col_icon .arrow').fadeIn();
                    $(this).addClass('in')
                }
                $http.get('../icon-list').success(function(json){
                    checkJSON(json, function(json){
                        var _div = '';
                        $.each(json.icons,function(index, el) {
                            _div += '<li name="'+el.replace('&', '&amp;')+'"><i class="iconfonts">'+el+'</i></li>';
                        });
                        $('.col_icon_box ul').html(_div);
                        _this._clickhide();
                    });
                });
            })  
        },
        this._clickhide = function(){
            var _this = this;
            $('.col_icon_box ul li').unbind('click').click(function(event) {
                var _Pthis = $(this).closest('.col_icon');
                _Pthis.children('i').before('<i class="iconfonts">'+$(this).attr('name')+'</i></li>').remove();
                _Pthis.children('.icon_input').val($(this).attr('name'));
                $('.col_icon_box,.col_icon .arrow').fadeOut();
                _this.clicks();
            });
        } 
    }
    // 转化弹框栏目类型
    function column_type_info(type){
        switch(type){
            case 1:
            case 2:
            case 3:
                $('#lottery').val('列表');
                $('#models').show();
                $('#inside_model').removeClass('none');
                if(type == 1){
                    $('#models .text').addClass('cu');
                }else if(type == 2){
                    $('#models .pic').addClass('cu');
                }else if(type == 3){
                    $('#models .txt_pic').addClass('cu');
                }
                break;
            case 4:
                $('#lottery').val(type);
                $('.box-down #page_editor').show();
                break;
            case 5:
                $('#lottery').val(type);
                break;
            case 6:
                $('#lottery').val(type);
                $('#out_url').show();
                break;
            case 7:
                $('#lottery').val(type);
                $('#lottery1,#lottery2,#lottery_mg').show();
                break;
            case 8:
                $('#lottery').val(type);
                break;
        }
    }
    // 实例化编辑器
    if (typeof addarticleEditor !== 'undefined') UE.getEditor('container').destroy();
    var editor = UE.getEditor('container',{
        initialFrameHeight:300,
        autoHeightEnabled: false,
        initialFrameWidth: 700
    });
    editor.addListener( 'ready', function( editor ) {
        addarticleEditor = true
    } );
    var this_id;
    // 点击编辑
    function column_edit(editor){
        $('.a-table').unbind('click').on('click','.column-edit',function(){
            var proportion;
            this_id = $(this).parent().siblings('.delv').attr('name');
            $http.get('../classify-info?id='+this_id+'').success(function(json) {
                var d = json.data;
                proportion = json.data.width/json.data.height;
                // 对应父级栏目
                $('.dropdown li a').each(function() {
                    if($(this).data('id') == d.p_id){
                        $('.selectBox').attr('data-id',d.p_id).text($(this).text()).text($(this).text());
                    }
                });
                $('.selectBox_val').val(d.p_id);
                $('.dropdown li a[data-id='+this_id+']').parent().hide();
                $('.column_name').val(d.name);
                // 图标判断
                $('.icon_input').val(d.icon);
                d.icon ? $('.col_icon>i').before('<i class="iconfonts">'+d.icon+'</i>').remove() : $('.col_icon>i').before('<i class="iconfont icon-dengpao"></i>').remove();
                // 栏目图标
                var columnicon = new column_icon_choose();
                columnicon.clicks();
                $('.en_name').val(d.en_name);
                $('#out_url input').val(d.url);
                column_type_info(d.type);
                if(d.article_type == 1){
                    $('#inside_model i[name=1]').parent().addClass('cu');                                
                }else{
                    $('#inside_model i[name=2]').parent().addClass('cu');
                }
                editor.setContent(d.page_content || '');
                if(d.pc_show == 1){
                    $('.sites input[value=pc]').attr('checked','true');
                    $('.sites label.lb_pc').addClass('chirdchecked');
                }
                if(d.mobile_show == 1){
                    $('.sites input[value=mobile]').attr('checked','true');
                    $('.sites label.lb_mobile').addClass('chirdchecked');
                }
                if(d.wechat_show == 1){
                    $('.sites input[value=wechat]').attr('checked','true');
                    $('.sites label.lb_wechat').addClass('chirdchecked');
                }
                $('.box-down .keyword').val(d.keywords);
                var _newpic = '';
                if(d.img){
                    _newpic += '<div class="template-download fade fl in">\n\
                                <div>\n\
                                    <span class="preview">\n\
                                    <div class="preview-close"><img src="images/preview-close.png" /></div>\n\
                                        <img src="'+d.img+'" style="width:80px;height:64px;padding:5px;" data-preimg="preimg">\n\
                                    </span>\n\
                                </div>\n\
                            </div>';
                    $('.up_pic').before(_newpic);
                }
                var slt_arry = d.img.split('/');
                upload_picname = slt_arry[(slt_arry.length-1)];
                $('.txts').val(d.description);
            });//GET请求结束
            $('#bomb-box').fadeIn(function(){
                heightauto()
            });
            $('#bomb-box').addClass('in');
            $('.box-up').text('编辑栏目');
            // 图片上传
            Column_Upload(proportion);
        });//点击结束
    }//column_edit方法结束

    var vlayout;
    //下拉列表
    $('#lottery').change(function(){
        //清除数据
        $('#models .mod_border').each(function(){
            $(this).hasClass('cu')?$(this).removeClass('cu'):'';
        });
        $('#out_url input').val('');
        editor.execCommand('cleardoc');
        var r = $(this).find('option:selected').text();
        switch (r){
            case '抽奖':{
                $('#lottery1,#lottery2,#lottery_mg').show();
                $('#models').hide();
                $('#inside_model').addClass('none');
                $('#out_url').hide();
                $('#page_editor').hide();
                vlayout = $(this).val();
				heightauto();
                break;
            }
            case '列表':{
                $('#models').show();
                $('#inside_model').removeClass('none');
                $('#lottery1,#lottery2,#lottery_mg').hide();
                $('#out_url').hide();
                $('#page_editor').hide();
				heightauto();
                break;
            }
            case '外链':{
                $('#out_url').show();
                $('#models').hide();
                $('#page_editor').hide();
                $('#lottery1,#lottery2,#lottery_mg').hide();
                vlayout = $(this).val();
				heightauto();
                break;
            }
            case '内容单页':{
                $('#page_editor').show();
                $('#out_url').hide();
                $('#models').hide();
                $('#inside_model').addClass('none');
                $('#lottery1,#lottery2,#lottery_mg').hide();
                vlayout = $(this).val();
                heightauto();
                break;
            }
            default:
                $('#out_url').hide();
                $('#models').hide();
                $('#inside_model').addClass('none');
                $('#page_editor').hide();
                $('#lottery1,#lottery2,#lottery_mg').hide();
                vlayout = $(this).val();
                heightauto();
                break;
        }
    });
	//弹窗处理
    tanchuang(Save_id);
    $('#models .mod_border,#inside_model .mod_border').click(function(){
       $(this).addClass('cu');
       $(this).parent(".tpl").siblings().find('.mod_border').removeClass('cu') 
    });
    //编辑添加栏目
    function Save_id(parame){
        if(parame == 1){
            this_id = 1
        }
        return this_id;
    };
    var article_type;
    $('.save_column').click(function(){
        if($('#lottery').val() == '列表'){
            $('#models .tpl_info').each(function(){
                if($(this).parent().hasClass('cu')){
                    vlayout = $(this).attr("name");
                }
            });
            $('#inside_model .mod_border').each(function(){
                if($(this).hasClass('cu')){
                    article_type = $(this).find('i').attr("name");
                }
            });
        }else{
            vlayout = $('#lottery').val();
        }

        var id = (Save_id() == 1 ? '' : this_id);
        if(vlayout == null){
            alert('保存失败，请选择类型！')
        }else{
            var vurl = $('#out_url input').val() ? $('#out_url input').val() : '';
            var vname = $('.column_name').val();
            var enname = $('.en_name').val();
            var vpid = $('.selectBox_val').val();
            var vkeywords = $('.keyword').val();
            var icons = $('.icon_input').val();
            var vdescription = $('.txts').val();
            var s_t = new Array();
            var j = 0 ;
            $('.sites input[type="checkbox"]').each(function(i) {
                if($(this).siblings('label').hasClass('chirdchecked')) {
                    s_t[j] = $(this).val();
                    j++;
                }
            });
            var page_content,module_key,module_value;
            switch(vlayout){
                case 2:
                    page_content = vlayout;
                    break;
                case 5:
                    module_key = vlayout;
                    break;
                case 7,8:
                    module_value = module_key = vlayout;
                    break;
            }

            var first = true;
            var savePostRequest = function(first){
                $http.post('../classify-modify', {id: id,
                    p_id         : vpid,
                    name         : vname,
                    en_name      : enname,
                    type         : vlayout,
                    url          : vurl,
                    is_show      : s_t,
                    keywords     : vkeywords,
                    description  : vdescription,
                    img          : upload_picname,
                    icon         : icons,
                    module_key   : module_key,
                    module_value : module_value,
                    force        : (first ? 0 : 1),
                    article_type : article_type,
                    page_content : editor.getContent()}).success(function(json) {
                    checkJSON(json, function(json){
                        getJson();//重新获取列表
                        var hint_box = new Hint_box();
                        hint_box;
                    },function(json){
                        if(json.err != 1001){
                            if(confirm(json.msg)){
                                first = false;
                                savePostRequest(first);
                            }else{
                                $('#bomb-box').fadeOut();
                            }
                        }
                    });//checkJSON结束
                });//POST请求结束
            }
            savePostRequest(first);
        }
    });//click保存结束
    //获取勾选id
    var all_id = function(){
        var id_all = new Array();
        j = 0;
        $('.label').each(function(i){
           if($(this).hasClass("nchecked")){
               id_all[j] = $(this).parent().parent().siblings().find('.delv').attr('name');j++;
           }
        }); 
        return id_all;
    };

    //展示
    function column_show(){
        $('.a-table .btn-show').on('click',function(){
            var btn = $(this);
            var voperate,SameClassName;
            var hierarchy = function(){
                if(btn.hasClass('icon-pc')){
                    voperate = 'pc_show';
                    SameClassName = 'icon-pc';
                }else if(btn.hasClass('icon-snimicshouji')){
                    voperate = 'mobile_show';
                    SameClassName = 'icon-snimicshouji';
                }else if(btn.hasClass('icon-weixin')){
                    voperate = 'wechat_show';
                    SameClassName = 'icon-weixin';
                }
                if( (btn.closest('tr').data('aid') == btn.closest('tr').next().data('parent')) && btn.hasClass('blue')){
                    var LevelNum = btn.closest('tr').attr('class').match(/\d+?$/g);
                    if(confirm('此为父级，隐藏后子级也将一起隐藏，是否确定隐藏？')){
                        btn.parents('tr').nextUntil('.Level'+LevelNum+'').find('.'+SameClassName).removeClass('blue').addClass('grey');
                    }else{
                        voperate = null;
                    }
                }
            }();
            var vid = btn.parents('tr').attr('data-aid');
            if(btn.hasClass('blue')){
                var vvaule = 0;
            }
            else{
                var vvaule = 1;    
            }
            if(voperate != null){
                $http.post('../classify-show',{id:vid,operate:voperate,value:vvaule}).success(function(json){
                    checkJSON(json, function(json){
                        if(btn.hasClass('blue')){
                            btn.removeClass('blue').addClass('grey');
                            $('.column-tb .size2').find('.icon-phonehome').hide().end().find('.iconfont').unwrap('<div class="pa size2"></div>');
                        }else{
                            btn.removeClass('grey').addClass('blue');
                        }
                        var hint_box = new Hint_box();
                        hint_box;
                    });
                });
            }
        }).on('mouseenter',function(){
            if($(this).hasClass('icon-snimicshouji') && $(this).hasClass('blue')){
                $(this).parent().wrapInner('<div class="pa size2"></div>').find('.icon-phonehome').show();
            };
            $('.column-tb .a-table .size2').on('mouseleave',function(){
                $(this).find('.icon-phonehome').hide();
                $(this).find('.iconfont').unwrap('<div class="pa size2"></div>');
            });
        });
        // 显示提示框
        $('.not-allowed').MoveBox();
        $('.column-tb .a-table .icon-phonehome').on('click',function(){
            var btn = $(this);
            var vid = $(this).parents('tr').attr('data-aid');
            var isshow = ($(this).hasClass('blue') ? 0 : 1);
            if(!$(this).hasClass('not-allowed')){
                $http.post('../mhomepage-batchmodify',{id:vid,show:isshow}).success(function(json){
                    checkJSON(json,function(json){
                        if(btn.hasClass('blue')){
                            btn.removeClass('blue').addClass('grey');
                        }else{
                            btn.removeClass('grey').addClass('blue');
                        }
                        var hint_box = new Hint_box();
                        hint_box;
                    });
                });
            }
        });
    }
    function column_del(){
        //栏目删除
        $('.a-table .delv').on('click',function(){
            var id = $(this).attr('name');
            var _this = $(this);
            (function column_delete(del_num){
                if(del_num == undefined){
                    var warningbox = new WarningBox(column_delete);
                    warningbox.ng_fuc();
                }else{
                    if(del_num){
                        var vdelete = $(this);
                        $('.column_type option').each(function(){
                            if($(this).val() == id){
                                $(this).remove();
                            }
                        });
                        $http.post('../classify-delete', {id: id}).success(function(json) {
                            checkJSON(json,function(json){
                                if(_this.parents('tr').attr('class') == 'Level1'){
                                    _this.parents('tr').remove();
                                    $('tr[data-parent='+_this.parents('tr').data('aid')+']').remove();
                                }else{
                                    _this.parents('tr').remove();
                                }
                                vdelete.parents('tr').remove();
                                var hint_box = new Hint_box();
                                hint_box;
                            });
                        });
                    }
                }
            })();
        });

        //批量删除
        $('.info-top .delcolumn').click(function(event) {
            (function column_delete(del_num){
                if(del_num == undefined){
                    var warningbox = new WarningBox(column_delete);
                    warningbox.ng_fuc();
                }else{
                    if(del_num){
                        var id_all = new all_id;
                        $http.post('../classify-delete', {id: id_all}).success(function(json) {
                            checkJSON(json,function(json){
                                $('.a-table tr .nchecked').parents('tr').remove();
                                $.each(json.data,function(i,v){
                                    $('tr[data-aid="'+v+'"]').remove();
                                });
                                var hint_box = new Hint_box();
                                hint_box;
                            });
                        });
                    }
                }
            })();
        });
    };
    function Column_Upload(proportion){
       $('.up_pic').on('click',function(event) {
            var warningbox = new WarningBox();
            warningbox._upImage({
                aspectRatio: proportion,
                ajaxurl    : '../file-upload?target=category',
                oncallback : function(json){
                    $('.column_pic .template-download').remove();
                    _newpic = '<div class="template-download fade fl in">\n\
                                    <div>\n\
                                        <span class="preview">\n\
                                        <div class="preview-close"><img src="images/preview-close.png" /></div>\n\
                                            <img src="'+json.data.url+'" style="width:80px;height:64px;padding:5px;" data-preimg="preimg">\n\
                                        </span>\n\
                                    </div>\n\
                                </div>';
                    $('.up_column').before(_newpic);
                    upload_picname = json.data.name;
                }
            });
        });
        //删除图片
        $('.column_pic').on('click','.preview-close',function(){
            $(this).parents('.template-download').remove();
            upload_picname = '';
            return false;
        }); 
    }
}
