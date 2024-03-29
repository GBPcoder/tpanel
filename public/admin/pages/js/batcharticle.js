function batcharticleController($scope, $http, $location) {
    $scope.$parent.showbox = "main";
	$scope.$parent.menu = [];
	$_GET = $location.search(); 
    $scope.G_id = $_GET['ids'];
    $scope.G_c_id = $_GET['c_id'];


    // 实例化编辑器 
    // if (typeof addarticleEditor !== 'undefined') UE.getEditor('container').destroy();
    // var editor = UE.getEditor('container',{ 
    //     initialFrameHeight:300,
    //     autoHeightEnabled: false
    // });
    // editor.addListener( 'ready', function( editor ) {
    //     addarticleEditor = true;
    // } );

    $scope.BatchArticleInit = function(){
        checkjs();
        this.G_id = $scope.G_id || '';
        this.G_c_id = $scope.G_c_id || '';
        this.init();
    };
    $scope.BatchArticleInit.prototype = {
        init : function(){
            this._limit();
            this._AddarticleData();
        },
        _limit : function(){
            if($('.f_column .checkclass .labe2').hasClass('chirdchecked')){
                $(".selectBox").addClass('not-allowed');
            }else{
                $(".selectBox").addClass('not-allowed');
            }
        },
        _column_show : function(){
            var _this = this;
            // 栏目显示
            $http.get('../classify-list').success(function(json) {
                checkJSON(json, function(json){
                    var d = json.data;
                    var option1 = '',pid,pname='',id;
                    var PageId = [];
                    if(json.err == 0){
                        var option1 = '<li><a data-id="0">顶级栏目</a></li>';
                        $.each(d,function(idx,ele){
                            if(ele.type < 5){
                                if(_this.G_c_id == ele.id){
                                    pid = ele.p_id;
                                    pname = ele.name;
                                    id = ele.id;
                                }
                                if(ele.type == '4'){
                                    PageId.push(ele.id);
                                }
                                option1 += '<li><a class="parents'+(ele.childmenu != null?' not-allowed':'')+'" data-id="'+ele.id+'">'+ele.name+'</a></li>';
                                var NextChild = ele;
                                var num = 2;
                                var LoopChlid = function(NextChild,num){
                                    if(NextChild.childmenu != null){
                                        $.each(NextChild.childmenu,function(k,v){
                                            if(v.type < 5){
                                                if(_this.G_c_id == v.id){
                                                    pid = v.p_id;
                                                    pname = v.name;
                                                    id = v.id;
                                                }
                                                if(v.type == '4'){
                                                    PageId.push(v.id);
                                                }
                                                option1 += '<li><a class="LevelChild'+num+(v.childmenu != null?' not-allowed':'')+'" data-pid="'+v.p_id+'" data-id="'+v.id+'">├'+v.name+'</a></li>'; 
                                                if(v.childmenu != null){
                                                    NextChild = v;
                                                    num++;
                                                    LoopChlid(NextChild,num);
                                                    num--;
                                                }  
                                            }
                                        });
                                    }
                                }
                                LoopChlid(NextChild,num);
                            }
                        });
                        _op = '<div class="dropdown">\
                                <div class="selectBox" type="text">'+pname+'</div><span class="arrow"></span>\
                                <input class="selectBox_val" name="column_name" type="hidden" value="'+id+'"/>\
                                <ul>'+option1+'</ul></div>';
                    }
                    $('.f_column').append(_op);
                    // 下拉框模拟事件
                    DropdownEvent(PageId);
                    $('.not-allowed').MoveBox({context:'此为含有子级的父级栏目或为单页内容页，不支持选择！'});
                });
            });
        },
        _AddarticleData : function(){
            // 栏目加载
            this._column_show(); 
            // 编辑文章标题
            this._AddarticleTitleEditor();
            // 保存
            this._AddarticleSave();
        },
        _AddarticleTitleEditor : function(){
            //编辑文章标题
            $('.add-r .set_blod').click(function(){
                if($('#addarticle-con .art_tit').css('font-weight') == '600' || $('#addarticle-con .art_tit').css('font-weight') == 'bold'){
                    $('#addarticle-con .art_tit').css('font-weight','');
                    $(this).text('加粗');
                }else{
                    $('#addarticle-con .art_tit').css('font-weight','600');
                    $(this).text('取消加粗');
                }
            });
            $('.add-r .set_color').click(function(){
                if($('#color-picker').css('display') == 'none'){
                    $('#color-picker').show();
                    $(this).text('确认修改');
                }else{
                    $('#color-picker').hide();
                    $(this).text('修改颜色');
                } 
            });
        },
        _AddarticleSave : function(){
            var _this = this;
            $('.addsave').click(function(){
                var editor = UE.getEditor('container'),
                    art_info = editor.getContent(),
                    id = (_this.G_id ? _this.G_id : ''),
                    f_c = $('.selectBox_val').val(),
                    c_t = $('.creat_time').val(),
                    vt = $('.visit').val(),
                    key = $('.keyword').val(),
                    txts = $('.txts').val(),
                    art_tit = $('.art_tit').val(),
                    title_bold;
                if($('#addarticle-con .art_tit').css('font-weight') == '600' || 'bold'){    
                    title_bold = 1;
                }else{
                    title_bold = 0;
                }
                var title_color = $('#addarticle-con .art_tit').css('color'),
                    s_t = new Array(),
                    j = 0 ;
                $('.home-list .is_show input[type="checkbox"]').each(function(i) {
                    if($(this).next().hasClass('chirdchecked')) {
                        s_t[j] = $(this).val();              
                        j ++ ;
                    }
                });
                var upload_picname = [];
                $('.up_pic_feild>.template-download .preview>img').each(function(i, v) {
                    var len = $(this).attr('src').split('/').length;
                    upload_picname.push($(this).attr('src').split('/')[len-1]);
                });
                $http.post('../article-create', 
                    {id       : id,
                    c_id      : f_c,  
                    pubdate   : c_t,
                    title_bold: title_bold,
                    title_color: title_color,
                    viewcount : vt,
                    is_show   : s_t,
                    src       : upload_picname,
                    keywords   : key,
                    introduction   : txts,
                    title     : art_tit,
                    content   : art_info}).success(function(json) {
                    checkJSON(json, function(json){
                        alert('修改成功！');
                        location.href='#/article';
                    });
                });
            });
        }
    };
    var init = new $scope.BatchArticleInit();
}