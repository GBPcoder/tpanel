function homeController($scope, $http) { 
	$scope.$parent.showbox = "page";
    $scope.$parent.homepreview = false;
	$scope.$parent.menu = [];
	
	var homeRequest = function(){
		var templePage = 'index',
			templeType = 1,
			url_index;
		$http.get('../homepage-manage?page='+templePage).success(function(json) {
			checkJSON(json, function(json) { 
				// 页面导航
				$('.home-page-preview .pages-nav').html('');
				$.each(json.data.pagelist, function(k,v) {
					if(v.page == 'index'){
						$('.home-page-preview iframe').attr('src',v.url);
						url_index = v.url;
					}
					$('.home-page-preview .pages-nav').append('<li' + (v.page=='index' ? ' class="current"' : '') + '><a href="'+(v.url ? v.url:'')+'" data-page="' + v.page + '" title="' + v.title + '" target="ifram">' + v.title + '</a></li>');
				});
				if(json.data.coded == 0){
					$('.home-page-preview .bule_button').css('backgroundColor','#ccc');
				}
				getTempledata(1, templePage);
				//  页面编辑项
				$('.home-page-preview .pages-nav li a').click(function() {
					getTempledata(1, $(this).data('page'));
	                if($(this).attr('href') != ''){
	                    $('.home-page-preview .iframs iframe').attr('src', $(this).data('url'));
	                }else if($(this).data('page') == 'footer'){
	                    $(this).attr('href','#footer');
	                    $(this).data('url','#footer');
	                }else{
	                    $(this).attr('href',url_index);
	                    $(this).data('url',url_index);
	                }
	                $(this).parent('li').addClass('current').siblings().removeClass('current');
				});
				//高级定制跳转
				$('.bule_button').unbind('click').click(function(){
					if(json.data.coded){
						location.href = '#/diytpl?type='+templeType+'';
					}else{
						var warningbox = new WarningBox('',{warning_context : '∑(っ°Д ° )っ此定制编辑需要有一定的代码基础，确定要对文件进行编辑吗？'});
						warningbox.idx_fuc(templeType);
					}
				});
			});
		});
		homeReflash();
		homeChangeSave();
	}();
	// 刷新按钮
	function homeReflash(){
		$('.home-box .reflash').on('click', function() {
			var _currentNav = $('.home-page-preview .pages-nav li.current a');
			if ($('.home-page-preview .iframs iframe').attr('src') == _currentNav.attr('href')) {
				// Todo 还有bug
				$('.home-page-preview .iframs iframe').attr('src', '');
				$('.home-page-preview .iframs iframe').attr('src', _currentNav.attr('href'));
			}else{
				_currentNav.data('url') == '' ? $('.home-page-preview .iframs iframe').attr('src', url_index) : $('.home-page-preview .iframs iframe').attr('src', _currentNav.data('url'));
			}
		});
	}
	function getTempledata(templeType, templePage) {
		$('.home-edite').html('loading...');
		$http.get('../homepage-list?type='+templeType+'&page='+templePage+'').success(function(json) {
			var _rt = '',
				pic = 0,
				pic_Classname = '',pic_name = '';
			$.each(json.data,function(k,v){
				var type = v.type;
				switch(type){
					case 'image':
						var _rel = '';
						var src = [],tit = [],href = [];
						src = v.value.image;
						tit = v.value.title; 
						href = v.value.link;
						_rel = '<dd><a class="preview" href="'+v.value.link+'" onclick="return false">\n\
							<div class="preview-close"><img src="images/preview-close.png" /></div>\n\
							<div class="preview-edit" style="visibility:hidden"><img src="images/preview-edit.png" /><span>编辑</span></div>\n\
							<div class="preview-mask" style="visibility:hidden"></div>\n\
							<img src="'+v.value.image+'" width="55" height="55" class="home_pic" data-preimg="preimg"></a>\n\
							<input type="hidden" value="'+src+'" name="data['+k+'][src]" />\n\
							<input type="hidden" value="'+tit+'" name="data['+k+'][title]" />\n\
							<input type="hidden" value="'+href+'" name="data['+k+'][href]" /></dd>';
                        _rel += '<dd class="new_add pr" data-role="image-'+k+'" style="margin-left:8px;"></dd>';
						break;
					case 'text':
						var _rel = '';
						_rel = '<input value="'+v.value+'"  name="data['+k+']" type="text" class="editeinput" />';
						break;
					case 'images':
						var _rel = '';
                        var num = 0,src,srclen;
                        $.each(v.value,function(i,j){
							srclen = j.image.split('/').length;
							src = j.image.split('/')[srclen-1];
							Isdescription = (j.description == undefined ? '' : '<input type="hidden" value="'+j.description+'" name="data['+k+']['+num+'][description]" />');
                            _rel += '<dd><a href="'+j.link+'" class="preview" onclick="return false">\n\
							<div class="preview-close"><img src="images/preview-close.png" /></div>\n\
							<div class="preview-edit" style="visibility:hidden"><img src="images/preview-edit.png" /><span>编辑</span></div>\n\
							<div class="preview-mask" style="visibility:hidden"></div>\n\
							<img src="'+j.image+'" class="home_pic" data-preimg="preimg"></a>\n\
							<input type="hidden" value="'+src+'" name="data['+k+']['+num+'][src]" />\n\
							<input type="hidden" value="'+j.title+'" name="data['+k+']['+num+'][title]" />'+Isdescription+'\n\
							<input type="hidden" value="'+j.link+'" name="data['+k+']['+num+'][href]" /></dd>';
                            num++;
                            pic++;
                        });
						_rel += '<dd class="new_add pr" data-role="images-'+k+'" style="margin-left:8px;"></dd>';
						break;
					case 'list':
						var _rel = '',sign = '',list1 = '',pname = '',rootNodeName = k;
						if(v.config.list != null){
							$.each(v.config.list,function(i,vlist){
								var _this = $(this);
								if(vlist.p_id == 0 || v.config.filter == 'page'){
									if(vlist.selected == 1) {sign = '<input class="selectBox_val" type="hidden" value="'+vlist.id+'" name="data['+rootNodeName+'][id]" />';pname = vlist.name}
									list1 += '<li><a class="'+(vlist.childmenu == null ? 'lastchild ' : '')+'parents'+((v.config.filter == 'all' || v.config.filter == 'list,page') ? '' : v.config.filter == 'page' ? '' : vlist.type == 4 ? ' not-allowed' : '')+'" data-id="'+vlist.id+'">'+vlist.name+'</a></li>';
					                var NextChild = vlist;
					                var num = 2;
									var LoopChlid = function(NextChild,num){
                                        if(NextChild.childmenu != null){
                                            $.each(NextChild.childmenu,function(kk,vv){
                                            	if(vv.selected == 1) {sign = '<input class="selectBox_val" type="hidden" value="'+vv.id+'" name="data['+rootNodeName+'][id]" />';pname = vv.name}
                                            	list1 += '<li><a class="'+(vv.childmenu == null ? 'lastchild ' : '')+'LevelChild'+num+((vv.type == 4) && (v.config.filter == 'list')?' not-allowed':'')+'" data-pid="'+vv.p_id+'" data-id="'+vv.id+'">├ '+vv.name+'</a></li>';
                                                NextChild = vv;
                                                num++;
                                                LoopChlid(NextChild,num);
                                                num--;
                                            });
                                        }
                                    }
                                    v.config.filter == 'page' ? '' : LoopChlid(NextChild,num);
								}
							});
						}else{
							list1 += '<li><a >暂无内容！</a></li>'
						}
						if(v.config.filter == 'page'){
							_rel += '<div class="dropdown" style="display:block;">\
		                            <div class="selectBox" type="text">'+pname+'</div><span class="arrow"></span>\
		                            <input class="selectBox_val" name="data['+k+'][id]" type="hidden" value="'+v.config.id+'"/>\
		                            <ul>'+list1+'</ul></div>';
						}else{
	                        _rel += '<div class="dropdown" style="display:block;">\
		                            <div class="selectBox" type="text">'+pname+'</div><span class="arrow"></span>'+sign+'\
		                            <ul>'+list1+'</ul></div>\
		                            <dl class="fl checkclass"><input type="hidden" value="'+v.config.star_only+'" name="data['+k+'][star_only]" style="display:none;">' +
	                        		'<label class="label '+(v.config.star_only == 1?'nchecked':'')+'"></label></dl><label for="'+k+'-star_only" class="vm">仅显示星标文章</label>';
						}
						break;
					case 'textarea':
						var _rel = '';
						_rel = '<textarea name="" cols="4" rows="4" class="editetextarea">'+v.value+'</textarea>\n\
							<input type="hidden" value="'+v.value+'" name="data['+k+']" />';
						break;
					case 'navs':
						var _rel = '',sign = [],list1 = '',pname = '',rootNodeName = k;
						if(v.config.list != null){
							$.each(v.config.ids,function(idx, ele) {
								$.each(v.config.list,function(i,vlist){
									var _this = $(this);
									if(vlist.p_id == 0 || v.config.filter == 'page'){
										if(vlist.id == ele) {sign = '<input class="selectBox_val" type="hidden" value="'+vlist.id+'" name="data['+rootNodeName+'][ids]['+idx+']" />';pname = vlist.name}
										list1 += '<li><a class="'+(vlist.childmenu == null ? 'lastchild ' : '')+'parents'+((v.config.filter.toLowerCase() == 'all' || v.config.filter == 'list,page') ? '' : v.config.filter == 'page' ? '' : vlist.type == 4 ? ' not-allowed' : '')+'" data-id="'+vlist.id+'">'+vlist.name+'</a></li>';
						                var NextChild = vlist;
						                var num = 2;
										var LoopChlid = function(NextChild,num){
	                                        if(NextChild.childmenu != null){
	                                            $.each(NextChild.childmenu,function(kk,vv){
	                                            	if(vv.id == ele) {sign = '<input class="selectBox_val" type="hidden" value="'+vv.id+'" name="data['+rootNodeName+'][ids]['+idx+']" />';pname = vv.name}
	                                            	list1 += '<li><a class="'+(vv.childmenu == null ? 'lastchild ' : '')+'LevelChild'+num+((vv.type == 4) && (v.config.filter == 'list')?' not-allowed':'')+'" data-pid="'+vv.p_id+'" data-id="'+vv.id+'">├ '+vv.name+'</a></li>';
	                                                NextChild = vv;
	                                                num++;
	                                                LoopChlid(NextChild,num);
	                                                num--;
	                                            });
	                                        }
	                                    }
	                                    v.config.filter == 'page' ? '' : LoopChlid(NextChild,num);
									}
								});
								_rel += '<div class="dropdown" style="margin-bottom:10px;">\
	                            <div class="selectBox" type="text">'+pname+'</div><span class="arrow"></span>'+sign+'\
	                            <ul>'+list1+'</ul><span class="move_icon"><i class="iconfont icon-liebiao"></i><i class="iconfont icon-guanbi"></i></span></div>'+(idx == (v.config.ids.length-1) ? '<div class="add_icon"><i class="iconfont icon-add" data-limit="'+v.config.limit+'"></i></div>' : '')+'';
							});
						}else{
							list1 += '<li><a >暂无内容！</a></li>'
						}
						break;		
				}// switch结束
				_rt += '<li><dl class="homeed-left">'+v.description+'：'+(typeof v.config == 'undefined' ? '' : v.type == 'images' || v.type == 'image' ? '<div class="ratio">'+(v.config.width == undefined ? '自适应':v.config.width)+'*'+(v.config.height == 'undefined' ? '自适应':v.config.height)+'</div>'+(v.type=='image'?'':'<div>限制数量：<span class="pic_limit">'+(v.config.limit == undefined ? '0': v.config.limit)+'</span></div>') : '')+'</dl><dl class="homeed-right">'+(v.type == 'navs' ? '<div id="move_navs">'+_rel+'</div>': ''+_rel+'')+'</dl></li>';
			}); // each结束
			
			$('.home-edite').html('<form id="temple-data">' + _rt + '<input type="hidden" name="page" value="'+templePage+'" /><input type="hidden" name="type" value="'+templeType+'" /></form>');
			//下拉框更改
			DropdownEvent();
			// 提示移动框
			$('.not-allowed').MoveBox({context:'此为单页类型或者父级分类下带有子级，不支持选择！'});
			// 下拉框整理
			homeListFix();
			// 拖拽效果
			$('.dropdown .icon-liebiao').TreeList({
				parentNode  : 'move_navs',
				rootNode 	: 'dropdown'
	       	});
	       	// 删除拖拽栏目
	       	$('#move_navs .icon-guanbi').on('click',function(){
	       		$(this).closest('.dropdown').remove();
	       	});
	       	// 添加拖拽栏目
			$('.add_icon i').on('click', function(event) {
	       		if($(this).parent().siblings('.dropdown').length >= $(this).data('limit')){
	       			alert('超出数量！')
	       		}else{
	       			var clone_cell = $('#move_navs .dropdown').first().clone(true);
					$('#move_navs .add_icon').before(clone_cell);
					clone_cell.find('.selectBox').text('空').end().find('.selectBox_val').val('');
					var word = clone_cell.find('.selectBox_val').attr('name').replace(/data\[(.*)\]\[(.*)\]\[(\d*)\]/,'data[$1][$2]['+($('#move_navs .dropdown').length-1)+']');
					clone_cell.find('.selectBox_val').attr('name',word);
	       		}
			});
            // 星标勾选
            $('#temple-data .homeed-right .checkclass label').on('click',function(){
                if($(this).hasClass('nchecked')){
                    $(this).removeClass('nchecked').prev().val("0");
                }else{
                    $(this).addClass('nchecked').prev().val("1");
                }
            });
            var homeboxHeight = $('#home-edit').height() - parseInt($('.home-page-preview .hd').height()) + 10;
			$('.home-box .home-page-preview .iframs').css('height', homeboxHeight);
			// 编辑图片
			var this_edit;
			$('.home-edite').on('click','.preview-edit',function(){
				this_edit = $(this);
				$(".box_info").css({
					"marginTop":0
				});
				$('.template-download').remove();
				$('#bomb-box').fadeIn();
				var href = $(this).parent().attr('href'),
					src = $(this).children('img').attr('src'),
					description = $(this).parent().siblings('input[name*="description"]').val(),
					title = $(this).parent().siblings('input[name*="title"]').val();
				$('.box-down .column_name').val(href);
				$('.box-down .keyword').val(title);
				description == undefined ? null :$('.box-down .description').val(description);
				_pics = '<div class="template-download fade fl in">\n\
					<div>\n\
						<span class="preview">\n\
							<img src="'+$(this).siblings('img').attr('src')+'" style="width:80px;height:64px;padding:5px;" data-preimg="preimg">\n\
						</span>\n\
					</div>\n\
				</div>';
				$('.column_pic').append(_pics);
				return false;
			});
            $("#temple-data input[type=checkbox]").on('click',function(){alert($(this).attr('checked'))});
			$('.pos_sites').click(function(event) {
				$(this).parents('.addimg').siblings('.table-striped').find('.template-download').remove()
			});
			//保存图片
			$('.save_column').click(function(event) {
				if($('.box-down .status').val() == 'old'){
					this_edit.parent().attr('href',$('.box-down .column_name').val());
					this_edit.siblings('input').val($('.box-down .keyword').val());
					this_edit.siblings('img').attr('src',$('.template-download .preview').children('img').attr('src'));
					this_edit.parent().siblings('input[name*="title"]').val($('.box-down .keyword').val());
					this_edit.parent().siblings('input[name*="href"]').val($('.box-down .column_name').val());
					this_edit.parent().siblings('input[name*="description"]').val($('.box-down .description').val());
				}
			});
            //是否仅显示星标文章
            $('#temple-data input[id*=star_only]').on('click',function(){
                $(this).prop('checked') ? $(this).val(1) : $(this).val(0);
            });
			//文本域更改
			$('.homeed-right .editetextarea').on('change',function(event) {
				$(this).siblings('input').val($(this).val());
			});
			// 图片上传
			$('.new_add').on('click',function(event) {console.log($(this).prev().find('input') == 'undefined');
				var _this = $(this);
				var limit = $(this).parent().siblings('.homeed-left').find('.pic_limit').text();
				var ratio = $(this).parent().siblings('.homeed-left').find('.ratio').text().split('*');
				$(this).data('role').split('-')[0] == 'images'? '' : $().prev().remove();
	        	var pic_num = ($(this).prev().find('input').length == 0 ? 0 : $(this).prev().find('input').eq(0).attr('name').match(/data\[(.*)\]\[(\d*)\]\[(.*)\]/)[2]);
				if((limit == 0) || $(this).parent().children().length <= limit){
					var warningbox = new WarningBox();
					warningbox._upImage({
						aspectRatio: ratio[0]/ratio[1],
						ajaxurl    : '../file-upload?target=page_index',
						oncallback : function(json){
							var role = _this.data('role');
							var pic_name = role.split('-')[1];
				        	var upload_Classname = role.split('-')[0];
				        	var new_num = parseInt(pic_num)+1;
				        	_newpic = '<dd><a href="" class="preview" onclick="return false">\n\
									<div class="preview-close"><img src="images/preview-close.png" /></div>\n\
									<div class="preview-edit" style="visibility:hidden"><img src="images/preview-edit.png" /><span>编辑</span></div>\n\
									<div class="preview-mask" style="visibility:hidden"></div>\n\
									<img src="' + json.data.url + '" class="home_pic" data-preimg="preimg"></a>\n\
									<input type="hidden" value="' + json.data.name + '" name="data['+pic_name+']'+(upload_Classname == 'images'?'['+new_num+']':'')+'[src]" />\n\
									<input type="hidden" value="" name="data['+pic_name+']'+(upload_Classname == 'images'?'['+new_num+']':'')+'[title]" />\n\
									<input type="hidden" value="" name="data['+pic_name+']'+(upload_Classname == 'images'?'['+new_num+']':'')+'[href]" />\n\
									</dd>';
							$('.new_add[data-role='+role+']').before(_newpic);
						}
					});
				}else{
					alert('超出上传数量！');
				}
			});

			$('.mask,.cancel,.save_column').click(function(){
				$('#bomb-box').fadeOut('400', function() {
					$('.box_info .box-up').text('编辑图片');
				});
				$('.box-down .status').val('old');
			});
		}); // GET请求结束
	} // getTempledata方法结束
	//修改首页 
	function homeChangeSave(){
		$('.home-info .btn-top .save').not($('.save_column')).unbind( "click" ).click(function(){
	    	var data1 = $("#temple-data").serializeJson();
	        $http.post('../homepage-modify',data1).success(function(json) {
	        	checkJSON(json,function(json){
					$('.home-content').append('<div class="hint_box">保存成功！</div>');
					setTimeout(function(){
					    $('.hint_box').remove();
					},2000);
	        	});
	        });
	        return false;
	    });
	}
	// 为最后一级，类型为单页的删除或者子级都为page，父级以及子级全删除
	function homeListFix(){
		$('.dropdown ul li a').each(function(index, el) {
			if($(this).hasClass('lastchild not-allowed')){
				$(this).remove();
			}
		});
	}
}